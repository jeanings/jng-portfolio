import React, { useEffect } from 'react';
import { useAppSelector, useAppDispatch, useMediaQueries } from '../../common/hooks';
import ToolbarButton, { ToolbarButtonProps } from './ToolbarButton';
import './Toolbar.css';


/* ====================================================================
    A main component - container for toolbar buttons.
==================================================================== */
const Toolbar: React.FunctionComponent = () => {
    const classBase: string = "Toolbar";


    
    return (
        <menu className={useMediaQueries(classBase)}
            role="menu" aria-label={classBase}>
            
            <div className={useMediaQueries(classBase.concat("__", "button-container"))}>
                {createToolbarButton(classBase, 'filter')}
                {createToolbarButton(classBase, 'bounds')}
                {createToolbarButton(classBase, 'sidePanel')}
            </div>

        </menu>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* ----------------------------------
    Constructor for toolbar button.
---------------------------------- */
function createToolbarButton(classBase: string, buttonName: ToolbarButtonProps['name']) {
    return (
        <ToolbarButton 
            name={buttonName}
            baseClassName={classBase}
            key={"key".concat("_", classBase, "-", buttonName)}
        />
    )
}


export default Toolbar;
