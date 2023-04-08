import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { getPayloadForFilteredQuery } from './FilterDrawer';
import { 
    addFilter, 
    removeFilter, 
    FilterPayloadType } from './filterDrawerSlice';
import { fetchImagesData } from '../TimelineBar/timelineSlice';
import './FilterButton.css';


/* ====================================================================
    A constructor component for creating available filter option
    buttons under each filter category.
==================================================================== */
const FilterButton: React.FunctionComponent<FilterButtonProps> = (props: FilterButtonProps) => {
    const dispatch = useAppDispatch();
    const filterState = useAppSelector(state => state.filter);
    const selectedTimeline = useAppSelector(state => state.timeline.selected);
    const yearSelectables = useAppSelector(state => state.timeline.filterSelectables);
    const monthSelectables = useAppSelector(state => state.timeline.filteredSelectables);

    // Get corresponding category in filter state (may be different than props one).
    let filterCategory: string = props.categoryName;
    let selectable: string | number = props.selectableName;
    // Process and clean categoryName and selectableName.
    switch(props.categoryName) {
        case 'format':
            // Differentiate the categories for the format selectables.
            props.selectableName === 'film' || props.selectableName === 'digital'
                ? filterCategory = 'formatMedium'
                : filterCategory = 'formatType';
            break;

        case 'camera':
            // Get cleaned selectableName for filter state.
            const cameraMakeModel = props.selectableName as string;
            const make: string = cameraMakeModel.split(' ', 1)[0];
            const modelStrings: Array<string> = cameraMakeModel.split(' ')
                .filter(model => !model.includes(make));
            let cameraModelOnlyName: string = '';
            
            // Reconstruct camera model if it contains multiple parts of text.
            modelStrings.forEach(modelString =>
                cameraModelOnlyName = cameraModelOnlyName.concat(' ', modelString).trim()
            );
            selectable = cameraModelOnlyName;
            break;
    };

    // Get array of filter items in this button's category.
    const activeFiltersInCategory = useAppSelector(state => state.filter[filterCategory]);

    /* -----------------------------------------------------------
        Gets add-on to class name for greying out filter buttons 
        if they're not available to the selected month.
    ------------------------------------------------------- ---- */
    const getAvailability = () => {
        let buttonsToDisable: Array<string | number | null> = [];
        let classNameAddOn: string = '';

        if (yearSelectables !== null) {
            for (let filter of Object.entries(yearSelectables)) {
                const category = filter[0];
                const itemList = filter[1] as Array<any>;
        
                if (monthSelectables !== null) {
                    let difference = itemList.filter(x => 
                        !monthSelectables[category]!.includes(x)
                    );
                    
                    // Append non-intersecting values of base/month selectables.
                    buttonsToDisable = [...buttonsToDisable, ...difference];
                }
            }
        }
            
        // Assign styling through classname.
        buttonsToDisable.includes(props.selectableName) === false
            ? classNameAddOn = ""
            : classNameAddOn = " " + "unavailable";

        return classNameAddOn;
    };
    

    /* --------------------------------------------------------------------------------
        Handle clicks on filter buttons. 
        Updates << filter >> state on clicked status.
        Dispatches fetch request on updated << filter >> state.
    -------------------------------------------------------------------------------- */
    const onFilterClick = (event: React.SyntheticEvent) => {
        // Get current payload for fetch.
        // returns object structured as { year: 2022, film: 'Kodak Gold 200' } etc. 
        let payloadFilteredQuery = getPayloadForFilteredQuery(filterState, selectedTimeline);

        // Prepare payload for updating << filter >> state.
        let payloadFilter: FilterPayloadType = {
            [filterCategory]: selectable
        };

        let clickAction: 'add' | 'remove' = 'add';

        // Filter addition.
        if (activeFiltersInCategory.includes(selectable) === false) {
            clickAction = 'add';
            dispatch(addFilter(payloadFilter));
        }
        // Filter removal.
        else {
            clickAction = 'remove';
            dispatch(removeFilter(payloadFilter));
        }

        // Re-assign category key to match backend's.
        filterCategory = categoryKeysCamelToHyphen(filterCategory);

        // Update payload for fetching for clicked filter.
        // Add to existing actively filtered category.
        if (Object.keys(payloadFilteredQuery).includes(filterCategory)) {
            const updatedFilteredCategory: Array<FilterPayloadType> = clickAction === 'add'
                ? [...payloadFilteredQuery[filterCategory], selectable]     // add clicked filter
                : payloadFilteredQuery[filterCategory].filter(              // remove clicked filter
                    (filteredItem: string | number) => filteredItem !== selectable);
                        
            payloadFilteredQuery[filterCategory] = updatedFilteredCategory;
        }
        // Create new filter parameter object. 
        else {
            // By default, must be clickAction 'add'.
            payloadFilteredQuery[filterCategory] = [selectable]
        }

        // Delete filter category if it's now empty (deactivated)
        if (payloadFilteredQuery[filterCategory].length === 0) {
            delete payloadFilteredQuery[filterCategory];
        }

        dispatch(fetchImagesData(payloadFilteredQuery));
    };

   
    return (
        <button 
            className={ useMediaQueries(`${props.baseClassName}__buttons`)
                +   // Grey out and disable button if unavailable for set of data.
                getAvailability()
                +   // Set "active" styling if filter is selected. 
                (activeFiltersInCategory.includes(selectable) === false
                    ? ""
                    : " " + "active") }
            role="checkbox"
            aria-label={ `${props.categoryName} filter option` }
            aria-checked={ activeFiltersInCategory.includes(selectable) === false
                ? "false"
                : "true" }
            onClick={ onFilterClick }>

                { props.categoryName === 'focalLength'
                        ? props.selectableName.toString() + "mm"      // Add focal length unit.
                        : props.selectableName }                
        </button>
    );
}

