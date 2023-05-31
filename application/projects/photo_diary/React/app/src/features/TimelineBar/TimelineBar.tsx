import React, { 
    useEffect,
    useState } from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { 
    Location,
    Route,
    Routes,
    useLocation } from 'react-router-dom';
import { 
    fetchImagesData, 
    FilterableTypes, 
    handleResponseStatus, 
    ImageDocsRequestProps,
    TimelineMonthTypes } from '../../features/TimelineBar/timelineSlice';
import YearButton from './YearButton';
import YearRoute from './YearRoute';
import MonthButton, { getNumericalMonth } from './MonthButton';
import { routePrefixForThumbs } from '../SideFilmStrip/SideFilmStrip';
import { getPayloadForFilteredQuery } from '../FilterDrawer/FilterDrawer';
import './TimelineBar.css';


/* ==============================================================
    A main component - container for the date selector up top.
    Entry point for fetching initial images data from API.
===============================================================*/
const TimelineBar: React.FunctionComponent = () => {
    const dispatch = useAppDispatch();
    const location = useLocation();
    const [ isYearSelectorHovered, setYearSelectorHovered ] = useState(false);
    const responseStatus = useAppSelector(state => state.timeline.responseStatus);
    const initYear = useAppSelector(state => state.timeline.initYear);
    const collectionYears = useAppSelector(state => state.timeline.years);
    const timeline = useAppSelector(state => state.timeline.selected);
    const classBase: string = "TimelineBar";

    /* ------------------------------------------
        Get default data set on initial render.
    ------------------------------------------ */
    useEffect(() => {
        const routedWith: RouteInitType = identifyRouteSource(location);
        const parsedYearFromPath: number = parseInt(location.pathname.split(`${routePrefixForYears}/`)[1]);
        const yearFromPath: number | 'default' = isNaN(parsedYearFromPath)
            ? 'default'
            : parsedYearFromPath;
        let payloadInit: ImageDocsRequestProps = { 'year': 'default' };

        switch(routedWith) {
            case 'filters':
                // Routed with filters queries.              
                const queryPairs = location.search.split('?')[1].split('&');
                const initTimeline: {
                    [index: string]: number | 'default' | null,
                    year: number | 'default', 
                    month: number | null } = { 
                    year: yearFromPath,
                    month: null 
                };

                // Parse URL arguments.
                let initQueries = {}
                initQueries = queryPairs.reduce((queries, query) => {
                    const [ key, val ] = query.split('=');
                    const vals = val.split('%2B');

                    if (key === 'month') {
                        initTimeline.month = getNumericalMonth(val as TimelineMonthTypes);
                        return queries;
                    }
                    
                    vals.length === 1
                        ? queries[key] = [val]
                        : queries[key] = vals
                    return queries;
                }, {} as FilterableTypes);
                payloadInit = getPayloadForFilteredQuery(initQueries, undefined, initTimeline);
                break;

            case 'revisit':
                // Routed with image parameter.
                payloadInit.year = yearFromPath
                break;

            case 'reflect-on':
                // Routed with year parameter.
                payloadInit.year = yearFromPath
                break;

            default:
                // Default root route, fetch latest dataset.
                break;
        }

        if (initYear === null && responseStatus === 'uninitialized') {
            dispatch(fetchImagesData(payloadInit));
        }
    }, []);


    /* --------------------------------------------------------
        Update response status to ready-state 'idle' to allow
        for various effects in other components to function.
    -------------------------------------------------------- */
    useEffect(() => {
        if (responseStatus === 'successful') {
            const payloadRespStatus: string = 'idle';
            dispatch(handleResponseStatus(payloadRespStatus));
        }
    }, [responseStatus])


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
/* -----------------------------------------------------------------------
    Identifies where browser is routing from, to determine init fetches.
----------------------------------------------------------------------- */
function identifyRouteSource(location: Location) {
    if (location.search) {
        return 'filters';
    }

    if (location.pathname.includes(routePrefixForThumbs)) {
        return 'revisit';
    }

    if (location.pathname.includes(routePrefixForYears)) {
        return 'reflect-on';
    }

    if (location.pathname === '/') {
        return 'root';
    }
}


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


/* =====================================================================
    Types.
===================================================================== */
type RouteInitType = "filters" | "revisit" | "reflect-on" | "root" | undefined;


export const routePrefixForYears: string = 'reflect-on';


export default TimelineBar;
