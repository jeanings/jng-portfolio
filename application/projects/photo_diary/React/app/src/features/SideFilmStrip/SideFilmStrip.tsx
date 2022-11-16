import React, { useEffect } from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import ImageFrame from './ImageFrame';
import ImageEnlarger from './ImageEnlarger';
import './SideFilmStrip.css';


/* =======================================================================
    A main component - container for showing thumbnail images from state 
    as well as showing enlarged image with stats from clicks on thumbnails
    and through map markers. 
======================================================================= */
const SideFilmStrip: React.FunctionComponent = () => {
    const imageDocs = useAppSelector(state => state.timeline.imageDocs);
    const classBase: string = "SideFilmStrip";

    
    /* -----------------------------------------------------------
        Generate image frame elements for array of MongoDB docs.
    ----------------------------------------------------------- */
    let imageFrameElems: Array<JSX.Element> = [];
    
    if (imageDocs) {
        // Reverse order of collection, with most recent doc on top.
        [...imageDocs].reverse().map((imageDoc, index) => (
            imageFrameElems.push(
                createImageFrames(classBase, imageDoc, index)
            )
        ));
    }


    /* ------------------------------------------------------
        Handle expand/contract of film strip on hover/touch.
    ------------------------------------------------------ */
    const onImageHover = (event: React.SyntheticEvent) => {
        const filmStripContainerElem = document.getElementById("film-strip") as HTMLElement;
        const imageEnlargerContainerElem = document.getElementById("image-enlarger-container") as HTMLElement;
        filmStripContainerElem.setAttribute("aria-expanded", 'true');
        filmStripContainerElem.classList.add("expand");
        imageEnlargerContainerElem.classList.add("slide");
    };

    const onImageUnhover = (event: React.SyntheticEvent) => {
        const filmStripContainerElem = document.getElementById("film-strip") as HTMLElement;
        const imageEnlargerContainerElem = document.getElementById("image-enlarger-container") as HTMLElement;
        filmStripContainerElem.setAttribute("aria-expanded", 'false');
        filmStripContainerElem!.classList.remove("expand");
        imageEnlargerContainerElem.classList.remove("slide");

    };


    return (
        <aside className={ useMediaQueries(classBase) } id={ classBase }
            role="aside" aria-label="side-film-strip-panel">

            {/* Panel for enlarged image and its stats. */}
            <div className={ useMediaQueries(classBase.concat("__", "image-enlarger-container")) }
                id="image-enlarger-container"
                role="none" aria-label="image-enlarger-container">

                <ImageEnlarger 
                    baseClassName={ classBase }/>
            </div>

            {/* "Film strip" showing image collection in columnar form. */}
            <div className={ useMediaQueries(classBase.concat("__", "film-strip")) }
                id="film-strip"
                role="none" aria-label="film-strip-container"
                aria-expanded="false"
                onTouchStart={ onImageHover }
                onTouchEnd={ onImageUnhover }
                onMouseEnter={ onImageHover }
                onMouseLeave={ onImageUnhover }>

                { /* Image containers for all docs in collection. */
                    imageFrameElems }
            </div>

        </aside>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* -------------------------------------------------------------------------
    Constructor for 'frames' for each individual image in docs collection.
------------------------------------------------------------------------- */
function createImageFrames(classBase: string, imageDoc: ImageDocTypes, index: number) {
    let imageFrame: JSX.Element;
    
    imageFrame = (
        <ImageFrame
            baseClassName={ classBase }
            imageDoc={ imageDoc }
            key={ "key".concat("_", classBase, "_", index.toString()) }
        />
    );
    
    return imageFrame;
}


export default SideFilmStrip;
