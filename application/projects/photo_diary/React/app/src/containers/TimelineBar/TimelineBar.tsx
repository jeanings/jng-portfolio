import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { handleTimelineMonth, handleTimelineYear, TimelineProps } from '../../slices/timelineSlice';
import { useMediaQueries } from '../../App';
import './TimelineBar.css';



const TimelineBar: React.FunctionComponent = () => {
    /* ------------------------------------------------------------
        A main component - container for the date selector up top.
    ------------------------------------------------------------- */
    const years: Array<string> = [
        '2014', '2015', '2016', '2017',
        '2018', '2019', '2020', '2021',
        '2022'
    ];

    const months: Array<string> = [
        'ALL',
        'JAN', 'FEB', 'MAR', 'APR',
        'MAY', 'JUN', 'JUL', 'AUG',
        'SEP', 'OCT', 'NOV', 'DEC'
    ];
    

    /* ==================================================================== 

    To-do / pseudo code
        
        1) get list of all available years from MongoDB
            --> yearsList: state

        2) for each year
                for each month
                    get photo count

        3) dropdown menu for selecting the year, include photo count in parentheses

        4)  if current year in yearsList
                default to that year in dropdown menu 
                --> triggers MainCanvas to render this initially

        5) if year selected
                horizontal date bar is rendered with 12 blocks,

                for each bar/month
                    a simple bar (CSS?) height based on photo count

                    clickable, clicks will update and render map pins 
                    --> MainCanvas interaction

                    hovering on each bar pops up photo count

                    Suggestion: when a year is selected, have the animate-render the month-chart like Chartjs

                    
    State interaction

        1) initial render gets state of all available years 
            --> async thunk, yearsList: state
        
        2) selecting a year on the dropdown menu sends action
            --> async thunk, selectedYear: state

        3) selecting a month, or 'show all' selected 
            --> async thunk, selectedMonth: state

        4) in (2) & (3), update list of photos and their metadata --> photosList: state

                metadata suggestions:
                    popupCameraMaker
                    popupCameraModel
                    popupCameraType
                    popupLensMaker
                    popupLensFcLength
                    popupLensMaxAperture
                    popupPhotoFcLength
                    popupPhotoShutterSpd
                    popupPhotoDayNight
                    popupPhotoInOutdoor
                    popupSubject (?)
                    popupTags (?)


    ==================================================================== */
    const dispatch = useAppDispatch();
    const yearState = useAppSelector(state => state.timeline.year);
    

    useEffect(() => {
        /* -------------------------------------------------------
            Set initial year and month selection parameters.
        ------------------------------------------------------- */
        const payloadInitYear: string = years[years.length - 1];  // refactor for API, current/most recent year
        // const payloadInitMonth: TimelineProps["month"] = 'all';
        const yearItems = Array.from(document.getElementsByClassName(
            "TimelineBar__year-item") as HTMLCollectionOf<Element>);
        const initYear = yearItems.find(
            element => element.textContent === payloadInitYear) as HTMLElement;
        const initMonthAll: HTMLElement = document.getElementsByClassName(
            "TimelineBar".concat("__", "month-item"))[0] as HTMLElement;

        initYear.click();
        initMonthAll.click();

        // dispatch(handleTimelineYear(payloadInitYear));
        // dispatch(handleTimelineMonth(payloadInitMonth));
    }, []);


    useEffect(() => {
        /* -------------------------------------------------------
            Update selected year text on state change.
        ------------------------------------------------------- */
        const yearSelectedElement: HTMLElement = document.querySelector(
            ".TimelineBar".concat("__", "year-selected")) as HTMLElement;
        
        if (yearSelectedElement) {
            yearSelectedElement.textContent = yearState;
        }
    }, [yearState]);


    const onYearSelect = (event: any) => {
        /* -------------------------------------------------------
            Clicks on year selector items will dispatch action to
            update selected year, handled by the reducer.
        ------------------------------------------------------- */
        const yearItems: HTMLCollectionOf<Element> = document.getElementsByClassName(
            "TimelineBar".concat("__", "year-item"));

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



    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'TimelineBar';

    
    return (
        <div className={useMediaQueries(classBase)}>
            <div className={useMediaQueries(classBase.concat("__", "year-selector"))}
                role="menubar" aria-label="year-selector">

                <div className={useMediaQueries(classBase.concat("__", "year-selected"))}
                    role="menuitem" aria-label="year-selected">
                    {years[years.length - 1]}
                </div>

                {/* Year items shown in drop-down */}
                {years.map((year, index) => (
                    <li className={"TimelineBar".concat("__", "year-item")}
                        role="menuitemradio" aria-label="year-item"
                        aria-checked="false"
                        key={'key-year_' + index}
                        onClick={onYearSelect}>
                            {year}
                    </li>
                ))}
            </div>


            <div className={useMediaQueries(classBase.concat("__", "month-selector"))}
                role="menubar" aria-label="month-selector">
                    
                {/* Months selection labels: JAN, FEB, etc */}
                {months.map((month, index) => (
                    <div className={"TimelineBar".concat("__", "month-item")}
                        role="menuitemradio" aria-label="month-item"
                        aria-checked="false"
                        key={'key-month_' + index}
                        onClick={onMonthSelect}>
                            {month}

                            {/* Counter for photos taken in each month */}
                            <div className={"TimelineBar".concat("__", "month-counter")}
                                key={'key-month-counter_' + index}>
                                0
                            </div>
                    </div>
                ))}
            </div>

        </div>
    );
}


export default TimelineBar;
