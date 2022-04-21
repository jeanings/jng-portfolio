import React from 'react';
import { useAppSelector } from '../hooks';
import { useMediaQueries } from '../App';
import './DateBar.css';



const DateBar: React.FC = () => {
    /* ------------------------------------------------------------
        A main component - container for the date selector up top.
    ------------------------------------------------------------- */


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'DateBar';

    return (
        <div className={useMediaQueries(classBase)}>
        </div>
    );
}


export default DateBar;