/* =====================================================================
    Helper functions.
===================================================================== */

/* --------------------------------------------------------------------
    Convert parameter keys from camel case to hyphenated for backend. 
-------------------------------------------------------------------- */
function categoryKeysCamelToHyphen(filterCategory: string) {
    const upperCaseIndices: Array<number> = [];
    let hyphenatedCategoryKey: string = filterCategory;
    let processedStringParts: Array<string> = [];

    // Find all upper case characters in key string.
    for (let charIndex = 0; charIndex < filterCategory.length; charIndex++) {
        // Get index of upper case characters.
        if (filterCategory.charAt(charIndex) === filterCategory.charAt(charIndex).toUpperCase()) {
            upperCaseIndices.push(charIndex);
        }
    }

    // Break out early if hyphenating not needed.
    if (upperCaseIndices.length === 0) {
        return filterCategory;
    }

    // Loop through the upper case indices to get all replacement string parts.
    for (let index = 0; index < upperCaseIndices.length; index++) {
        let left: number;
        let right: number;

        switch(index === 0) {
            // Example with 'formatMediumType' with [6, 12]
            case true:
                left = 0;                           //  [0] -> | formatMediumType
                right = upperCaseIndices[index];    //  [6] -> format | MediumType
                break;
            case false:
                left = upperCaseIndices[index];     //  [6] -> format | MediumType
                right = upperCaseIndices[index + 1] !== undefined
                    ? upperCaseIndices[index + 1]   //  [12] -> formatMedium | Type
                    : filterCategory.length;        //  formatMediumType |
                break;
        }

        processedStringParts.push(
            filterCategory.slice(left, right).toLowerCase(),
        );
        
        // Add the rightmost part on final iteration.
        if (index === upperCaseIndices.length - 1) {
            processedStringParts.push(
                filterCategory.slice(right, filterCategory.length).toLowerCase()
            );
        }        
    }

    hyphenatedCategoryKey = processedStringParts.join("-");
    
    return hyphenatedCategoryKey;
};



/* =====================================================================
    Types.
===================================================================== */
export interface FilterButtonProps {
    'baseClassName': string,
    'categoryName': string,
    'selectableName': string | number
};


export default FilterButton;
