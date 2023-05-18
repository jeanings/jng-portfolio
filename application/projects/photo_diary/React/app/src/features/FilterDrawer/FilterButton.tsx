import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries, } from '../../common/hooks';
import { 
    addFilter, 
    removeFilter, 
    FilterPayloadType } from './filterDrawerSlice';
import './FilterButton.css';


/* ====================================================================
    A constructor component for creating available filter option
    buttons under each filter category.
==================================================================== */
const FilterButton: React.FunctionComponent<FilterButtonProps> = (props: FilterButtonProps) => {
    const dispatch = useAppDispatch();
    const selectablesForYear = useAppSelector(state => state.timeline.filterSelectables);
    const selectablesForQueried = useAppSelector(state => state.timeline.filteredSelectables);

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
            // Reconstruct camera model if it contains multiple parts of text.
            const model: string = cameraMakeModel
                .split(' ')
                .filter((makeModel: string) => !makeModel.includes(make))
                .join(' ');
            selectable = model;
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

        if (selectablesForYear) {
            for (let filter of Object.entries(selectablesForYear)) {
                const category = filter[0];
                const itemList = filter[1] as Array<any>;

                if (selectablesForQueried === null) {
                    continue;
                }
                
                let difference = [];
                try {
                    if (selectablesForQueried[category]) {
                        difference = itemList.filter(x => 
                            !selectablesForQueried[category]?.includes(x)
                        );
                    }
                }
                catch (TypeError) {
                    // No differences found.
                }
                
                // Append non-intersecting values of base/month selectables.
                buttonsToDisable = [...buttonsToDisable, ...difference];
            }
        }
            
        // Assign styling through classname.
        buttonsToDisable.includes(props.selectableName) === false
            ? classNameAddOn = ""
            : classNameAddOn = " " + "unavailable";

        return classNameAddOn;
    };
    

    /* --------------------------------------------------------------------------------
        Handle clicks on filter buttons. Updates << filter >> state on clicked status.
        FilterDrawer handles actual fetches for filtered queries.
    -------------------------------------------------------------------------------- */
    const onFilterClick = (event: React.SyntheticEvent) => {
        // Prepare payload for updating << filter >> state.
        let payloadFilter: FilterPayloadType = {
            [filterCategory]: selectable
        };

        // Filter addition.
        activeFiltersInCategory.includes(selectable) === false
            ? dispatch(addFilter(payloadFilter))
            : dispatch(removeFilter(payloadFilter));
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
    Types.
===================================================================== */
export interface FilterButtonProps {
    'baseClassName': string,
    'categoryName': string,
    'selectableName': string | number
};


export default FilterButton;
