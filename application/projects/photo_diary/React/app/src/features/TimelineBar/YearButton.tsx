import React from 'react';
import { useAppDispatch, useAppSelector, useMediaQueries } from '../../common/hooks';
import { fetchImagesData, ImageDocsRequestProps } from './timelineSlice';
import './YearButton.css';


/* =============================================================
    Button constructor for dropdown menu of year items.
    Clicks will dispatch fetch request to async thunk,
    getting new image data for the clicked year. 
============================================================= */
const YearButton: React.FunctionComponent<YearButtonProps> = (props: YearButtonProps) => {
    const dispatch = useAppDispatch();

    /* -------------------------------------------------------
        Clicks on year selector items will dispatch action to
        fetch data and update state, handled by the reducer.
    ------------------------------------------------------- */
    const onYearSelect = (event: React.SyntheticEvent) => {
        const yearSelectElem = event.target as HTMLButtonElement;
        const yearElems: HTMLCollectionOf<Element> = document.getElementsByClassName(
            props.baseClassName.concat("__", props.className));

        // Reset all radios to false.
        for (let element of Array.from(yearElems)) {
            element.ariaChecked = 'false';
        }

        // Get clicked year text and set to checked.
        const yearSelectElemText: string = yearSelectElem.textContent as string;
        yearSelectElem.ariaChecked = 'true';

        // Change selected year to clicked year.
        const yearSelectedElem: HTMLElement = document.querySelector(
            ".".concat(props.baseClassName, "__", "year-selected")) as HTMLElement;
        
        if (yearSelectedElem) {
            yearSelectedElem.textContent = yearSelectElemText;
        }

        // Dispatch fetch request.
        const payloadForYear: ImageDocsRequestProps = {
            'year': parseInt(yearSelectElemText)
        };

        dispatch(fetchImagesData(payloadForYear));
    };
    

    return (
        <li 
            className={useMediaQueries(props.baseClassName.concat("__", props.className))}
            role="menuitemradio" aria-label={props.className}
            aria-checked="false"
            onClick={onYearSelect}>

                {props.name}
        </li>
    );
}


/* =====================================================================
    Types.
===================================================================== */
export interface YearButtonProps {
    name: string,
    baseClassName: string,
    className: string,
};

export default YearButton;
