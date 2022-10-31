import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { 
    addFilter, 
    removeFilter, 
    FilterProps } from './filterDrawerSlice';
import './FilterButton.css';


/* ====================================================================
    A constructor component for creating available filter option
    buttons under each filter category.
==================================================================== */
const FilterButton: React.FunctionComponent<FilterButtonProps> = (props: FilterButtonProps) => {
    const dispatch = useAppDispatch();
    const baseSelectables = useAppSelector(state => state.timeline.filterSelectables);
    const monthSelectables = useAppSelector(state => state.timeline.filteredSelectables);

    /* ---------------------------------------------------------
        Gets add-on to class name for greying out reset button
        when no filters are selected.
    --------------------------------------------------------- */
    const getAvailability = () => {
        let buttonsToDisable: Array<string | number | null> = [];
        let classNameAddOn: string = '';

        if (baseSelectables !== null) {
            for (let filter of Object.entries(baseSelectables)) {
                const category = filter[0];
                const itemList = filter[1] as Array<string | number | null>;
        
                if (monthSelectables !== null) {
                    let difference = itemList?.filter(x => 
                        !monthSelectables[category]?.includes(x)
                    );
                    
                    // Append non-intersecting values of base/month selectables.
                    buttonsToDisable = [...buttonsToDisable, ...difference];
                }
            }
        }
            
        // Assign styling through classname.
        buttonsToDisable.includes(props.selectableName) === false
            ? classNameAddOn = ""
            : classNameAddOn = "unavailable";

        return classNameAddOn;
    };
    

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
        const ariaPressed = filterElem.getAttribute('aria-pressed');
        // Add class active for styling.
        ariaPressed === 'true'
            ? filterElem.classList.add("active")
            : filterElem.classList.remove("active");

        let payloadFilter: FilterProps;
        // Assign payload its corresponding key:val pairs based on category.
        switch(filterElem.getAttribute('aria-label')) {
            case 'filter-drawer-format-item':
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

            case 'filter-drawer-film-item':
                payloadFilter = { 'film': buttonText };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;
        
            case 'filter-drawer-camera-item':
                // Only dispatch camera model as 'camera'.
                const make: string = buttonText.split(' ', 1)[0];
                const modelStrings: Array<string> = buttonText.split(' ')
                    .filter(model => !model.includes(make));
                let camera: string = '';
                
                // Reconstruct camera model if it contains multiple parts of text.
                modelStrings.forEach(modelString =>
                    camera = camera.concat(' ', modelString).trim()
                );

                payloadFilter = { 'camera': camera };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'filter-drawer-lens-item':
                payloadFilter = { 'lens': buttonText };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'filter-drawer-focalLength-item':
                // Metadata has focal lengths in int, cleaning string is necessary.
                const focalLength: number = parseInt(buttonText.replace('mm', ''));
                payloadFilter = { 'focalLength': focalLength };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;

            case 'filter-drawer-tags-item':
                payloadFilter = { 'tags': buttonText };
                ariaPressed === 'true'
                    ? dispatch(addFilter(payloadFilter))
                    : dispatch(removeFilter(payloadFilter));
                break;
        }
    };

   

    return (
        <button 
            className={useMediaQueries(props.baseClassName.concat("__", "buttons")) + getAvailability()}
            role="checkbox" aria-label={"filter-drawer".concat("-", props.categoryName, "-item")}
            aria-pressed="false"
            onClick={onFilterClick}>

                {props.categoryName === 'focalLength'
                    ? props.selectableName.toString().concat('mm')      // Add focal length unit.
                    : props.selectableName}
                
        </button>
    );
}


/* =====================================================================
    Types.
===================================================================== */
export interface FilterButtonProps {
    'baseClassName': string,
    'categoryName': string,
    'selectableName': string | number
};


export default FilterButton;
