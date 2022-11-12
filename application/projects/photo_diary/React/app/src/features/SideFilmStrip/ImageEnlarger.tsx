import React, { useEffect } from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
import './ImageEnlarger.css';


/* =====================================================================
    Subcomponent for showing enlarged image if a thumbnail is clicked.
    Image metadata/info shown along with image.
===================================================================== */
const ImageEnlarger: React.FunctionComponent <ImageEnlargerProps> = (props: ImageEnlargerProps) => {
    const imageDoc = useAppSelector(state => state.sideFilmStrip.enlargeDoc);
    const classBase: string = "image-enlarger";
    let imageSource: string = "";
    let imageInfo: ImageInfoType = {
        'Title': null,
        'Date': '',
        'Format': '',
        'Film': null,
        'Focal length': '',
        'ISO': null,
        'Camera': '',
        'Lens': '',
        'Tags': [],
        'Description': null
    };

    /* ---------------------------------------------------------------
        TODO: don't show image enlarger panel if no image clicked.
    --------------------------------------------------------------- */
    useEffect(() => {

        if (imageDoc !== null) {
            // Add class to show panel.
            const imageEnlargerElem = document.getElementById("image-enlarger") as HTMLElement;
            imageEnlargerElem.setAttribute("aria-expanded", 'true');
            imageEnlargerElem.classList.add("show");
        }
        else {
            // Hide panel if no image clicked.
            const imageEnlargerElem = document.getElementById("image-enlarger") as HTMLElement;
            imageEnlargerElem.setAttribute("aria-expanded", 'false');
            imageEnlargerElem.classList.remove("show");
        }
    }, [imageDoc])


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
            'Date': (imageDoc.date.year + '/' + dateMonth + dateDay + '\u00A0 \u00A0 \u00A0' + dateTime).toString(),
            'Format': imageDoc.format.type + ' ' + imageDoc.format.medium,
            'Film': imageDoc.film,
            'Focal length': imageDoc.focal_length_35mm + 'mm',
            'ISO': imageDoc.iso,
            'Camera': imageDoc.make + ' ' + imageDoc.model,
            'Lens': imageDoc.lens,
            'Tags': imageDoc.tags,
            'Description': imageDoc.description
        };
    }

    // Create englarged image element.
    const enlargedImageElem: JSX.Element = (
        <img className={ useMediaQueries(props.baseClassName.concat("__", classBase, "__", "image")) }
            src={ imageSource } 
            aria-label="enlarged-image"
        />
    );

    // Prepare image stats categories for generating elements.
    let infoElems: Array<JSX.Element> = [];
    const infoElemsClassName = useMediaQueries(
        props.baseClassName.concat("__", classBase, "__", "info", "-", "category"));

    Object.entries(imageInfo).forEach(item => {
        // Only add category if their content exists.
        if (item[1] !== null) {
            const category: JSX.Element = (
                <div className={ infoElemsClassName }
                    role="none" aria-label="enlarged-image-info-categories"
                    key={ "key".concat("_", "image-info", "_", item[0]) }>
                    
                    {/* Category titles. */}
                    <span role="none" aria-label={ "enlarged-image-info-category".concat("-", item[0]) }>
                        { item[0].toUpperCase() }
                    </span>

                    {/* Category content. */}
                    <span>
                        { typeof(item[1]) === "object"
                            ? item[1]?.map(tag => tag).join(', ')   // for string[] in tags
                            : item[1]
                        }
                    </span>
                </div>
            )
            infoElems.push(category);
        }
    })
    
    // Create image stats elements to populate info panel next to enlarged image.
    const imageInfoElem: JSX.Element = (
        <figcaption className={ useMediaQueries(props.baseClassName.concat("__", classBase, "__", "info")) }
            id="enlarged-image-info"
            role="none" aria-label="enlarged-image-info">

            {/* List of image stats. */
                infoElems }
        </figcaption>
    );

    
    return (
        <div className={ useMediaQueries(props.baseClassName.concat("__", classBase)) }
            id="image-enlarger"
            role="figure" aria-label={ classBase }
            aria-expanded="false">
            
            { enlargedImageElem }

            { imageInfoElem }

        </div>
    );
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
    'Focal length': string,
    'ISO': number | null,
    'Camera': string,
    'Lens': string,
    'Tags': Array<string>,
    'Description': string | null
}


export default ImageEnlarger;
