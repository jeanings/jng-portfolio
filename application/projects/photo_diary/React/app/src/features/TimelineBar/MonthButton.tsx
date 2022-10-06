import React from 'react';
import { useAppDispatch, useMediaQueries } from '../../common/hooks';
import { handleTimelineMonth, TimelineProps } from './timelineSlice';
import MonthCounter from './MonthCounter';
import './MonthButton.css';


/* =============================================================
    Button constructor for row of month items.
    Clicks will dispatch to change ... state
============================================================= */
const MonthButton: React.FunctionComponent<MonthButtonProps> = (props: MonthButtonProps) => {
    const dispatch = useAppDispatch();

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
                if (element.ariaChecked === 'true') {
                    element.ariaChecked = 'false';
                    element.classList.remove("active");
                }
            }
        }

        // Change to clicked month.
        const monthElemToSelectName: string = monthElemToSelect.textContent!.replace(/\d/, "");
        monthElemToSelect.ariaChecked = 'true';

        // Update styling and highlight new month.
        monthElemToSelect.classList.add("active");

        // Dispatch selected month to reducer.
        const payloadMonth = monthElemToSelectName.toLowerCase() as TimelineProps["month"];
        dispatch(handleTimelineMonth(payloadMonth));
    }
    

    return (
        <div className={useMediaQueries(props.baseClassName.concat("__", props.className))}
            role="menuitemradio" aria-label={props.className}
            aria-checked="false"
            onClick={onMonthSelect}>

                {props.name.toUpperCase()}
                {/* Counter for images taken in the month */}
                {createMonthCounter(props.name, props.baseClassName, props.keyIndex)}
        </div>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* -----------------------------------------------------
    Wrapper for creating image counters for the month.
----------------------------------------------------- */
function createMonthCounter(name: string, classBase: string, index: number) {
    let monthCounter : JSX.Element;

    monthCounter = (
        <MonthCounter
            name={name}
            baseClassName={classBase}
            className='month-counter'
            key={'key-month-counter_'.concat(index.toString())}
        />
    );

    return monthCounter;
}


/* =====================================================================
    Types.
===================================================================== */
export interface MonthButtonProps {
    name: string,
    baseClassName: string,
    className: string,
    keyIndex: number
};

export default MonthButton;