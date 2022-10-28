import React, { useEffect } from 'react';
import { 
    useAppSelector, 
    useAppDispatch, 
    useMediaQueries } from '../../common/hooks';
import FilterButton from './FilterButton';
import { clearFilters } from './filterDrawerSlice';
import { fetchImagesData, ImageDocsRequestProps, ImageDocFormatTypes } from '../TimelineBar/timelineSlice';
import './FilterDrawer.css';


/* ====================================================================
    A main component - container for filtering options.
    Renders all the filter options available in the set of image data.
==================================================================== */
const FilterDrawer: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const filterables = useAppSelector(state => state.timeline.filterSelectables);
    const yearSelected = useAppSelector(state => state.timeline.yearSelected);
    const filterState = useAppSelector(state => state.filter);
    const classBase: string = "FilterDrawer";
    const classNames: ClassNameTypes = {
        'parent': useMediaQueries(classBase.concat("__", "parameters")),
        'title': useMediaQueries(classBase.concat("__", "header")),
        'options': useMediaQueries(classBase.concat("__", "options")),
        'base': classBase
    };

    /* -------------------------------------------------------------
        Changes to << filter >> state will dispatch fetch request.
        Image counters will update but filterable items will not change,
        as those are fixed to the selected year.
    ------------------------------------------------------------- */
    useEffect(() => {
        if (yearSelected !== null) {
            let filterQueries: ImageDocsRequestProps= {
                'year': yearSelected as number
            }
            
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
           
            dispatch(fetchImagesData(filterQueries))
        }
    }, [filterState]);


    /* ---------------------------------------------
        Clear << filter >> state on changing year. 
    --------------------------------------------- */
    useEffect(() => {
        // Clear all "active" styling on pressed buttons.
        document.querySelectorAll('[role="checkbox"]').forEach(button =>
            button.classList.remove("active"));
        
        dispatch(clearFilters("RESET TO INIT STATE"));
    }, [yearSelected])



    // Prep fetched data for the filter groups.
    const cameras: Array<string> = filterables?.camera === undefined 
        ? []
        : filterables!.camera;
    const films: Array<string | null> = (filterables?.film === undefined
        || filterables?.film.includes(null) === true)      // for digital images, arrays have null value
            ? []
            : filterables!.film;
    const lenses: Array<string> = filterables?.lens === undefined
        ? []
        : filterables!.lens;
    const tags: Array<string> = filterables?.tags === undefined
        ? []
        : filterables!.tags;
    const focalLengths: Array<number> = filterables?.focalLength === undefined
        ? []
        : filterables!.focalLength;
    const formats: Array<string> = filterables?.formatMedium === undefined
        ? []
        : filterables?.formatType === undefined
            ? filterables!.formatMedium
            // Combines format medium and type values into the same 'format' category.
            : filterables!.formatMedium.concat(filterables!.formatType);
    
   
  
    return (
        <section className={useMediaQueries(classBase)} id={classBase}
            role="form" aria-label={"filter-drawer"}>
            <div className={useMediaQueries(classBase.concat("__", "parameters-container"))}
                role="group" aria-label={"filter-drawer".concat("-", "container")}>

                {/* Generates each filter category and its buttons. */}
                {createCategory(classNames, "format", formats)}
                {createCategory(classNames, "film", films as Array<string>)}
                {createCategory(classNames, "camera", cameras)}
                {createCategory(classNames, "lens", lenses)}
                {createCategory(classNames, "focalLength", focalLengths)}
                {createCategory(classNames, "tags", tags)}

            </div>
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
    return (
        <div className={classNames['parent']} id={categoryName}
            role="group" aria-label={"filter-drawer".concat("-", categoryName)}>

            <h1 className={classNames['title']}>
                {categoryName !== "focalLength"
                    ? categoryName.toUpperCase()
                    : "FOCAL LENGTH"}
            </h1>

            <div className={classNames['options']}
                role="group" aria-label={"filter-drawer".concat("-", categoryName, "-options")}>
                
                {/* Generate buttons for all the values in each filter category. */}
                {selectables.map((selectable, index) => (
                    <FilterButton
                        baseClassName={classNames['base']}
                        categoryName={categoryName}
                        selectable={selectable}
                        key={"key".concat("_", categoryName, "_", index.toString())}
                    />))
                }
            </div>
        </div>
    )
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
