import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../common/hooks';
import { 
    fetchImagesData,
    handleYearSelect,
    handleResponseStatus,
    ImageDocsRequestProps } from './timelineSlice';
import { YearButtonProps } from './YearButton';
import { checkFiltersInStateExist } from '../FilterDrawer/FilterDrawer';


/* =================================================================================
    Routes for each year available in timeline, handles fetch dispatches for year.
    Originates from clicks on year buttons on drop-down menu on TimelineBar.
================================================================================= */
const YearRoute: React.FunctionComponent<YearButtonProps> = (props: YearButtonProps) => {
    const dispatch = useAppDispatch();
    const timeline = useAppSelector(state => state.timeline.selected);
    const responseStatus = useAppSelector(state => state.timeline.responseStatus)
    const queried = useAppSelector(state => state.timeline.query);
    const filtered = useAppSelector(state => state.filter)

    /* ----------------------------
        Year dataset fetch logic.
    ---------------------------- */
    useEffect(() => {
        const payloadYearSelected: number = parseInt(props.year);
        // Determine initial render filter-related states.
        const isFiltersInState: boolean = checkFiltersInStateExist(filtered);
        const isFiltersInQuery: boolean = queried
            ? Object.keys(queried).length > 1 ? true : false
            : false;
        
        /* -----------------------------------------------------------------------------
            Guard clauses: init renders handled by TimelineBar, skip fetch dispatches.
        ----------------------------------------------------------------------------- */
        // "Twilight" state between uninitialized and (fetch successful) initialized.
        if (responseStatus === 'successful') {
            return;
        }

        // Initial renders with filter queries (direct access from URL).
        if (responseStatus === 'initialized'
            && isFiltersInQuery
            && isFiltersInState === false) {
            // Set response status: TimelineBar follows with setting to 'idle'.
            const payloadRespStatus: string = 'successful';
            dispatch(handleResponseStatus(payloadRespStatus));
            return;
        }

        // Other initial renders (handled by TimelineBar useEffect).
        if (responseStatus === 'initialized') {
            // Set response status: TimelineBar follows with setting to 'idle'.
            const payloadRespStatus: string = 'successful';
            dispatch(handleResponseStatus(payloadRespStatus));
            return;
        }

        /* ------------------------------------------------------------------------
            Month effects are essentially filters, handled by FilterDrawer.
        ------------------------------------------------------------------------ */
        // Do not handle fetch for 'month' changes.
        if (timeline.month !== 'all') {
            if (timeline.year !== parseInt(props.year)) {
                // Update selected year: FilterDrawe handles filter-related fetches.
                dispatch(handleYearSelect(payloadYearSelected));
            }
        }
        
        
        /* -----------------------------------------
            Fetch dispatches handled by YearRoute.
        ----------------------------------------- */
        // Idling state after being initialized.
        if (responseStatus === 'idle') {
            // Different year clicked, no filters, on 'all' timeline
            // --> dispatch fetch.
            if (parseInt(props.year) !== timeline.year
                && isFiltersInState === false
                && timeline.month === 'all') {
                // Update selected year.
                dispatch(handleYearSelect(payloadYearSelected));

                // Dispatch fetch request for newly selected year.
                let payloadFetchYear: ImageDocsRequestProps = { 'year': payloadYearSelected };
                dispatch(fetchImagesData(payloadFetchYear));
            }
            // Different year clicked, with filters
            // --> fetch handled by FilterDrawer.
            else if (parseInt(props.year) !== timeline.year
                && isFiltersInState) {
                // Update selected year.
                dispatch(handleYearSelect(payloadYearSelected));
            }
        }

        // Accessed directly via YearRoute URL.
        if (timeline.year === null) {
            // Update selected year.
            dispatch(handleYearSelect(payloadYearSelected));

            // Dispatch fetch request for newly selected year.
            let payloadFetchYear: ImageDocsRequestProps = { 'year': payloadYearSelected };
            dispatch(fetchImagesData(payloadFetchYear));
        }
    }, [props.year, responseStatus, filtered, timeline.month]);
    
    
    return (
        // Not rendering anything, just dispatching action.
        <></>
    );
};


export default YearRoute;
