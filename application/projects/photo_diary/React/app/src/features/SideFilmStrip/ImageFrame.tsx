import React from 'react';
import { 
    useAppSelector, 
    useAppDispatch,
    useMediaQueries } from '../../common/hooks';
import { Link } from 'react-router-dom';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import { handleMarkerLocator } from '../MapCanvas/mapCanvasSlice';
import { handleToolbarButtons, ToolbarProps } from '../Toolbar/toolbarSlice';
import './ImageFrame.css';


/* ===============================================================
    Constructor for rendering images in << timeline.imageDocs >>
    state, sets them in container for styling.
=============================================================== */
const ImageFrame: React.FunctionComponent<ImageFrameProps> = (props: ImageFrameProps) => {
    const dispatch = useAppDispatch();
    const enlargeDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const toolbarImageEnlarger = useAppSelector(state => state.toolbar.imageEnlarger);
    const classBase: string = "ImageFrame";   

    /* ------------------------------------------------------------------------
        Handles same-image clicks, separate from image thumb route redirects.
    ------------------------------------------------------------------------ */
    const onImageClick = (event: React.SyntheticEvent) => {     
        if (toolbarImageEnlarger !== 'on'
            && props.imageDoc._id === enlargeDoc?._id) {
            // Show image enlarger (if closed) if same image clicked.
            const payloadToolbarButtons: ToolbarProps = {
                'filter': 'off',
                'imageEnlarger': 'on'
            };
            dispatch(handleToolbarButtons(payloadToolbarButtons));

            // Zoom map to marker.
            dispatch(handleMarkerLocator('clicked'));
        }
    };

    
    return (
        <div 
            className={ useMediaQueries(classBase) }
            role="img"
            aria-label="thumbnail image container"
            onClick={ onImageClick }>

            {/* Redirect to image routes, where all the state logic resides. */}
            <Link to={ props.path }>
                <img 
                    className={ useMediaQueries(`${classBase}__image`) 
                        +   // Add class styling to indicate selected state
                        (enlargeDoc?._id === props.imageDoc._id
                            ? " " + "selected"
                            : "") }
                    id={ props.imageDoc._id }
                    src={ props.imageDoc.url_thumb }
                    aria-label="thumbnail image"
                    draggable="false"
                />
            </Link>
           
        </div>
    );
};


/* =====================================================================
    Types.
===================================================================== */
export interface ImageFrameProps {
    [index: string]: string | ImageDocTypes | number
    'baseClassName': string,
    'imageDoc': ImageDocTypes,
    'docIndex': number,
    'path': string
};


export default ImageFrame;
