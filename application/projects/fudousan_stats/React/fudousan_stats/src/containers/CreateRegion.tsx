import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { handleMenuLevel, handleRenderDirection } from '../slices/menuLevelSlice';
import { handleSelection } from '../slices/selectionSlice';
import { mongoDbFetchRegions } from '../slices/menuApiSlice';
import './CreateRegion.css';



const CreateRegion: React.FC<CreateRegionProps> = (props: CreateRegionProps) => {
    const dispatch = useAppDispatch();
    const dataState = useAppSelector(state => state.data);
    const menuApiState = useAppSelector(state => state.menuApi);
    const menuLevelState = useAppSelector(state => state.menuLevel);
    const selectionState = useAppSelector(state => state.selection.selected);
    const availability: string = checkAvailability();
    
    
    // Check for and assign checkbox value based on current selection state.
    function getChecked(): boolean {
        let selectorCheck = selectionState?.[props.nextLevel]?.[props.name];
        let boxChecked: boolean = false;

        if (typeof(selectorCheck) !== 'undefined') {
            boxChecked = selectorCheck.selected;
        } 
        return boxChecked;
    }


    // Handle clicks on menu items.
    const onLevelChange = (event: any) => {
        if (availability === 'available') {
            // Create activeLevel state.
            const nextRender = {
                [props.nextLevel]: {
                    name: props.name,
                    category: props.category,
                }
            }
            
            // Only dispatch if not the final level.
            if (props.category != 'districts') {
                // Send to menu level slice for use as marker.
                dispatch(handleMenuLevel(nextRender));
                // Switch render direction.
                dispatch(handleRenderDirection('zoom in'));

                // Send to MongoDB thunk to get menu data (if first time retrieving).
                if (!menuApiState[props.nextCategory][props.name]) {
                    const param: object = {[props.category]: props.name};
                    dispatch(mongoDbFetchRegions(param));
                } else {
                    // console.log("Reusing menu data: ", category, name);
                }
            }
        }
    }


    // Handle clicks on selection checkboxes.
    const onSelectionChange = (event: any) => {
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


    // Helper: Checks current filter options against data, set interactivity based on CSS class.
    function checkAvailability(): string {
        const age: string = dataState.currentOptions.collection;
        const options: string = dataState.currentOptions.options;
        let className: string = '';
        let dataSet: any;
        let nameList: Array<string> = [];


        try {
            dataSet = dataState.collections[age][options];
        } catch (TypeError) {
            // console.log("Data set doesn't exist with these parameters.");
        }
        
        if (dataSet === undefined) {
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


    // Helper: return keys of objects in current level in data set.
    function getRegionsInLevel(dataSet: any): Array<string> {
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


    return (
        <div className={"Sidebar_regions_item" + " " + props.name}>
            <button className={"Sidebar_regions_item_name" + " " + availability} 
                    type="button" 
                    name={props.name}
                    data-category={props.category}
                    data-level={props.level}
                    onClick={onLevelChange}>
                {props.name}
            </button>
            <label className={"Sidebar_regions_item_checkbox" + " " + availability}>
                <input type="checkbox" 
                    name={props.name}
                    data-category={props.category}
                    data-level={props.level}
                    checked={getChecked()}
                    onChange={onSelectionChange} />
                <span className="Sidebar_regions_item_checkbox_overlay"></span>
            </label>
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

interface ChartDataSetProps {
    [index: string] : string | any
    category: string,
    partOf: {
        'level 1': PartOfProps | null,
        'level 2': PartOfProps | null,
        'level 3': PartOfProps | null,
        'level 4': PartOfProps | null,
    }
}

type PartOfProps = {
    [index: string] : string | any,
    category: string,
    name: string
}

export default CreateRegion;