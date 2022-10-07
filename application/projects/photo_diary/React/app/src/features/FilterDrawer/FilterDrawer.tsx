import React, { MouseEventHandler } from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
import './FilterDrawer.css';



const FilterDrawer: React.FunctionComponent = () => {
    /* ------------------------------------------------------------
        A main component - container for the filters on the left.
    ------------------------------------------------------------- */
    const filterablesState = useAppSelector(state => state.timeline.filterSelectables); 

    let formats: Array<string> = [];
    let cameras: Array<string> = [];
    let films: Array<string> = [];
    let lenses: Array<string> = [];
    let tags: Array<string> = [];
    let focalLengths: Array<string> = [];
    
    
    const onFilterClick = (event: React.SyntheticEvent) => {
        const filterElem = event.target as HTMLButtonElement;

        switch(filterElem.ariaLabel) {
            case 'FilterDrawer-format-item':
                console.log('format item click');
                break;
        
            case 'FilterDrawer-camera-item':
                console.log('camera item click');
                break;

            case 'FilterDrawer-focalLength-item':
                console.log('focalLength item click');
                break;

            case 'FilterDrawer-aperture-item':
                console.log('aperture item click');
                break;
        }    
    };

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

                {createCategory(classNames, "format", formats, onFilterClick)}
                {createCategory(classNames, "camera", cameras, onFilterClick)}
                {createCategory(classNames, "film", films, onFilterClick)}
                {createCategory(classNames, "lens", lenses, onFilterClick)}
                {createCategory(classNames, "tags", tags, onFilterClick)}
                {createCategory(classNames, "focalLength", focalLengths, onFilterClick)}

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
function createCategory(classNames: ClassNameTypes, categoryName: string, selectables: Array<string>, 
    onFilterClick: MouseEventHandler) {

    let categoryElem;
    if (categoryName !== "tags") {
        categoryElem = (
            <div className={classNames['parent']}
                role="group" aria-label={"FilterDrawer".concat("-", categoryName)}>
    
                <h1 className={classNames['title']}>
                    {categoryName !== "focalLength"
                        ? categoryName.toUpperCase()
                        : "FOCAL LENGTH"}
                </h1>
    
                <div className={classNames['options']}
                    role="group" aria-label={"FilterDrawer".concat("-", categoryName, "-options")}>
    
                    {selectables.map((selectable, index) => (
                        <button className={"FilterDrawer".concat("__", categoryName, "-item")}
                            role="checkbox" aria-label={"FilterDrawer".concat("-", categoryName, "-item")}
                            aria-checked="false"
                            key={"key".concat("_", categoryName, "_", index.toString())}
                            onClick={onFilterClick}>
                                {selectable}
                        </button>
                    ))}
                </div>
            </div>
        );
    } 
    else {
        categoryElem = (
            <div className={classNames['parent']}>
                <h1 className={classNames['title']}>
                    {categoryName.toUpperCase()}
                </h1>

                <div className={classNames['options']}
                    role="group" aria-label={"FilterDrawer".concat("-", categoryName, "-options")}>
                </div>
            </div>
        );
    }
    
    return categoryElem;
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
