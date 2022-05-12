import React from 'react';
import { useAppSelector } from '../hooks';
import { useMediaQueries } from '../App';
import './FilterMenu.css';



const FilterMenu: React.FC = () => {
    /* ------------------------------------------------------------
        A main component - container for the filters on the left.
    ------------------------------------------------------------- */


    /* ==================================================================== 
        
    To-do / pseudo code

        1) 
        
        2) 
    
        3) 


    State interaction
        
        1) 

        2) 

        3) 

    ==================================================================== */



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
