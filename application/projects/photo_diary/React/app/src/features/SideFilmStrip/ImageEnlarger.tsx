import React, { ReactFragment, useEffect } from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { handleToolbarButtons, ToolbarProps } from '../Toolbar/toolbarSlice';
import { handleMarkerLocator } from '../MapCanvas/mapCanvasSlice';
import './ImageEnlarger.css';


/* =====================================================================
    Subcomponent for showing enlarged image if a thumbnail is clicked.
    Image metadata/info shown along with image.
===================================================================== */
const ImageEnlarger: React.FunctionComponent <ImageEnlargerProps> = (props: ImageEnlargerProps) => {
    const dispatch = useAppDispatch();
    const imageDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const toolbarEnlarger = useAppSelector(state => state.toolbar.imageEnlarger);
    const timelineSelected = useAppSelector(state => state.timeline.selected);
    const classBase: string = "image-enlarger";
    
    let imageSource: string = "";
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
        if (toolbarEnlarger === 'on') {
            const payloadToolbarButtons: ToolbarProps = {
                'imageEnlarger': 'off'
            };
            dispatch(handleToolbarButtons(payloadToolbarButtons));
        }
    }, [timelineSelected]);


    /* --------------------------------
        Handles clicks on GPS locator 
    -------------------------------- */
    const onLocatorClick = (event: React.SyntheticEvent) => {
        dispatch(handleMarkerLocator('clicked'));
    };

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

    // Prepare image stats categories for generating elements.
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
            
            <div
                className={ useMediaQueries(props.baseClassName.concat("__", classBase, "__", "image")) }
                id="enlarged-image-container">   
                { enlargedImageElem }
            </div>

            { imageInfoElem }

        </div>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */
// const locateIconSVG = (
//     <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
//         <circle cx="12" cy="12" r="4"/>
//         <path d="M13 4.069V2h-2v2.069A8.01 8.01 0 0 0 4.069 11H2v2h2.069A8.008 8.008 0 0 0 11 19.931V22h2v-2.069A8.007 8.007 0 0 0 19.931 13H22v-2h-2.069A8.008 8.008 0 0 0 13 4.069zM12 18c-3.309 0-6-2.691-6-6s2.691-6 6-6 6 2.691 6 6-2.691 6-6 6z"/>
//     </svg>
// );


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

// type DateLocType = {
//     'Date': string,
//     'Loc': JSX.Element
// }


export default ImageEnlarger;
