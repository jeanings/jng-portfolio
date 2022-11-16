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
    const selectedMonth = useAppSelector(state => state.timeline.selected.month);

    
    /* -------------------------------------------------------------
        Clicks on month selector items will update selected month, 
        triggering a useEffect fetch dispatch in component.
    ------------------------------------------------------------- */
    const onMonthSelect = (event: React.SyntheticEvent) => {
        const payloadMonthSelected: string = props.month;
        dispatch(handleMonthSelect(payloadMonthSelected));
    };
  
    
    return (
        <div 
            className={ useMediaQueries(props.baseClassName.concat("__", props.className)) 
                +   // Add "active" styling for selected element.
                (selectedMonth === props.month
                    ? "active"
                    : "") }
            id={ props.className.concat('-', props.month) }
            role="menuitemradio" 
            aria-label={ props.className }
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
}


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