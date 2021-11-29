import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { handleMenuLevel, handleRenderDirection } from '../slices/menuLevelSlice';
import { handleSelection } from '../slices/selectionSlice';
import { mongoDbFetchRegions, MongoDbMenuFetchProps } from '../slices/menuApiSlice';
import { DEV_MODE } from '../App';
import { getMediaQueries } from '../App';
import './CreateRegion.css';



const CreateRegion: React.FC<CreateRegionProps> = (props: CreateRegionProps) => {
    /* -------------------------------------------------------------------------------
        Creates individual region's clickable name-button and checkboxes.
        Subscribes to {dataApi}, {menuApi}, {menuLevel}, {selection}, {language} states.
    ------------------------------------------------------------------------------- */
    // Dispatch, selector hooks.
    const dispatch = useAppDispatch();
    const dataState = useAppSelector(state => state.dataApi);
    const menuApiState = useAppSelector(state => state.menuApi);
    const menuLevelState = useAppSelector(state => state.menuLevel);
    const selectionState = useAppSelector(state => state.selection.selected);
    const languageState = useAppSelector(state => state.language);
    const locale = languageState.en === true ? 'en' : 'jp';
    // Other variables.
    const availability: string = checkAvailability();
    

    const onLevelChange = () => {
        /* --------------------------------
            Handle clicks on menu items.
        -------------------------------- */
        if (availability === 'available') {
            // Create activeLevel state.
            const nextRender = {
                [props.nextLevel]: {
                    name: props.name,
                    category: props.category,
                }
            }
            
            // Send to menu level slice for use as marker.
            dispatch(handleMenuLevel(nextRender));
            // Switch render direction.
            dispatch(handleRenderDirection('zoom in'));
            
            // Dispatch to MongoDB thunk for requests above 'districts'.
            if (props.category != 'districts') {
                // Send to MongoDB thunk to get menu data (if first time retrieving).
                if (!menuApiState[props.nextCategory][props.name]) {
                    let mongoDbRequest: MongoDbMenuFetchProps = {
                        'lang': locale,
                        [props.category]: props.name
                    };

                    dispatch(mongoDbFetchRegions(mongoDbRequest));
                } else {
                    if (DEV_MODE === 'True')
                        console.log("Reusing menu data: ", props.category, name);
                }
            }
        }
    }


    const onSelectionChange = (event: any) => {
        /* ------------------------------------------
            Handle clicks on selection checkboxes.
        ------------------------------------------ */

        // Create payload for selection state.
        const selected = {
            [props.nextLevel]: {
                name: props.name,
                category: props.category,
                selected: event.target.checked,
                partOf: menuLevelState.active
            }
        }

        // Send to selection slice for state handling.
        dispatch(handleSelection(selected));
    }


    /* =======================================================
                        Helper functions
    ======================================================= */

    function getChecked(): boolean {
        /* ------------------------------------------------------------------------
            Check for and assign checkbox value based on current selection state.
        ------------------------------------------------------------------------ */
        let selectorCheck = selectionState?.[props.nextLevel]?.[props.name];
        let boxChecked: boolean = false;

        if (typeof(selectorCheck) !== 'undefined') {
            boxChecked = selectorCheck.selected;
        }

        return boxChecked;
    }

    
    function checkAvailability(): string {
        /* ------------------------------------------------------------------------------------
            Checks current filter options against data, set interactivity based on CSS class.
        ------------------------------------------------------------------------------------ */
        const age: string = dataState.currentOptions.collection;
        const options: string = dataState.currentOptions.options;
        let className: string = '';
        let dataSet: any;
        let nameList: Array<string> = [];


        try {
            dataSet = dataState.collections[age][options];
        } catch (TypeError) {
            if (DEV_MODE === 'True')
                console.log("Data set doesn't exist with these parameters.", dataSet);
        }
        
        if (dataSet === undefined) {
            // Greys out selection with CSS styling.
            className = "unavailable";
        } else {
            nameList = getRegionsInLevel(dataSet);

            if (nameList.includes(props.name)) {
                className = "available";
            } else {
                className = "unavailable";
            }
        }

        return className;
    }


    function getRegionsInLevel(dataSet: any): Array<string> {
        /* ----------------------------------------------------
            Get keys of objects in current level in data set.
        ---------------------------------------------------- */
        const levelPref = menuLevelState.active['level 1'];    // toggled to show prefs
        const levelCity = menuLevelState.active['level 2'];    // cities
        const levelDist = menuLevelState.active['level 3'];    // districts


        if (!levelPref) {
            // 0th initial level rendered with 'regions' only.
            return Object.keys(dataSet.regions);
        } else if (levelPref) {
            // 1st level rendered with 'prefectures'.
            dataSet = dataSet.regions[levelPref.name].prefectures;
        }

        if (levelCity) {
            // 2nd level rendered with 'cities'.
            dataSet = dataSet[levelCity.name].cities;
        }

        if (levelDist) {
            // 3rd level rendered with 'districts'.
            dataSet = dataSet[levelDist.name].districts;
        }

        return Object.keys(dataSet);
    }


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'Sidebar_regions_item';


    return (
        <div className={getMediaQueries(classBase.concat(' ', props.name), locale)}>

            <label className={getMediaQueries(classBase.concat('_checkbox', ' ', availability), locale)}>
                <input type="checkbox" 
                    name={props.name}
                    data-category={props.category}
                    data-level={props.level}
                    checked={getChecked()}
                    onChange={onSelectionChange} />
                <span className={getMediaQueries(classBase.concat('_checkbox_overlay'), locale)}></span>
            </label>
            
            <button className={getMediaQueries(classBase.concat('_name', ' ', availability), locale)} 
                    type="button" 
                    name={props.name}
                    data-category={props.category}
                    data-level={props.level}
                    onClick={onLevelChange}>
                {locale === 'en'
                    ? props.category === 'regions'
                        // Kanto region etc
                        ? props.name.concat(' region')
                        : props.category === 'prefectures'
                            // Tokyo
                            ? props.name  === 'Tokyo'
                                ? props.name.concat(' Metropolis') 
                                : props.name
                            // Funabashi 'City'
                            : props.category === 'cities'
                                ? props.name.replace(',', ', ')
                                    .replace(' Village', '')
                                    .replace(' Town', '')
                                    .replace(' City', '')
                                    .replace(' County', '')
                                : props.name
                    // locale === 'jp'
                    : props.name }
            </button>
            
        </div>
    );
}


// Types setting.
interface CreateRegionProps {
    name: string,
    category: string,
    level: string,
    nextLevel: string,
    nextCategory: string,
}


export default CreateRegion;
