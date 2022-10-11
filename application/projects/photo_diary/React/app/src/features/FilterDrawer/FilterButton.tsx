import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../common/hooks';
import { addFilter, removeFilter, FilterProps } from './filterDrawerSlice';
import './FilterButton.css';


/* ====================================================================
    A constructor component for creating available filter option
    buttons under each filter category.
==================================================================== */
const FilterButton: React.FunctionComponent<FilterButtonProps> = (props: FilterButtonProps) => {
    const dispatch = useAppDispatch();
    
    const onFilterClick = (event: React.SyntheticEvent) => {
        const filterElem = event.target as HTMLButtonElement;
        const filterKeyword = filterElem.textContent as string;
        // Sets aria-checked, determines addFilter/removeFilter dispatches below.
        const setAriaPressed = filterElem.getAttribute('aria-pressed') === 'false'
            ? 'true' : 'false';
        filterElem.setAttribute('aria-pressed', setAriaPressed)

        let payloadFilter: FilterProps;
        const ariaPressed = filterElem.getAttribute('aria-pressed');
        // Assign payload its corresponding key:val pairs based on category.
        switch(filterElem.getAttribute('aria-label')) {
            case 'FilterDrawer-format-item':
                payloadFilter = (filterElem.textContent === 'film'
                    || filterElem.textContent === 'digital')
                        ? { 'formatMedium': filterKeyword }
                        : { 'formatType': filterKeyword };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'FilterDrawer-film-item':
                payloadFilter = { 'film': filterKeyword };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;
        
            case 'FilterDrawer-camera-item':
                payloadFilter = { 'camera': filterKeyword };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'FilterDrawer-lens-item':
                payloadFilter = { 'lens': filterKeyword };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'FilterDrawer-focalLength-item':
                const focalLength: number = parseInt(filterKeyword.replace('mm', ''));
                payloadFilter = { 'focalLength': focalLength };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'FilterDrawer-tags-item':
                payloadFilter = { 'tags': filterKeyword };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;
        }
    };

   

    return (
        <button className={"FilterDrawer".concat("__", props.categoryName, "-item")}
            role="checkbox" aria-label={"FilterDrawer".concat("-", props.categoryName, "-item")}
            aria-pressed="false"
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
