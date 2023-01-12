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
            : classNameAddOn = "unavailable";

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

        // Update << filter >> state.
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

        // Update payload for clicked filter.
        // For non-empty filtered category.
        if (Object.keys(payloadFilteredQuery).includes(filterCategory)) {
            const updatedFilteredCategory: Array<FilterPayloadType> = clickAction === 'add'
                ? [...payloadFilteredQuery[filterCategory], selectable]     // add clicked filter
                : payloadFilteredQuery[filterCategory].filter(              // remove clicked filter
                    (filteredItem: string | number) => filteredItem !== selectable);
                        
            payloadFilteredQuery[filterCategory] = updatedFilteredCategory;            
        }
        // For empty filtered category. 
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
            className={ useMediaQueries(props.baseClassName.concat("__", "buttons"))
                +   // Grey out and disable button if unavailable for set of data.
                getAvailability()
                +   // Set "active" styling if filter is selected. 
                (activeFiltersInCategory.includes(selectable) === false
                    ? ""
                    : " ".concat("active")) }
            role="checkbox"
            aria-label={ props.categoryName.concat(" filter option") }
            aria-checked={ activeFiltersInCategory.includes(selectable) === false
                ? "false"
                : "true" }
            onClick={ onFilterClick }>

                { props.categoryName === 'focalLength'
                        ? props.selectableName.toString().concat('mm')      // Add focal length unit.
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
