import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
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
    }

    let selectedInCategory = useAppSelector(state => state.filter[filterCategory]);
    if (!selectedInCategory) {
        // Assign empty array if null.
        selectedInCategory = [];
    }


    /* ---------------------------------------------------------
        Gets add-on to class name for greying out reset button
        when no filters are selected.
    --------------------------------------------------------- */
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
    

    /* ------------------------------------------------------------
        Handle clicks on buttons.
        Dispatches addFilter or removeFilter actions depending if 
        filter exists or not in << filter >> state.
    ------------------------------------------------------------ */
    const onFilterClick = (event: React.SyntheticEvent) => {
        let payloadFilter: FilterPayloadType = {
            [filterCategory]: selectable
        };

        selectedInCategory.includes(selectable) === false
            ? dispatch(addFilter(payloadFilter))
            : dispatch(removeFilter(payloadFilter));
    };

   
    return (
        <button 
            className={ useMediaQueries(props.baseClassName.concat("__", "buttons"))
                +   // Grey out and disable button if unavailable for set of data.
                getAvailability()
                +   // Set "active" styling if filter is selected. 
                (selectedInCategory.includes(selectable) === false
                    ? ""
                    : "active") }
            role="checkbox"
            aria-label={ props.categoryName.concat(" filter option") }
            aria-pressed={ selectedInCategory.includes(selectable) === false
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
