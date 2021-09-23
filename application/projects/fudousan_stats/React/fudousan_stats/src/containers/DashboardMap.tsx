import React, { useEffect, useRef} from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { handleBoundsUpdate, mapboxFetchGeo } from '../slices/mapSlice';
import regionCoords from '../imports/regionCoords';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import './DashboardMap.css';



const DashboardMap: React.FC = () => {
    /* --------------------------------------------------------------------------------
        Mapbox GL JS component that adds interactive map zooming on menu item clicks. 
        Subscribes to {menuLevel} and {map} states.
    -------------------------------------------------------------------------------- */
    const dispatch = useAppDispatch();
    const menuLevelState = useAppSelector(state => state.menuLevel);
    const mapState = useAppSelector(state => state.map);
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.map | null>(null);
    mapboxgl.accessToken = process.env.REACT_APP_DEV_MAPBOX;


    useEffect(() => {
        /* -------------------------------------
            Initialize map on initial render.
        ------------------------------------- */
        if (map.current === null) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/jeanings/cktoky46n1cw818kzolvwcpn5',
                center: [mapState.lng, mapState.lat],
                zoom: mapState.zoom,
                bounds: [
                    [mapState.bounds.sw.lng, mapState.bounds.sw.lat],
                    [mapState.bounds.ne.lng, mapState.bounds.ne.lat]
                ],
                // interactive: false
                boxZoom: false,
                doubleClickZoom: false,
                dragPan: true,
                dragRotate: false
            });
        }
    });


    useEffect(() => {
        /* ----------------------------------------------
            Send region props to Mapbox Geocoder API.
        ---------------------------------------------- */
        const menuLevels = Object.entries(menuLevelState.active);
        let name: string = '';
        let type: string = '';
        let partOf: string = '';
        let updateBounds;

        if (menuLevels.length > 1) {
            if (menuLevels.length === 4) {
                // Current view: district type.
                type = 'locality';
                name = menuLevelState.active['level 4'].name;
                partOf = menuLevelState.active['level 2'].name.concat(
                    ' ', menuLevelState.active['level 3'].name
                );
            } else if (menuLevels.length === 3) {
                // Current view: city type.
                type = 'place';
                name = menuLevelState.active['level 3'].name;
                partOf = menuLevelState.active['level 2'].name;
            } else if (menuLevels.length === 2) {
                // Current view: prefecture type.
                type = 'region';
                name = menuLevelState.active['level 2'].name;
                partOf = '';

                // Exception: Tokyo prefecture (bounding box from Mapbox way too big).
                if (name === '東京都') {
                    updateBounds = {
                        sw: {lng: 138.9396, lat: 35.4955},
                        ne: {lng: 139.9244, lat: 35.8984}
                    };

                    dispatch(handleBoundsUpdate(updateBounds));
                    
                    return;
                }
            }

            const mapboxRequest: MapboxGeocoderProps = {
                name: name,
                types: type,
                partOf: partOf
            };

            dispatch(mapboxFetchGeo(mapboxRequest));
        } else if (menuLevels.length === 1) {
            // Current view: region type.
            name = menuLevelState.active['level 1'].name;
            updateBounds = {
                sw: {lng: regionCoords[name].sw.lng, lat: regionCoords[name].sw.lat},
                ne: {lng: regionCoords[name].ne.lng, lat: regionCoords[name].ne.lat}
            };

            dispatch(handleBoundsUpdate(updateBounds));
        } else {
            // Current view: initial Japan bounds.
            updateBounds = {
                sw: {lng: 123.9681, lat: 23.9492},
                ne: {lng: 151.1719, lat: 46.3044}
            };

            dispatch(handleBoundsUpdate(updateBounds));
        }
    }, [menuLevelState.active]);


    useEffect(() => {
        /* ----------------------------------------------------------------
            Fit map to bounds or centre to coordinates on region change.
        ---------------------------------------------------------------- */
        if (map.current) {
            if (mapState.bounds.sw.lng !== null) {
                // Fit to bounds if API returns them.
                // Most likely any region other than district types.
                const bbox: Array<number> = [
                    mapState.bounds.sw.lng!, mapState.bounds.sw.lat!,
                    mapState.bounds.ne.lng!, mapState.bounds.ne.lat!
                ];

                map.current.fitBounds(
                    bbox, {
                        linear: false,
                        speed: 0.85,
                        curve: 2,
                        essential: true
                    }
                );
            } else if (mapState.zoom !== null) {
                // Centre to coordinates.
                // Most likely district types only.
                const center: Array<number> = [
                    mapState.lng, mapState.lat
                ];

                map.current.flyTo(
                    {
                        center: center,
                        speed: 0.55,
                        curve: 1.4,
                        zoom: mapState.zoom,
                        essential: true
                    }
                );
            }
        }
    }, [mapState.bounds, mapState.lng]);
        
    
    return (
        <div 
            id="map" 
            ref={mapContainer} 
            className="Dashboard_map_container">
        </div>
    );
}


// Types setting.
export type MapboxGeocoderProps = {
    name: string,
    types: string,
    partOf: string
}

export default DashboardMap;