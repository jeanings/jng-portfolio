import React, { useEffect } from 'react';
import { 
    useAppSelector, 
    useAppDispatch, 
    useMediaQueries } from '../../common/hooks';
import { 
    useLocation, 
    useNavigate,
    useSearchParams } from 'react-router-dom';
import FilterButton from './FilterButton';
import { clearFilters, FilterProps } from './filterDrawerSlice';
import {
    fetchImagesData,
    FilterableTypes,
    ImageDocsRequestProps, 
    ImageDocFormatTypes,
    TimelineProps,
    TimelineMonthTypes } from '../TimelineBar/timelineSlice';
import { getNumericalMonth } from '../TimelineBar/MonthButton';
import { routePrefixForYears } from '../TimelineBar/TimelineBar';
import './FilterDrawer.css';


/* =====================================================================
    A main component - container for filtering options.
    Renders all the filter options available in the set of image data.
===================================================================== */
const FilterDrawer: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { search } = useLocation();
    const [ searchParams, setSearchParams ] = useSearchParams();
    const filtered = useAppSelector(state => state.filter);
    const filterables = useAppSelector(state => state.timeline.filterSelectables);
    const timeline = useAppSelector(state => state.timeline.selected);
    const toolbarFilterSwitch = useAppSelector(state => state.toolbar.filter);
    const classBase: string = "FilterDrawer";
    const classNames: ClassNameTypes = {
        'parent': useMediaQueries(`${classBase}__parameters`),
        'title': useMediaQueries(`${classBase}__header`),
        'options': useMediaQueries(`${classBase}__options`),
        'base': classBase
    };

    /* -------------------------------------------------
        Clear all filters on selected timeline changes. 
    ------------------------------------------------- */
    useEffect(() => {
        if (timeline.year) {
            dispatch(clearFilters("RESET TO INIT STATE"));
        }
    }, [timeline.year]);

    
    /* ---------------------------------------------------
        Set search params (filter queries) for route.
    -------------------------------------------------- */
    useEffect(() => {
        const buildFilterParams = new FilterParams(filtered, searchParams, timeline.month);
        const updatedParams = buildFilterParams.apply();
        setSearchParams(updatedParams);

        const yearRoute: string = `${routePrefixForYears}/${timeline.year}`;
        // Get current payload for fetch.
        // returns object structured as { year: 2022, film: 'Kodak Gold 200' } etc. 
        let payloadFilteredQuery = getPayloadForFilteredQuery(filtered, timeline);
        
        // Re-assign category key to match backend's.
        for (let category in filtered) {
            const parsedCategoryKey = categoryKeysCamelToHyphen(category);
            
            // Don't add empty filters.
            if (filtered[category].length === 0) {
                continue;
            }

            payloadFilteredQuery[parsedCategoryKey] = filtered[category];
        }

        // Only fetch if filter queries exist.
        if (Object.keys(payloadFilteredQuery).length > 1) {
            dispatch(fetchImagesData(payloadFilteredQuery));
        }
        // Reroute to year route if filters cleared.
        else {
            if (timeline.year) {
                navigate(yearRoute);
            }
        }
    }, [filtered, timeline.month]);


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


    /* --------------------------------------------------------
        Handle button for resetting of filter state.
        Clears << filter >> and triggers fetch via useEffect.
    -------------------------------------------------------- */
    const onResetClick = (event: React.SyntheticEvent) => {
        dispatch(clearFilters("RESET TO INIT STATE"));

        // "Return" to unfiltered data state by fetching for selected timeline.
        const payloadFetchBaseTimeline: ImageDocsRequestProps = {
            'year': timeline.year as number
        };

        if (timeline.month !== 'all') {
            payloadFetchBaseTimeline['month'] = getNumericalMonth(timeline.month as TimelineMonthTypes);
        }

        dispatch(fetchImagesData(payloadFetchBaseTimeline));
    };


    /* ---------------------------------------------------------
        Gets add-on to class name for greying out reset button
        when no filters are selected.
    --------------------------------------------------------- */
    const getResetAvailability = () => {
        let filtersActive: boolean | null = null;
        let resetAvailablity: string = '';

        for (let filters of Object.entries(filtered)) {
            const queries = filters[1];
            
            if (queries?.length > 0) {
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
            : resetAvailablity = " " + "unavailable";

        return resetAvailablity;
    };

  
    return (
        <section 
            className={ useMediaQueries(classBase) 
                +   // Add "show" styling based on clicked state.
                (toolbarFilterSwitch === 'off'
                    ? ""
                    : " " + "show") }
            id={ classBase }
            role="form" 
            aria-label="filters menu">

            <div 
                className={ useMediaQueries(`${classBase}__parameters-container`) }>

                {/* Generates each filter category and its buttons. */}
                { createCategory(classNames, "format", formats) }
                { createCategory(classNames, "film", films as Array<string>) }
                { createCategory(classNames, "camera", cameras) }
                { createCategory(classNames, "lens", lenses) }
                { createCategory(classNames, "focalLength", focalLengths) }
                { createCategory(classNames, "tags", tags) }
            </div>

            <button 
                className={ useMediaQueries(`${classBase}__reset`) + getResetAvailability() }
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
function createCategory(
    classNames: ClassNameTypes, 
    categoryName: string, 
    selectables: Array<string | number>) {
    
    let sortedSelectables: Array<string | number> = [];
    if (selectables.length !== 0) {
        sortedSelectables = [...selectables].sort();
    } 

    return (
        <div 
            className={ classNames['parent'] }
            id={ categoryName }
            role="group"
            aria-label={ `${categoryName} filter group` }>

            <h1 
                className={ classNames['title']}>
                    { categoryName !== "focalLength"
                        ? categoryName.toUpperCase()
                        : "FOCAL LENGTH" }
            </h1>

            <div 
                className={ classNames['options'] }
                role="group" 
                aria-label={ `${categoryName} filter options` }>
                
                {/* Generate buttons for all the values in each filter category. */
                    sortedSelectables.map((selectable, index) => (
                        <FilterButton
                            baseClassName={ classNames['base'] }
                            categoryName={ categoryName }
                            selectableName={ selectable }
                            key={ `key_ ${categoryName}_${index.toString()}` }
                        />
                    )) }
            </div>
        </div>
    )
}


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
}


/* ---------------------------------------------
    Builds fetch payload for filtered queries.
--------------------------------------------- */
export function getPayloadForFilteredQuery(filterState: FilterableTypes, selectedTimeline: TimelineProps['selected']) {
    // Start with year parameter as base.
    let filteredQuery: ImageDocsRequestProps= {
        'year': selectedTimeline.year as number
    };

    // Add month if selected.
    if (selectedTimeline.month !== 'all') {
        filteredQuery['month'] = getNumericalMonth(selectedTimeline.month as TimelineMonthTypes);
    }

    const isFiltered = getFilterStateStatus(filterState);

    if (isFiltered === false) {
        return filteredQuery;
    }

    // Assign correct string for keys.
    for (let category in filterState) {
        if (filterState[category]!.length === 0) {
            continue;
        }

        switch(category) {
            case 'formatMedium':
                filteredQuery['format-medium'] = filterState[category] as Array<ImageDocFormatTypes['medium']>
                break;
            case 'formatType': 
                filteredQuery['format-type'] = filterState[category] as Array<ImageDocFormatTypes['type']>
                break;
            case 'film':
                filteredQuery['film'] = filterState[category] as Array<string>
                break;
            case 'camera':
                filteredQuery['camera'] = filterState[category]
                break;
            case 'lens':
                filteredQuery['lens'] = filterState[category]
                break;
            case 'focalLength':
                filteredQuery['focal-length'] = filterState[category] as Array<number>
                break;
            case 'tags':
                filteredQuery['tags'] = filterState[category]
                break;
        }
    }

    return filteredQuery;
}


// filtered: FilterProps, searchParams: URLSearchParams
// updateSearchParams.add()
export class FilterParams {
    filtered: FilterProps;
    searchParams: URLSearchParams;
    month: string | null;

    constructor(filtered: FilterProps, searchParams: URLSearchParams, month: string | null) {
        this.filtered = filtered;
        this.searchParams = searchParams;
        this.month = month;
    }

    apply() {
        const setParams = Object.keys(this.filtered).filter(category => this.filtered[category].length > 0);
    
        setParams.map(category => {
            let tags: Array<string> = [];
            for (let param in this.filtered[category]) {
                // Parse spaces into underscores.
                const keyword: string = this.filtered[category][param].toString().split(' ').join('_');
                if (category === 'tags') {
                    // Build 'tags' search params array.
                    tags.push(keyword);
                }
                else {
                    // Immediately set search params (no multiple params for category).
                    this.searchParams.set(category, keyword);
                }
            }
            // Set 'tags' params.
            if (category === 'tags') {
                this.searchParams.set(category, tags.join('+'));
            }
        });

        const clearParams = Object.keys(this.filtered).filter(category => this.filtered[category].length === 0);
        for (let category of clearParams) {
            this.searchParams.delete(category);            
        };

        // Only set 'month' param for actual months.
        if (this.month && this.month !== 'all') {
            this.searchParams.set('month', this.month);
        }
        else if (this.month) {
            this.searchParams.delete('month');
        }

        return this.searchParams;
    }
}


/* ------------------------------------------
    Get de/activated status of << filter >>
------------------------------------------ */
export function getFilterStateStatus(filtered: FilterableTypes) {
    let filteredStatus: boolean = false;
    for (let category in filtered) {
        if (filtered[category]!.length > 0) {
            filteredStatus = true;
            break;
        }
    }
    return filteredStatus;
}


/* =====================================================================
    Types.
===================================================================== */
export interface ClassNameTypes {
    [index: string]: string,
    'parent': string,
    'title': string,
    'options': string,
    'base': string
};


export default FilterDrawer;
