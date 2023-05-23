import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector,  } from '../../common/hooks';
import { useParams, useSearchParams } from 'react-router-dom';
import { handleEnlarger, SideFilmStripProps } from './sideFilmStripSlice';
import { handleMarkerLocator } from '../MapCanvas/mapCanvasSlice';
import { FilterParams } from '../FilterDrawer/FilterDrawer';


/* =================================================================================
    Routes for each image doc in current dataset.
================================================================================= */
// const ImageThumbRoute: React.FunctionComponent<ImageFrameProps> = (props: ImageFrameProps) => {
    const ImageThumbRoute: React.FunctionComponent<any> = (props: any) => {
    const dispatch = useAppDispatch();
    const { docId } = useParams();
    const [ searchParams, setSearchParams ] = useSearchParams();
    const timeline = useAppSelector(state => state.timeline.selected);
    const filtered = useAppSelector(state => state.filter);
    const imageDocs = useAppSelector(state => state.timeline.imageDocs);
    const enlargeDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const markerLocator = useAppSelector(state => state.mapCanvas.markerLocator);
    
    // Get doc index of clicked image.
    const docIndex = imageDocs?.reduce((result, current, index) => {
        if (current._id === docId) {
            result = index;
        }
        return result;
    }, 0);

    /* ------------------------------------------------------
        Handles opening image enlarger and marker locating.
    ------------------------------------------------------ */
    useEffect(() => {
        if (docId 
            && typeof docIndex === 'number'
            && docId !== enlargeDoc?._id   // No dispatch if clicked image is the current image.
            && imageDocs) {              
            // Update enlarger doc state.
            const payloadImageDoc: SideFilmStripProps = {
                'enlargeDoc': imageDocs?.[docIndex as number],
                'docIndex': docIndex
            };
            dispatch(handleEnlarger(payloadImageDoc));

            // Zoom map to marker.
            dispatch(handleMarkerLocator('clicked'));
        }
    }, [docId, markerLocator]);


    /* -------------------------------------
        Preserve filter search parameters.
    ------------------------------------- */
    useEffect(() => {
        const buildFilterParams = new FilterParams(filtered, searchParams, timeline.month);
        const updatedParams = buildFilterParams.apply();
        setSearchParams(updatedParams);
    }, [docId, filtered]);

    
    return (
        // Not rendering anything, just dispatching action.
        <></>
    );
};


export default ImageThumbRoute;
