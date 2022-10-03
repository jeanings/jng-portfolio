import React, { useEffect } from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { 
    fetchImagesData, 
    handleTimelineMonth, 
    ImageDocsRequestProps, 
    TimelineProps } from '../../features/TimelineBar/timelineSlice';
import YearButton from './YearButton';
import MonthButton from './MonthButton';
import './TimelineBar.css';


/* =============================================================
    A main component - container for the date selector up top.
    Entry point for requesting initial images data from API,
    and subsequent requests on year/month elements.
============================================================= */
const TimelineBar: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const timelineState = useAppSelector(state => state.timeline);
    const classBase: string = 'TimelineBar';

    /* ------------------------------------------
        Get default data set on initial render.
    ------------------------------------------ */
    useEffect(() => {
        const payloadInit: ImageDocsRequestProps = {
            'year': 'default'
        };
        
        if (timelineState.yearInit === null) {
            dispatch(fetchImagesData(payloadInit));
        }
    }, []);


    // Build list of selectable years, based on collections in db.
    let years: Array<string> = [];
    let yearsList: Array<JSX.Element> = [];
    years = timelineState.years as Array<string>

    if (years) {
        years.map((year, index) => (
            yearsList.push(createYearButton(year, index, classBase))
        ));
    }

    
    // Build month items.
    const months: Array<string> = [
        'all',
        'jan', 'feb', 'mar', 'apr',
        'may', 'jun', 'jul', 'aug',
        'sep', 'oct', 'nov', 'dec'
    ];
    let monthItems: Array<JSX.Element> = [];

    months.map((month, index) => (
        monthItems.push(createMonthButton(month, index, classBase))
    ));



    return (
        <div className={useMediaQueries(classBase)}
            role="region" aria-label="timeline">
            <div className={useMediaQueries(classBase.concat("__", "year-selector"))}
                role="menubar" aria-label="year-selector">

                <div className={useMediaQueries(classBase.concat("__", "year-selected"))}
                    role="menuitem" aria-label="year-selected">
                    {timelineState.yearSelected}
                </div>

                {/* Dropdown menu of selectable years based on db collections. */}
                {yearsList}
            </div>


            <div className={useMediaQueries(classBase.concat("__", "month-selector"))}
                role="menubar" aria-label="month-selector">
                
                {/* Months selection labels: JAN, FEB, etc. */}
                {monthItems}
            </div>
        </div>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* -------------------------------------------------------
    Wrapper for creating selectable year dropdown items.
------------------------------------------------------- */
function createYearButton(year: string, index: number, classBase: string) {
    let yearButton: JSX.Element;

    yearButton = (
        <YearButton
            name={year}
            baseClassName={classBase}
            className='year-item'
            key={'key-year_'.concat(index.toString())}
        />
    );

    return yearButton;
};

/* -----------------------------------------------
    Wrapper for creating selectable month items.
----------------------------------------------- */
function createMonthButton(month: string, index: number, classBase: string) {
    let monthButton: JSX.Element;

    monthButton = (
        <MonthButton 
            name={month}
            baseClassName={classBase}
            className='month-item'
            keyIndex={index}
            key={'key-month_'.concat(index.toString())}
        />
    );

    return monthButton;
};


export default TimelineBar;
