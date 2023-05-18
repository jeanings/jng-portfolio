import React, { 
    useEffect, 
    useRef,
    useState } from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries,
    useDebounceCallback } from '../../common/hooks';
import { useNavigate } from 'react-router-dom';
import { handleToolbarButtons, ToolbarProps } from '../Toolbar/toolbarSlice';
import { handleMarkerLocator } from '../MapCanvas/mapCanvasSlice';
import { routePrefixForThumbs } from './SideFilmStrip';
import { 
    handleEnlarger, 
    handleSlideView, 
    SideFilmStripProps } from './sideFilmStripSlice';
import { ImageDocTypes } from '../TimelineBar/timelineSlice';
import { LoginProps, UserProps } from '../Login/loginSlice';
import { 
    updateDoc, 
    handleUpdatedDocsClear,
    ClearUpdatedDocsType, 
    UpdateRequestDocType } from '../Editor/editorSlice';
import './ImageEnlarger.css';


/* =====================================================================
    Subcomponent for showing enlarged image if a thumbnail is clicked.
    Image metadata/info shown along with image.
===================================================================== */
const ImageEnlarger: React.FunctionComponent <ImageEnlargerProps> = (props: ImageEnlargerProps) => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const [ metadataEdits, setMetadataEdits ] = useState<MetadataEditInputType>({});
    const [ isFormatCorrect, setIsFormatCorrect ] = useState<MetadataCorrectnessType>({});
    const [ showEditResponseMessage, setShowEditResponseMessage ] = useState<boolean>(false);
    const enlargeDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const docIndex = useAppSelector(state => state.sideFilmStrip.docIndex);
    const toolbarEnlarger = useAppSelector(state => state.toolbar.imageEnlarger);
    const timeline = useAppSelector(state => state.timeline.selected);
    const imageDocs = useAppSelector(state => state.timeline.imageDocs);
    const filtered = useAppSelector(state => state.filter);
    const metadataForm = useRef<HTMLFormElement | null>(null);
    const role: LoginProps['role'] = useAppSelector(state => state.login.role);
    const user: UserProps | null = useAppSelector(state => state.login.user);
    const isUserEditor: boolean = (role === 'editor') || (role === 'admin') ? true : false;
    const editor = useAppSelector(state => state.editor);
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

            // Clear local form and edit state.
            clearMetadataFormEdits();
            setShowEditResponseMessage(false);

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


    /* ------------------------------------------------------------------------
        Year or month selection clears enlarger image, closes enlarger panel.
    ------------------------------------------------------------------------ */
    useEffect(() => {
        // Reset image enlarger state.
        const payloadEnlarger: SideFilmStripProps = {
            'enlargeDoc': null,
            'docIndex': null
        };
        
        dispatch(handleEnlarger(payloadEnlarger));
    }, [timeline]);


    /* -------------------------------------------------------------
        On newly fetched image docs:
        - clear store's << editor.updated >> state
        - redirect back to base route
    ------------------------------------------------------------- */
    useEffect(() => {
        // Clear editor state.
        if (role === 'admin' || role === 'editor') {
            if (Object.keys(editor.updated).length > 0) {
                const payloadResetUpdatedDocs: ClearUpdatedDocsType = {
                    'msg': 'clear updated docs'
                };
                dispatch(handleUpdatedDocsClear(payloadResetUpdatedDocs));
            }
        }
    }, [imageDocs]);


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
        if (enlargeDoc) {
            setShowEditResponseMessage(false);
            const payloadDocUpdate: UpdateRequestDocType = {
                'id': enlargeDoc._id,
                'collection': enlargeDoc.date.year,
                'fields': metadataEdits
            };
            dispatch(updateDoc(payloadDocUpdate));
        }
    };

    /* --------------------------------------------------
        Handles edited values and saves to local state. 
    -------------------------------------------------- */
    const handleMetadataInput = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const metadataName = event.target.name;
        const metadataUpdatedField = event.target.value;
        const updateThis = new MetadataInput(metadataName, metadataUpdatedField);
        updateThis.checkInputs();
       
        if (updateThis.passes) {
            // Add to metadata edits to state if input format passes.
            setMetadataEdits({...metadataEdits,
                [updateThis.field]: updateThis.value 
            });
        }
        else {
            // Flag metadata as incorrectly formatted.
            setMetadataEdits({...metadataEdits,
                [updateThis.field]: 'wrong format'
            });
        }

        if (!updateThis.value) {
            // Delete key if no value present (cleared by user).
            const newMetadataEdits = {...metadataEdits};
            delete newMetadataEdits[updateThis.field];
            setMetadataEdits(newMetadataEdits);
        }
    };

    /* -------------------------------------------------------------------------------
        Handles indicating format correctness through subscribed elements.
        Decouples from metadataEdits local state to only affect after onBlur events.
    --------------------------------------------------------------------------------*/
    const handleCorrectnessIndicator = (event: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const thisField = event.target.name;
        const thisInput = metadataEdits[thisField]
        
        if (thisInput === 'wrong format') {
            setIsFormatCorrect({...isFormatCorrect,
                [thisField]: false
            });
        }
        else {
            setIsFormatCorrect({...isFormatCorrect,
                [thisField]: true
            });
        }
    }   

    /* -----------------------------------------------
        Handles clearing form edits and local state.
    ----------------------------------------------- */
    const clearMetadataFormEdits = () => {
        if (metadataForm.current) {
            metadataForm.current.reset();
            setMetadataEdits({});
            setIsFormatCorrect({});
        }
    };

    /* --------------------------------------------
        Handles displaying edit response message.
    -------------------------------------------- */
    const onSaveStatusClick = () => {
        setShowEditResponseMessage(!showEditResponseMessage);
    };

    /* -------------------------------------------------
        Handles clicks on enlarger navigation buttons. 
    ------------------------------------------------- */
    const onEnlargerNavButtonClicks = useDebounceCallback((event: React.SyntheticEvent) => {
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
            const newDocId: string = imageDocs[newDocIndex]._id;
            const newRoute: string = `${props.routeExisting}/${routePrefixForThumbs}/${newDocId}`;
            
            // Redirect to image thumb's route, triggering actions.
            navigate(newRoute);
        }
    }, 200);


    /* ------------------------------------------------------------------
        Prepare object for image info taken from << enlargeDoc >> state.
    ------------------------------------------------------------------ */
    if (enlargeDoc !== null) {
        const isUpdated: boolean = enlargeDoc._id in editor.updated ? true : false;
        const targetDoc: ImageDocTypes = isUpdated ? editor.updated[enlargeDoc._id] : enlargeDoc;
        // Construct date strings for date entry.
        imageSource = targetDoc.url;
        const dateMonth = targetDoc.date.month.toString().length === 1
            ? '0' + targetDoc.date.month
            : targetDoc.date.month;

        const dateDay = targetDoc.date.day !== null
            ? '/' + targetDoc.date.day
            : '';

        const dateTime = targetDoc.date.taken !== null
            ? targetDoc.date.taken.split(' ')[1]
            : '';
            
        imageInfo = {
            'Title': targetDoc.title,
            'Date': (
                targetDoc.date.year + '/' + dateMonth + dateDay + 
                (dateTime !== ''
                    ? '\u00A0 \u00A0 \u00A0' + dateTime
                    : '')).toString(),
            'Format': `${targetDoc.format.type} ${targetDoc.format.medium}`,
            'Film': targetDoc.film,
            'FocalLength': `${targetDoc.focal_length_35mm}mm`,
            'ISO': targetDoc.iso,
            'Camera': `${targetDoc.make} ${targetDoc.model}`,
            'Lens': targetDoc.lens,
            'Tags': targetDoc.tags,
            'Description': targetDoc.description,
            'Coordinates': `${targetDoc.gps.lat}, ${targetDoc.gps.lng}`
        };
    }

    const enlargedImageElem: JSX.Element = (
        <img 
            id={ "enlarged-image" }
            src={ imageSource }
            aria-label="enlarged image"
            draggable="false"/>
    );

    /* ---------------------------------------------------
        Creates buttons that live on white image border.
    --------------------------------------------------- */
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
            case 'clear-edits':
                clickFunction = clearMetadataFormEdits;
                ariaLabel = "clear metadata form edits";
                svgKey = "clearEdits";
                break;
            case 'save-status':
                clickFunction = onSaveStatusClick;
                ariaLabel = "metadata edit status";
                svgKey = editor.response === 'successful'
                    ? 'saveStatusGreen'
                    : editor.response === 'passed with error'
                        ? 'saveStatusAmber'
                        : editor.response === 'failed'
                            ? 'saveStatusRed'
                            : '';
                break;
            default:
                clickFunction = onEnlargerNavButtonClicks;
                ariaLabel = `show ${name} image`;
                svgKey = name;
        }

        return (
            <button
                className={ "enlarged-image__border-buttons"
                    +   // For save form button: Indicate form values changed; can be saved.
                    ( name === 'save-edits' || name === 'clear-edits'
                        ? Object.keys(metadataEdits).length !== 0
                            ? " " + "available"
                            : " " + "unavailable"
                        : "")
                    +   // For save status icon.
                    ( name === 'save-status'
                        ? editor.response === 'successful'
                            ? " " + "available" + " " + "green"
                            : editor.response === 'passed with error'
                                ? " " + "available" + " " + "amber"
                                : editor.response === 'failed'
                                    ? " " + "available" +  " " + "red"
                                    : ""
                        : "") }
                id={ `enlarger-border-${name}` }
                aria-label={ ariaLabel }
                onClick={ clickFunction }>
                { getBorderSVG[svgKey] }
            </button>
        );
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
            else if (isUserEditor === false && categoryName !== 'Coordinates') {
                // For viewer role, don't show coordinates.
                return true;
            }
            else if (isUserEditor) {
                // For editor role, show everything available to edit.
                return true;
            }
            else {
                // Above conditions should catch all cases, but return false as default.
                return false;
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
        isUserEditor === true 
        && user?._id === enlargeDoc?.owner
            // Editable form component for editors.
            ? <form
                className={ imageInfoElemClassName }
                id="enlarged-image-metadata"
                aria-label="edit form of metadata for enlarged image"
                ref={ metadataForm }
                onSubmit={ onSaveEditsClick }>

                { /* List of image stats. */
                    infoElems }
            </form>
            // Static component for viewers. 
            : <figcaption
                className={ imageInfoElemClassName }
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
        const metaDataSpan: JSX.Element = (
            isUserEditor === true
            && user?._id === enlargeDoc?.owner
            // Editor mode.
                ? <>
                    <label
                        htmlFor={ categoryName }
                        className={ "image-enlarger__metadata-name" }
                        aria-label={ `${categoryName} metadata` }>
                    
                        { categoryName === 'FocalLength'
                            ? 'Focal Length'.toUpperCase()
                            : categoryName.toUpperCase() }
                    </label>

                    { categoryName === 'Tags'
                        ? <textarea
                            name={ categoryName }
                            className={ "image-enlarger__metadata-value edit" 
                                +   // Add additional indicator styling if incorrect formatting
                                ( isFormatCorrect[categoryName] === undefined
                                    || isFormatCorrect[categoryName] === true
                                    ? ""
                                    : " " + "wrongFormat")}
                            placeholder={ getCategoryData(categoryName, categoryData) as string }
                            onChange={ (event) => handleMetadataInput(event) }
                            onBlur={ (event) => handleCorrectnessIndicator(event) }
                            aria-label={ `${categoryName} editable metadata value` }
                        />
                        : <input
                            name={ categoryName }
                            className={ "image-enlarger__metadata-value edit"
                                +   // Add additional indicator styling if incorrect formatting
                                ( isFormatCorrect[categoryName] === undefined
                                    || isFormatCorrect[categoryName] === true
                                    ? ""
                                    : " " + "wrongFormat")}
                            id={ `${categoryName}-input` }
                            type="text"
                            placeholder={ getCategoryData(categoryName, categoryData) as string
                                +   // Add input format hint for date if it only contains year/month.
                                ( categoryName === 'Date' 
                                    && (categoryData as string).split(' ', 1).length === 1
                                    ? " " + "(yyyy/mm/dd hh:mm:ss)"
                                    : categoryName === 'FocalLength'    // Focal length equiv. reminder
                                        ? " " + "(35mm equiv., in mm/cm)"
                                        : "") }
                            onChange={ (event) => handleMetadataInput(event) }
                            onBlur={ (event) => handleCorrectnessIndicator(event) }
                            aria-label={ `${categoryName} editable metadata value` }
                        />
                    }
                </>
                // Viewer (default) mode.
                : <>
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
        );
        return metaDataSpan;
    }


    return (
        <div 
            className={ useMediaQueries(`${props.baseClassName}__${classBase}`) 
                +   // Add "show" styling based on clicked state. 
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

            {/* Metadata panel */}
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
                {/* Text area to show edit response message. */}
                { editor.message !== null
                    ?   <span
                            className={ "enlarged-image__border-message" 
                                +   // Only show message if status icon clicked.
                                (showEditResponseMessage === true
                                    ? " " + "show"
                                    : "") }

                            id="enlarger-border-save-response-message"
                            role="log"
                            aria-label="edit submission note">
                            { editor.message }
                        </span>
                    :   "" }

                {/* Buttons on top border of image. */}
                {/* Editor tools. */}
                { isUserEditor
                    ? (<>
                        { createImageBorderButton('save-status') }
                        { createImageBorderButton('save-edits') }
                        { createImageBorderButton('clear-edits') }
                    </>)
                    : "" }

                {/* Standard border button icons. */}
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

/* --------------------------------------------------------------
    Class for validating inputs being sent to update docs in db.
-------------------------------------------------------------- */
class MetadataInput {
    field: string;
    value: string;
    passes: boolean;

    constructor(name: string, input: string) {
        this.field = name;
        this.value = input;
        this.passes = false;
    };

    checkInputs() {
        switch (this.field) {
            case 'Date':
                this.passes = this.isDateInputCorrect(this.value);
                break;
            case 'Format':
                this.passes = ['film', 'digital'].some(medium => this.value.includes(medium));
                break;
            case 'FocalLength':
                this.passes = ['mm', 'cm'].some(unit => this.value.includes(unit));
                break;
            case 'ISO':
                this.passes = parseInt(this.value) > 0 ? true : false
                break;
            case 'Camera':
                this.passes = this.isCameraInputCorrect(this.value);
                break;
            case 'Coordinates':
                this.passes = this.isCoordinatesInputCorrect(this.value);
                break;
            default:
                // Film, Lens, Tags strings don't need checking.
                this.passes = true;
        }
    }

    /*-------------------------------------------
        Methods for format-checking some fields.
    ------------------------------------------ */
    isDateInputCorrect(value: string) {
        const today = new Date();
        const [ thisYear, thisMonth, thisDay ] = [ 
            today.getFullYear(), 
            today.getMonth() + 1,   // getMonth() indexes January as 0.
            today.getDate()
        ];

        // 2022/12/31 23:59:59
        const [ date, time ] = value.split(' ');

        if (time) {
            // Check correctness of time format.
            const [ hour, minute, second ] = time.split(':').map(unit => parseInt(unit));
            if (hour && minute && second) {
                if (hour < 0 || hour > 23) {
                    return false;
                }
                if (minute < 0 || minute > 59) {
                    return false;
                }
                if (second < 0 || second > 59) {
                    return false;
                }
            }
            else {
                // Any of the parts missing, mark as incorrect format.
                return false;
            }
        }
        
        if (date) {
            const [ year, month, day ] = date.split('/').map(unit => parseInt(unit));
            if (year && month) {                      
                if (year < 1920 || year > thisYear) {
                    return false;
                }
                if (month < 1 || month > 12) {
                    return false;
                }
                if (year === thisYear && month > thisMonth) {
                    // No time travelling yet, reject metadata from the future.
                    return false;
                }
                if (day) {
                    if (day < 1 || day > 31) {
                        // Very simplified, but this isn't a critical app...
                        return false;
                    }
                }
                else if (day === 0) {
                    return false;
                }
            }
            else {
                // Reject any input missing year and month.
                return false;
            }
        }
        return true;
    };


    isCameraInputCorrect(value: string) {
        // Camera input requires a maker and model name.
        const hasMakeAndModel = value.split(' ').length >= 2 ? true : false;
        return hasMakeAndModel;
    };


    isCoordinatesInputCorrect(value: string) {
        const coords = value.split(',');
        const setOfCoords = coords.length === 2 ? true : false;

        if (setOfCoords) {
            // Check range of latitude, longitude values.
            let [lat, lng] = coords;
            const latOK = (parseFloat(lat) >= -90) && (parseFloat(lat) <= 90) ? true : false;
            const lngOK = (parseFloat(lng) >= -180) && (parseFloat(lng) <= 180) ? true : false; 

            return (latOK && lngOK);
        }
        else {
            return false;
        }
    };
}


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
    ),
    'clearEdits': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12.48 3 7.73 7.75 3 12.59a2 2 0 0 0 0 2.82l4.3 4.3A1 1 0 0 0 8 20h12v-2h-7l7.22-7.22a2 2 0 0 0 0-2.83L15.31 3a2 2 0 0 0-2.83 0zM8.41 18l-4-4 4.75-4.84.74-.75 4.95 4.95-4.56 4.56-.07.08z"/>
        </svg>
    ),
    'saveStatusGreen': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12 2C6.486 2 2 6.486 2 12s4.486 10 10 10 10-4.486 10-10S17.514 2 12 2zm-1.999 14.413-3.713-3.705L7.7 11.292l2.299 2.295 5.294-5.294 1.414 1.414-6.706 6.706z"/>
        </svg>
    ),
    'saveStatusAmber': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M12.884 2.532c-.346-.654-1.422-.654-1.768 0l-9 17A.999.999 0 0 0 3 21h18a.998.998 0 0 0 .883-1.467L12.884 2.532zM13 18h-2v-2h2v2zm-2-4V9h2l.001 5H11z"/>
        </svg>
    ),
    'saveStatusRed': (
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
            <path d="M16.707 2.293A.996.996 0 0 0 16 2H8a.996.996 0 0 0-.707.293l-5 5A.996.996 0 0 0 2 8v8c0 .266.105.52.293.707l5 5A.996.996 0 0 0 8 22h8c.266 0 .52-.105.707-.293l5-5A.996.996 0 0 0 22 16V8a.996.996 0 0 0-.293-.707l-5-5zM13 17h-2v-2h2v2zm0-4h-2V7h2v6z"/>
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
}


/* =====================================================================
    Types.
===================================================================== */
export interface ImageEnlargerProps {
    [index: string]: string,
    'baseClassName': string,
    'routeExisting': string
};

export interface ImageInfoType {
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

export interface MetadataEditInputType {
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

interface MetadataCorrectnessType {
    [index: string]: boolean | undefined
    'Title'?: boolean | undefined,
    'Date'?: boolean | undefined,
    'Format'?: boolean | undefined,
    'Film'?: boolean | undefined,
    'FocalLength'?: boolean | undefined,
    'ISO'?: boolean | undefined,
    'Camera'?: boolean | undefined,
    'Lens'?: boolean | undefined,
    'Tags'?: boolean | undefined, 
    'Description'?: boolean | undefined,
    'Coordinates'?: boolean | undefined
};


export default ImageEnlarger;
