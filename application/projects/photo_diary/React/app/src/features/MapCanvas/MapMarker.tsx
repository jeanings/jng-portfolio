import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';


/* =============&============================
    Component for Mapbox clustered markers.
========================================== */
const MapMarker: React.FunctionComponent<MapMarkerProps> = (props: MapMarkerProps) => {
    const dispatch = useAppDispatch();
    const classBase: string = "";


    /* --------------------------------------------
        Handle app logins, passing code to thunk.
    -------------------------------------------- */        
    // Assign variables for each branch.
    // const leafElem: HTMLElement = branch.elements.pin;
    // const feature = branch.feature;
    // const leafDocId: string = feature.doc_id;
    // leafElem.appendChild(getLeafSvgIconElem());


    
    // // Get matching MongoDB doc with id.
    // const dbDoc = imageDocs?.filter(doc => doc._id === leafDocId)[0] as ImageDocTypes;
    // if (!dbDoc) {
    //     console.error('initBranchLeg: No MongoDB docs to match with Mapbox markers.');
    // }

    // // Add docId as id as identifier.
    // leafElem.id = `spider-pin__${dbDoc._id}`; 

    // // Clicks on leaves same as single markers, film strip clicks. 
    // leafElem.addEventListener('click', () => {
    //     if (leafDocId) {
    //         handleImageMarkerClicks(leafDocId);
    //     }
    // });
    console.log('map marker pin made')

    return (
        <>
            { }
        </>
    );
};


/* =====================================================================
    Helper functions.
===================================================================== */
export interface MapMarkerProps {
    [index: string]: string | HTMLElement | Element
    'pin': HTMLElement,
    'feature': any,
    'docId': string,
    'icon': Element
};


export default MapMarker;
