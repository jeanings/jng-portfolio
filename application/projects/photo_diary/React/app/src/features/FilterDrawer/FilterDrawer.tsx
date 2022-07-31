import React from 'react';
import { useAppSelector, useMediaQueries } from '../../common/hooks';
import './FilterDrawer.css';



const FilterDrawer: React.FC = () => {
    /* ------------------------------------------------------------
        A main component - container for the filters on the left.
    ------------------------------------------------------------- */

    const formats: Array<string> = [
        '35mm film', '120 film', 'APS-C digital'
    ];

    const cameras: Array<string> = [
        'Konica IIIM', 'Nikon FE', 'Pentax MX'
    ];

    const focalLengths: Array<string> = [
        'Wide', 'Standard', 'Long'
    ];

    const apertures : Array<string> = [
        '1', '1.2', '1.4', '1.7', '1.8',
        '2', '2.8', '4', '5.6', '8', '11',
        '16', '22', '32'
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
            case 'FilterDrawer-format-item':
                console.log('format item click');
                break;
        
            case 'FilterDrawer-camera-item':
                console.log('camera item click');
                break;

            case 'FilterDrawer-focalLength-item':
                console.log('focalLength item click');
                break;

            case 'FilterDrawer-aperture-item':
                console.log('aperture item click');
                break;
        }    
    };

    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = "FilterDrawer";


    return (
        <section className={useMediaQueries(classBase)}>
            
            <div className={useMediaQueries(classBase.concat("__", "parameters-wrapper"))}
                role="group" aria-label="">

                <div className={useMediaQueries(classBase.concat("__", "parameters"))}
                    role="group" aria-label="FilterDrawer-format">
                    <h1 className={useMediaQueries(classBase.concat("__", "header"))}>
                        FORMAT
                    </h1>

                    {/* REFACTOR: Pull data from backend, dynamic list */}
                    <div className={useMediaQueries(classBase.concat("__", "options"))}
                        role="group" aria-label="FilterDrawer-format-options">

                        {formats.map((format, index) => (
                            <button className={"FilterDrawer" + "__format-item"}
                                role="checkbox" aria-label="FilterDrawer-format-item"
                                aria-checked="false"
                                key={'key_format_' + index}
                                onClick={onFilterClick}>
                                    {format}
                            </button>
                        ))}

                    </div>
                </div>

                <div className={useMediaQueries(classBase.concat("__", "parameters"))}
                    role="group" aria-label="FilterDrawer-camera-block">
                    <h1 className={useMediaQueries(classBase.concat("__", "header"))}>
                        CAMERA
                    </h1>

                    {/* REFACTOR: Pull data from backend, dynamic list */}
                    <div className={useMediaQueries(classBase.concat("__", "options"))}
                        role="group" aria-label="FilterDrawer-camera-options">

                        {cameras.map((camera, index) => (
                            <button className={"FilterDrawer" + "__camera-item"}
                                role="checkbox" aria-label="FilterDrawer-camera-item"
                                aria-checked="false"
                                key={'key_camera_' + index}
                                onClick={onFilterClick}>
                                    {camera}
                            </button>
                        ))}

                    </div>
                </div>

                <div className={useMediaQueries(classBase.concat("__", "parameters"))}
                    role="group" aria-label="FilterDrawer-focalLength">
                    <h1 className={useMediaQueries(classBase.concat("__", "header"))}>
                        FOCAL LENGTH
                    </h1>

                    {/* REFACTOR: Pull data from backend, dynamic list */}
                    <div className={useMediaQueries(classBase.concat("__", "options"))}
                        role="group" aria-label="FilterDrawer-focalLength-options">

                        {focalLengths.map((focalLength, index) => (
                            <button className={"FilterDrawer" + "__focalLength-item"}
                                role="checkbox" aria-label="FilterDrawer-focalLength-item"
                                aria-checked="false"
                                key={'key_focalLength_' + index}
                                onClick={onFilterClick}>
                                    {focalLength}
                            </button>
                        ))}

                    </div>
                </div>

                <div className={useMediaQueries(classBase.concat("__", "parameters"))}
                    role="group" aria-label="FilterDrawer-aperture">
                    <h1 className={useMediaQueries(classBase.concat("__", "header"))}>
                        APERTURE
                    </h1>

                    {/* REFACTOR: Pull data from backend, dynamic list */}
                    <div className={useMediaQueries(classBase.concat("__", "options"))}
                        role="group" aria-label="FilterDrawer-aperture-options">

                        {apertures.map((aperture, index) => (
                            <button className={"FilterDrawer" + "__aperture-item"}
                                role="checkbox" aria-label="FilterDrawer-aperture-item"
                                aria-checked="false"
                                key={'key_aperture_' + index}
                                onClick={onFilterClick}>
                                    {aperture}
                            </button>
                        ))}

                    </div>
                </div>

                <div className={useMediaQueries(classBase.concat("__", "parameters"))}>
                    <h1 className={useMediaQueries(classBase.concat("__", "header"))}>
                        TAGS
                    </h1>

                    <div className={useMediaQueries(classBase.concat("__", "options"))}
                        role="group" aria-label="FilterDrawer-tags-options">
                        
                    </div>
                </div>

            </div>
        </section>
    );
}


export default FilterDrawer;
