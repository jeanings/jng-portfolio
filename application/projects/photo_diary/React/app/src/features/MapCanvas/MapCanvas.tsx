import React, { 
    useEffect, 
    useRef } from 'react';
import {
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries, 
    useWindowSize } from '../../common/hooks';
import { 
    setStyleLoadStatus, 
    setSourceStatus, 
    setMarkersStatus, 
    cleanupMarkerSource,
    handleBoundsButton, 
    handleMarkerLocator } from './mapCanvasSlice';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import { handleEnlarger, SideFilmStripProps } from '../SideFilmStrip/sideFilmStripSlice';
import { handleToolbarButtons, ToolbarProps } from '../Toolbar/toolbarSlice';
import { FeatureCollection } from 'geojson';
import './MapCanvas.css';
import 'mapboxgl-spiderifier/index.css';
// @ts-ignore
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

const MapboxglSpiderfier: any = require('mapboxgl-spiderifier');

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
    const enlargeDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const toolbarImageEnlarger = useAppSelector(state => state.toolbar.imageEnlarger);
    const markerLocator = useAppSelector(state => state.mapCanvas.markerLocator);
    const windowSize = useWindowSize();
    const classBase: string = "MapCanvas";
    // Mapbox variables.
    const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX;
    const mapStyle: string = process.env.REACT_APP_MAPBOX_STYLE as string;
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const mapControl = useRef<mapboxgl.IControl>(new mapboxgl.NavigationControl());
    const markerIconImage: string = 'image-sharp';
    const markerIconPin: string ='images-sharp';
    const spiderfier = useRef<any | null>(null);
    const bbox: Array<Array<number>> = bounds !== null
        ? [ [ bounds!.lng[0], bounds!.lat[0] ],     // min bound coords
            [ bounds!.lng[1], bounds!.lat[1] ] ]    // max bound coords
        : [];
  
    /* ----------------------------------------------------
        Initialize map once data is successfully fetched.
    ---------------------------------------------------- */
    useEffect(() => {
        if (bounds !== null) {
            // Initialize map.
            if (map.current === null) {
                map.current = new mapboxgl.Map({
                    accessToken: MAPBOX_ACCESS_TOKEN,
                    container: mapContainer.current as HTMLDivElement,
                    style: mapStyle,
                    zoom: 12,
                    bounds: bbox as mapboxgl.LngLatBoundsLike,
                    fitBoundsOptions: {
                        padding: getMapPaddingOffset('bound', windowSize) as mapboxgl.PaddingOptions
                    },
                    boxZoom: false,
                    doubleClickZoom: true,
                    dragPan: true,
                    dragRotate: false,
                });
            }
        }
    }, [bounds, map.current]);

    
    /* ----------------------------------------------------------------------
        Once map initialized and data fetched, add data source for markers.
    ---------------------------------------------------------------------- */
    useEffect(() => {
        // Set loaded status and add controls once map initialized.
        if (bounds !== null && map.current && styleLoaded === false) {
            map.current.on('load', () => {
                dispatch(setStyleLoadStatus(true));
            });
        }
    }, [styleLoaded, bounds, map.current]);


    /* --------------------------------------------------------------------
        On new data fetches (bounds updated), refresh marker data source.
    -------------------------------------------------------------------- */
    useEffect(() => {
        // Add or refresh marker source.
        if (bounds !== null && map.current && styleLoaded === true) {
            // Reset spiderfy ref.
            if (spiderfier.current) {
                spiderfier.current.unspiderfy();
                spiderfier.current = null;
            }

            // Remove previous marker counter layer.
            removeMapLayerSource(map, 'layer', 'imageMarkersCounter');
            // Remove previous markers clusters layer.
            removeMapLayerSource(map, 'layer', 'imageMarkersClusters');
            // Remove previous marker layer.
            removeMapLayerSource(map, 'layer', 'imageMarkers');
            // Remove previous source data.
            removeMapLayerSource(map, 'source', 'imageSource');

            // Update map state so layer-adding effect triggers later.
            dispatch(cleanupMarkerSource('idle'));
            
            // Add new set of data.
            map.current.addSource('imageSource', {
                'type': 'geojson',
                'data': geojson as FeatureCollection,
                'cluster': true,
                'clusterRadius': 45,
                'clusterMaxZoom': 15
            });

            // Set 'loaded' state to trigger addLayers.
            dispatch(setSourceStatus('loaded'));
        }        
    }, [bounds, styleLoaded, map.current])


    /* ------------------------------------------------------------
        Add map zoom controls to bottom left corner on loaded map.
    ------------------------------------------------------------ */
    useEffect(() => {
        if (map.current && styleLoaded === true) {
            // Only add controls for larger, non-mobile screens.
            const controlAdded: boolean = map.current.hasControl(mapControl.current);
            const shouldAddControls: boolean = windowSize.width >= 800
                && windowSize.width > windowSize.height
                    ? true
                    : false;

            // Add map zoom controls.
            if (shouldAddControls === true) {
                if (controlAdded === false) {
                    map.current.addControl(mapControl.current, 'bottom-left');
                }
            }
            else {
                if (controlAdded === true) {
                    map.current.removeControl(mapControl.current);
                }
            }
        }
    }, [styleLoaded, windowSize, mapControl.current, map.current])


    /* -------------------------------------------------
        Map bounds-fitter for toolbar bounds button.
    ------------------------------------------------- */
    useEffect(() => {
        if (sourceStatus === 'loaded'
            && fitBoundsButton === 'clicked'
            && bounds !== null
            && map.current) {
            
            // Adjust and zoom map to fit all markers. 
            map.current.fitBounds(
                bbox as mapboxgl.LngLatBoundsLike,
                {
                    padding: getMapPaddingOffset('bound', windowSize) as mapboxgl.PaddingOptions,
                    linear: false,
                    animate: true,
                    duration: 1500,
                    curve: 1.2,
                    maxZoom: 13
                }
            );
            
            // Reset button state.
            dispatch(handleBoundsButton('idle'));
        }
    }, [fitBoundsButton])


    /* ------------------------------------------------
        Map marker locator for use in image enlarger.
    ------------------------------------------------ */
    useEffect(() => {
        if (sourceStatus === 'loaded'
            && markerLocator === 'clicked'
            && enlargeDoc !== null
            && map.current) {
            // Fly map to marker with offset to the left for image enlarger.
            const markerCoords: Array<number> = [
                enlargeDoc.gps.lng, enlargeDoc.gps.lat
            ]; 

            // Get current zoom level and only flyTo that zoom if lower value.
            // Eliminates cases where clicks on neighbouring markers while 
            // navigating using the map would kick into lower level zoom.
            let currentZoomLevel: number = map.current.getZoom();
            const toZoomLevel: number = 13;

            if (currentZoomLevel < toZoomLevel) {
                map.current.flyTo({
                    center: markerCoords as mapboxgl.LngLatLike,
                    offset: getMapPaddingOffset('fly', windowSize) as mapboxgl.PointLike,
                    animate: true,
                    duration: 1500,
                    zoom: toZoomLevel,
                });
            }
            else {
                map.current.flyTo({
                    center: markerCoords as mapboxgl.LngLatLike,
                    offset: getMapPaddingOffset('fly', windowSize) as mapboxgl.PointLike,
                    animate: true,
                    duration: 1500,
                    zoom: currentZoomLevel,
                });
            }

            // Reset button state.
            dispatch(handleMarkerLocator('idle'));
        }
    }, [markerLocator])

    
    /* -------------------------------------------
        Add marker layers when source is added.
    ------------------------------------------- */
    if (sourceStatus === 'loaded'
        && markersStatus === 'idle'
        && bounds !== null
        && map.current) {

            // Create new photo marker layer.
        map.current.addLayer({
            'id': 'imageMarkers',
            'type': 'symbol',
            'source': 'imageSource',
            'filter': [
                '!', [
                    'has', 'point_count'
                ]
            ],
            'layout': {
                'icon-image': markerIconImage,
                'icon-size': 1,
                'icon-allow-overlap': false,
                'symbol-z-order': 'source'
            }
        });

        // Create cluster layer (for spiderfying/branching).
        map.current.addLayer({
            'id': 'imageMarkersClusters',
            'type': 'symbol',
            'source': 'imageSource',
            'filter': [
                'all', [
                    'has', 'point_count'
                ]
            ],
            'layout': {
                'icon-image': markerIconPin,
                'icon-size': 1,
                'icon-allow-overlap': true,
                'symbol-z-order': 'source'
            }
        });

        // Cluster counter.
        map.current.addLayer({
            'id': 'imageMarkersCounter',
            'type': 'symbol',
            'source': 'imageSource',
            'layout': {
                'text-field': '{point_count}',
                'text-font': ['Knewave Regular', 'Courgette Regular'],
                'text-size': 20,
                'text-anchor': 'bottom',
                'text-offset': [-0.25, 2]
            },
            'paint': {
                'text-color': '#333333',            // warm grey css --colour-text-inactive
                'text-halo-color': '#FFFFCC',       // offwhite  css --colour-text-active
                'text-halo-width': 1,
            }
        });

        // Initialize marker cluster-expanding 'spiderfy' module.
        spiderfier.current = new MapboxglSpiderfier(map.current, {
            animate: true,
            animationSpeed: 500,
            customPin: true,
            circleSpiralSwitchover: 0,
            spiralFootSeparation: 85,
            spiralLengthStart: 55,
            spiralLengthFactor: 10,
            initializeLeg: ((branch: any) => {
                // Assign variables for each branch.
                const leafElem: HTMLElement = branch.elements.pin;
                const feature = branch.feature;
                const leafDocId: string = feature.doc_id;
                leafElem.appendChild(getLeafSvgIconElem());
                
                // Get matching MongoDB doc with id.
                const dbDoc = imageDocs?.filter(doc => doc._id === leafDocId)[0] as ImageDocTypes;
                if (!dbDoc) {
                    console.error('initBranchLeg: No MongoDB docs to match with Mapbox markers.');
                }

                // Add docId as id as identifier.
                leafElem.id = "spider-pin".concat("__", dbDoc._id); 

                // Clicks on leaves same as single markers, film strip clicks. 
                leafElem.addEventListener('click', () => {
                    if (leafDocId) {
                        handleImageMarkerClicks(leafDocId);
                    }
                });
            })
        });

        // Adjust and zoom map to fit all markers. 
        map.current.fitBounds(
            bbox as mapboxgl.LngLatBoundsLike,
            {
                padding: getMapPaddingOffset('bound', windowSize) as mapboxgl.PaddingOptions,
                linear: false,
                animate: true,
                duration: 1500,
                curve: 1.2,
                maxZoom: 13
            }
        );

        // Set 'loaded' as check for map.on() methods.
        dispatch(setMarkersStatus('loaded'));
    }   


    /* ---------------------------------------------------------------------------- 
        Click event listener on markers with same functionality as film strip
        thumbnail clicks.  Opens image enlarger, with added function of scrolling
        film strip to clicked marker image.
    ---------------------------------------------------------------------------- */
    function handleImageMarkerClicks(markerDocId: string) {
        const enlargeDocId: string = enlargeDoc !== null    
            ? enlargeDoc._id
            : '';

        // Dispatch new doc ID to enlarger, triggering loading and opening of enlarger.
        if (markerDocId !== enlargeDocId) {
            // Find index and doc.
            const docIndex: number = imageDocs!.findIndex(doc => doc._id === markerDocId);
            const markerImageDoc = imageDocs![docIndex];

            if (markerImageDoc) {
                const payloadImageDoc: SideFilmStripProps = {
                    'enlargeDoc': markerImageDoc,
                    'docIndex': docIndex
                };
                dispatch(handleEnlarger(payloadImageDoc));
            }
        }
        // Just open image enlarger if same image clicked.
        else if (markerDocId === enlargeDocId) {
            const payloadToolbarButtons: ToolbarProps = {
                'filter': 'off',
                'imageEnlarger': 'on'
            };
            
            if (toolbarImageEnlarger !== 'on') {
                dispatch(handleToolbarButtons(payloadToolbarButtons));
            }
        }
    };


    /* --------------------------------- 
        Handle various marker events.
    --------------------------------- */
    if (markersStatus === 'loaded' 
        && spiderfier.current !== null
        && map.current) {
        // Change cursor when hovering over image markers.
        map.current.on('mouseenter', 'imageMarkers', () => 
            map.current!.getCanvas().style.cursor = 'pointer'
        );
        map.current.on('mouseleave', 'imageMarkers', () => 
            map.current!.getCanvas().style.cursor = ''
        );

        // Clicks on single image markers
        map.current.on('click', 'imageMarkers', (event: any) => {
            const markerDocId = event.features[0].properties.doc_id;
            
            if (markerDocId) {
                handleImageMarkerClicks(markerDocId);
            }               
        });


        // Change cursor when hovering over image clusters.
        map.current.on('mouseenter', 'imageMarkersClusters', () => 
            map.current!.getCanvas().style.cursor = 'pointer'
        );
        map.current.on('mouseleave', 'imageMarkersClusters', () =>
            map.current!.getCanvas().style.cursor = ''
        );
        
        // Explode marker cluster into individual markers.
        map.current.on('click', 'imageMarkersClusters', (event: any) => 
            spiderfyClusters(event, map, spiderfier)
        );

        // Close branches on zooming.
        map.current.on("zoomstart", () => 
            spiderfier.current.unspiderfy()
        );
    }


    return (
        <main 
            className={ useMediaQueries(classBase) } 
            id="map"
            ref={ mapContainer }
            role="main"
            aria-label="map">
        </main>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */
/* ----------------------------------------------
    Get padding/offset for map animate methods,
    calculated off of window size.
---------------------------------------------- */
function getMapPaddingOffset(mode: string, windowSize: { [index: string]: number }) {
    let padding: PaddingType = {
        'top': 0,
        'bottom': 0,
        'left': 0,
        'right': 0
    };

    let offset: Array<number> = [ 0, 0 ];
    
    switch(mode) {
        case 'bound':
            // Assign different ratios depending on type of screen.
            let topBoundOffset = windowSize.width >= 800 
                && windowSize.width > windowSize.height
                    ? windowSize.height * 0.15      // Non-mobile, landscape
                    : windowSize.height * 0.13;     // Mobile or portrait
            let bottomBoundOffset = windowSize.width >= 800 
                && windowSize.width > windowSize.height
                    ? windowSize.height * 0.15      // Non-mobile, landscape
                    : windowSize.height * 0.35;     // Mobile or portrait

            let leftBoundOffset = windowSize.width >= 800 
                && windowSize.width > windowSize.height
                    ? windowSize.width * 0.10       // Non-mobile, landscape
                    : windowSize.width * 0.12;      // Mobile or portrait
            let rightBoundOffset = windowSize.width >= 800
                && windowSize.width > windowSize.height
                    ? windowSize.width * 0.25       // Non-mobile, landscape
                    : windowSize.width * 0.12;      // Mobile or portrait

            padding = {
                'top': topBoundOffset,
                'bottom': bottomBoundOffset,
                'left': leftBoundOffset,
                'right': rightBoundOffset
            };
            return padding;

        case 'fly':
            // Assign different ratios depending on type of screen.
            let xAxisOffset = windowSize.width > 800
                && windowSize.width > windowSize.height
                    ? windowSize.width * -0.25      // Shifts center point to left of screen for landscape
                    : 0;

            let yAxisOffset = windowSize.width < windowSize.height
                    ? windowSize.height * 0.10      // Shifts center point to mid-bottom of screen for portrait
                    : 0;
           
            offset = [ xAxisOffset, yAxisOffset ];
            return offset;
    }
};


/* --------------------------------------------------
    Create svg element for marker cluster leaves.
-------------------------------------------------- */
function getLeafSvgIconElem() {
    const xmlns: string = "http://www.w3.org/2000/svg";
    const boxWidth: string = '24';
    const boxHeight: string = '24';

    const svgElem: Element = document.createElementNS(xmlns, 'svg');
    svgElem.setAttributeNS(null, "viewBox", "0 0" + " " + "512" + " " + "512");
    svgElem.setAttributeNS(null, "width", boxWidth);
    svgElem.setAttributeNS(null, "height", boxHeight);
    
    const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");

    svgPath.setAttribute("d", "M456 64H56a24 24 0 00-24 24v336a24 24 0 0024 24h400a24 24 0 0024-24V88a24 24 0 00-24-24zm-124.38 64.2a48 48 0 11-43.42 43.42 48 48 0 0143.42-43.42zM76 416a12 12 0 01-12-12v-87.63L192.64 202l96.95 96.75L172.37 416zm372-12a12 12 0 01-12 12H217.63l149.53-149.53L448 333.84z");
    svgPath.setAttribute("fill", "#F0690F");
    // svgPath.setAttribute("d", "M19.999 4h-16c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm-13.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5.5 10h-7l4-5 1.5 2 3-4 5.5 7h-7z");

    svgElem.appendChild(svgPath);

    return svgElem;
}


/* ----------------------------------------------
    Checks and removes (previous) layer/source,
    used for new data fetches. 
---------------------------------------------- */
function removeMapLayerSource(map: React.MutableRefObject<any>, objectType: string, id: string) {
    switch(objectType) {
        case 'layer': 
            if (map.current.getLayer(id) !== undefined) {
                map.current.removeLayer(id);
            }
            break;
        case 'source':
            if (map.current.getSource(id) !== undefined) {
                map.current.removeSource(id);
            }
            break;
    }
};


/* --------------------------------------------------------
    Draws and animates exploding of marker cluster layer
    on click of clusters.  
-------------------------------------------------------- */
function spiderfyClusters(event: any, 
    map: React.MutableRefObject<any>, spiderfier: React.MutableRefObject<any>) {
    const spiderfyZoomLevel = 10;
    const features = map.current.queryRenderedFeatures(
        event.point, {
            layers: ['imageMarkersClusters']
        }
    );
    
    // Contracts currently exploded cluster.
    spiderfier.current.unspiderfy();

    if (!features.length) {
        console.error('spiderifyClusters: No Mapbox features to branch out.');
        return;
    } 
    else if (map.current.getZoom() < spiderfyZoomLevel) {
        map.current.easeTo({
            center: event.lngLat,
            zoom: map.current.getZoom() + 2,
            duration: 1500
        });
    }
    else {
        map.current.getSource('imageSource').getClusterLeaves(
            features[0].properties.cluster_id,
            30,         // max number of features to return.
            0,          // features to skip.
            function(error: any, leafFeatures: any) {
                if (error) {
                    return console.error("Error while retrieving leaves of a cluster", error);
                }

                let markers = leafFeatures.map((leafFeature: any) => {
                    return leafFeature.properties;
                });

                spiderfier.current.spiderfy(
                    features[0].geometry.coordinates,
                    markers
                );
            }
        );
    }
};


/* =====================================================================
    Types.
===================================================================== */
export type PaddingType = {
    [index: string]: number,
    'top': number,
    'bottom': number,
    'left': number,
    'right': number
};


export default MapCanvas;
