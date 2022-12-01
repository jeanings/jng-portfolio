import React, { useEffect } from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { handleToolbarButtons, ToolbarProps } from '../Toolbar/toolbarSlice';
import { handleMarkerLocator } from '../MapCanvas/mapCanvasSlice';
import { 
    handleEnlarger, 
    handleSlideView, 
    SideFilmStripProps } from './sideFilmStripSlice';
import './ImageEnlarger.css';


/* =====================================================================
    Subcomponent for showing enlarged image if a thumbnail is clicked.
    Image metadata/info shown along with image.
===================================================================== */
const ImageEnlarger: React.FunctionComponent <ImageEnlargerProps> = (props: ImageEnlargerProps) => {
    const dispatch = useAppDispatch();
    const imageDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const docIndex = useAppSelector(state => state.sideFilmStrip.docIndex);
    const toolbarEnlarger = useAppSelector(state => state.toolbar.imageEnlarger);
    const timelineSelected = useAppSelector(state => state.timeline.selected);
    const imageDocs = useAppSelector(state => state.timeline.imageDocs);
    const classBase: string = "image-enlarger";
    
    let imageSource: string = '';
    let imageInfo: ImageInfoType = {
        'Title': null,
        'Date': '',
        'Format': '',
        'Film': null,
        'FocalLength': '',
        'ISO': null,
        'Camera': '',
        'Lens': '',
        'Tags': [],
        'Description': null
    };

    /* -------------------------------------------------------------------
        Handles showing image enlarger only if << imageDoc >> state set.
    ------------------------------------------------------------------- */
    useEffect(() => {
        if (imageDoc !== null) {
            // Zoom map to marker.
            dispatch(handleMarkerLocator('clicked'));

            // Add class to show panel.
            const payloadToolbarButtons: ToolbarProps = {
                'filter': 'off',
                'imageEnlarger': 'on'
            };
            dispatch(handleToolbarButtons(payloadToolbarButtons));
        }
        else {
            // Hide panel if no image clicked.
            const payloadToolbarButtons: ToolbarProps = {
                'imageEnlarger': 'off'
            };
            dispatch(handleToolbarButtons(payloadToolbarButtons));
        }
    }, [imageDoc]);


    /* -----------------------------------------------------------------
        Year or month selection triggers image enlarger panel to close.
    ----------------------------------------------------------------- */
    useEffect(() => {
        // Reset image enlarger state.
        const payloadEnlarger: SideFilmStripProps = {
            'enlargeDoc': null,
            'docIndex': null
        };

        dispatch(handleEnlarger(payloadEnlarger));
    }, [timelineSelected]);


    /* ------------------------------------------------------------------
        Prepare object for image info taken from << enlargeDoc >> state.
    ------------------------------------------------------------------ */
    if (imageDoc !== null) {
        // Construct date strings for date entry.
        imageSource = imageDoc.url;
        const dateMonth = imageDoc.date.month.toString().length === 1
            ? '0' + imageDoc.date.month
            : imageDoc.date.month;

        const dateDay = imageDoc.date.day !== null
            ? '/' + imageDoc.date.day
            : '';

        const dateTime = imageDoc.date.taken !== null
            ? imageDoc.date.taken.split(' ')[1]
            : '';
            
        imageInfo = {
            'Title': imageDoc.title,
            'Date': (
                imageDoc.date.year + '/' + dateMonth + dateDay + 
                (dateTime !== ''
                    ? '\u00A0 \u00A0 \u00A0' + dateTime
                    : '')).toString(),
            'Format': imageDoc.format.type + ' ' + imageDoc.format.medium,
            'Film': imageDoc.film,
            'FocalLength': imageDoc.focal_length_35mm + 'mm',
            'ISO': imageDoc.iso,
            'Camera': imageDoc.make + ' ' + imageDoc.model,
            'Lens': imageDoc.lens,
            'Tags': imageDoc.tags,
            'Description': imageDoc.description
        };
    }

    const enlargedImageElem: JSX.Element = (
        <img 
            id={ "enlarged-image" }
            src={ imageSource }
            aria-label="enlarged image"
            draggable="false"/>
    );

    // Create image navigation buttons.
    function createImageNavButton(name: string) {
        let clickFunction;
        let ariaLabel: string = '';
        let svgKey: string = '';

        switch(name) {
            case 'full-screen':
                clickFunction = onEnlargerFullScreenClick;
                ariaLabel = "show image full screen";
                svgKey = "fullScreen"
                break;
            
            default:
                clickFunction = onEnlargerNavButtonClicks;
                ariaLabel = "show".concat(" ", name, " image");
                svgKey = name;
        }
    
        return (
            <button
                className={ "enlarged-image__nav-buttons" }
                id={ "enlarger".concat("-", "nav", "-", name) }
                aria-label={ ariaLabel }
                onClick={ clickFunction }>
                { getNavSVG[svgKey] }
            </button>
        );
    };

    /* -------------------------------------------------
        Handles clicks on enlarger navigation buttons. 
    ------------------------------------------------- */
    const onEnlargerNavButtonClicks = (event: React.SyntheticEvent) => {
        const button = event.target as HTMLButtonElement;
        const currentDocIndex = docIndex as number;
        let changeDocIndexTo: number = currentDocIndex;

        switch(button.id) {
            case 'enlarger-nav-previous':
                changeDocIndexTo = currentDocIndex - 1;
                break;
            case 'enlarger-nav-next':
                changeDocIndexTo = currentDocIndex + 1;
                break;
        }

        if (imageDocs) {
            // Allow for previous/next cycling even at end of ranges.
            let newDocIndex: number = changeDocIndexTo > imageDocs.length - 1
                ? 0                          // Cycle back to left end.
                : changeDocIndexTo < 0
                    ? imageDocs.length - 1   // Cycle to right end. 
                    : changeDocIndexTo;      // Default case.
            
            const payloadEnlarger: SideFilmStripProps = {
                'enlargeDoc': imageDocs[newDocIndex],  // Triggers image change.
                'docIndex': newDocIndex
            };

            dispatch(handleEnlarger(payloadEnlarger));
        }
    };

    /* ---------------------------------------------
        Handles clicks to open "slide-mode" viewer
    --------------------------------------------- */
    const onEnlargerFullScreenClick = (event: React.SyntheticEvent) => {
        const payloadSlideView = 'on';
        dispatch(handleSlideView(payloadSlideView)); 
    };


    /* ----------------------------------------------------------
        Prepare image stats categories for generating elements.
    ---------------------------------------------------------- */
    let infoElems: Array<JSX.Element> = [];
    const infoElemsClassName = useMediaQueries(
        props.baseClassName.concat("__", classBase, "__", "metadata", "-", "category"));

    Object.entries(imageInfo).forEach(item => {
        // Only add category if their data exists.
        const categoryName = item[0];
        const categoryData = item[1];

        if (categoryData !== null) {
            
            const category: JSX.Element = (
                <div 
                    className={ infoElemsClassName }
                    id={ "image-enlarger".concat("__", categoryName) }
                    role="figure"
                    aria-label="metadata entry for enlarged image"
                    key={ "key".concat("_", "enlarger-metadata", "_", categoryName) }>
                    
                    { getCategoryMetadataSpan(categoryName, categoryData) }
                </div>
            )
            infoElems.push(category);
            
        }
    })
    
    // Create image stats elements to populate info panel next to enlarged image.
    const imageInfoElem: JSX.Element = (
        <figcaption
            className={ useMediaQueries(props.baseClassName.concat("__", classBase, "__", "metadata")) }
            id="enlarged-image-metadata"
            role="figure"
            aria-label="metadata for enlarged image">

            { /* List of image stats. */
                infoElems }
        </figcaption>
    );


    /* -------------------------------------------
        Create elements for each metadata item.
    ------------------------------------------- */
    function getCategoryMetadataSpan(
        categoryName: string, 
        categoryData: string | number | Array<string>) {
            
        // For all the base metadata items.
        let metaDataSpan: JSX.Element = (
            <>
                {/* Category names. */}
                <span
                    className={ "image-enlarger__metadata".concat("-", "name") }
                    role="figure"
                    aria-label={ categoryName.concat(" metadata") }>
                
                    { categoryName === 'FocalLength'
                        ? 'Focal Length'.toUpperCase()
                        : categoryName.toUpperCase() }
                </span>

                {/* Category content. */}
                <span
                    className={ "image-enlarger__metadata".concat("-", "value") }
                    role="figure"
                    aria-label={ categoryName.concat(" metadata value")}>
                    { getCategoryData(categoryName, categoryData) }
                </span>
            </>
        )
        return metaDataSpan;
    }

    
    return (
        <div 
            className={ useMediaQueries(props.baseClassName.concat("__", classBase)) + 
                // Add "show" styling based on clicked state. 
                (toolbarEnlarger === 'off'
                    ? ""
                    : " ".concat("show")) }
            id="image-enlarger"
            role="tab" 
            aria-label="image enlarger"
            aria-expanded={
                // Change expanded status based on clicked state.
                toolbarEnlarger === 'off'
                    ? "false"
                    : "true" }>
            
            { imageInfoElem }

            <div
                className={ useMediaQueries(props.baseClassName.concat("__", classBase, "__", "image")) }
                id="enlarged-image-container">
                {/* Regular enlarged image. */}
                { enlargedImageElem }
            </div>

            <div
                className={ useMediaQueries("enlarged-image__nav-buttons__container") }
                role="navigation"
                aria-label="image enlarger navigation tools">
                {/* Buttons on top border of image. */}
                { createImageNavButton('previous') }
                { createImageNavButton('full-screen') }
                { createImageNavButton('next') }
            </div>

        </div>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* -------------------------------------
    SVGs for image navigation buttons.
------------------------------------- */
export const getNavSVG: { [index: string]: React.SVGProps<SVGSVGElement> } = {
    'previous': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M18.464 2.114a.998.998 0 0 0-1.033.063l-13 9a1.003 1.003 0 0 0 0 1.645l13 9A1 1 0 0 0 19 21V3a1 1 0 0 0-.536-.886zM17 19.091 6.757 12 17 4.909v14.182z">
            </path>
        </svg>
    ),
    'next': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M5.536 21.886a1.004 1.004 0 0 0 1.033-.064l13-9a1 1 0 0 0 0-1.644l-13-9A.998.998 0 0 0 5 3v18a1 1 0 0 0 .536.886zM7 4.909 17.243 12 7 19.091V4.909z">
            </path>
        </svg>
    ),
    'fullScreen': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M5 5h5V3H3v7h2zm5 14H5v-5H3v7h7zm11-5h-2v5h-5v2h7zm-2-4h2V3h-7v2h5z">
            </path>
        </svg>
    )
};


/* -----------------------------------------
    Process image metadata for displaying.
----------------------------------------- */
function getCategoryData(categoryName: string, categoryData: string | number | Array<string>) {
    let content: string | number | Array<string> = '';

    switch(categoryName) {
        case 'Tags':
            // Parse individual tags into one string for display.
            content = (categoryData as Array<string>).map(tag => tag).join(', ')  
            break;
        default:
            content = categoryData;
    }

    return content;
}


/* =====================================================================
    Types.
===================================================================== */
export interface ImageEnlargerProps {
    [index: string]: string,
    'baseClassName': string
}

export type ImageInfoType = {
    [index: string]: string | number | Array<string> | null
    'Title': string | null,
    'Date': string,
    'Format': string,
    'Film': string | null,
    'FocalLength': string,
    'ISO': number | null,
    'Camera': string,
    'Lens': string,
    'Tags': Array<string>,
    'Description': string | null
}


export default ImageEnlarger;
