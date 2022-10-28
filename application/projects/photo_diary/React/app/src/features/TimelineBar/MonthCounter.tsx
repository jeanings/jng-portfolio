import React, { useEffect } from 'react';
import { 
    useAppDispatch,
    useAppSelector,
    useMediaQueries } from '../../common/hooks';
import Countup from 'react-countup';
import { handleMonthCounter } from '../../features/TimelineBar/timelineSlice';
import './MonthCounter.css';


/* ==============================================================
    Counter for number of images taken during the month.
    Subscribes to image counts in << timeline.counter >> state.
============================================================== */
const MonthCounter: React.FunctionComponent<MonthCounterProps> = (props: MonthCounterProps) => {
    const dispatch = useAppDispatch();
    const countCurrent = useAppSelector(state => state.timeline.counter[props.month]);
    const countPrev = useAppSelector(state => state.timeline.counter.previous[props.month]);
    const countStart = countPrev !== undefined
        ? countPrev
        : 0;
    
    /* ------------------------------------------------------
        Update state corresponding to this counter's month.
    ------------------------------------------------------ */
    useEffect(() => {
        // Wait out the rolling counter's duration.
        setTimeout(() => {
            const endCount = countCurrent !== undefined
                ? countCurrent as number
                : 0;

            const payloadUpdatePrevCounter = {
                month: props.month,
                count: endCount
            };

            // Only dispatch action if previous and new counts are different.
            if (endCount !== countStart) {
                dispatch(handleMonthCounter(payloadUpdatePrevCounter));
            }
        }, 2000)
    }, [countCurrent])


    // Create rolling counter component.
    const updateCount: JSX.Element = (
        <Countup
            start={countStart as number} 
            end={countCurrent === undefined ? 0 : countCurrent as number}   // Avoids passing in undefined
            duration={1.5}                                                  // when fetches result in 
            decimals={0}                                                    // non-existent keys.
        />
    );
    

    return (
        <div className={useMediaQueries(props.baseClassName.concat("__", props.className))}
            role='none' aria-label='month-counter'>

            {updateCount}
        </div>
    );
}


/* =====================================================================
    Types.
===================================================================== */
export interface MonthCounterProps {
    month: string,
    baseClassName: string,
    className: string,
};

export default MonthCounter;