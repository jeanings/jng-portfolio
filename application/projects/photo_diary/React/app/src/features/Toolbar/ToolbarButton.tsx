import React from 'react';
import { 
    useAppSelector, 
    useAppDispatch, 
    useMediaQueries } from '../../common/hooks';
import { handleBoundsButton } from '../MapCanvas/mapCanvasSlice';
import { handleToolbarButtons, ToolbarProps } from './toolbarSlice';
import './ToolbarButton.css';


/* ====================================================================
    A constructor component for creating available filter option
    buttons under each filter category.
==================================================================== */
const ToolbarButton: React.FunctionComponent<ToolbarButtonProps> = (props: ToolbarButtonProps) => {    
    const dispatch = useAppDispatch();
    const toolbarState = useAppSelector(state => state.toolbar);
    const mapStyleLoaded = useAppSelector(state => state.mapCanvas.styleLoaded);
    const enlargeDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
   

    /* -----------------------------------
        Handle clicks on toolbar buttons.
    ----------------------------------- */
    const onToolbarButtonClick = (event: React.SyntheticEvent) => {
        switch(props.name) {
            case 'filter': 
                // Fade in.
                if (toolbarState.filter === 'off') {
                    const payloadToolbarButtons: ToolbarProps = {
                        'filter': 'on',
                        'imageEnlarger': 'off'
                    };
                    dispatch(handleToolbarButtons(payloadToolbarButtons));
                }
                // Fade out, changing z-index to be under map canvas
                // so all clickable elements are disabled. 
                else {
                    const payloadToolbarButtons: ToolbarProps = {
                        'filter': 'off',
                    };
                    dispatch(handleToolbarButtons(payloadToolbarButtons));
                }
                break;

            case 'bounds':
                if (mapStyleLoaded === true) {
                    dispatch(handleBoundsButton('clicked'));
                }
                break;

            case 'imageEnlarger':
                // Fade in.
                if (toolbarState.imageEnlarger === 'off') {
                    const payloadToolbarButtons: ToolbarProps = {
                        'filter': 'off',
                        'imageEnlarger': 'on'
                    };
                    dispatch(handleToolbarButtons(payloadToolbarButtons));
                }
                // Fade out, changing z-index to be under map canvas
                // so all clickable elements are disabled. 
                else {
                    const payloadToolbarButtons: ToolbarProps = {
                        'imageEnlarger': 'off'
                    };
                    dispatch(handleToolbarButtons(payloadToolbarButtons));
                }
                break;
        }
    };
   

    return (
        <button 
            className={ useMediaQueries(props.baseClassName.concat("__", "button"))
                +   // Disable image enlarger button if no image is clicked for enlarging. 
                (enlargeDoc !== null
                    ? ""
                    : props.name === 'imageEnlarger'
                        ? "unavailable"
                        : "")
                +   // Add "active" styling based on clicked state.
                (props.name === 'bounds'
                    ? ""
                    : toolbarState[props.name] === 'off'
                        ? ""
                        : "active") }
            id={ props.baseClassName.concat("-", props.name) }
            aria-label={ 
                props.name === 'filter'
                    ? "open filter drawer"
                    : props.name === 'bounds'
                        ? "reset map bounds"
                        : "open image enlarger"}
            aria-pressed={ // Change pressed status based on clicked state.  
                props.name === 'bounds'
                    ? "false"
                    : toolbarState[props.name] === 'off'
                        ? "false"
                        : "true" }
            onClick={ onToolbarButtonClick }>
                { /* Assign icon based on button type. */
                    getIcon(props.name) }

        </button>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* -----------------------------------
    Assign icons for toolbar button.
----------------------------------- */
function getIcon(buttonName: string) {
    // Icon SVGs.
    const filterIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" id="icon-filter" width="24" height="24" viewBox="0 0 24 24">
            <path d="M5 16h3v3c0 1.103.897 2 2 2h9c1.103 0 2-.897 2-2v-9c0-1.103-.897-2-2-2h-3V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2v9c0 1.103.897 2 2 2zm9.001-2L14 10h.001v4zM19 10l.001 9H10v-3h4c1.103 0 2-.897 2-2v-4h3zM5 5h9v3h-4c-1.103 0-2 .897-2 2v4H5V5z"/>
        </svg>
    );

    const boundsIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" id="icon-bounds" width="24" height="24" viewBox="0 0 24 24">
            <path d="M3 5v14c0 1.103.897 2 2 2h14c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2H5c-1.103 0-2 .897-2 2zm16.002 14H5V5h14l.002 14z"/>
            <path d="M15 12h2V7h-5v2h3zm-3 3H9v-3H7v5h5z"/>
        </svg>
    );

    const imageEnlargerIcon = (
        <svg xmlns="http://www.w3.org/2000/svg" id="icon-side-panel" width="24" height="24" viewBox="0 0 24 24">
            <path d="M20 3H4c-1.103 0-2 .897-2 2v14c0 1.103.897 2 2 2h16c1.103 0 2-.897 2-2V5c0-1.103-.897-2-2-2zM4 19V7h6v12H4zm8 0V7h8V5l.002 14H12z"/>
        <path d="M6 10h2v2H6zm0 4h2v2H6z"/></svg>
    );

    // Assign icons.
    switch(buttonName) {
        case 'filter':
            return filterIcon;
        case 'bounds':
            return boundsIcon;
        case 'imageEnlarger':
            return imageEnlargerIcon;
    };
};


/* =====================================================================
    Types.
===================================================================== */
export interface ToolbarButtonProps {
    name: string
    baseClassName: string
};


export default ToolbarButton;
