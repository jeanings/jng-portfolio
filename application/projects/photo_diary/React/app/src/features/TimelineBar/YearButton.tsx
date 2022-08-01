import React, { useEffect } from 'react';
import { useAppDispatch, useMediaQueries } from '../../common/hooks';
import { handleTimelineYear, TimelineProps } from './timelineSlice';
import './YearButton.css';


const YearButton: React.FunctionComponent<YearButtonProps> = (props: YearButtonProps) => {
    const dispatch = useAppDispatch();

    const onYearSelect = (event: any) => {
        /* -------------------------------------------------------
            Clicks on year selector items will dispatch action to
            update selected year, handled by the reducer.
        ------------------------------------------------------- */
        const yearItems: HTMLCollectionOf<Element> = document.getElementsByClassName(
            props.baseClassName.concat("__", props.className));

        // Reset all radios to false.
        for (let element of Array.from(yearItems)) {
            element.ariaChecked = "false";
        }

        // Change to clicked year.
        const yearSelectionText: string = event.target.textContent;
        const yearSelectionStatus: boolean = event.target.ariaChecked = true;

        // Dispatch selected year to reducer.
        const payloadYear: TimelineProps["year"] = yearSelectionText;
        dispatch(handleTimelineYear(payloadYear));
    }
    

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


export interface YearButtonProps {
    name: string,
    baseClassName: string,
    className: string,
};

export default YearButton;
