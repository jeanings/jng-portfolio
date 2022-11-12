import React, { useEffect } from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { getFilterStateStatus } from '../FilterDrawer/FilterDrawer';
import { clearFilters } from '../FilterDrawer/filterDrawerSlice';
import { handleYearSelect } from './timelineSlice';
import './YearButton.css';


/* =============================================================
    Button constructor for dropdown menu of year items.
    Clicks will dispatch fetch request to async thunk,
    getting new image data for the clicked year. 
============================================================= */
const YearButton: React.FunctionComponent<YearButtonProps> = (props: YearButtonProps) => {
    const dispatch = useAppDispatch();
    const selectedYear = useAppSelector(state => state.timeline.selected.year);
    const filterState = useAppSelector(state => state.filter);

    /* --------------------------------------------------------------
        Handles year elements' style and attribute updates through 
        listening on << timeline.selected.year >> changes.
    -------------------------------------------------------------- */
    useEffect(() => {
        const thisYearButton = document.getElementById(
            props.className.concat("-", props.year)) as HTMLElement;

        // Styling and attribute assigning based on if month was queried.
        switch (selectedYear === parseInt(props.year)) {
            case (true):
                thisYearButton.setAttribute("aria-checked", 'true');
                thisYearButton.classList.add("active");
                break;
            case (false):
                thisYearButton.setAttribute("aria-checked", 'false');
                thisYearButton.classList.remove("active");
                break;
        }   
    }, [selectedYear])


    /* -------------------------------------------------------
        Clicks on year selector items will dispatch action to
        update << timeline.selected.year >>.
        Fetches handled by useEffect in TimelineBar.
    ------------------------------------------------------- */
    const onYearSelect = (event: React.SyntheticEvent) => {
        const yearElemToSelect = event.target as HTMLButtonElement;
        
        // Get clicked year text.
        const yearElemToSelectText: string = yearElemToSelect.textContent as string;

        // Change selected year to clicked year.
        const yearSelectedElem: HTMLElement = document.querySelector(
            ".".concat(props.baseClassName, "__", "year-selected")) as HTMLElement;
        if (yearSelectedElem) {
            yearSelectedElem.textContent = yearElemToSelectText;
        }

        // Dispatch selected year to reducer.
        const payloadYearSelected: number = parseInt(yearElemToSelectText);
        const filterStatus = getFilterStateStatus(filterState);

        if (filterStatus === 'on') {
            // << year >> dispatch with filters 'on' won't trigger fetch.
            dispatch(handleYearSelect(payloadYearSelected));
            // clearFilters has fetch attached via useEffect in FilterDrawer.
            dispatch(clearFilters("RESET TO INIT STATE"));
        }
        else {
            // Dispatch year update, fetch handled in TimelineBar.
            dispatch(handleYearSelect(payloadYearSelected));
        }
    };
    

    return (
        <li 
            className={ useMediaQueries(props.baseClassName.concat("__", props.className)) }
            id={ props.className.concat("-", props.year) }
            role="menuitemradio" aria-label={ props.className }
            aria-checked="false"
            onClick={ onYearSelect }>

                {/* Year text. */
                    props.year
                }
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
        elem.setAttribute("aria-checked", 'false');
        elem.classList.remove("active");
    });

    const defaultMonthElem = document.getElementById("month-item-all") as HTMLElement;
    defaultMonthElem.setAttribute("aria-checked", 'true');
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
