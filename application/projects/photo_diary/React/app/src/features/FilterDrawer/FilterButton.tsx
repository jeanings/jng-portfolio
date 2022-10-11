import React from 'react';
import { useAppDispatch } from '../../common/hooks';
import { addFilter, removeFilter, FilterProps } from './filterDrawerSlice';
import './FilterButton.css';


/* ====================================================================
    A constructor component for creating available filter option
    buttons under each filter category.
==================================================================== */
const FilterButton: React.FunctionComponent<FilterButtonProps> = (props: FilterButtonProps) => {
    const dispatch = useAppDispatch();
    
    /* ------------------------------------------------------------
        Handle clicks on buttons.
        Dispatches addFilter or removeFilter actions depending if 
        filter exists or not in << filter >> state.
    ------------------------------------------------------------ */
    const onFilterClick = (event: React.SyntheticEvent) => {
        const filterElem = event.target as HTMLButtonElement;
        const buttonText = filterElem.textContent as string;
        // Sets aria-checked, determines addFilter/removeFilter dispatches below.
        const setAriaPressed = filterElem.getAttribute('aria-pressed') === 'false'
            ? 'true' : 'false';
        filterElem.setAttribute('aria-pressed', setAriaPressed);

        let payloadFilter: FilterProps;
        const ariaPressed = filterElem.getAttribute('aria-pressed');
        // Assign payload its corresponding key:val pairs based on category.
        switch(filterElem.getAttribute('aria-label')) {
            case 'FilterDrawer-format-item':
                // "Format" includes both medium (film, digital) and type (35mm, mirrorless)
                // but fetch API handles both as separate for querying. This handles separation
                // of each for querying MongoDB.
                payloadFilter = (filterElem.textContent === 'film'
                    || filterElem.textContent === 'digital')
                        ? { 'formatMedium': buttonText }
                        : { 'formatType': buttonText };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'FilterDrawer-film-item':
                payloadFilter = { 'film': buttonText };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;
        
            case 'FilterDrawer-camera-item':
                payloadFilter = { 'camera': buttonText };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'FilterDrawer-lens-item':
                payloadFilter = { 'lens': buttonText };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'FilterDrawer-focalLength-item':
                // Metadata have focal lengths in int, cleaning string is necessary.
                const focalLength: number = parseInt(buttonText.replace('mm', ''));
                payloadFilter = { 'focalLength': focalLength };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'FilterDrawer-tags-item':
                payloadFilter = { 'tags': buttonText };
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
