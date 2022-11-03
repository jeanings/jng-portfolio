import React, { useEffect } from 'react';
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

    /* ------------------------------------------------------------------
        On initialization, set 'ALL' months selector to 
            - aria-checked true
            - active class styling
    ------------------------------------------------------------------ */
    useEffect(() => {
        // Set active month to 'all', unset the rest.
        const defaultMonthElem = document.getElementById("month-item-all") as HTMLElement;
        defaultMonthElem.setAttribute("aria-checked", 'true');
        defaultMonthElem.classList.add("active");
    }, []);


    /* --------------------------------------------------------------
        Handles month elements' style and attribute updates through 
        listening on << timeline.selected.month >> changes.
    -------------------------------------------------------------- */
    useEffect(() => {
        const thisMonthButton = document.getElementById(
            props.className.concat("-", props.month)) as HTMLElement;

        // Styling and attribute assigning based on if month was queried.
        switch (selectedMonth === props.month) {
            case (true):
                thisMonthButton.setAttribute("aria-checked", 'true');
                thisMonthButton.classList.add("active");
                break;
            case (false):
                thisMonthButton.setAttribute("aria-checked", 'false');
                thisMonthButton.classList.remove("active");
                break;
        }   
    }, [selectedMonth])


    /* -------------------------------------------------------------
        Clicks on month selector items will update selected month, 
        triggering a useEffect fetch dispatch in component.
    ------------------------------------------------------------- */
    const onMonthSelect = (event: React.SyntheticEvent) => {
        const monthElemToSelect = event.target as HTMLButtonElement;

        // Dispatch selected month to reducer.
        const monthElemSelected: string = monthElemToSelect.textContent!
            .replace(/\d+/, "")
            .toLowerCase();
        const payloadMonthSelected: string = monthElemSelected;

        dispatch(handleMonthSelect(payloadMonthSelected));
    };
    

    return (
        <div className={ useMediaQueries(props.baseClassName.concat("__", props.className)) }
            id={ props.className.concat('-', props.month) }
            role="menuitemradio" aria-label={ props.className }
            aria-checked="false"
            onClick={ onMonthSelect }>

                {/* Month text styled in upper case. */
                    props.month.toUpperCase()
                }
                {/* Generate counter for images taken in the month. */
                    createMonthCounter(props.month, props.baseClassName, props.keyIndex)
                }
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