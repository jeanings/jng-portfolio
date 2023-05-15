import React from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
import { Link } from 'react-router-dom';
import { routePrefixForYears } from './TimelineBar';
import './YearButton.css';


/* =============================================================================
    Button constructor for dropdown menu of year items.  Clicks will navigate 
    to corresponding year route, fetching request to async thunk and
    getting new image data for the clicked year. 
============================================================================= */
const YearButton: React.FunctionComponent<YearButtonProps> = (props: YearButtonProps) => {
    const selectedYear = useAppSelector(state => state.timeline.selected.year);
    const routePrefix = routePrefixForYears;
    
    return (
        <li 
            className={ useMediaQueries(`${props.baseClassName}__${props.className}`) 
                +   // Add "active" styling if selected.
                (selectedYear === parseInt(props.year)
                    ? " " + "active"
                    : "" ) }
            id={ `${props.className}-${props.year}` }>
            
                <Link 
                    to={ `${routePrefix}/${props.year}` }
                    className={ useMediaQueries(`${props.baseClassName}__${props.className}__link`) 
                        +   // Add "active" styling if selected.
                        (selectedYear === parseInt(props.year)
                            ? " " + "active"
                            : "" ) }
                    role="menuitemradio" 
                    aria-label={ "year selector option" }
                    aria-checked={ selectedYear === parseInt(props.year) 
                        ? "true" 
                        : "false" }>

                    { props.year }

                </Link>
        </li>
    );
};


/* =====================================================================
    Types.
===================================================================== */
export interface YearButtonProps {
    year: string,
    baseClassName: string,
    className: string,
};

export default YearButton;
