import React, { 
    useEffect, 
    useRef,
    useState } from 'react';
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
    const enlargeDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const docIndex = useAppSelector(state => state.sideFilmStrip.docIndex);
    const toolbarEnlarger = useAppSelector(state => state.toolbar.imageEnlarger);
    const timelineSelected = useAppSelector(state => state.timeline.selected);
    const imageDocs = useAppSelector(state => state.timeline.imageDocs);
    const [ metadataEdits, setMetadataEdits ] = useState<MetadataEditInputProps>({});
    const metadataForm = useRef<HTMLFormElement | null>(null);
    const isLoggedIn = useAppSelector(state => state.login.loggedIn);
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
        'Description': null,
        'Coordinates': null
    };

    /* -------------------------------------------------------------------
        Handles showing image enlarger only if << enlargeDoc >> state set.
    ------------------------------------------------------------------- */
    useEffect(() => {
        if (enlargeDoc !== null) {
            // Zoom map to marker.
            dispatch(handleMarkerLocator('clicked'));

            // Clear form and edit state.
            if (metadataForm.current) {
                metadataForm.current.reset();
                setMetadataEdits({});
            }

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
    }, [enlargeDoc]);


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
    if (enlargeDoc !== null) {
        // Construct date strings for date entry.
        imageSource = enlargeDoc.url;
        const dateMonth = enlargeDoc.date.month.toString().length === 1
            ? '0' + enlargeDoc.date.month
            : enlargeDoc.date.month;

        const dateDay = enlargeDoc.date.day !== null
            ? '/' + enlargeDoc.date.day
            : '';

        const dateTime = enlargeDoc.date.taken !== null
            ? enlargeDoc.date.taken.split(' ')[1]
            : '';
            
        imageInfo = {
            'Title': enlargeDoc.title,
            'Date': (
                enlargeDoc.date.year + '/' + dateMonth + dateDay + 
                (dateTime !== ''
                    ? '\u00A0 \u00A0 \u00A0' + dateTime
                    : '')).toString(),
            'Format': `${enlargeDoc.format.type} ${enlargeDoc.format.medium}`,
            'Film': enlargeDoc.film,
            'FocalLength': `${enlargeDoc.focal_length_35mm}mm`,
            'ISO': enlargeDoc.iso,
            'Camera': `${enlargeDoc.make} ${enlargeDoc.model}`,
            'Lens': enlargeDoc.lens,
            'Tags': enlargeDoc.tags,
            'Description': enlargeDoc.description,
            'Coordinates': `${enlargeDoc.gps.lat}, ${enlargeDoc.gps.lng}`
        };
    }

    const enlargedImageElem: JSX.Element = (
        <img 
            id={ "enlarged-image" }
            src={ imageSource }
            aria-label="enlarged image"
            draggable="false"/>
    );

    // Create buttons that live on white image border.
    function createImageBorderButton(name: string) {
        let clickFunction;
        let ariaLabel: string = '';
        let svgKey: string = '';

        switch(name) {
            case 'full-screen':
                clickFunction = onEnlargerFullScreenClick;
                ariaLabel = "show image full screen";
                svgKey = "fullScreen";
                break;

            case 'save-edits':
                clickFunction = Object.keys(metadataEdits).length !== 0
                    ? onSaveEditsClick
                    : undefined;
                ariaLabel = "save metadata edits on image";
                svgKey = "saveEdits";
                break;
            
            default:
                clickFunction = onEnlargerNavButtonClicks;
                ariaLabel = `show ${name} image`;
                svgKey = name;
        }

        return (
            <button
                className={ "enlarged-image__border-buttons"
                    +   // Indicate form values changed; can be saved.
                    ( name !== 'save-edits'
                        ? " " 
                        : Object.keys(metadataEdits).length !== 0
                            ? " " + "available"
                            : " " + "unavailable") }
                id={ `enlarger-border-${name}` }
                aria-label={ ariaLabel }
                onClick={ clickFunction }>
                { getBorderSVG[svgKey] }
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
            case 'enlarger-border-previous':
                changeDocIndexTo = currentDocIndex - 1;
                break;
            case 'enlarger-border-next':
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

    /* -----------------------------------------------------------
        Handles clicks to save edits to metadata in editor mode. 
    ----------------------------------------------------------- */
    const onSaveEditsClick = (event: React.SyntheticEvent) => {
        console.log('save these edits', metadataEdits)
    };

    /* --------------------------------------------------
        Handles edited values and saves to local state. 
    -------------------------------------------------- */
    const handleMetadataInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const metadataName = event.target.name;
        const metadataUpdatedField = event.target.value;
        
        if (metadataUpdatedField) {
            // Add to metadata edits state.
            setMetadataEdits({...metadataEdits,
                [metadataName]: metadataUpdatedField 
            });
        }
        else {
            // Delete key if no value present.
            const newMetadataEdits = {...metadataEdits};
            delete newMetadataEdits[metadataName];
            setMetadataEdits(newMetadataEdits);
        }
        
    };

    /* ----------------------------------------------------------
        Prepare image stats categories for generating elements.
    ---------------------------------------------------------- */
    const infoElemsClassName = useMediaQueries(`${props.baseClassName}__${classBase}__metadata-category`);

    const infoElems: Array<JSX.Element> = Object.entries(imageInfo)
        .filter(category => {
            const categoryName = category[0];
            const categoryData = category[1]!;

            if (categoryData === null) {
                // Filter out categories without data.
                return false;
            }
            else if (isLoggedIn === false && categoryName !== 'Coordinates') {
                // For viewer role, don't show coordinates.
                return true;
            }
            else if (isLoggedIn) {
                // For editor role, show everything available to edit.
                return true;
            }
        })   
        .map(category => {
            // Create JSX element for each category and store in array.
            const categoryName = category[0];
            const categoryData = category[1]!;

            const categoryElem: JSX.Element = (
                <div 
                    className={ infoElemsClassName }
                    id={ `image-enlarger__${categoryName}` }
                    role="figure"
                    aria-label="metadata entry for enlarged image"
                    key={ `key_enlarger-metadata_${categoryName}` }>
                    
                    { getCategoryMetadataSpan(categoryName, categoryData) }
                </div>
            );
            
            return categoryElem;
        });

    
    // Create image stats elements to populate info panel next to enlarged image.
    const imageInfoElemClassName = useMediaQueries(`${props.baseClassName}__${classBase}__metadata`)
    const imageInfoElem: JSX.Element = (
        isLoggedIn === false
            // Static component for viewers. 
            ?   <figcaption
                    className={ imageInfoElemClassName }
                    id="enlarged-image-metadata"
                    role="figure"
                    aria-label="metadata for enlarged image">

                    { /* List of image stats. */
                        infoElems }
                </figcaption>
            // Editable form component for editors.
            :   <form
                    className={ imageInfoElemClassName }
                    id="enlarged-image-metadata"
                    aria-label="edit form of metadata for enlarged image"
                    ref={ metadataForm }
                    onSubmit={ onSaveEditsClick }>

                    { /* List of image stats. */
                        infoElems }
                </form>
    );


    /* -------------------------------------------
        Create elements for each metadata item.
    ------------------------------------------- */
    function getCategoryMetadataSpan(
        categoryName: string, 
        categoryData: string | number | Array<string>) {
            
        // For all the base metadata items.
        const metaDataSpan: JSX.Element = (
            isLoggedIn === false
                // Viewer role mode.
                ?   <>
                        <span
                            className={ "image-enlarger__metadata-name" }
                            role="figure"
                            aria-label={ `${categoryName} metadata` }>
                        
                            { categoryName === 'FocalLength'
                                ? 'Focal Length'.toUpperCase()
                                : categoryName.toUpperCase() }
                        </span>

                        <span
                            className={ "image-enlarger__metadata-value" }
                            role="figure"
                            aria-label={ `${categoryName} metadata value` }>
                            { getCategoryData(categoryName, categoryData) }
                        </span>
                    </>
                // Editor role mode.
                :   <>
                        <label
                            htmlFor={ categoryName }
                            className={ "image-enlarger__metadata-name" }
                            aria-label={ `${categoryName} metadata` }>
                        
                            { categoryName === 'FocalLength'
                                ? 'Focal Length'.toUpperCase()
                                : categoryName.toUpperCase() }
                        </label>

                        { categoryName !== 'Tags' 
                        ?   <input
                                name={ categoryName }
                                className={ "image-enlarger__metadata-value edit" }
                                id={ `${categoryName}-input` }
                                type="text"
                                placeholder={ getCategoryData(categoryName, categoryData) as string }
                                onChange={ (event) => handleMetadataInput(event) }
                                aria-label={ `${categoryName} editable metadata value` }
                            />
                        :   <textarea
                                name={ categoryName }
                                className={ "image-enlarger__metadata-value edit" }
                                placeholder={ getCategoryData(categoryName, categoryData) as string }
                                onChange={ (event) => handleMetadataInput(event) }
                                aria-label={ `${categoryName} editable metadata value` }
                            />
                        }
                    </>
        );

        return metaDataSpan;
    };

    
    return (
        <div 
            className={ useMediaQueries(`${props.baseClassName}__${classBase}`) + 
                // Add "show" styling based on clicked state. 
                (toolbarEnlarger === 'off'
                    ? ""
                    : " " + "show") }
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
                className={ useMediaQueries(`${props.baseClassName}__${classBase}__image`) }
                id="enlarged-image-container">
                {/* Regular enlarged image. */}
                { enlargedImageElem }
            </div>

            <div
                className={ useMediaQueries("enlarged-image__border-buttons__container") }
                role="navigation"
                aria-label="image enlarger navigation tools">
                {/* Buttons on top border of image. */}
                { createImageBorderButton('save-edits') }
                { createImageBorderButton('previous') }
                { createImageBorderButton('full-screen') }
                { createImageBorderButton('next') }
            </div>

        </div>
    );
};


/* =====================================================================
    Helper functions.
===================================================================== */

/* -------------------------------------
    SVGs for image border buttons.
------------------------------------- */
export const getBorderSVG: { [index: string]: React.SVGProps<SVGSVGElement> } = {
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
    ),
    'saveEdits': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M5 21h14a2 2 0 0 0 2-2V8l-5-5H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2zM7 5h4v2h2V5h2v4H7V5zm0 8h10v6H7v-6z"/>
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
    };

    return content;
};


/* =====================================================================
    Types.
===================================================================== */
export interface ImageEnlargerProps {
    [index: string]: string,
    'baseClassName': string
};

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
    'Description': string | null,
    'Coordinates': string | null
};

interface MetadataEditInputProps {
    [index: string]: string | undefined
    'Title'?: string | undefined,
    'Date'?: string | undefined,
    'Format'?: string | undefined,
    'Film'?: string | undefined,
    'FocalLength'?: string | undefined,
    'ISO'?: string | undefined,
    'Camera'?: string | undefined,
    'Lens'?: string | undefined,
    'Tags'?: string | undefined, 
    'Description'?: string | undefined,
    'Coordinates'?: string | undefined
};


export default ImageEnlarger;
