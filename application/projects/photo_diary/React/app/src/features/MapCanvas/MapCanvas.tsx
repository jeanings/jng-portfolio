import React, { useEffect, useRef } from 'react';
import {
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { 
    setStyleLoadStatus, 
    setSourceStatus, 
    setMarkersStatus, 
    cleanupMarkerSource,
    setBoundsButton } from './mapCanvasSlice';
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
    const bounds = useAppSelector(state => state.timeline.bounds);
    const styleLoaded = useAppSelector(state => state.mapCanvas.styleLoaded);
    const fitBoundsButton = useAppSelector(state => state.mapCanvas.fitBoundsButton);
    const sourceStatus = useAppSelector(state => state.mapCanvas.sourceStatus);
    const markersStatus = useAppSelector(state => state.mapCanvas.markersStatus);
    const imageDocs = useAppSelector(state => state.timeline.imageDocs);
    const classBase: string = "MapCanvas";
    // Mapbox variables.
    const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX;
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.map | null>(null);
    const mapStyle: string = process.env.REACT_APP_MAPBOX_STYLE as string;
    const bbox: Array<Array<number>> = bounds !== null
        ? [ [ bounds!.lng[0], bounds!.lat[0] ],     // min bound coords
            [ bounds!.lng[1], bounds!.lat[1] ] ]    // max bound coords
        : []

    /* -------------------------------------------------
        Initialize map and add data source for markers 
        once data is loaded into state.
    ------------------------------------------------- */
    useEffect(() => {
        if (bounds !== null) {
            // Initialize map.
            if (map.current === null) {
                map.current = new mapboxgl.Map({
                    accessToken: MAPBOX_ACCESS_TOKEN,
                    container: mapContainer.current,
                    style: mapStyle,
                    zoom: 12,
                    bounds: bbox,
                    boxZoom: false,
                    doubleClickZoom: true,
                    dragPan: true,
                    dragRotate: false
                });
    
                // Set map loading status.
                map.current.on('load', () => {
                    dispatch(setStyleLoadStatus(true));
                });
            }
            // Add or refresh marker source.
            else if (styleLoaded === true) {
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
        }
    }, [bounds, styleLoaded]);

    
    /* -------------------------------------------------
        Map bounds-fitter for toolbar bounds button.
    ------------------------------------------------- */
    useEffect(() => {
        if (sourceStatus === 'loaded'
            && fitBoundsButton === 'clicked'
            && bounds !== null) {
                
            // Adjust and zoom map to fit all markers. 
            map.current.fitBounds(
            bbox,
            {
                padding: {
                    top: 150,
                    bottom: 150,
                    left: 250, 
                    right: 250
                },
                linear: false,
                animate: true,
                duration: 3500,
                curve: 1.2,
                maxZoom: 13
            });

            dispatch(setBoundsButton('idle'));
        }
    }, [fitBoundsButton])


    // Add marker layer if map is set up.
    if (sourceStatus === 'loaded'
        && markersStatus === 'idle'
        && bounds !== null) {

        // Create new photo marker layer.
        map.current.addLayer({
            'id': 'imageMarkers',
            'type': 'symbol',
            'source': 'imageSource',
            'layout': {
                'icon-image': 'bxs-pin',
                'icon-allow-overlap': true,
                'icon-size': 1,
                // 'symbol-z-order': 'source'
            },
        });
        
        // Adjust and zoom map to fit all markers. 
        map.current.fitBounds(
            bbox,
            {
                padding: {
                    top: 150,
                    bottom: 150,
                    left: 250, 
                    right: 250
                },
                linear: false,
                animate: true,
                duration: 3500,
                curve: 1.2,
                maxZoom: 13
            }
        );

        dispatch(setMarkersStatus('loaded'));
    }   


    /* --------------------------------------- 
        Handle clicks on markers for popups.
    ----------------------------------------*/
    if (markersStatus === 'loaded') {
        map.current.on('click', 'imageMarkers', (event: any) => {
            // Get document corresponding to marker.
            // const markerDocId = event.features[0].properties.id;
            // let markerDoc: ImageDocTypes;
            // for (let doc of imageDocs!) {
            //     if (doc._id === markerDocId) {               //  TODO: works on single markers, not clusters.
                    // markerDoc = doc;                         //  Look into using spiderify
            //     }
            // }
            const imageClassName = classBase.concat("__", "marker-image");
            const imageTag = '<img class="' + imageClassName + '" src="' + 'markerDoc!.url' + '">';

            new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: true,
            })
                .setLngLat(event.lngLat)
                .setHTML(imageTag)
                .addTo(map.current)
        });
    }


    
    return (
        <main className={ useMediaQueries(classBase) } 
            id="map" ref={ mapContainer }
            role="main" aria-label="map-canvas">
        </main>
    );
}


export default MapCanvas;
