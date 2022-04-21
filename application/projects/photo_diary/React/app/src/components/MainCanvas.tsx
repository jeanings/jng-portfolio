import React from 'react';
import { useAppSelector } from '../hooks';
import { useMediaQueries } from '../App';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import './MainCanvas.css';



const MainCanvas: React.FC = () => {
    /* ------------------------------------------------------------
        A main component - container for the main map canvas area.
    ------------------------------------------------------------- */


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'MainCanvas';

    
    return (
        <main className={useMediaQueries(classBase)}>
        </main>
    );
}


export default MainCanvas;
