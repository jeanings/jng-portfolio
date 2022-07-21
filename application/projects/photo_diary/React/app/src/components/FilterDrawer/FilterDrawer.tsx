import React from 'react';
import { useAppSelector } from '../../hooks';
import { useMediaQueries } from '../../App';
import './FilterDrawer.css';



const FilterDrawer: React.FC = () => {
    /* ------------------------------------------------------------
        A main component - container for the filters on the left.
    ------------------------------------------------------------- */

    const cameras: Array<string> = [
        'Konica IIIM', 'Nikon FE', 'Pentax MX'
    ];

    const focalLengths: Array<string> = [
        'Wide', 'Standard', 'Long'
    ];

    const formats: Array<string> = [
        '35mm film', '120 film', 'APS-C digital'
    ];

    /* ==================================================================== 
        
    To-do / pseudo code

        1) for all items in photosList
                highlight all options available from set of photos
                --> dim/grey-out options that unavailable for filtering 
        
        2) on click of filter buttons
                hide/show all photos containing the parameter
                --> save filtered items in separate state to be reinstated later (?)
    
        3) filters based on metadata parameters
            --> see DateBar pseudo


    State interaction
        
        1) subscribe to list of photos according to DateBar selection --> photosList: state

        2) according to metadata of photos, on/off states for filter buttons
            --> filterList: state
                --> focalLength: state on/off etc

        3) saved "removed" photos into list state for retrieval on removing filters

    ==================================================================== */

    const onFilterClick = (event: any) => {
    
        // console.log(event.target.ariaLabel);

        switch(event.target.ariaLabel) {
            case 'camera_item':
                console.log('camera item click');
                break;

            case 'focalLength_item':
                console.log('focalLength item click');
                break;

            case 'format_item':
                console.log('format item click');
                break;
        }
    };

    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'FilterDrawer';


    return (
        <div className={useMediaQueries(classBase)}>
            
            <div className="FilterDrawer_parameters">
                <div className="FilterDrawer_parameters_camera">
                    <span className="FilterDrawer_parameters_title">CAMERA</span>
                    {/* Pull data from backend, dynamic list */}
                    {cameras.map((camera, index) => (
                        <button className="FilterDrawer_parameters_camera_item"
                            role="menuitemradio" aria-label="camera_item"
                            aria-checked="false"
                            key={'key_camera_' + index}
                            onClick={onFilterClick}>
                                {camera}
                        </button>
                    ))}

                </div>

                <div className="FilterDrawer_parameters_focal">
                    <span className="FilterDrawer_parameters_title">FOCAL LENGTH</span>
                    {/* Pull data from backend, dynamic list */}
                    {focalLengths.map((focalLength, index) => (
                        <button className="FilterDrawer_parameters_focalLength_item"
                            role="menuitemradio" aria-label="focalLength_item"
                            aria-checked="false"
                            key={'key_focalLength_' + index}
                            onClick={onFilterClick}>
                                {focalLength}
                        </button>
                    ))}
                </div>

                <div className="FilterDrawer_parameters_format">
                    <span className="FilterDrawer_parameters_title">FORMAT</span>
                    {/* Pull data from backend, dynamic list */}
                    {formats.map((format, index) => (
                        <button className="FilterDrawer_parameters_format_item"
                            role="menuitemradio" aria-label="format_item"
                            aria-checked="false"
                            key={'key_format_' + index}
                            onClick={onFilterClick}>
                                {format}
                        </button>
                    ))}
                </div>
            </div>

            <div className="FilterDrawer_tags">
                <span className="FilterDrawer_tags_title">TAGS</span>
            </div>

        </div>
    );
}


export default FilterDrawer;
