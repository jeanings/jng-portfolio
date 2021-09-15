import React from "react";
import { useAppSelector } from '../hooks';
import CreateSelectedRegion from "./CreateSelectedRegion";
import { v4 as uuidv4 } from 'uuid';
import "./SidebarRegionsSelected.css";



const SidebarRegionsSelected: React.FC = () => {
    const selectionState = useAppSelector(state => state.selection.selected);
    let selected: SelectedProps = {
        'level 1': [],
        'level 2': [],
        "level 3": [],
        "level 4": []
    }


    // Create object of selected items.
    if (Object.keys(selectionState).length !== 0) {
        for (const [level, regions] of Object.entries(selectionState)) {
            for (const [region, props] of Object.entries(regions)) {
                let selectedElement = createSelectedItem(region, props.category, level);
                selected[level].push(selectedElement);
            }
        }
    }


    // Check for selected categories.
    const regionsExist: boolean = checkExistence('level 1');
    const prefecturesExist: boolean = checkExistence('level 2');
    const citiesExist: boolean = checkExistence('level 3');
    const districtsExist: boolean = checkExistence('level 4');

    // Helper: check category existence. '地方' 
    function checkExistence(level: string) {
        return selected[level].length === 0 ? false : true;
    }
    

    return (
        <div className="Sidebar_regions_selected">
            <span className="Sidebar_regions_selected_header">選択した地域</span>
            {regionsExist 
                ? <div className="Sidebar_regions_selected_category">
                    <span className="Sidebar_regions_selected_category_name">地方</span>
                    <div className="Sidebar_regions_selected_items">{selected['level 1']}</div>
                </div> 
                : ''}
            {prefecturesExist
                ? <div className="Sidebar_regions_selected_category">
                    <span className="Sidebar_regions_selected_category_name">都道府県</span>
                    <div className="Sidebar_regions_selected_items">{selected['level 2']}</div>
                </div>
                : ''}
            {citiesExist
                ? <div className="Sidebar_regions_selected_category">
                    <span className="Sidebar_regions_selected_category_name">市区町村</span>
                    <div className="Sidebar_regions_selected_items">{selected['level 3']}</div>
                </div>
                : ''}
            {districtsExist
                ? <div className="Sidebar_regions_selected_category">
                    <span className="Sidebar_regions_selected_category_name">地区</span>
                    <div className="Sidebar_regions_selected_items">{selected['level 4']}</div>
                </div>
                : ''}
        </div>
    );
}


// Helper: generate selected items for deletion list.
function createSelectedItem(name: string, category: string, level: string) {
    let selectedItem: JSX.Element;


    selectedItem = (
        <CreateSelectedRegion
            key={uuidv4()}
            name={name}
            category={category}
            level={level}
        />
    )
    return selectedItem;
}


// Types setting.
interface SelectedProps {
    [index: string]: string | any,
    'level 1': Array<JSX.Element>,
    'level 2': Array<JSX.Element>,
    'level 3': Array<JSX.Element>,
    'level 4': Array<JSX.Element>
}


export default SidebarRegionsSelected;