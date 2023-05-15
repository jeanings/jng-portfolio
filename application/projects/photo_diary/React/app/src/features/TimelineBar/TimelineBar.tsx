import React, { 
    useEffect,
    useState } from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { Route, Routes } from 'react-router-dom';
import { fetchImagesData, ImageDocsRequestProps } from '../../features/TimelineBar/timelineSlice';
import YearButton from './YearButton';
import YearRoute from './YearRoute';
import MonthButton from './MonthButton';
import './TimelineBar.css';


/* ==============================================================
    A main component - container for the date selector up top.
    Entry point for fetching initial images data from API.
===============================================================*/
const TimelineBar: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const [ isYearSelectorHovered, setYearSelectorHovered ] = useState(false);
    const initYear = useAppSelector(state => state.timeline.initYear);
    const collectionYears = useAppSelector(state => state.timeline.years);
    const timeline = useAppSelector(state => state.timeline.selected);
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

    /* --------------------------------------------------------------
        Build list of selectable years, based on collections in db.
    -------------------------------------------------------------- */
    let selectableYears: Array<string> = [];
    let yearElems: Array<JSX.Element> = [];
    selectableYears = collectionYears as Array<string>;

    if (selectableYears) {
        yearElems = [...selectableYears].reverse().map((year, index) => 
            createYearButton(year, index, classBase)
        );
    } 
    
    /* --------------------------------------------
        Build routes for each year element above.
    -------------------------------------------- */
    const yearElemRoutes = yearElems.map((elem: JSX.Element, index: number) => {
        return (
            <Route
                path={ `${routePrefixForYears}/${elem.props.year}` }
                element={ 
                    <YearRoute 
                        year={ elem.props.year } 
                        baseClassName={''} 
                        className={''} 
                    /> 
                }
                key={ `key-routed-years_${index}` }
            />
        );
    });
    
    /* --------------------------------------
        Build month elements for filtering.
    -------------------------------------- */
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


    /* ------------------------------------------------------
        Handle dropdown of year selector on hover/touch.
    ------------------------------------------------------ */
    const onYearSelectorHover = (event: React.SyntheticEvent) => {
        isYearSelectorHovered === false
            ? setYearSelectorHovered(true)
            : setYearSelectorHovered(false);
    };


    return (
        <>
            <div 
                className={ useMediaQueries(classBase) }
                role="menu"
                aria-label="timeline selector">
                
                <div 
                    className={ useMediaQueries(`${classBase}__year-selector`) 
                        +   // Add "dropdown" styling on hover
                        (isYearSelectorHovered === false
                            ? ""
                            : " " + "dropdown")}
                    role="menubar"
                    aria-label="year selector"
                    onMouseEnter={ onYearSelectorHover }
                    onMouseLeave={ onYearSelectorHover }>

                    <div 
                        className={ useMediaQueries(`${classBase}__year-selected`) }
                        role="menuitem"
                        aria-label="selected year">
                        
                        { timeline.year }
                    </div>

                    {/* Dropdown menu of selectable years based on db collections. */}
                    { yearElems }

                    {/* Nested routes for each available year in dataset. */}
                    { <Routes>
                        { yearElemRoutes }
                    </Routes> }
                </div>

                <div
                    className={ useMediaQueries(`${classBase}__month-selector`) }
                    role="menubar"
                    aria-label="month selector">
                    
                    {/* Months selection labels: JAN, FEB, etc. */ }
                    { monthElems }
                </div>
            </div>
        </>
        
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
            key={ `key-year_${index.toString()}` }
        />
    );
    
    return yearButton;
}


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
            key={ `key-month_${index.toString()}` }
        />
    );

    return monthButton;
}

export const routePrefixForYears: string = 'reflect-on';


export default TimelineBar;
