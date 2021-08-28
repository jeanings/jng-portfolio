import React from "react";
import { useAppDispatch, useAppSelector } from '../hooks';
import { handleLevelStore, handleStoreRemoval } from '../slices/menuStoreSlice';
import { handleRenderDirection, handleMenuLevelRemoval } from '../slices/menuLevelSlice';
import CreateRegion from "./CreateRegion";
import SidebarRegionsSelected from "./SidebarRegionsSelected";
import { v4 as uuidv4 } from 'uuid';
import "./SidebarRegions.css";


const SidebarRegions: React.FC = () => {
    const dispatch = useAppDispatch();
    const menuStoreState = useAppSelector(state => state.menuStore);
    const menuLevelState = useAppSelector(state => state.menuLevel);
    const menuApiState = useAppSelector(state => state.menuApi);
    const renderDirection: string = menuLevelState.direction;
    const renderedLength: number = Object.keys(menuStoreState.rendered).length;
    const currentLevel: string = 'level' + ' ' + (Object.keys(menuLevelState.active).length - 1);
    const nextLength = Object.keys(menuLevelState.active).length;
    const nextLevel: string = 'level' + ' ' + nextLength;
    const categories: { [key: string]: string} = {
        'level 0': 'regions',
        'level 1': 'prefectures',
        'level 2': 'cities',
        'level 3': 'districts'
    }
    const nextCategory: string = categories[nextLevel];    
    let menu: Array<JSX.Element> = [];
    let prevElementKey: string;
    let activeMenuElementsProps: Array<MenuElementProps> = [];
    let menuApiDataList = menuApiState[nextCategory];
    let prevElemPropsList: Array<MenuElementProps> | null = null;
    if (renderedLength !== 0) {
        prevElementKey = 'level' + ' ' + (renderedLength - 1);
        prevElemPropsList = menuStoreState.rendered[prevElementKey];
    }

    // Create list of JSX elements for region items.
    if (menuApiState.status === 'successful' 
        && Object.keys(menuApiDataList).length !== 0) {
        
        if (renderDirection === 'zoom in') {
            Object.entries(menuApiDataList).map((item: any) => {
                item[1].forEach((elem: JSX.Element) => {
                    menu.push(createMenuItem(elem, categories, nextLevel));
                })
            });

            // Save all rendered menu items into state for retrieval on 'back' requests.
            menu.forEach((item: JSX.Element) => {
                activeMenuElementsProps.push(item.props);
            });
            let payload = {
                [nextLevel]: activeMenuElementsProps
            }

            // Save current list of menu props in state.
            try {
                if (menuStoreState.rendered[nextLevel][0].name !== activeMenuElementsProps[0].name) {
                    // Dispatch and write over the previous same-leveled geographic region.
                    // If condition necessary or else infinite loops. 
                    dispatch(handleLevelStore(payload));
                }
            } catch (TypeError) {
                if (nextLevel in menuStoreState.rendered === false) {
                    // Dispatch if first time saving same level.
                    dispatch(handleLevelStore(payload));
                }
            }
            
        } else if (renderDirection === 'zoom out') {
            prevElemPropsList?.forEach((item: MenuElementProps) => {
                menu.push(createMenuItem(item, categories, item.level));
            });
        }
    }


    // Handle 'back' button clicks.
    const handleBackButton = (event: any) => {
        event.preventDefault();
        if (nextLength !== 0) {
            if (prevElementKey !== undefined) {
                dispatch(handleStoreRemoval(prevElementKey));
                dispatch(handleRenderDirection('zoom out'));
                dispatch(handleMenuLevelRemoval(prevElementKey));
            }
        }
    }


    // Handle 'selected' button clicks.
    const handleSelectedButton = (event: any) => {
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


    return (
        <form className="Sidebar_regions">
            <div className="Sidebar_regions_header">
                <div className="Sidebar_regions_header_back">
                    <button className={renderedLength <= 1 
                                ? "Sidebar_regions_header_back_button"
                                : "Sidebar_regions_header_back_button show"} 
                            name="menuBack" 
                            onClick={handleBackButton}>
                        <span id="Sidebar_regions_header_back_button_arrow">
                            &#129140;
                        </span>
                        {nextLength === 0
                            ? ''
                            : nextLength === 1
                                ? '地域全体に'
                                : menuLevelState.active[currentLevel].name + 'に'}
                        戻る
                    </button>
                </div>
                <div className="Sidebar_regions_header_selected">
                    <button className="Sidebar_regions_header_selected_button"
                            name="selectedList"
                            onClick={handleSelectedButton}>
                        <span id="Sidebar_regions_header_selected_button_arrow">
                            &#129155;
                        </span>
                    </button>
                </div>
            </div>
            <div className="Sidebar_regions_list">
                <SidebarRegionsSelected />
                <div className="Sidebar_regions_list_menu">
                    {menu}
                </div>
            </div>
        </form>
    );
}


// Helper function to generate menu items for regions list.
function createMenuItem(item: any, categories: { [key: string]: string}, level: string) {
    let levelNum:number = parseInt(level.replace(/\D/g, ''));
    let category:string = categories[level];
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
    )
    return menuItem;
}


// Types setting.
type MenuElementProps = {
    [index: string] : string | any,
    name: string,
    category: string,
    level: string,
    nextCategory: string
}

export default SidebarRegions;