import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector, useMediaQueries } from '../../common/hooks';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import './ImageEnlarger.css';


/* ====================================================================

==================================================================== */
const ImageEnlarger: React.FunctionComponent <ImageEnlargerProps> = (props: ImageEnlargerProps) => {
    const imageDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const classBase: string = "image-enlarger";
    let imageSource: string = "";

    /* ---------------------------------------------------------------
     
    --------------------------------------------------------------- */
    useEffect(() => {
        if (imageDoc !== null) {
            // add class to show panel
        }
        // else don't show
    }, [imageDoc])

    if (imageDoc !== null) {
        imageSource = imageDoc.url;
    }

    const enlargedImageElem: JSX.Element = (
        <img className={ useMediaQueries(props.baseClassName.concat(
            "__", classBase, "__", "image")) }
            src={ imageSource } 
            aria-label="enlarged-image"
        />
    )

    
    return (
        <div className={ useMediaQueries(props.baseClassName.concat("__", classBase)) }
            role="none" aria-label={ classBase }>

            { enlargedImageElem }

        </div>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* =====================================================================
    Types.
===================================================================== */
export interface ImageEnlargerProps {
    [index: string]: string,
    'baseClassName': string
}


export default ImageEnlarger;
