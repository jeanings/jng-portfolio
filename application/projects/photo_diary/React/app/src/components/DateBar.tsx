import React from 'react';
import { useAppSelector } from '../hooks';
import { useMediaQueries } from '../App';
import './DateBar.css';



const DateBar: React.FC = () => {
    /* ------------------------------------------------------------
        A main component - container for the date selector up top.
    ------------------------------------------------------------- */
    

    /* ==================================================================== 

    To-do / pseudo code
        
        1) get list of all available years from MongoDB
            --> yearsList: state

        2) for each year
                for each month
                    get photo count

        3) dropdown menu for selecting the year, include photo count in parentheses

        4)  if current year in yearsList
                default to that year in dropdown menu 
                --> triggers MainCanvas to render this initially

        5) if year selected
                horizontal date bar is rendered with 12 blocks,

                for each bar/month
                    a simple bar (CSS?) height based on photo count

                    clickable, clicks will update and render map pins 
                    --> MainCanvas interaction

                    hovering on each bar pops up photo count

                    Suggestion: when a year is selected, have the animate-render the month-chart like Chartjs

                    
    State interaction

        1) initial render gets state of all available years 
            --> async thunk, yearsList: state
        
        2) selecting a year on the dropdown menu sends action
            --> async thunk, selectedYear: state

        3) selecting a month, or 'show all' selected 
            --> async thunk, selectedMonth: state

        4) in (2) & (3), update list of photos and their metadata --> photosList: state

                metadata suggestions:
                    popupCameraMaker
                    popupCameraModel
                    popupCameraType
                    popupLensMaker
                    popupLensFcLength
                    popupLensMaxAperture
                    popupPhotoFcLength
                    popupPhotoShutterSpd
                    popupPhotoDayNight
                    popupPhotoInOutdoor
                    popupSubject (?)
                    popupTags (?)


    ==================================================================== */


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'DateBar';

    
    return (
        <div className={useMediaQueries(classBase)}>
        </div>
    );
}


export default DateBar;
