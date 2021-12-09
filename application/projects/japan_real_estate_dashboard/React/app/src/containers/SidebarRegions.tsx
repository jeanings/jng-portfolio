import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { handleLevelStore, handleStoreRemoval } from '../slices/menuStoreSlice';
import { handleRenderDirection, handleMenuLevelRemoval } from '../slices/menuLevelSlice';
import { v4 as uuidv4 } from 'uuid';
import CreateRegion from './CreateRegion';
import SidebarRegionsSelected from './SidebarRegionsSelected';
import { SidebarRegSet } from '../imports/languageSet';
import { DEV_MODE, getMediaQueries } from '../App';
import './SidebarRegions.css';



const SidebarRegions: React.FC = () => {
    /* ----------------------------------------------------------------------------
        Main user interaction component.
        - Clicks on region items zoom into region, both in the menu and on map.
        - Select/deselect on checkboxes adds/removes region from selection state.
            - Adds/removes data from charts.
        Subscribes to {menuStore}, {menuLevel}, {menuApi}, {dataApi} states.
    ---------------------------------------------------------------------------- */
    // Dispatch, selector hooks.
    const dispatch = useAppDispatch();
    const menuStoreState = useAppSelector(state => state.menuStore);
    const menuLevelState = useAppSelector(state => state.menuLevel);
    const menuApiState = useAppSelector(state => state.menuApi);
    const dataApiState = useAppSelector(state => state.dataApi);
    const languageState = useAppSelector(state => state.language);
    const locale = languageState.en === true ? 'en' : 'jp';
    // Level-related variables.
    const categories: { [key: string]: string} = {
        'level 0': 'regions',
        'level 1': 'prefectures',
        'level 2': 'cities',
        'level 3': 'districts'
    };
    const renderDirection: string = menuLevelState.direction;
    const renderedLength: number = Object.keys(menuStoreState.rendered).length;
    const prevLevel: string = 'level' + ' ' + (Object.keys(menuLevelState.active).length - 1);
    const nextLevelindex = Object.keys(menuLevelState.active).length;
    const nextLevel: string = 'level' + ' ' + nextLevelindex;
    const nextCategory: string = categories[nextLevel];
    let currentLevel: LevelsProps['name'] = 'level 0';   // for initial render
    let activeMenuElementsProps: Array<MenuElementProps> = [];
    let menuApiDataList = menuApiState[nextCategory];
    // Set current level indicator.
    if (renderedLength !== 0) {
        currentLevel = nextLevelindex < 4 
            ? 'level' + ' ' + (renderedLength - 1) as LevelsProps['name']
            : 'level' + ' ' + (renderedLength) as LevelsProps['name'];
    }


    useEffect(() => {
        /* ------------------------------------------------------------
            Controls creation of menu region items.
            Triggered on {menuApi}, {menuStore}, {menuLevel} states, 
            so it only creates new items for regions -> districts.
        ------------------------------------------------------------ */
        
        // Initialize new menu list.
        var newMenu: Array<JSX.Element> = [];

        // Create list of JSX elements for menu region items.
        if (menuApiState.status === 'successful'
            && nextLevelindex !== 4     // range limit - 'lower' than districts, not possible
            && Object.keys(menuApiDataList).length !== 0) {
            
            if (renderDirection === 'zoom in') {
                // Create list of region elements.
                Object.entries(menuApiDataList).map((item: any) => {
                    item[1].forEach((elem: JSX.Element) => {
                        newMenu.push(createMenuItem(elem, categories, nextLevel));
                    })
                });

                // Save list of elements into state for retrieval on 'back' requests.
                newMenu.forEach((elem: JSX.Element) => {
                    activeMenuElementsProps.push(elem.props);
                });

                // Save current list of menu props in state.
                let JSXElemPayload = {[nextLevel]: activeMenuElementsProps};
                try {
                    if (menuStoreState.rendered[nextLevel][0].name !== activeMenuElementsProps[0].name) {
                        // Dispatch and write over the previous same-leveled geographic region.
                        // If condition necessary or else infinite loops.
                        dispatch(handleLevelStore(JSXElemPayload));
                    }

                } catch (TypeError) {
                    if (nextLevel in menuStoreState.rendered === false) {
                        // Dispatch if first time saving level.
                        dispatch(handleLevelStore(JSXElemPayload));
                    }
                }
            }
        }
    // data status,   menu clicks   
    }, [menuApiState, menuLevelState]);


    /* ------------------------------------------------------------------------
        Handles rendering of list of regions depending on render direction:
        'zoom out' == districts -> geographic region (back button)
        'zoom in'  == geographic region -> districts (default) 
    ------------------------------------------------------------------------ */
    var menu: Array<JSX.Element> = [];

    if (renderDirection === 'zoom out') {
        // Renders when back button is clicked, ie clicks in districts -> prefectures.
        // 'currentLevel' is now the parent level after back button dispatches level removal. 
        menu = getMenuList(currentLevel);

    } else if (renderDirection === 'zoom in' && renderedLength !== 0) {
        if (nextLevelindex <= 3) {
            // Render items of level above 'districts'
            menu = getMenuList(currentLevel);

        } else if (nextLevelindex > 3) {
            // Render the same item list of the parent city (unchanged).
            menu = getMenuList('level 3');
        }
    }


    const handleBackButton = (event: any) => {
        /* ------------------------------------------------------------------------------
            Handle 'back' button clicks to return to parent region and zooms out map
            by deleting most recent regions list from store, triggering render of list.
        ------------------------------------------------------------------------------ */
        event.preventDefault();

        if (nextLevelindex !== 0) {
            if (currentLevel !== undefined) {
                dispatch(handleStoreRemoval(currentLevel));
                dispatch(handleRenderDirection('zoom out'));
                dispatch(handleMenuLevelRemoval(currentLevel));
            }
        }
    }


    const handleSelectedButton = (event: any) => {
        /* --------------------------------------------
            Handle 'selected' button clicks.
            Shows selected menu by using CSS styling.
        -------------------------------------------- */
        event.preventDefault();

        const boxArrow = document.getElementById("Sidebar_regions_header_selected_button_arrow")!.classList;
        const selectedList = document.getElementsByClassName("Sidebar_regions_selected")[0].classList;

        if (boxArrow.length === 0) {
            boxArrow.add("open");
            selectedList.add("open");
        } else {
            boxArrow.remove("open");
            selectedList.remove("open");
        }
    }


    useEffect(() => {
        /* ------------------------------------------------------------
            Provide message about no data on selected filter options.
            Give suggestion on options for available data.
        ------------------------------------------------------------ */
        const collection: string = dataApiState.currentOptions.collection;
        const options: string = dataApiState.currentOptions.options;
        const notifyElem = document.getElementsByClassName("Sidebar_regions_notify")[0];

        try {
            let request = dataApiState.collections[collection][options];
            
            if (request === undefined) {
                // Notify user about unavailable data.
                notifyElem.classList.add("show");
            } else if (request) {
                notifyElem.classList.remove("show");
            }
        } catch (TypeError) {
            // if (DEV_MODE)
            //     console.log("No data from API call: initial render.");
        }
    }, [dataApiState]);


    /* ============================================================
                            Helper functions
    ============================================================ */

    function createMenuItem(item: any, categories: {[key: string]: string}, level: string) {
        /* -----------------------------------------
            Generate menu items for regions list.
        ----------------------------------------- */
        let levelNum: number = parseInt(level.replace(/\D/g, ''));
        let category: string = categories[level];
        let nextLevel: string = 'level ' + (levelNum + 1);
        let nextCategory: string = categories[nextLevel];
        let menuItem: JSX.Element;


        menuItem = (
            <CreateRegion 
                key={uuidv4()}
                name={item.name} 
                category={category}
                level={level}
                nextLevel={nextLevel}
                nextCategory={nextCategory}
            />
        );

        return menuItem;
    }


    function getMenuList(level: LevelsProps['name']) {
        /* ----------------------
            Generate menu list.
        ----------------------- */
        let menuToRender: Array<JSX.Element> = [];

        menuStoreState.rendered[level].forEach((elem: MenuElementProps) => {
            menuToRender.push(createMenuItem(elem, categories, elem.level));
        });

        return menuToRender;
    }


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'Sidebar_regions';


    return (
        <form className={getMediaQueries(classBase, locale)}>
            <div className={getMediaQueries(classBase.concat('_header'), locale)}>
                <div className={getMediaQueries(classBase.concat('_header_back'), locale)}>
                    
                    <button className=
                                {renderedLength <= 1 
                                    ? getMediaQueries(classBase.concat('_header_back_button'), locale)
                                    : getMediaQueries(classBase.concat('_header_back_button show'), locale)} 
                            name="menuBack" 
                            onClick={handleBackButton}>

                        <span id="Sidebar_regions_header_back_button_arrow">
                            &#129140;
                        </span>

                        {locale === 'en'
                            ? nextLevelindex === 0
                                ? ''
                                : nextLevelindex === 1  
                                    // Return to -- region
                                    ? SidebarRegSet[locale].backBtn.toReturn + ' ' + SidebarRegSet[locale].backBtn.generalReg
                                    // Return to -- prefecture etc.
                                    : SidebarRegSet[locale].backBtn.toReturn + ' ' + menuLevelState.active[prevLevel].name
                            // locale === 'jp'
                            : nextLevelindex === 0
                                ? ''
                                : nextLevelindex === 1
                                    // ～(地域)にもどる
                                    ? SidebarRegSet[locale].backBtn.generalReg + SidebarRegSet[locale].backBtn.toReturn
                                    // ～県(など)にもどる
                                    : menuLevelState.active[prevLevel].name + SidebarRegSet[locale].backBtn.toReturn}
                    </button>

                </div>
                <div className={getMediaQueries(classBase.concat('_header_selected'), locale)}>

                    <button className={getMediaQueries(classBase.concat('_header_selected_button'), locale)}
                            name="selectedList"
                            onClick={handleSelectedButton}>

                        <span id="Sidebar_regions_header_selected_button_arrow">
                            &#129155;
                        </span>

                    </button>

                </div>
            </div>
            <div className={getMediaQueries(classBase.concat('_list'), locale)}>
                <SidebarRegionsSelected />
                <div className={getMediaQueries(classBase.concat('_list_menu'), locale)}>
                    {menu}
                </div>
            </div>

            <div className={getMediaQueries(classBase.concat('_notify'), locale)}>
                <span className={getMediaQueries(classBase.concat('_notify_note'), locale)}>
                    {SidebarRegSet[locale].noDataNotify.note}
                </span>
                <ul className={getMediaQueries(classBase.concat('_notify_rec'), locale)}
                    id="Sidebar_regions_notify_rec_house">
                    {SidebarRegSet[locale].noDataNotify.houseRec.type}
                    <li className={getMediaQueries(classBase.concat('_notify_rec_item'), locale)}>
                        {SidebarRegSet[locale].noDataNotify.houseRec.material}
                    </li>
                    <li className={getMediaQueries(classBase.concat('_notify_rec_item'), locale)}>
                        {SidebarRegSet[locale].noDataNotify.houseRec.station}
                    </li>
                    <li className={getMediaQueries(classBase.concat('_notify_rec_item'), locale)}>
                        {SidebarRegSet[locale].noDataNotify.houseRec.age}
                    </li>
                    <li className={getMediaQueries(classBase.concat('_notify_rec_item'), locale)}>
                        {SidebarRegSet[locale].noDataNotify.houseRec.area}
                    </li>
                </ul>
                <ul className={getMediaQueries(classBase.concat('_notify_rec'), locale)}
                    id="Sidebar_regions_notify_rec_condo">
                    {SidebarRegSet[locale].noDataNotify.condoRec.type}
                    <li className={getMediaQueries(classBase.concat('_notify_rec_item'), locale)}>
                        {SidebarRegSet[locale].noDataNotify.condoRec.material}
                    </li>
                    <li className={getMediaQueries(classBase.concat('_notify_rec_item'), locale)}>
                        {SidebarRegSet[locale].noDataNotify.condoRec.station}
                    </li>
                    <li className={getMediaQueries(classBase.concat('_notify_rec_item'), locale)}>
                        {SidebarRegSet[locale].noDataNotify.condoRec.age}
                    </li>
                    <li className={getMediaQueries(classBase.concat('_notify_rec_item'), locale)}>
                        {SidebarRegSet[locale].noDataNotify.condoRec.area}
                    </li>
                </ul>
            </div>
        </form>
    );
}


// Types setting.
type MenuElementProps = {
    [index: string]: string | any,
    name: string,
    category: string,
    level: string,
    nextCategory: string
}

type LevelsProps = {
    name: 'level 0' | 'level 1' | 'level 2' | 'level 3'
}


export default SidebarRegions;
