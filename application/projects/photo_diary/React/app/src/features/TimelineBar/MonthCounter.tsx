import React from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
import './MonthCounter.css';


/* ==============================================================
    Counter for number of images taken during the month.
    Subscribes to image counts in << timeline.counter >> state.
============================================================== */
const MonthCounter: React.FunctionComponent<MonthCounterProps> = (props: MonthCounterProps) => {
    const timelineState = useAppSelector(state => state.timeline);
    let counter: number = 0;

    // Updates counter with << timeline.counter >> state.
    if (timelineState.counter) {
        if (props.name in timelineState.counter) {
            counter = timelineState.counter[props.name];
        }
    }
    
    
    return (
        <div className={useMediaQueries(props.baseClassName.concat("__", props.className))}
            role='none' aria-label='month-counter'>
            {counter}
        </div>
    );
}


/* =====================================================================
    Types.
===================================================================== */
export interface MonthCounterProps {
    name: string,
    baseClassName: string,
    className: string,
};

export default MonthCounter;