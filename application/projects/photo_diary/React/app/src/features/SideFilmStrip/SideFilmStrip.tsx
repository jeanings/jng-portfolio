import React, {
    useEffect, 
    useState, 
    useRef } from 'react';
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
    const [ filmStripHovered, setFilmStripHovered ] = useState(false);
    const imageDocs = useAppSelector(state => state.timeline.imageDocs);
    const filmStripRef = useRef<HTMLDivElement>(null);
    const classBase: string = "SideFilmStrip";


    /* -----------------------------------------------------------------------------
        Scroll film strip back to top on imageDoc changes - year/month selections.
    ----------------------------------------------------------------------------- */
    useEffect(() => {
        if (filmStripRef.current) {
            filmStripRef.current.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }
    }, [imageDocs]);
    

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
        setFilmStripHovered(true);
    };

    const onImageUnhover = (event: React.SyntheticEvent) => {
        setFilmStripHovered(false);
    };


    return (
        <aside 
            className={ useMediaQueries(classBase) }
            id={ classBase }
            role="main"
            aria-label="images panel">

            {/* Panel for enlarged image and its stats. */}
            <div 
                className={ useMediaQueries(classBase.concat("__", "image-enlarger-container"))
                    +   // Add "slide" styling: slides left if mouse hovered on film strip. 
                    (filmStripHovered === false
                        ? ""
                        : " ".concat("slide")) }
                id="image-enlarger-container"
                role="figure"
                aria-label="enlarged image with metadata">

                <ImageEnlarger 
                    baseClassName={ classBase }/>
            </div>

            {/* "Film strip" showing image collection in columnar form. */}
            <div 
                className={ useMediaQueries(classBase.concat("__", "film-strip")) 
                    +   // Add "expand" styling: reveals second column of images.
                    (filmStripHovered === false
                        ? ""
                        : " ".concat("expand")) }
                id="film-strip"
                ref={ filmStripRef }
                role="listbox" 
                aria-label="images strip"
                aria-expanded={ // Set expanded based on hover state. 
                    filmStripHovered === false
                        ? "false"
                        : "true" }
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
