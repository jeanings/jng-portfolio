import React, { useEffect, useRef } from 'react';
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
    // const mediaQuery: Array<string> = useMediaQueries('').split(' ');
    // const media = { 
    //     'type': mediaQuery[1] as keyof MediaTypes,
    //     'orientation': mediaQuery[2] as keyof PaddingTypes
    // };
    const classBase: string = "MapCanvas";
    // Mapbox variables.
    const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX;
    const mapStyle: string = process.env.REACT_APP_MAPBOX_STYLE as string;
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.map | null>(null);
    const markerIconImage: string = 'bxs-image';
    const markerIconPin: string ='bxs-pin';
    const spiderfier = useRef<any | null>(null);
    const bbox: Array<Array<number>> = bounds !== null
        ? [ [ bounds!.lng[0], bounds!.lat[0] ],     // min bound coords
            [ bounds!.lng[1], bounds!.lat[1] ] ]    // max bound coords
        : [];
  

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
                    fitboundsOptions: {
                        padding: getMapPaddingOffset('bound', windowSize)
                    },
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
                    'data': geojson,
                    'cluster': true,
                    'clusterRadius': 45,
                    'clusterMaxZoom': 15
                });
    
                // Set 'loaded' state to trigger addLayers.
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
                    padding: getMapPaddingOffset('bound', windowSize),
                    linear: false,
                    animate: true,
                    duration: 2500,
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
            && enlargeDoc !== null) {
            // Fly map to marker with offset to the left for image enlarger.
            const markerCoords: Array<number> = [
                enlargeDoc.gps.lng, enlargeDoc.gps.lat
            ]; 

            map.current.flyTo({
                center: markerCoords,
                offset: getMapPaddingOffset('fly', windowSize),
                linear: false,
                animate: true,
                duration: 2500,
                zoom: 13,
                maxZoom: 16
            });

            // Reset button state.
            dispatch(handleMarkerLocator('idle'));
        }
    }, [markerLocator])

    
    /* -------------------------------------------
        Add marker layers when source is added.
    ------------------------------------------- */
    if (sourceStatus === 'loaded'
        && markersStatus === 'idle'
        && bounds !== null) {

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
            bbox,
            {
                padding: getMapPaddingOffset('bound', windowSize),
                linear: false,
                animate: true,
                duration: 3500,
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
        // Scroll film strip to target image.
        const imageFrame = document.getElementById(markerDocId);
        if (imageFrame) {
            imageFrame.scrollIntoView({ behavior: 'smooth' });
        }

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
    if (markersStatus === 'loaded' && spiderfier.current !== null) {
        // Change cursor when hovering over image markers.
        map.current.on('mouseenter', 'imageMarkers', () => 
            map.current.getCanvas().style.cursor = 'pointer'
        );
        map.current.on('mouseleave', 'imageMarkers', () => 
            map.current.getCanvas().style.cursor = ''
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
            map.current.getCanvas().style.cursor = 'pointer'
        );
        map.current.on('mouseleave', 'imageMarkersClusters', () =>
            map.current.getCanvas().style.cursor = ''
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
            let topBoundOffset = windowSize.width > 800 
                && windowSize.width > windowSize.height
                    ? windowSize.height * 0.15
                    : windowSize.height * 0.13;
            let bottomBoundOffset = windowSize.width > 800 
                && windowSize.width > windowSize.height
                    ? windowSize.height * 0.15
                    : windowSize.height * 0.35;

            let leftBoundOffset = windowSize.width > 800 
                && windowSize.width > windowSize.height
                    ? windowSize.width * 0.15
                    : windowSize.width * 0.12;
            let rightBoundOffset = windowSize.width > 800
                && windowSize.width > windowSize.height
                    ? windowSize.width * 0.15
                    : windowSize.width * 0.12;

            padding = {
                'top': topBoundOffset,
                'bottom': bottomBoundOffset,
                'left': leftBoundOffset,
                'right': rightBoundOffset
            };
            return padding;

        case 'fly':
            // Assign different ratios depending on type of screen.
            let xAxisNegativeOffset = windowSize.width > 800
                && windowSize.width > windowSize.height
                    ? windowSize.width * -0.35      // Shifts center point to left of screen.
                    : 0;
           
            offset = [ xAxisNegativeOffset, 0 ];
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
    svgElem.setAttributeNS(null, "viewBox", "0 0" + " " + boxWidth + " " + boxHeight);
    svgElem.setAttributeNS(null, "width", boxWidth);
    svgElem.setAttributeNS(null, "height", boxHeight);
    
    const svgPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    svgPath.setAttribute("d", "M19.999 4h-16c-1.103 0-2 .897-2 2v12c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V6c0-1.103-.897-2-2-2zm-13.5 3a1.5 1.5 0 1 1 0 3 1.5 1.5 0 0 1 0-3zm5.5 10h-7l4-5 1.5 2 3-4 5.5 7h-7z");
    svgPath.setAttribute("fill", "#F0690F");

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
