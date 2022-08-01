import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector, useMediaQueries } from '../../common/hooks';
import { handleTimelineMonth, handleTimelineYear, TimelineProps } from '../../features/TimelineBar/timelineSlice';
import YearButton from './YearButton';
import MonthButton from './MonthButton';
import './TimelineBar.css';



const TimelineBar: React.FunctionComponent = () => {
    /* ------------------------------------------------------------
        A main component - container for the date selector up top.
    ------------------------------------------------------------- */

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
    const classBase: string = 'TimelineBar';

    /* TODO: years array pulled from API */
    const years: Array<string> = [
        '2014', '2015', '2016', '2017',
        '2018', '2019', '2020', '2021',
        '2022'
    ];
    /* TODO: months array pulled from API */
    const months: Array<string> = [
        'ALL',
        'JAN', 'FEB', 'MAR', 'APR',
        'MAY', 'JUN', 'JUL', 'AUG',
        'SEP', 'OCT', 'NOV', 'DEC'
    ];

    // useEffect(() => {
    //     /* -------------------------------------------------------
    //         Set initial year and month selection parameters.
    //     ------------------------------------------------------- */
    //     const payloadInitYear: string = yearState;  // refactor for API, current/most recent year
    //     // const payloadInitMonth: TimelineProps["month"] = 'all';
    //     const yearItems = Array.from(document.getElementsByClassName(
    //         classBase.concat("__", "year-item")) as HTMLCollectionOf<Element>);
    //     const initYear = yearItems.find(
    //         element => element.textContent === payloadInitYear) as HTMLElement;
    //     const initMonth: HTMLElement = document.getElementsByClassName(
    //         classBase.concat("__", "month-item"))[0] as HTMLElement;

    //     console.log(initYear, initMonth)
    //     // initYear.click();
    //     // initMonthAll.click();

    //     // dispatch(handleTimelineYear(payloadInitYear));
    //     // dispatch(handleTimelineMonth(payloadInitMonth));
    // }, []);


    useEffect(() => {
        /* -------------------------------------------------------
            Update selected year text on state change.
        ------------------------------------------------------- */
        const yearSelectedElement: HTMLElement = document.querySelector(
            ".".concat(classBase, "__", "year-selected")) as HTMLElement;
        
        if (yearSelectedElement) {
            yearSelectedElement.textContent = yearState;
        }
    }, [yearState]);


    return (
        <div className={useMediaQueries(classBase)}>
            <div className={useMediaQueries(classBase.concat("__", "year-selector"))}
                role="menubar" aria-label="year-selector">

                <div className={useMediaQueries(classBase.concat("__", "year-selected"))}
                    role="menuitem" aria-label="year-selected">
                    {yearState}
                </div>

    {/* TODO: years array pulled from API */}
                {/* Year items shown in drop-down */}
                {years.map((year, index) => (
                    <YearButton
                        name={year}
                        baseClassName={classBase}
                        className='year-item'
                        key={'key-year_'.concat(index.toString())}
                    />
                ))}
            </div>


            <div className={useMediaQueries(classBase.concat("__", "month-selector"))}
                role="menubar" aria-label="month-selector">
                
                {/* Months selection labels: JAN, FEB, etc */}
                {months.map((month, index) => (
                    <MonthButton 
                        name={month}
                        baseClassName={classBase}
                        className='month-item'
                        keyIndex={index}
                        key={'key-month_'.concat(index.toString())}
                    />
                ))}
            </div>

        </div>
    );
}


export default TimelineBar;
