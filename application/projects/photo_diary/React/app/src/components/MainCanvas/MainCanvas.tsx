import React from 'react';
import { useAppSelector } from '../../hooks';
import { useMediaQueries } from '../../App';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';
import './MainCanvas.css';



const MainCanvas: React.FC = () => {
    /* ------------------------------------------------------------
        A main component - container for the main map canvas area.
    ------------------------------------------------------------- */

    
    /* ===============================================================
    
    To-do / pseudo code

    1) (carry-over from DateBar) initial render for default year's markers
    
    2) if selectedYear: state
        draw all markers for that year

        if selectedMonth: state
            draw all markers for that month in that selectedYear
    
        if selectedMonth: state is 'all
            draw all markers for selectedYear: state
    
    3) group nearby markers based on zoom (see Tokaido map features)

    4) spiderify grouped markers on click, exploding all markers radially

    5) pop-ups and enlarge photo styling etc
    
    

    State interaction:
    
        1) subscribe to list of photos according to DateBar selection --> photosList: state

        2) markers get rendered based on above states

        3) clicks on markers uses metadata saved in state
            --> async thunk, popup states, get img url

                
    
    ==================================================================== */



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
