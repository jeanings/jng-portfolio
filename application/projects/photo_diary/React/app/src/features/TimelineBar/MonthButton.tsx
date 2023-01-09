import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector,
    useMediaQueries } from '../../common/hooks';
import { 
    handleMonthSelect,
    fetchImagesData,
    ImageDocsRequestProps,
    TimelineMonthTypes } from './timelineSlice';
import MonthCounter from './MonthCounter';
import './MonthButton.css';


/* =============================================================
    Button constructor for row of month items.
    Clicks will dispatch to change << timeline.month >> state
============================================================= */
const MonthButton: React.FunctionComponent<MonthButtonProps> = (props: MonthButtonProps) => {
    const dispatch = useAppDispatch();
    const selectedYear = useAppSelector(state => state.timeline.selected.year);
    const selectedMonth = useAppSelector(state => state.timeline.selected.month);

    /* -------------------------------------------------------------
        Clicks on month selector items will update selected month, 
        dispatch fetch request for selected year and month.
    ------------------------------------------------------------- */
    const onMonthSelect = (event: React.SyntheticEvent) => {
        // Update selected month.
        const payloadMonthSelected: string = props.month;
        dispatch(handleMonthSelect(payloadMonthSelected));

        // Dispatch fetch request for newly selected month.
        // Prepare fetch payload.
        let payloadFetchMonth: ImageDocsRequestProps = { 
            'year': selectedYear as number
        };
        // month value in fetch request needs to be numerical.
        const month = getNumericalMonth(props.month as TimelineMonthTypes);
        payloadFetchMonth['month'] = month;

        dispatch(fetchImagesData(payloadFetchMonth));
    };
  
    
    return (
        <div 
            className={ useMediaQueries(props.baseClassName.concat("__", props.className)) 
                +   // Add "active" styling for selected element.
                (selectedMonth === props.month
                    ? " ".concat("active")
                    : "") }
            id={ props.className.concat('-', props.month) }
            role="menuitemradio" 
            aria-label={ "month selector option" }
            aria-checked={// Changed pressed state based on selected element.
                selectedMonth === props.month 
                    ? "true"
                    : "false" }
            onClick={ onMonthSelect }>

                {/* Month text styled in upper case. */
                    props.month.toUpperCase() }
                {/* Generate counter for images taken in the month. */
                    createMonthCounter(props.month, props.baseClassName, props.keyIndex) }
        </div>
    );
}


/* =====================================================================
    Helper functions.
===================================================================== */

/* -----------------------------------------------------
    Wrapper for creating image counters for the month.
----------------------------------------------------- */
function createMonthCounter(month: string, classBase: string, index: number) {
    let monthCounter : JSX.Element;

    monthCounter = (
        <MonthCounter
            month={ month }
            baseClassName={ classBase }
            className="month-counter"
            key={ "key-month-counter_".concat(index.toString()) }
        />
    );

    return monthCounter;
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

    return monthNum;
};

/* =====================================================================
    Types.
===================================================================== */
export interface MonthButtonProps {
    month: string,
    baseClassName: string,
    className: string,
    keyIndex: number
};

export default MonthButton;