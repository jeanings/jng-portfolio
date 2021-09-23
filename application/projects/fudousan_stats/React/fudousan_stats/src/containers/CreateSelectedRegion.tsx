import React from 'react';
import { useAppDispatch } from '../hooks';
import { clearSelection } from '../slices/selectionSlice';
import './CreateSelectedRegion.css';



const CreateSelectedRegion: React.FC<CreateSelectedRegionProps> = (props: CreateSelectedRegionProps) => {
    /* ------------------------------------------------------------
        Creates individual selected region's text and checkboxes.
    ------------------------------------------------------------ */
    const dispatch = useAppDispatch();
    
    const onDeleteRequest = (event: any) => {
        /* -----------------------------------------------------------
            Handle state change on selected regions' delete request.
        ----------------------------------------------------------- */
        const crossMarkClass = "Sidebar_regions_selected_item_checkbox_checked" + " " + event.target.name;
        const crossMarkElem = document.getElementsByClassName(crossMarkClass)[0];
        const levelClass = "Sidebar_regions_selected_item_checkbox" + "_" + event.target.name;
        const levelElem = document.getElementById(levelClass);
        const level = levelElem!.dataset.level as string;
        const name: string = event.target.name;
        

        // Checkbox cross mark styling.
        if (crossMarkElem.classList.contains("show")) {
            crossMarkElem.classList.remove("show")
        } else {
            crossMarkElem.classList.add("show");
        }

        const clearRequest = {
            level: level,
            name: name
        }

        // Send selection removal request.
        dispatch(clearSelection(clearRequest));
    }
  

    return (
        <div className={"Sidebar_regions_selected_item" + " " + props.name}>
            <label className={"Sidebar_regions_selected_item_checkbox"}>
                <input type="checkbox"
                    id={"Sidebar_regions_selected_item_checkbox" + "_" + props.name}
                    name={props.name}
                    data-category={props.category}
                    data-level={props.level}
                    onChange={onDeleteRequest} />
                <span className={"Sidebar_regions_selected_item_checkbox_checked" + " " + props.name}>&#10006;</span>
                <span className={"Sidebar_regions_selected_item_checkbox_overlay" + " " + props.name}></span>
            </label>
            <span className="Sidebar_regions_selected_item_name">{props.name}</span>
        </div>
    );
}


// Types setting.
interface CreateSelectedRegionProps {
    name: string,
    category: string,
    level: string
}


export default CreateSelectedRegion;