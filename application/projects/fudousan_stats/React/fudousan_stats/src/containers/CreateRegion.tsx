import React from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { handleMenuLevel, handleRenderDirection } from '../slices/menuLevelSlice';
import { handleSelection } from '../slices/selectionSlice';
import { mongoDbFetchRegions } from '../slices/menuApiSlice';
import './CreateRegion.css';



const CreateRegion: React.FC<CreateRegionProps> = (props: CreateRegionProps) => {
    /* --------------------------------------------------------------------
        Creates individual region's clickable name-button and checkboxes.
        Subscribes to {data}, {menuApi}, {menuLevel}, {selection} states.
    -------------------------------------------------------------------- */
    const dispatch = useAppDispatch();
    const dataState = useAppSelector(state => state.data);
    const menuApiState = useAppSelector(state => state.menuApi);
    const menuLevelState = useAppSelector(state => state.menuLevel);
    const selectionState = useAppSelector(state => state.selection.selected);
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
                    let mongoDbRequest: object = {[props.category]: props.name};
                    dispatch(mongoDbFetchRegions(mongoDbRequest));
                } else {
                    // console.log("Reusing menu data: ", category, name);
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
            // console.log("Data set doesn't exist with these parameters.", dataSet);
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


    return (
        <div className={"Sidebar_regions_item" + " " + props.name}>
            <label className={"Sidebar_regions_item_checkbox" + " " + availability}>
                <input type="checkbox" 
                    name={props.name}
                    data-category={props.category}
                    data-level={props.level}
                    checked={getChecked()}
                    onChange={onSelectionChange} />
                <span className="Sidebar_regions_item_checkbox_overlay"></span>
            </label>
            <button className={"Sidebar_regions_item_name" + " " + availability} 
                    type="button" 
                    name={props.name}
                    data-category={props.category}
                    data-level={props.level}
                    onClick={onLevelChange}>
                {props.name}
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
