import React from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import ImageFrame from './ImageFrame';
import ImageEnlarger from './ImageEnlarger';
import './SideFilmStrip.css';


/* =======================================================================
    A main component - container for showing thumbnail images from state 
    as well as showing enlarged image with stats from clicks on them and 
    through map markers. 
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



    return (
        <aside className={ useMediaQueries(classBase) } id={ classBase }
            role="aside" aria-label="side-film-strip">
            
            {/* Panel for showing stats and enlarged image, if a thumbnail or
                map marker is clicked. */}
            <ImageEnlarger 
                baseClassName={ classBase }/>

            <div className={ useMediaQueries(classBase.concat("__", "container")) }
                role="none" aria-label="film-strip-container">

                {/* Image containers for all docs in collection. */
                    imageFrameElems
                }
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
