import React from 'react';
import { useMediaQueries } from '../../common/hooks';
import ToolbarButton, { ToolbarButtonProps } from './ToolbarButton';
import './Toolbar.css';


/* ====================================================================
    A main component - container for toolbar buttons.
==================================================================== */
const Toolbar: React.FunctionComponent = () => {
    const classBase: string = "Toolbar";

    
    return (
        <menu 
            className={ useMediaQueries(classBase) }
            role="menu"
            aria-label="toolbar">
            
            <div 
                className={ useMediaQueries(`${classBase}__button-container`) }>
                
                { createToolbarButton(classBase, 'filter') }
                { createToolbarButton(classBase, 'bounds') }
                { createToolbarButton(classBase, 'imageEnlarger') }
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
            name={ buttonName }
            baseClassName={ classBase }
            key={ "key_" +  classBase + "-" + buttonName }
        />
    )
}


export default Toolbar;
