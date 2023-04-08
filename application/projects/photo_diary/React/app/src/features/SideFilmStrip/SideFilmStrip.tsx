import React, {
    useEffect, 
    useState, 
    useRef } from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import { 
    handleEnlarger, 
    handleSlideView, 
    SideFilmStripProps } from './sideFilmStripSlice';
import { handleToolbarButtons, ToolbarProps } from '../Toolbar/toolbarSlice';
import ImageFrame from './ImageFrame';
import ImageEnlarger, { getBorderSVG } from './ImageEnlarger';
import './SideFilmStrip.css';


/* =======================================================================
    A main component - container for showing thumbnail images from state 
    as well as showing enlarged image with stats from clicks on thumbnails
    and through map markers. 
======================================================================= */
const SideFilmStrip: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const [ filmStripHovered, setFilmStripHovered ] = useState(false);
    const [ slideImageIndex, setSlideImageIndex ] = useState<number | null>(null);
    const [ isImageViewableInFilmStrip, setIsImageViewableInFilmStrip ] = useState(true);
    const isLoaded = useAppSelector(state => state.timeline.responseStatus);
    const imageDocs = useAppSelector(state => state.timeline.imageDocs);
    const enlargeDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const docIndex = useAppSelector(state => state.sideFilmStrip.docIndex);
    const slideView = useAppSelector(state => state.sideFilmStrip.slideView);
    const imageEnlarger = useAppSelector(state => state.toolbar.imageEnlarger);
    const filmStripRef = useRef<HTMLDivElement>(null);
    const filmStripObserverRef = useRef<IntersectionObserver | null>(null);
    const classBase: string = "SideFilmStrip";


    /* -----------------------------------------------------------------------------
        Scroll film strip back to top on imageDoc changes - year/month selections.
        Reset local state for slide view mode.
    ----------------------------------------------------------------------------- */
    useEffect(() => {
        if (filmStripRef.current) {
            filmStripRef.current.scrollTo({
                top: 0,
                left: 0,
                behavior: 'smooth'
            });
        }
        // Reset slide image index.
        setSlideImageIndex(null);
    }, [imageDocs]);


    /* -------------------------------------------------------
        Reset slide image index when slide view mode closes
        and dispatch action to change image in enlarger to 
        the last viewed image in slide view.
    ------------------------------------------------------- */
    useEffect(() => {
        if (imageDocs) {
            // On slide view exit, change enlarger image 
            // and reset local slide image index.
            if (slideView === 'off') {
                const payloadEnlarger: SideFilmStripProps = {
                    'enlargeDoc': imageDocs![slideImageIndex as number],    // Triggers image change.
                    'docIndex': slideImageIndex as number
                };
                dispatch(handleEnlarger(payloadEnlarger));

                if (imageEnlarger === 'hidden') {
                    const payloadToolbar: ToolbarProps = {
                        'imageEnlarger': 'on'
                    };
                    dispatch(handleToolbarButtons(payloadToolbar));
                }
                setSlideImageIndex(null);
            }
            // On slide view open, set local slide image index.
            else if (slideView === 'on') {
                setSlideImageIndex(docIndex);
                // Set imageEnlarger to intermediate state 'hidden'.
                const payloadToolbar: ToolbarProps = {
                    'imageEnlarger': 'hidden'
                };
                dispatch(handleToolbarButtons(payloadToolbar));
            }
        }
    }, [slideView]);


    /* -------------------------------------------------------
        Keep film strip expanded when image enlarger opened.
    ------------------------------------------------------- */
    useEffect(() => {
        imageEnlarger === 'on'
            ? setFilmStripHovered(true)
            : setFilmStripHovered(false);
    }, [imageEnlarger])


    /* -----------------------------------------------------------------
        On image selection, scroll film strip to image if not in view.
    ----------------------------------------------------------------- */
    useEffect(() => {
        // Set up observer for film strip element.
        if (filmStripObserverRef.current === null) {
            const observerOptions = {
                root: filmStripRef.current,
                threshold: 0.75
            };

            const observerCallback = (entries: Array<IntersectionObserverEntry>) => {
                const [entry] = entries;
                // Trigger scroll into view depending if selected frame in viewport.
                setIsImageViewableInFilmStrip(entry.isIntersecting);

                // CLean up observer.
                filmStripObserverRef.current?.disconnect();
            };

            filmStripObserverRef.current = new IntersectionObserver(observerCallback, observerOptions);
        }

        // Observe clicked image frame and determine if scrolling is needed.
        if (filmStripRef.current && enlargeDoc) {
            const imageFrame = document.getElementById(enlargeDoc._id) as HTMLElement;

            // Set observer.
            filmStripObserverRef.current.observe(imageFrame);
            
            if (isImageViewableInFilmStrip === false) {
                imageFrame.scrollIntoView({ behavior: 'smooth' });
            }
        }
    }, [enlargeDoc, isImageViewableInFilmStrip])
    

    /* ---------------------------------------
        Catch key presses for hotkey events.
    --------------------------------------- */
    useEffect(() => {
        document.addEventListener('keydown', onKeyPress);
        
        // Clean up after consuming.
        return () => {
            document.removeEventListener('keydown', onKeyPress);
        } 
    });


    /* ----------------------------------------------
        Keypress listener (conventional DOM).
    ---------------------------------------------- */
    const onKeyPress = (event: KeyboardEvent) => {
        const keyPress = event;

        // Key listeners.
        switch(keyPress.key) {
            case 'Escape':
                // Close slide viewer.
                if (slideView === 'on') {
                    const payloadSlideView: SideFilmStripProps['slideView'] = 'off';
                    dispatch(handleSlideView(payloadSlideView));
                }
                break;

            case 'ArrowLeft':
                // Slide view nav previous.
                if (slideView === 'on') {
                    const slideViewPrevious = document.getElementById("slide-mode-nav-previous") as HTMLElement;
                    slideViewPrevious.click();
                }
                // Base image enlarger nav previous.
                else if (imageEnlarger === 'on') {
                    const enlargerPrevious = document.getElementById("enlarger-border-previous") as HTMLElement;
                    enlargerPrevious.click();
                }
                break;

            case 'ArrowRight':
                // Slide view nav next.
                if (slideView === 'on') {
                    const slideViewNext = document.getElementById("slide-mode-nav-next") as HTMLElement;
                    slideViewNext.click();
                }
                // Base image enlarger nav next.
                else if (imageEnlarger === 'on') {
                    const enlargerNext = document.getElementById("enlarger-border-next") as HTMLElement;
                    enlargerNext.click();
                }
                break;
        }
    };


    /* ---------------------------------------------------------------------
        Generate thumbnail image frame elements for array of MongoDB docs.
    --------------------------------------------------------------------- */
    let imageFrameElems: Array<JSX.Element> = [];
    
    if (imageDocs !== null) {
        imageDocs.map((doc, index) => (
            imageFrameElems.push(
                createImageFrames(classBase, doc, index)
            )
        ));
    }

    /* ------------------------------------------------------
        Handle expand/contract of film strip on hover/touch.
    ------------------------------------------------------ */
    const onImageHover = (event: React.SyntheticEvent) => {
        filmStripHovered === false
            ? setFilmStripHovered(true)
            : imageEnlarger === 'on'
                ? setFilmStripHovered(true)
                : setFilmStripHovered(false);
    };


    /* ----------------------------------------------------------
        Generate elements for full-screen slide viewer overlay.
    ---------------------------------------------------------- */
    // Create image element for slide view.
    let imageSource: string = ''
    if (imageDocs) {
        imageSource = slideImageIndex !== null
            ? imageDocs[slideImageIndex as number].url  // Use slide viewer's indexing
            : enlargeDoc?.url as string;                  // Else use base index from enlarger.
    }
    
    const enlargedImageElem: JSX.Element = (
        <img 
            id="enlarged-image-slide-view"
            src={ imageSource }
            aria-label="enlarged image in full screen mode"
            draggable="false"/>
    );

    // Create slide image navigation buttons.
    function createSlideImageNavButton(name: string) {
        return (
            <button
                className={ "slide-mode-overlay__nav-buttons" }
                id={ `slide-mode-nav-${name}` }
                aria-label={ `show ${name} slide image` }
                onClick={ onSlideViewNavButtonClick }>
                { getBorderSVG[name] }
            </button>
        );
    };

    /* -----------------------------------------
        Handle previous/next slide image click.
    ----------------------------------------- */
    const onSlideViewNavButtonClick = (event: React.SyntheticEvent) => {
        // Prevent onSlideViewClick from bubbling up.
        event.stopPropagation()

        // Cycle slide image without changing base imageDoc, avoiding unnecessary
        // and non-visible changes while in slide view.
        const button = event.target as HTMLButtonElement;
        let newSlideIndex: number = slideImageIndex !== null
            ? slideImageIndex
            : 0;    // Just a temp value.

        // Set doc index in current slide view mode.
        if (slideImageIndex !== null && imageDocs) {
            
            switch(button.id) {
                case 'slide-mode-nav-previous':
                    newSlideIndex = slideImageIndex - 1;
                    break;
                case 'slide-mode-nav-next':
                    newSlideIndex = slideImageIndex + 1;
                    break;
            }

            // Allow for previous/next cycling even at end of ranges.
            newSlideIndex > imageDocs.length - 1
                ? setSlideImageIndex(0)                         // Cycle back to left end.
                : newSlideIndex < 0
                    ? setSlideImageIndex(imageDocs.length - 1)  // Cycle to right end. 
                    : setSlideImageIndex(newSlideIndex);        // Default case.
        }
    };

    /* --------------------------------------
        Handle closing slide view on click.
    -------------------------------------- */
    const onSlideViewClick = (event: React.SyntheticEvent) => {
        const payloadSlideView = 'off';
        dispatch(handleSlideView(payloadSlideView));
    };


    return (
        <>
            <aside 
                className={ useMediaQueries(classBase) 
                    +   // Add styling for loading: hidden if initial fetch not loaded
                    (isLoaded === 'uninitialized'
                        ? " " + "loading"
                        : "") }
                id={ classBase }
                role="main"
                aria-label="images panel">

                {/* Panel for enlarged image and its stats. */}
                <div 
                    className={ useMediaQueries(`${classBase}__image-enlarger-container`)
                        +   // Add "slide" styling: slides left if mouse hovered on film strip. 
                        (filmStripHovered === false
                            ? ""
                            : " " + "slide") }
                    id="image-enlarger-container"
                    role="figure"
                    aria-label="enlarged image with metadata">

                    <ImageEnlarger 
                        baseClassName={ classBase }/>
                </div>

                {/* "Film strip" showing image collection in columnar form. */}
                <div 
                    className={ useMediaQueries(`${classBase}__film-strip`) 
                        +   // Add "expand" styling: reveals second column of images.
                        (filmStripHovered === false
                            ? ""
                            : " " + "expand") }
                    id="film-strip"
                    ref={ filmStripRef }
                    role="listbox" 
                    aria-label="images strip"
                    aria-expanded={ // Set expanded based on hover state. 
                        filmStripHovered === false
                            ? "false"
                            : "true" }
                    onMouseEnter={ onImageHover }
                    onMouseLeave={ onImageHover }>

                    { /* Image containers for all docs in collection. */
                        imageFrameElems }
                </div>

            </aside>

            <div
                className={ useMediaQueries(`${classBase}__slide-mode-overlay`) 
                    +   // Show slide view overlay depending on state.
                    (slideView === 'on'
                        ? " " + "show"
                        : " " + "hide") }
                id="enlarged-image-slide-mode"
                role="img"
                aria-label="full screen slide view mode"
                onClick={ onSlideViewClick }>

                {/* Slide view full screen image. */}
                { enlargedImageElem }

                {/* Navigation buttons. */}
                { createSlideImageNavButton('previous') }
                { createSlideImageNavButton('next') } 
            </div>
        </>
    );
};


/* =====================================================================
    Helper functions.
===================================================================== */

/* -------------------------------------------------------------------------
    Constructor for 'frames' for each individual image in docs collection.
------------------------------------------------------------------------- */
function createImageFrames(classBase: string, imageDoc: ImageDocTypes, index: number) {
    let imageFrame: JSX.Element;
    
    imageFrame = (
        <ImageFrame
            baseClassName={ classBase }
            imageDoc={ imageDoc }
            docIndex= { index }
            key={ `key_${classBase}_${index.toString()}` }
        />
    );
    
    return imageFrame;
}


export default SideFilmStrip;
