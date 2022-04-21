import React from 'react';
import { useAppSelector } from '../hooks';
import { useMediaQueries } from '../App';
import './FilterMenu.css';



const FilterMenu: React.FC = () => {
    /* ------------------------------------------------------------
        A main component - container for the filters on the left.
    ------------------------------------------------------------- */


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'FilterMenu';


    return (
        <div className={useMediaQueries(classBase)}>
        </div>
    );
}


export default FilterMenu;
