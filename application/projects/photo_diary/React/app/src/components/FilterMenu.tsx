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

        1) for all items in photosList
                highlight all options available from set of photos
                --> dim/grey-out options that unavailable for filtering 
        
        2) on click of filter buttons
                hide/show all photos containing the parameter
                --> save filtered items in separate state to be reinstated later (?)
    
        3) filters based on metadata parameters
            --> see DateBar pseudo


    State interaction
        
        1) subscribe to list of photos according to DateBar selection --> photosList: state

        2) according to metadata of photos, on/off states for filter buttons
            --> filterList: state
                --> focalLength: state on/off etc

        3) saved "removed" photos into list state for retrieval on removing filters

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
