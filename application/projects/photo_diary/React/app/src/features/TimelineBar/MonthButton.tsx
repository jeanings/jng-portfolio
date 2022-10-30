import React, { useEffect } from 'react';
import { 
    useAppDispatch, 
    useAppSelector,
    useMediaQueries } from '../../common/hooks';
import { 
    fetchImagesData, 
    TimelineProps, 
    ImageDocsRequestProps } from './timelineSlice';
import MonthCounter from './MonthCounter';
import './MonthButton.css';


/* =============================================================
    Button constructor for row of month items.
    Clicks will dispatch to change << timeline.month >> state
============================================================= */
const MonthButton: React.FunctionComponent<MonthButtonProps> = (props: MonthButtonProps) => {
    const dispatch = useAppDispatch();
    const yearSelected = useAppSelector(state => state.timeline.yearSelected);

    /* ------------------------------------------------------------------
        On initialization, set 'ALL' months selector to 
            - aria-checked true
            - active class styling
    ------------------------------------------------------------------ */
    useEffect(() => {
        // Set active month to 'all', unset the rest.
        const defaultMonthSelectorElem = document.getElementById("month-item-all") as HTMLElement;
        defaultMonthSelectorElem.setAttribute('aria-checked', 'true');
        defaultMonthSelectorElem.classList.add("active");
    }, []);


    /* ------------------------------------------------------------------
        Clicks on month selector items will dispatch action to
        update selected month, showing only images from selected month.
    ------------------------------------------------------------------ */
    const onMonthSelect = (event: React.SyntheticEvent) => {
        const monthElemToSelect = event.target as HTMLButtonElement;
        const monthSelectorElems: HTMLCollectionOf<Element> = document.getElementsByClassName(
            "TimelineBar".concat("__", "month-item"));

        // Reset all other radios to false, unhighlight styling.
        for (let element of Array.from(monthSelectorElems)) {
            if (element !== monthElemToSelect) {
                if (element.getAttribute('aria-checked') === 'true') {
                    element.setAttribute('aria-checked', 'false');
                    element.classList.remove("active");
                }
            }
        }

        // Change to clicked month.
        monthElemToSelect.setAttribute('aria-checked', 'true');

        // Update styling and highlight new month.
        monthElemToSelect.classList.add("active");

        // Dispatch selected month to reducer.
        const monthElemToSelectName: string = monthElemToSelect.textContent!.replace(/\d+/, "");
        const monthNum = getNumericalMonth(monthElemToSelectName.toLowerCase());

        const monthQuery: ImageDocsRequestProps= {
            'year': yearSelected as number,
            'month': monthNum
        };

        dispatch(fetchImagesData(monthQuery));
    };
    

    return (
        <div className={useMediaQueries(props.baseClassName.concat("__", props.className))}
            id={props.className.concat('-', props.month)}
            role="menuitemradio" aria-label={props.className}
            aria-checked="false"
            onClick={onMonthSelect}>

                {props.month.toUpperCase()}
                {/* Generate counter for images taken in the month */}
                {createMonthCounter(props.month, props.baseClassName, props.keyIndex)}
        </div>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* -----------------------------------------------------
    Wrapper for creating image counters for the month.
----------------------------------------------------- */
function createMonthCounter(month: string, classBase: string, index: number) {
    let monthCounter : JSX.Element;

    monthCounter = (
        <MonthCounter
            month={month}
            baseClassName={classBase}
            className='month-counter'
            key={'key-month-counter_'.concat(index.toString())}
        />
    );

    return monthCounter;
}

/* -----------------------------------
    Month to numerical month mapper.
----------------------------------- */
function getNumericalMonth(month: string) {
    const monthToNum: { [key: string]: number } = {
        'jan': 1, 'feb': 2, 'mar': 3,
        'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9,
        'oct': 10, 'nov': 11, 'dec': 12
    };

    const monthNum: number = monthToNum[month];

    return monthNum
};



/* =====================================================================
    Types.
===================================================================== */
export interface MonthButtonProps {
    month: string,
    baseClassName: string,
    className: string,
    keyIndex: number
};

export default MonthButton;