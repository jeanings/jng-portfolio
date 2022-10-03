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
    const timelineState = useAppSelector(state => state.timeline);

    /* -------------------------------------------------------
        Clicks on year selector items will dispatch action to
        fetch data and update state, handled by the reducer.
    ------------------------------------------------------- */
    const onYearSelect = (event: any) => {
        const yearItems: HTMLCollectionOf<Element> = document.getElementsByClassName(
            props.baseClassName.concat("__", props.className));

        // Reset all radios to false.
        for (let element of Array.from(yearItems)) {
            element.ariaChecked = "false";
        }

        // Get clicked year text and set to checked.
        const yearSelectionText: number = event.target.textContent;
        const yearSelectionStatus: boolean = event.target.ariaChecked = true;

        // Change selected year to clicked year.
        const yearSelectedElement: HTMLElement = document.querySelector(
            ".".concat(props.baseClassName, "__", "year-selected")) as HTMLElement;
        
        if (yearSelectedElement) {
            yearSelectedElement.textContent = yearSelectionText.toString();
        }

        // Dispatch fetch request.
        const payloadForYear: ImageDocsRequestProps = {
            'year': yearSelectionText as number
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
