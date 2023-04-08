import React from 'react';
import { useAppDispatch, useAppSelector, useMediaQueries } from '../../common/hooks';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import { handleEnlarger, SideFilmStripProps } from './sideFilmStripSlice';
import { handleToolbarButtons, ToolbarProps } from '../Toolbar/toolbarSlice';
import './ImageFrame.css';


/* ===============================================================
    Constructor for rendering images in << timeline.imageDocs >>
    state, sets them in container for styling.
=============================================================== */
const ImageFrame: React.FunctionComponent <ImageFrameProps> = (props: ImageFrameProps) => {
    const dispatch = useAppDispatch();
    const enlargeDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const toolbarImageEnlarger = useAppSelector(state => state.toolbar.imageEnlarger);
    const classBase: string = "ImageFrame";   

    /* ---------------------------------------------------------------
        Clicks on image dispatches action to change << enlargeDoc >>
        state, so an enlarged version with stats will be shown 
        in a panel to the left of film strip.
    --------------------------------------------------------------- */
    const onImageClick = (event: React.SyntheticEvent) => {
        if (props.imageDoc !== enlargeDoc) {
            const payloadImageDoc: SideFilmStripProps = {
                'enlargeDoc': props.imageDoc,
                'docIndex': props.docIndex
            };
            dispatch(handleEnlarger(payloadImageDoc));
        }
        else if (props.imageDoc === enlargeDoc) {
            // Show image enlarger if same image clicked.
            const payloadToolbarButtons: ToolbarProps = {
                'filter': 'off',
                'imageEnlarger': 'on'
            };
            
            if (toolbarImageEnlarger !== 'on') {
                dispatch(handleToolbarButtons(payloadToolbarButtons));
            }
        }
    };

    
    return (
        <div 
            className={ useMediaQueries(classBase) }
            id={ props.imageDoc._id }
            role="img"
            aria-label="thumbnail image container"
            onClick={ onImageClick }>

            <img 
                className={ useMediaQueries(`${classBase}__image`) 
                    +   // Add class styling to indicate selected state
                    (enlargeDoc?._id === props.imageDoc._id
                        ? " " + "selected"
                        : "") }
                src={ props.imageDoc.url_thumb }
                aria-label="thumbnail image"
                draggable="false"
            />
            
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
    'docIndex': number
};


export default ImageFrame;
