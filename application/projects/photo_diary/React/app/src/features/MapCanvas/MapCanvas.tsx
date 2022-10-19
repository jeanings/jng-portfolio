import React , { useEffect, useRef } from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import './MapCanvas.css';


/* ================================================================
    A main component - container for the main portion of the app.
    Draws map pins on updates to image docs.
================================================================ */
const MapCanvas: React.FunctionComponent = () => {
    const classBase: string = 'MapCanvas';
    const MAPBOX_ACCESS_TOKEN = process.env.REACT_APP_MAPBOX;
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.map | null>(null);
    const mapStyle: string = process.env.REACT_APP_MAPBOX_STYLE as string;

    /* ------------------------------------
        Initialize map on initial render.
    ------------------------------------ */
    useEffect(() => {
        if (map.current === null) {
            map.current = new mapboxgl.Map({
                accessToken: MAPBOX_ACCESS_TOKEN,
                container: mapContainer.current,
                style: mapStyle,
                center: [-122.420679, 37.772537],
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
        }
    }, []);


    
    return (
        <main className={useMediaQueries(classBase)} 
            id="map" ref={mapContainer}>
        </main>
    );
}


export default MapCanvas;
