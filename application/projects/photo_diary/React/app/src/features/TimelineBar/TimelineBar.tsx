import React, { useEffect } from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { 
    fetchImagesData, 
    handleInitStatus, 
    ImageDocsRequestProps,
    TimelineMonthTypes } from '../../features/TimelineBar/timelineSlice';
import YearButton from './YearButton';
import MonthButton from './MonthButton';
import { getFilterStateStatus } from '../FilterDrawer/FilterDrawer';
import './TimelineBar.css';


/* ==============================================================
    A main component - container for the date selector up top.
    Entry point for requesting initial images data from API,
    and subsequent fetches on year and month queries.
===============================================================*/
const TimelineBar: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const initYear = useAppSelector(state => state.timeline.yearInit);
    const initFetch: boolean = useAppSelector(state => state.timeline.request) === 'initialized'
        ? true
        : false;
    const collectionYears = useAppSelector(state => state.timeline.years);
    const selectedYear = useAppSelector(state => state.timeline.selected.year);
    const selectedMonth = useAppSelector(state => state.timeline.selected.month);
    const filterState = useAppSelector(state => state.filter);
    const classBase: string = "TimelineBar";

    /* ------------------------------------------
        Get default data set on initial render.
    ------------------------------------------ */
    useEffect(() => {
        const payloadInit: ImageDocsRequestProps = {
            'year': 'default'
        };
        
        if (initYear === null) {
            dispatch(fetchImagesData(payloadInit));
        }
    }, []);


    /* --------------------------------------------------------
        Handles all the main non-filtered fetches related to 
        << selected.year >> and << selected.month >>.
        The handler for year and month item clicks, triggered
        by the above mentioned states.
    --------------------------------------------------------- */
    useEffect(() => {
        const filterStatus = getFilterStateStatus(filterState);
        // Only handle fetch calls if filters are off.
        // Otherwise let FilterDrawer useEffect handle fetches.
        if (filterStatus === 'off') {
            // For all regular cases after initialization.
            if (initYear !== null && initFetch === false ) {    // initFetch keeps from re-rendering. 
                let payload: ImageDocsRequestProps = { 'year': selectedYear as number };

                switch (selectedMonth) {
                    case ('all'):
                        // For 'all' default cases, ie year selects.
                        payload = payload;
                        break;
                    default:
                        // For month selected cases.
                        const month = getNumericalMonth(selectedMonth as TimelineMonthTypes);
                        payload['month'] = month;
                };
                dispatch(fetchImagesData(payload));
            }
            // Set request status after initialization..
            else if (initYear !== null) {
                const payloadInitStatus = 'complete';
                dispatch(handleInitStatus(payloadInitStatus));
            }
        }
    }, [selectedYear, selectedMonth, filterState])


    // Build list of selectable years, based on collections in db.
    let selectableYears: Array<string> = [];
    let yearElems: Array<JSX.Element> = [];
    selectableYears = collectionYears as Array<string>

    if (selectableYears) {
        selectableYears.map((year, index) => (
            yearElems.push(createYearButton(year, index, classBase))
        ));
    }

    
    // Build month items.
    const months: Array<string> = [
        'all',
        'jan', 'feb', 'mar', 'apr',
        'may', 'jun', 'jul', 'aug',
        'sep', 'oct', 'nov', 'dec'
    ];
    let monthElems: Array<JSX.Element> = [];

    months.map((month, index) => (
        monthElems.push(createMonthButton(month, index, classBase))
    ));



    return (
        <div className={ useMediaQueries(classBase) }
            role="region" aria-label="timeline-bar">
            <div className={ useMediaQueries(classBase.concat("__", "year-selector")) }
                role="menubar" aria-label="year-selector">

                <div className={ useMediaQueries(classBase.concat("__", "year-selected")) }
                    role="menuitem" aria-label="year-selected">
                    { selectedYear }
                </div>

                {/* Dropdown menu of selectable years based on db collections. */
                    yearElems
                }
                
            </div>


            <div className={ useMediaQueries(classBase.concat("__", "month-selector")) }
                role="menubar" aria-label="month-selector">
                
                {/* Months selection labels: JAN, FEB, etc. */
                    monthElems
                }
                
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
            year={ year }
            baseClassName={ classBase }
            className="year-item"
            key={ "key-year_".concat(index.toString()) }
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
            month={ month }
            baseClassName={ classBase }
            className="month-item"
            keyIndex={ index }
            key={ "key-month_".concat(index.toString()) }
        />
    );

    return monthButton;
};


/* -----------------------------------
    Month to numerical month mapper.
----------------------------------- */
export function getNumericalMonth(month: string) {
    const monthToNum: { [key: string]: number } = {
        'jan': 1, 'feb': 2, 'mar': 3,
        'apr': 4, 'may': 5, 'jun': 6,
        'jul': 7, 'aug': 8, 'sep': 9,
        'oct': 10, 'nov': 11, 'dec': 12
    };

    const monthNum: number = monthToNum[month];

    return monthNum
};


export default TimelineBar;
