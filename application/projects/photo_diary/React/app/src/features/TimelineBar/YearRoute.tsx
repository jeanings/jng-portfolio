import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector,  } from '../../common/hooks';
import { 
    handleYearSelect,
    fetchImagesData,
    ImageDocsRequestProps } from './timelineSlice';
import { YearButtonProps } from './YearButton';


/* =================================================================================
    Routes for each year available in timeline, handles fetch dispatches for year.
    Originates from clicks on year buttons on drop-down menu on TimelineBar.
================================================================================= */
const YearRoute: React.FunctionComponent<YearButtonProps> = (props: YearButtonProps) => {
    const dispatch = useAppDispatch();
    const selected = useAppSelector(state => state.timeline.selected);

    /* ----------------------------
        Year dataset fetch logic.
    ---------------------------- */
    useEffect(() => {
        const payloadYearSelected: number = parseInt(props.year);

        if (selected.year !== payloadYearSelected || selected.month) {
            // Update selected year.
            dispatch(handleYearSelect(payloadYearSelected));

            // Dispatch fetch request for newly selected year.
            let payloadFetchYear: ImageDocsRequestProps = { 
                'year': payloadYearSelected
            };
            dispatch(fetchImagesData(payloadFetchYear));
        }
    }, [selected, props.year]);
    
    return (
        // Not rendering anything, just dispatching action.
        <></>
    );
};


export default YearRoute;
