import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { getFilterStateStatus } from '../FilterDrawer/FilterDrawer';
import { clearFilters } from '../FilterDrawer/filterDrawerSlice';
import { handleYearSelect } from './timelineSlice';
import './YearButton.css';


/* =============================================================
    Button constructor for dropdown menu of year items.
    Clicks will dispatch fetch request to async thunk,
    getting new image data for the clicked year. 
============================================================= */
const YearButton: React.FunctionComponent<YearButtonProps> = (props: YearButtonProps) => {
    const dispatch = useAppDispatch();
    const selectedYear = useAppSelector(state => state.timeline.selected.year);
    const filterState = useAppSelector(state => state.filter);


    /* -------------------------------------------------------
        Clicks on year selector items will dispatch action to
        update << timeline.selected.year >>.
        Fetches handled by useEffect in TimelineBar.
    ------------------------------------------------------- */
    const onYearSelect = (event: React.SyntheticEvent) => {
        // Dispatch selected year to reducer.
        const payloadYearSelected: number = parseInt(props.year);
        const filterStatus = getFilterStateStatus(filterState);

        if (filterStatus === 'on') {
            // << year >> dispatch with filters 'on' won't trigger fetch.
            dispatch(handleYearSelect(payloadYearSelected));
            // clearFilters has fetch attached via useEffect in FilterDrawer.
            dispatch(clearFilters("RESET TO INIT STATE"));
        }
        else {
            // Dispatch year update, fetch handled in TimelineBar.
            dispatch(handleYearSelect(payloadYearSelected));
        }
    };
    

    return (
        <li 
            className={ useMediaQueries(props.baseClassName.concat("__", props.className)) 
                +   // Add "active" styling if selected.
                (selectedYear === parseInt(props.year)
                    ? "active"
                    : "" ) }
            id={ props.className.concat("-", props.year) }
            role="menuitemradio" 
            aria-label={ props.className }
            aria-checked={
                selectedYear === parseInt(props.year)
                    ? "true"
                    : "false" }
            onClick={ onYearSelect }>

                {/* Year text. */
                    props.year }
        </li>
    );
}


/* =====================================================================
    Types.
===================================================================== */
export interface YearButtonProps {
    year: string,
    baseClassName: string,
    className: string,
};

export default YearButton;
