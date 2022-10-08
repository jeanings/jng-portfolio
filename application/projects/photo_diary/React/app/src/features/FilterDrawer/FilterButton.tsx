import React, { useEffect } from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
import './FilterButton.css';


/* ====================================================================
    A constructor component for creating available filter option
    buttons under each filter category.
==================================================================== */
const FilterButton: React.FunctionComponent<FilterButtonProps> = (props: FilterButtonProps) => {
    const onFilterClick = (event: React.SyntheticEvent) => {
        const filterElem = event.target as HTMLButtonElement;

        switch(filterElem.ariaLabel) {
            case 'FilterDrawer-format-item':
                console.log('format item click');
                break;
        
            case 'FilterDrawer-camera-item':
                console.log('camera item click');
                break;

            case 'FilterDrawer-focalLength-item':
                console.log('focalLength item click');
                break;

            case 'FilterDrawer-aperture-item':
                console.log('aperture item click');
                break;
        }    
    };

   

    return (
        <button className={"FilterDrawer".concat("__", props.categoryName, "-item")}
            role="checkbox" aria-label={"FilterDrawer".concat("-", props.categoryName, "-item")}
            aria-checked="false"
            onClick={onFilterClick}>

                {props.categoryName === 'focalLength'
                    ? props.selectable.toString().concat('mm')      // Add focal length unit.
                    : props.selectable}                             
        </button>
    );
}


/* =====================================================================
    Types.
===================================================================== */
export interface FilterButtonProps {
    categoryName: string
    selectable: string | number
};


export default FilterButton;
