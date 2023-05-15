import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector,  } from '../../common/hooks';
import { handleEnlarger, SideFilmStripProps } from './sideFilmStripSlice';
import { handleMarkerLocator } from '../MapCanvas/mapCanvasSlice';
import { ImageFrameProps } from './ImageFrame';


/* =================================================================================
    Routes for each image doc in current dataset.
================================================================================= */
const ImageThumbRoute: React.FunctionComponent<ImageFrameProps> = (props: ImageFrameProps) => {
    const dispatch = useAppDispatch();
    const enlargeDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const markerLocator = useAppSelector(state => state.mapCanvas.markerLocator);
    
    /* ------------------------------------------------------
        Handles opening image enlarger and marker locating.
    ------------------------------------------------------ */
    useEffect(() => {
        if (props.imageDoc !== enlargeDoc) {
            const payloadImageDoc: SideFilmStripProps = {
                'enlargeDoc': props.imageDoc,
                'docIndex': props.docIndex
            };
            dispatch(handleEnlarger(payloadImageDoc));

            // Zoom map to marker.
            dispatch(handleMarkerLocator('clicked'));
        }
    }, [props.imageDoc, enlargeDoc, markerLocator]);
    
    
    return (
        // Not rendering anything, just dispatching action.
        <></>
    );
};


export default ImageThumbRoute;
