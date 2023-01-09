import React from 'react';
import { 
    useAppDispatch, 
    useAppSelector, 
    useMediaQueries } from '../../common/hooks';
import { 
    handleYearSelect, 
    fetchImagesData,
    ImageDocsRequestProps } from './timelineSlice';
import './YearButton.css';


/* =============================================================================
    Button constructor for dropdown menu of year items.  Clicks will dispatch 
    fetch request to async thunk, getting new image data for the clicked year. 
============================================================================= */
const YearButton: React.FunctionComponent<YearButtonProps> = (props: YearButtonProps) => {
    const dispatch = useAppDispatch();
    const selectedYear = useAppSelector(state => state.timeline.selected.year);

    /* -------------------------------------------------------------------------
        Clicks on year selector items will update << timeline.selected.year >>
        and fetch data for clicked year. 
    ------------------------------------------------------------------------- */
    const onYearSelect = (event: React.SyntheticEvent) => {
        const payloadYearSelected: number = parseInt(props.year);

        // Update selected year.
        dispatch(handleYearSelect(payloadYearSelected));

        // Dispatch fetch request for newly selected year.
        let payloadFetchYear: ImageDocsRequestProps = { 
            'year': payloadYearSelected
        };
        dispatch(fetchImagesData(payloadFetchYear));
    };
    

    return (
        <li 
            className={ useMediaQueries(props.baseClassName.concat("__", props.className)) 
                +   // Add "active" styling if selected.
                (selectedYear === parseInt(props.year)
                    ? " ".concat("active")
                    : "" ) }
            id={ props.className.concat("-", props.year) }
            role="menuitemradio" 
            aria-label={ "year selector option" }
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
