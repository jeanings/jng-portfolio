import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../hooks';
import { handleTimelineMonth, handleTimelineYear, TimelineProps } from '../../slices/timelineSlice';
import { useMediaQueries } from '../../App';
import './TimelineBar.css';



const TimelineBar: React.FC = () => {
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
    

    useEffect(() => {
        // Set initial year and month selection parameters.
        const payloadInitYear: string = years[years.length - 1];  // refactor for API, current/most recent year
        const payloadInitMonth: TimelineProps["month"] = 'all';
        const allMonthsElement: HTMLElement = document.getElementsByClassName("TimelineBar_month_selector_item")[0] as HTMLElement;

        allMonthsElement.click();

        dispatch(handleTimelineYear(payloadInitYear));
        dispatch(handleTimelineMonth(payloadInitMonth));
    }, []);


    const onYearSelect = (event: any) => {
        /* -------------------------------------------------------
            Clicks on year selector items will dispatch action to
            retrieve new set of images, handled by the reducer.
        ------------------------------------------------------- */
        const yearSelectorItems:  HTMLCollectionOf<Element>= document.getElementsByClassName("TimelineBar_year_selector_item");

        // Reset all radios to false.
        for (let element of Array.from(yearSelectorItems)) {
            element.ariaChecked = "false";
        }

        // Change to clicked year.
        const yearSelected: string = event.target.textContent;
        const yearSelectedStatus: boolean = event.target.ariaChecked = true;
        const yearSelector = document.querySelector(".TimelineBar_year_selector_active") as HTMLElement;

        yearSelector.textContent = yearSelected;

        // Dispatch selected year to reducer.
        const payloadYear: TimelineProps["year"] = yearSelected;
        dispatch(handleTimelineYear(payloadYear));
    }


    const onMonthSelect = (event: any) => {
        /* ----------------------------------------------------------------
            Clicks on month selector items will dispatch action to
            update set of images, showing only images from selected month.
        ---------------------------------------------------------------- */
        const monthSelectorItems:  HTMLCollectionOf<Element>= document.getElementsByClassName("TimelineBar_month_selector_item");
        const monthSelected: HTMLElement = event.target;

        // Reset all radios to false, unhighlight styling.
        for (let element of Array.from(monthSelectorItems)) {
            element.ariaChecked = "false";
            element.classList.remove("active");
        }

        // Change to clicked month.
        const monthSelectedText: string = event.target.textContent.replace(/\d/, "");
        const monthSelectedStatus: boolean = event.target.ariaChecked = true;

        // Update styling and highlight new month.
        monthSelected.classList.add("active");

        // Dispatch selected month to reducer.
        const payloadMonth = monthSelectedText.toLowerCase() as TimelineProps["month"];
        dispatch(handleTimelineMonth(payloadMonth));
    }



    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'TimelineBar';

    
    return (
        <div className={useMediaQueries(classBase)}>
            <div className="TimelineBar_year_selector"
                role="menubar" aria-label="year_selector">

                <div className="TimelineBar_year_selector_active"
                    role="menuitem" aria-label="year_selected">
                    {years[years.length - 1]}
                </div>

                {/* Year items shown in drop-down */}
                {years.map((year, index) => (
                    <li className="TimelineBar_year_selector_item"
                    role="menuitemradio" aria-label="year_selector_item"
                    aria-checked="false"
                    key={'key_year_' + index}
                    onClick={onYearSelect}>
                        {year}
                    </li>
                ))}
            </div>


            <div className="TimelineBar_month_selector"
                role="menubar" aria-label="month_selector">
                    
                {/* Months selection labels: JAN, FEB, etc */}
                {months.map((month, index) => (
                    <div className="TimelineBar_month_selector_item"
                        role="menuitemradio" aria-label="month_selector_item"
                        aria-checked="false"
                        key={'key_month_' + index}
                        onClick={onMonthSelect}>
                            {month}

                            {/* Counter for photos taken in each month */}
                            <div className="TimelineBar_month_selector_item_counter"
                                key={'key_month_counter_' + index}>
                                0
                            </div>
                    </div>
                ))}
            </div>

        </div>
    );
}


export default TimelineBar;
