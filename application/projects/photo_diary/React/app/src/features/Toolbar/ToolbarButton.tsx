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

        // Sets aria-checked, determines addFilter/removeFilter dispatches below.
        const setAriaPressed = toolbarButtonElem.getAttribute('aria-pressed') === 'false'
            ? 'true' : 'false';
        toolbarButtonElem.setAttribute('aria-pressed', setAriaPressed);
        const ariaPressed = toolbarButtonElem.getAttribute('aria-pressed');

        // Add class active for styling.
        ariaPressed === 'true'
            ? toolbarButtonElem.classList.add("active")
            : toolbarButtonElem.classList.remove("active");

        // Assign payload its corresponding key:val pairs based on category.
        switch(toolbarButtonElem.getAttribute('id')) {
            case 'Toolbar-filter':
                                        
                break;
            case 'Toolbar-bounds':

                break;
            case 'Toolbar-sidePanel':
                
                break;
        }
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
