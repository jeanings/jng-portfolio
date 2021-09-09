import React, { useEffect, useRef} from 'react';
import { useAppDispatch, useAppSelector } from '../hooks';
import { handleBoundsUpdate, mapboxFetchGeo } from '../slices/mapSlice';
import regionCoords from '../imports/regionCoords';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import './DashboardMap.css';



const DashboardMap: React.FC = () => {
    const dispatch = useAppDispatch();
    const menuLevelState = useAppSelector(state => state.menuLevel);
    const mapState = useAppSelector(state => state.map);
    const mapContainer = useRef(null);
    const map = useRef<mapboxgl.map | null>(null);
    mapboxgl.accessToken = process.env.REACT_APP_DEV_MAPBOX;


    // Initialize map (first render only).
    useEffect(() => {
        if (map.current === null) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: 'mapbox://styles/jeanings/cks7i4p090r9s18s3srb7d57l',
                center: [mapState.lng, mapState.lat],
                zoom: mapState.zoom,
                // interactive: false
                boxZoom: false,
                doubleClickZoom: false,
                dragPan: false,
                dragRotate: false
            });
        }
    });


    // Send region props to Mapbox Geocoder API.
    useEffect(() => {
        const menuLevels = Object.entries(menuLevelState.active);
        let name: string = '';
        let type: string = '';
        let partOf: string = '';

        if (menuLevels.length > 1) {
            if (menuLevels.length === 4) {
                // Current view: district type.
                name = menuLevelState.active['level 4'].name,
                type = 'locality',
                partOf = menuLevelState.active['level 2'].name + ' ' + menuLevelState.active['level 3'].name;
            } else if (menuLevels.length === 3) {
                // Current view: city type.
                name = menuLevelState.active['level 3'].name;
                type = 'place';
                partOf = menuLevelState.active['level 2'].name;
            } else if (menuLevels.length === 2) {
                // Current view: prefecture type.
                name = menuLevelState.active['level 2'].name;
                type = 'region';
                partOf = '';

                // Tokyo prefecture exception (bounding box from Mapbox way too big).
                if (name === '東京都') {
                    const updateBounds = {
                        sw: {lng: 138.9396, lat: 35.4955},
                        ne: {lng: 139.9244, lat: 35.8984}
                    }
                    dispatch(handleBoundsUpdate(updateBounds));
                    return;
                }
            }

            const mapboxRequest: MapboxGeocoderProps = {
                name: name,
                types: type,
                partOf: partOf
            }
            dispatch(mapboxFetchGeo(mapboxRequest));

        } else if (menuLevels.length === 1) {
            name = menuLevelState.active['level 1'].name;
            const updateBounds = {
                sw: {
                    lng: regionCoords[name].sw.lng,
                    lat: regionCoords[name].sw.lat
                },
                ne: {
                    lng: regionCoords[name].ne.lng,
                    lat: regionCoords[name].ne.lat
                }
            }
            dispatch(handleBoundsUpdate(updateBounds));
        }
    }, [menuLevelState.active]);


    // Fit map to bounding or central coordinates on region change.
    useEffect(() => {
        if (map.current) {
            if (mapState.bounds.sw.lng !== null) {
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
        <div id="map" ref={mapContainer} className="Dashboard_map_container">
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