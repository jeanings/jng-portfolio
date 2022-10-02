import React, { useEffect } from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { 
    fetchImagesData, 
    handleTimelineMonth, 
    // handleTimelineYear, 
    ImageDocsRequestProps, 
    TimelineProps } from '../../features/TimelineBar/timelineSlice';
import YearButton from './YearButton';
import MonthButton from './MonthButton';
import './TimelineBar.css';
import { JSXElement } from '@babel/types';
import { time } from 'console';


/* =============================================================
    A main component - container for the date selector up top.
    Entry point for requesting initial images data from API,
    and subsequent requests on year/month elements.
============================================================= */
const TimelineBar: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const timelineState = useAppSelector(state => state.timeline);
    const classBase: string = 'TimelineBar';

    const months: Array<string> = [
        'ALL',
        'JAN', 'FEB', 'MAR', 'APR',
        'MAY', 'JUN', 'JUL', 'AUG',
        'SEP', 'OCT', 'NOV', 'DEC'
    ];

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
        ))
    }


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


/* =====================================================================
    Helper functions.
===================================================================== */

/* ------------------------------------------------------
    Wrapper for creating selectable year dropdown items
------------------------------------------------------ */
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
} 


export default TimelineBar;
