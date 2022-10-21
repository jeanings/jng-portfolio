import React , { useEffect, useRef } from 'react';
import { useAppDispatch, useAppSelector, useMediaQueries } from '../../common/hooks';
import { setStyleLoadStatus, setSourceStatus, setMarkersStatus, cleanupMarkerSource } from './mapCanvasSlice';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import './MapCanvas.css';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';



/* ================================================================
    A main component - container for the main portion of the app.
    Draws map pins on updates to image docs.
================================================================ */
const MapCanvas: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const geojson = useAppSelector(state => state.timeline.geojson);
    const mapState = useAppSelector(state => state.map);
    const classBase: string = 'MapCanvas';
    const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX;
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.map | null>(null);
    const mapStyle: string = process.env.REACT_APP_MAPBOX_STYLE as string;
    // const photoPinUrl: string = process.env.REACT_APP_MAPBOX_MARKER_ICON as string;
    // const themeColour = "hsl(24, 83%, 50%)";

    /* ---------------------------------------
        Initialize map on fetching new data.
    --------------------------------------- */
    useEffect(() => {
        if (map.current === null) {
            map.current = new mapboxgl.Map({
                accessToken: MAPBOX_ACCESS_TOKEN,
                container: mapContainer.current,
                style: mapStyle,
                center: [-122.90625772853042, 49.206604889479166],  // TODO: bounds
                zoom: 12,
                // bounds: [
                    // [mapState.bounds.sw.lng, mapState.bounds.sw.lat],
                    // [mapState.bounds.ne.lng, mapState.bounds.ne.lat]
                // ],
                // interactive: false
                boxZoom: false,
                doubleClickZoom: true,
                dragPan: true,
                dragRotate: false
            });

            // Set map status.
            map.current.on('load', () => {
                dispatch(setStyleLoadStatus(true));
            });
        }
    }, []);

    
    /* ------------------------------------------------
        Refresh souce and layers on new fetched data.
    ------------------------------------------------ */
    useEffect(() => {
        if (mapState.styleLoaded === true) {
            // Remove previous marker layer.
            if (map.current.getLayer('imageMarkers') !== undefined) {
                map.current.removeLayer('imageMarkers');
            }

            // Remove previous source data.
            if (map.current.getSource('imageSource') !== undefined) {
                map.current.removeSource('imageSource');
            }

            // Update map state so layer-adding effect triggers later.
            dispatch(cleanupMarkerSource('idle'));
            
            // checkForIconImage(map, photoPinUrl);

            // Add new set of data.
            map.current.addSource('imageSource', {
                'type': 'geojson',
                'data': geojson,
                'cluster': true,
                'clusterRadius': 45,
                'clusterMaxZoom': 15
            });

            // Update map state.
            dispatch(setSourceStatus('loaded'));
        }
    }, [geojson]);


    /* ----------------------------
        Add marker layer for map.
    ---------------------------- */
    
    if (mapState.sourceStatus === 'loaded'
        && mapState.markersStatus === 'idle') {

        // checkForIconImage(map, photoPinUrl);

        // Create new photo marker layer.
        map.current.addLayer({
            'id': 'imageMarkers',
            'type': 'symbol',
            'source': 'imageSource',
            'layout': {
                // 'icon-image': 'photo-pin',
                'icon-image': 'bxs-pin',
                'icon-allow-overlap': true,
                // 'icon-anchor': 'top-right',
                'icon-size': 1,
                // 'icon-padding': 15,
                // 'symbol-z-order': 'source'
            },
        });

        dispatch(setMarkersStatus('loaded'));
    }   


    
    return (
        <main className={useMediaQueries(classBase)} 
            id="map" ref={mapContainer}>
        </main>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* -------------------------------------------------------
    Wrapper for creating selectable year dropdown items.
------------------------------------------------------- */
function checkForIconImage(map: React.MutableRefObject<any>, photoPinUrl: string) {
    if (map.current.hasImage('photo-pin') === false) {
        // Load in external image.
        map.current.loadImage(photoPinUrl, (error: Error, image: object) => {
            if (error)
                throw error;
            // Add to map style.
            map.current.addImage('photo-pin', image, { sdf: true });
        });
    }
};



/* =====================================================================
    Types.
===================================================================== */
export interface GeojsonFeatureCollectionProps {
    [index: string]: string | object,
    'type': 'FeatureCollection',
    'features': Array<GeojsonFeatureType>
};

export type GeojsonFeatureType = {
    [index: string]: string | object,
    'type': string,
    'geometry': {
        'type': string,
        'coordinates': Array<number>
    },
    'properties': {
        'name': string,
        'date': {
            'year': number,
            'month': number
        }
    }
};

export default MapCanvas;
