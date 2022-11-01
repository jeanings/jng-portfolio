import React from 'react';
import { useAppDispatch, useMediaQueries } from '../../common/hooks';
import { resetFilterStyling } from '../FilterDrawer/FilterDrawer';
import { clearFilters } from '../FilterDrawer/filterDrawerSlice';
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
        for (let yearElem of Array.from(yearElems)) {
            yearElem.setAttribute('aria-checked', 'false');
        }

        // Set active month to 'all', unset the rest.
        resetMonthStyling();
        
        // Get clicked year text and set to checked.
        const yearSelectElemText: string = yearSelectElem.textContent as string;
        yearSelectElem.setAttribute('aria-checked', 'true');

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

        resetFilterStyling();
        dispatch(clearFilters("RESET TO INIT STATE"));
        dispatch(fetchImagesData(payloadForYear));
    };
    

    return (
        <li 
            className={useMediaQueries(props.baseClassName.concat("__", props.className))}
            role="menuitemradio" aria-label={props.className}
            aria-checked="false"
            onClick={onYearSelect}>

                {props.year}
        </li>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* -------------------------
    Resets month styling.
------------------------- */
export function resetMonthStyling() {
    const monthElems = document.querySelectorAll('[aria-label="month-item"]');
    monthElems.forEach(elem => {
        elem.setAttribute('aria-checked', 'false');
        elem.classList.remove("active");
    });

    const defaultMonthElem = document.getElementById("month-item-all") as HTMLElement;
    defaultMonthElem.setAttribute('aria-checked', 'true');
    defaultMonthElem.classList.add("active");
};


/* =====================================================================
    Types.
===================================================================== */
export interface YearButtonProps {
    year: string,
    baseClassName: string,
    className: string,
};

export default YearButton;
