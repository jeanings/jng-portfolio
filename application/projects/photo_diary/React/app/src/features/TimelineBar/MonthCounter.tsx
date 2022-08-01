import React, { useEffect } from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
import { TimelineProps } from './timelineSlice';
import './MonthCounter.css';


const MonthCounter: React.FunctionComponent<MonthCounterProps> = (props: MonthCounterProps) => {
    const counterPlaceholder: number = 0;
    // TODO: 
    // 'counterPlaceholder' updates based on API data
    // using props.name (abbreviated month name used in state)

    
    return (
        <div className={useMediaQueries(props.baseClassName.concat("__", props.className))}>
            {counterPlaceholder}
        </div>
    );
}


export interface MonthCounterProps {
    name: string,
    baseClassName: string,
    className: string,
};

export default MonthCounter;