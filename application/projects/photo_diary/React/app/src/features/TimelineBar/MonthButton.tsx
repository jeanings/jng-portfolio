import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector,
    useMediaQueries } from '../../common/hooks';
import { handleMonthSelect } from './timelineSlice';
import MonthCounter from './MonthCounter';
import './MonthButton.css';


/* =============================================================
    Button constructor for row of month items.
    Clicks will dispatch to change << timeline.month >> state
============================================================= */
const MonthButton: React.FunctionComponent<MonthButtonProps> = (props: MonthButtonProps) => {
    const dispatch = useAppDispatch();
    const timeline = useAppSelector(state => state.timeline.selected);

    /* ---------------------------------------------------------------------------
        Clicks on month selector items will update << timeline.selected.month >>
        and dispatch fetch request for selected year and month.
    --------------------------------------------------------------------------- */
    const onMonthSelect = (event: React.SyntheticEvent) => {
        // Update selected month.
        const payloadMonthSelected: string = props.month;
        dispatch(handleMonthSelect(payloadMonthSelected));
    };
  
    
    return (
        <div 
            className={ useMediaQueries(`${props.baseClassName}__${props.className}`) 
                +   // Add "active" styling for selected element.
                (timeline.month === props.month
                    ? " " + "active"
                    : "") }
            id={ `${props.className}-${props.month}` }
            role="menuitemradio" 
            aria-label={ "month selector option" }
            aria-checked={// Changed pressed state based on selected element.
                timeline.month === props.month 
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
            key={ `key-month-counter_${index.toString()}` }
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