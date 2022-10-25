import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch, useMediaQueries } from '../../common/hooks';
import './Toolbar.css';


/* ====================================================================
    A main component - container for toolbar buttons.
==================================================================== */
const Toolbar: React.FunctionComponent = () => {
    const classBase: string = "Toolbar";
    const dispatch = useAppDispatch();


    /* -------------------------------------------------------------

    ------------------------------------------------------------- */


    return (
        <menu className={useMediaQueries(classBase)}
            role="menu" aria-label="toolbar">
            

            
        </menu>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* --------------------------------------------
    Constructor for filter drawer categories.
-------------------------------------------- */



/* =====================================================================
    Types.
===================================================================== */
export type ClassNameTypes = {
    [index: string]: string,
    'parent': string,
    'title': string,
    'options': string,
};


export default Toolbar;
