import React from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
import FilterButton from './FilterButton';
import './FilterDrawer.css';


/* ====================================================================
    A main component - container for filtering options.
    Renders all the filter options available in the set of image data.
==================================================================== */
const FilterDrawer: React.FunctionComponent = () => {
    const filterablesState = useAppSelector(state => state.timeline.filterSelectables); 

    // Prep fetched data for the filter groups.
    const cameras: Array<string> = filterablesState?.camera === undefined 
        ? []
        : filterablesState!.camera;
    const films: Array<string | null> = (filterablesState?.film === undefined
        || filterablesState?.film.includes(null) === true)      // for digital images, arrays have null value
            ? []
            : filterablesState!.film;
    const lenses: Array<string> = filterablesState?.lens === undefined
        ? []
        : filterablesState!.lens;
    const tags: Array<string> = filterablesState?.tags === undefined
        ? []
        : filterablesState!.tags;
    const focalLengths: Array<number> = filterablesState?.focalLength === undefined
        ? []
        : filterablesState!.focalLength;
    const formats: Array<string> = filterablesState?.formatMedium === undefined
        ? []
        : filterablesState?.formatType === undefined
            ? filterablesState!.formatMedium
            // Combines format medium and type values into the same 'format' category.
            : filterablesState!.formatMedium.concat(filterablesState!.formatType);
    
    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = "FilterDrawer";
    const classNames: ClassNameTypes = {
        'parent': useMediaQueries(classBase.concat("__", "parameters")),
        'title': useMediaQueries(classBase.concat("__", "header")),
        'options': useMediaQueries(classBase.concat("__", "options"))
    };
  
    

    return (
        <section className={useMediaQueries(classBase)}>
            <div className={useMediaQueries(classBase.concat("__", "parameters-container"))}
                role="group" aria-label="FilterDrawer-container">

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
            role="group" aria-label={"FilterDrawer".concat("-", categoryName)}>

            <h1 className={classNames['title']}>
                {categoryName !== "focalLength"
                    ? categoryName.toUpperCase()
                    : "FOCAL LENGTH"}
            </h1>

            <div className={classNames['options']}
                role="group" aria-label={"FilterDrawer".concat("-", categoryName, "-options")}>
                
                {/* Generate buttons for all the values in each filter category. */}
                {selectables.map((selectable, index) => (
                    <FilterButton 
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
};


export default FilterDrawer;
