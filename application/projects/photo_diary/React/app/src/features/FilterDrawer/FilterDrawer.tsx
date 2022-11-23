import React, { useEffect } from 'react';
import { 
    useAppSelector, 
    useAppDispatch, 
    useMediaQueries } from '../../common/hooks';
import FilterButton from './FilterButton';
import { clearFilters } from './filterDrawerSlice';
import {
    fetchImagesData, 
    ImageDocsRequestProps, 
    ImageDocFormatTypes,
    TimelineMonthTypes, 
    FilterableTypes } from '../TimelineBar/timelineSlice';
import { getNumericalMonth } from '../TimelineBar/TimelineBar';
import './FilterDrawer.css';


/* ====================================================================
    A main component - container for filtering options.
    Renders all the filter options available in the set of image data,
    as well as handling filtered query fetches.
==================================================================== */
const FilterDrawer: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const filterables = useAppSelector(state => state.timeline.filterSelectables);
    const initFetch: boolean = useAppSelector(state => state.timeline.request) === 'initialized'
        ? true
        : false;
    const selectedYear = useAppSelector(state => state.timeline.selected.year);
    const selectedMonth = useAppSelector(state => state.timeline.selected.month);
    const filterState = useAppSelector(state => state.filter);
    const toolbarFilterSwitch = useAppSelector(state => state.toolbar.filter);
    const classBase: string = "FilterDrawer";
    const classNames: ClassNameTypes = {
        'parent': useMediaQueries(classBase.concat("__", "parameters")),
        'title': useMediaQueries(classBase.concat("__", "header")),
        'options': useMediaQueries(classBase.concat("__", "options")),
        'base': classBase
    };

    /* ----------------------------------------------------------------------
        Changes to << filter >> state will dispatch filtered fetch request.
        Image counters will update but filterable items will not change,
        as those are fixed to the selected year.
    ---------------------------------------------------------------------- */
    useEffect(() => {
        if (selectedYear !== null  && initFetch === false) {
            let filterQueries: ImageDocsRequestProps= {
                'year': selectedYear as number
            }
        
            // Add month if selected.
            if (selectedMonth !== 'all') {
                filterQueries['month'] = getNumericalMonth(selectedMonth as TimelineMonthTypes);
            }

            // Get status of filters.
            const filterStatus = getFilterStateStatus(filterState);

            // Only dispatch fetch query if filters activated.
            if (filterStatus === 'on') {
                // Assign correct string for keys.
                for (let category in filterState) {
                    if (filterState[category]!.length > 0) {
                        switch(category) {
                            case 'formatMedium':
                                filterQueries['format-medium'] = filterState[category] as Array<ImageDocFormatTypes['medium']>
                                break;
                            case 'formatType': 
                                filterQueries['format-type'] = filterState[category] as Array<ImageDocFormatTypes['type']>
                                break;
                            case 'film':
                                filterQueries['film'] = filterState[category] as Array<string>
                                break;
                            case 'camera':
                                filterQueries['camera'] = filterState[category]
                                break;
                            case 'lens':
                                filterQueries['lens'] = filterState[category]
                                break;
                            case 'focalLength':
                                filterQueries['focal-length'] = filterState[category] as Array<number>
                                break;
                            case 'tags':
                                filterQueries['tags'] = filterState[category]
                                break;
                        }
                    }
                }
                dispatch(fetchImagesData(filterQueries));
            }
        }
    }, [filterState]);


    /* --------------------------------------------------------
        Handle button for resetting of filter state.
        Clears << filter >> and triggers fetch via useEffect.
    -------------------------------------------------------- */
    const onResetClick = (event: React.SyntheticEvent) => {
        dispatch(clearFilters("RESET TO INIT STATE"));
    };


    // Prep fetched data for the filter groups.
    const cameras: Array<string> = filterables?.camera !== undefined 
        ? filterables!.camera
        : [];
    const films: Array<string | null> = (filterables?.film !== undefined
        && filterables?.film.includes(null) === false)      // for digital images, arrays have null value
            ? filterables!.film
            : [];
    const lenses: Array<string> = filterables?.lens !== undefined
        ? filterables!.lens
        : [];
    const tags: Array<string> = filterables?.tags !== undefined
        ? filterables!.tags
        : [];
    const focalLengths: Array<number> = filterables?.focalLength !== undefined
        ? filterables!.focalLength
        : [];
    const formats: Array<string> = filterables?.formatMedium !== undefined
        ? filterables?.formatType !== undefined
            // Combines format medium and type values into the same 'format' category.
            ? filterables!.formatMedium.concat(filterables!.formatType)
            : filterables!.formatMedium
        : [];

    
    /* ---------------------------------------------------------
        Gets add-on to class name for greying out reset button
        when no filters are selected.
    --------------------------------------------------------- */
    const getResetAvailability = () => {
        let filtersActive: boolean | null = null;
        let resetAvailablity: string = '';

        for (let filters of Object.entries(filterState)) {
            const queries = filters[1];
            
            if (queries?.length !== 0) {
                filtersActive = true;
                break;
            }
            else {
                filtersActive = false;
            }
        }

        // Assign styling through classname.
        filtersActive === true
            ? resetAvailablity = ""
            : resetAvailablity = " ".concat("unavailable");

        return resetAvailablity;
    };

  
    return (
        <section 
            className={ useMediaQueries(classBase) 
                +   // Add "show" styling based on clicked state.
                (toolbarFilterSwitch === 'off'
                        ? ""
                        : " ".concat("show")) }
            id={ classBase }
            role="form" 
            aria-label="filters menu">

            <div 
                className={ useMediaQueries(classBase.concat("__", "parameters-container")) }>

                {/* Generates each filter category and its buttons. */}
                { createCategory(classNames, "format", formats) }
                { createCategory(classNames, "film", films as Array<string>) }
                { createCategory(classNames, "camera", cameras) }
                { createCategory(classNames, "lens", lenses) }
                { createCategory(classNames, "focalLength", focalLengths) }
                { createCategory(classNames, "tags", tags) }
            </div>

            <button 
                    className={ useMediaQueries(classBase.concat("__", "reset")) + getResetAvailability() }
                    id="Toolbar__reset"
                    aria-label="reset filters"
                    onClick={ onResetClick }>

                    <svg xmlns="http://www.w3.org/2000/svg" id="icon-filter-reset" width="24" height="24" viewBox="0 0 24 24">
                        <path d="M12 16c1.671 0 3-1.331 3-3s-1.329-3-3-3-3 1.331-3 3 1.329 3 3 3z"/>
                        <path d="M20.817 11.186a8.94 8.94 0 0 0-1.355-3.219 9.053 9.053 0 0 0-2.43-2.43 8.95 8.95 0 0 0-3.219-1.355 9.028 9.028 0 0 0-1.838-.18V2L8 5l3.975 3V6.002c.484-.002.968.044 1.435.14a6.961 6.961 0 0 1 2.502 1.053 7.005 7.005 0 0 1 1.892 1.892A6.967 6.967 0 0 1 19 13a7.032 7.032 0 0 1-.55 2.725 7.11 7.11 0 0 1-.644 1.188 7.2 7.2 0 0 1-.858 1.039 7.028 7.028 0 0 1-3.536 1.907 7.13 7.13 0 0 1-2.822 0 6.961 6.961 0 0 1-2.503-1.054 7.002 7.002 0 0 1-1.89-1.89A6.996 6.996 0 0 1 5 13H3a9.02 9.02 0 0 0 1.539 5.034 9.096 9.096 0 0 0 2.428 2.428A8.95 8.95 0 0 0 12 22a9.09 9.09 0 0 0 1.814-.183 9.014 9.014 0 0 0 3.218-1.355 8.886 8.886 0 0 0 1.331-1.099 9.228 9.228 0 0 0 1.1-1.332A8.952 8.952 0 0 0 21 13a9.09 9.09 0 0 0-.183-1.814z"/>
                    </svg>
            </button>
        </section>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* --------------------------------------------
    Constructor for filter drawer categories.
-------------------------------------------- */
function createCategory(classNames: ClassNameTypes, categoryName: string, selectables: Array<string | number>) {
    let sortedSelectables: Array<string | number> = [];
    if (selectables.length !== 0) {
        sortedSelectables = [...selectables].sort();
    } 

    return (
        <div 
            className={ classNames['parent'] }
            id={ categoryName }
            role="group"
            aria-label={ categoryName.concat(" filter group") }>

            <h1 
                className={ classNames['title']}>
                    { categoryName !== "focalLength"
                        ? categoryName.toUpperCase()
                        : "FOCAL LENGTH" }
            </h1>

            <div 
                className={ classNames['options'] }
                role="group" 
                aria-label={ categoryName.concat(" filter options") }>
                
                {/* Generate buttons for all the values in each filter category. */
                    sortedSelectables.map((selectable, index) => (
                        <FilterButton
                            baseClassName={ classNames['base'] }
                            categoryName={ categoryName }
                            selectableName={ selectable }
                            key={ "key".concat("_", categoryName, "_", index.toString()) }
                        />
                    )) }
            </div>
        </div>
    )
}


/* ------------------------------------------
    Get de/activated status of << filter >>
------------------------------------------ */
export function getFilterStateStatus(filterState: FilterableTypes) {
    let filterStatus: string = 'off';
    for (let category in filterState) {
        if (filterState[category]!.length > 0) {
            filterStatus = 'on';
            break;
        }
    }
    return filterStatus;
}


/* =====================================================================
    Types.
===================================================================== */
export type ClassNameTypes = {
    [index: string]: string,
    'parent': string,
    'title': string,
    'options': string,
    'base': string
};


export default FilterDrawer;
