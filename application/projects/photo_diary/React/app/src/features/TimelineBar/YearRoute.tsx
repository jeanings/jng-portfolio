import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { useLocation } from 'react-router-dom';
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
    const { search } = useLocation();
    const selected = useAppSelector(state => state.timeline.selected);

    /* ----------------------------
        Year dataset fetch logic.
    ---------------------------- */
    useEffect(() => {
        const payloadYearSelected: number = parseInt(props.year);
        const isFiltered: boolean = search !== '' ? true : false;

        if (isFiltered) {
            return;
        }

        if (selected.year !== payloadYearSelected 
            || selected.month) {
            // Update selected year.
            dispatch(handleYearSelect(payloadYearSelected));

            // Dispatch fetch request for newly selected year.
            let payloadFetchYear: ImageDocsRequestProps = { 
                'year': payloadYearSelected
            };
            dispatch(fetchImagesData(payloadFetchYear));
        }
    }, [props.year, search]);
    
    
    return (
        // Not rendering anything, just dispatching action.
        <></>
    );
};


export default YearRoute;
