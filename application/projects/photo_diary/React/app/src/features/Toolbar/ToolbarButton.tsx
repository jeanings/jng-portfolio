import React from 'react';
import './ToolbarButton.css';
import './ToolbarButton.css';


/* ====================================================================
    A constructor component for creating available filter option
    buttons under each filter category.
==================================================================== */
const ToolbarButton: React.FunctionComponent<ToolbarButtonProps> = (props: ToolbarButtonProps) => {    
    
    /* ------------------------------------------------------------
        Handle clicks on toolbar buttons.
    ------------------------------------------------------------ */
    const onToolbarButtonClick = (event: React.SyntheticEvent) => {
        const toolbarButtonElem = event.target as HTMLButtonElement;

    };

   

    return (
        <button className={props.baseClassName.concat("__", "button")} 
            id={props.baseClassName.concat("-", props.name)}
            role="button" aria-label={props.baseClassName.concat("-", "button")}
            aria-pressed="false"
            onClick={onToolbarButtonClick}>
                
        </button>
    );
}


/* =====================================================================
    Types.
===================================================================== */
export interface ToolbarButtonProps {
    name: string
    baseClassName: string
};


export default ToolbarButton;
