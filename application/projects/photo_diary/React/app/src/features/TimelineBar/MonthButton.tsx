import React, { useEffect } from 'react';
import { useAppDispatch, useMediaQueries } from '../../common/hooks';
import { handleTimelineMonth, TimelineProps } from './timelineSlice';
import MonthCounter from './MonthCounter';
import './MonthButton.css';


const MonthButton: React.FunctionComponent<MonthButtonProps> = (props: MonthButtonProps) => {
    const dispatch = useAppDispatch();

    const onMonthSelect = (event: any) => {
        /* ----------------------------------------------------------------
            Clicks on month selector items will dispatch action to
            update selected month, showing only images from selected month.
        ---------------------------------------------------------------- */
        const monthSelectorItems: HTMLCollectionOf<Element> = document.getElementsByClassName(
            "TimelineBar".concat("__", "month-item"));
        const monthSelection: HTMLElement = event.target;

        // Reset all radios to false, unhighlight styling.
        for (let element of Array.from(monthSelectorItems)) {
            element.ariaChecked = "false";
            element.classList.remove("active");
        }

        // Change to clicked month.
        const monthSelectionText: string = event.target.textContent.replace(/\d/, "");
        const monthSelectionStatus: boolean = event.target.ariaChecked = true;

        // Update styling and highlight new month.
        monthSelection.classList.add("active");

        // Dispatch selected month to reducer.
        const payloadMonth = monthSelectionText.toLowerCase() as TimelineProps["month"];
        dispatch(handleTimelineMonth(payloadMonth));
    }
    

    return (
        <div className={useMediaQueries(props.baseClassName.concat("__", props.className))}
            role="menuitemradio" aria-label={props.className}
            aria-checked="false"
            onClick={onMonthSelect}>
                {props.name}

                {/* Counter for photos taken in each month */}
                <MonthCounter
                    name={props.name}
                    baseClassName={props.baseClassName}
                    className='month-counter'
                    key={'key-month-counter_'.concat(props.keyIndex.toString())}
                />
        </div>
    );
}


export interface MonthButtonProps {
    name: string,
    baseClassName: string,
    className: string,
    keyIndex: number
};

export default MonthButton;