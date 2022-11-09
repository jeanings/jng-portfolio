import React from 'react';
import { useAppDispatch, useMediaQueries } from '../../common/hooks';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import { handleEnlarger } from './sideFilmStripSlice';
import './ImageFrame.css';


/* ===============================================================
    Constructor for rendering images in << timeline.imageDocs >>
    state, sets them in container for styling.
=============================================================== */
const ImageFrame: React.FunctionComponent <ImageFrameProps> = (props: ImageFrameProps) => {
    const dispatch = useAppDispatch();
    const classBase: string = "ImageFrame";   

    /* ---------------------------------------------------------------
        Clicks on image dispatches action to change << enlargeDoc >>
        state, so an enlarged version with stats will be shown 
        in a panel to the left of film strip.
    --------------------------------------------------------------- */
    const onImageClick = (event: React.SyntheticEvent) => {
        const payloadImageDoc: ImageDocTypes = props.imageDoc;
        dispatch(handleEnlarger(payloadImageDoc));
    };

    
    return (
        <div className={ useMediaQueries(classBase) }
            role="none" aria-label="image-frame"
            onClick={onImageClick}>

            <img className={ useMediaQueries(classBase.concat("__", "image")) }
                src={ props.imageDoc.url_thumb }
                aria-label="image-frame-image"
                draggable="false"
            />
            
        </div>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* =====================================================================
    Types.
===================================================================== */
export interface ImageFrameProps {
    [index: string]: string | ImageDocTypes
    'baseClassName': string,
    'imageDoc': ImageDocTypes
};


export default ImageFrame;
