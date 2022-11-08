import React from 'react';
import { useAppDispatch, useMediaQueries } from '../../common/hooks';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import './ImageFrame.css';


/* ====================================================================
    A main component - container for filtering options.
==================================================================== */
const ImageFrame: React.FunctionComponent <ImageFrameProps> = (props: ImageFrameProps) => {
    const dispatch = useAppDispatch();
    const classBase: string = "ImageFrame";   

    /* ----------------------------------------------------------
        Clicks on image dispatches action to change << >>, so
        an enlarged version with stats will be shown in a panel
        to the left.
    ---------------------------------------------------------- */
    const onImageClick = (event: React.SyntheticEvent) => {
       
    };

    
    return (
        <div className={ useMediaQueries(classBase) }
            role="none" aria-label="image-frame"
            onClick={onImageClick}>

            <img className={ useMediaQueries(classBase.concat("__", "image")) }
                src={ props.imageDoc.url_thumb }
                aria-label="image-frame-image" 
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
