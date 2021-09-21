import React, { useEffect, useRef } from "react";
import { useAppDispatch, useAppSelector } from '../hooks';
import { handleSliders } from '../slices/slidersSlice';
import { handleRawInput, mongoDbFetchData } from '../slices/dataSlice';
import { clearAllSelections } from '../slices/selectionSlice';
import "./SidebarOptions.css";



const SidebarOptions: React.FC = () => {
    const dispatch = useAppDispatch();
    const slidersState = useAppSelector(state => state.sliders);
    const dataState = useAppSelector(state => state.data);
    const refSubmitTimer = useRef<any>({timer: 0});


    useEffect(() => {
        /* ------------------------
            SetTimeout instance.
        ------------------------ */
        return () => {
            clearTimeout(refSubmitTimer.current.timer)
        }
    }, []);

    // Helper: for onSaving readability.
    function keyExists(inputKey: string, inputObj: object) {
        if (inputKey in inputObj) {
            return true;
        } else
            return false;
    }

    // Helper: translate (replace) backend-use English to user-facing Japanese.
    function translateReplace(inputString: string, patternDict: SliderProps) {
        if (inputString in patternDict) {
            return patternDict[inputString];
        } 
    }
    
    const buildingType: SliderProps = {
        '1': 'house', '0': 'condo'
    }
    const stationDist: SliderProps = {
        '2': '0_15', '1': '15_30', '0': '30_'
    }
    const material: SliderProps = {
        '3': 'wood', '2': 'stFrame', '1': 'reCon', '0': 'con'
    }
    const age: SliderProps = {
        '5': '1920_1960', '4': '1960_1980', '3': '1980_1990', '2': '1990_2000', 
        '1': '2000_2010', '0': '2010_2020'
    }
    const floorArea: SliderProps = {
        '37': '10_20', '36': '20_30', '35': '30_40', '34': '40_50', '33': '50_60', 
        '32': '60_70',  '31': '70_80', '30': '80_90', '29': '90_100', '28': '100_110',
        '27': '110_120', '26': '120_130', '25': '130_140', '24': '140_150',
        '23': '150_160', '22': '160_170', '21': '170_180', '20': '180_190', 
        '19': '190_200', '18': '200_220', '17': '220_240', '16': '240_260', 
        '15': '260_280', '14': '280_300', '13': '300_325', '12': '325_350',
        '11': '350_375', '10': '375_400', '9': '400_425', '8': '425_450', 
        '7': '450_475', '6': '475_500', '5': '500_550', '4': '550_600', 
        '3': '600_650', '2': '650_700', '1': '700_750', '0': '750_'
    }

    // Replace pattern dicts.
    const buildingMatch = {
        'house': '一戸建て',
        'condo': 'マンション等'
    }
    const materialMatch = {
        'wood': '木造',
        'stFrame': '鉄骨造',
        'reCon': '鉄筋コンクリート造',
        'con':　'ブロック造'
    }
    
    
    // Handle changes on sliders.
    const onSliderChange = (event: any) => {
        const name: string = event.target.name;
        const value: string = event.target.value;
        let slider;

        // Create payload.
        if (name === 'buildingType') {
            slider = {
                [name]: buildingType[value]
            }
        } else if (name === 'stationDist') {
            slider = {
                [name]: stationDist[value]
            }
        } else if (name === 'material') {
            slider = {
                [name]: material[value]
            }
        } else if (name === 'age') {
            slider = {
                [name]: age[value]
            }
        } else if (name === 'floorArea') {
            slider = {
                [name]: floorArea[value]
            }
        }
        dispatch(handleSliders(slider));
    }


    // Handle click on save button.
    const onSaving = (event: any) => {
        event.preventDefault();
        clearTimeout(refSubmitTimer.current.timer);

        // Create MongoDB API payload.
        const collection: string = slidersState.options.age;
        const options: string = slidersState.options.material.concat(
            '-', slidersState.options.floorArea, '.',
            'stationDistanceMin', '.', slidersState.options.stationDist, '.',
            'type', '.', slidersState.options.buildingType
        );

        // Save raw input.
        const rawInputPayload = {
            collection: collection,
            options: options,
            rawInput: slidersState.options
        }
        console.log('rawInput dispatch');
        dispatch(handleRawInput(rawInputPayload));

        // Clear selections state.
        dispatch(clearAllSelections(true));        

        // Send to MongoDB thunk to get housing data, if not already retrieved.
        if (keyExists(collection, dataState.collections) == true) {
            if (keyExists(options, dataState.collections[collection]) == false) {
                dispatch(mongoDbFetchData({"collection": collection, "options": options}));
            } else {
                console.log("Reusing existing data -->", collection, options);
            }
        } else {
            dispatch(mongoDbFetchData({"collection": collection, "options": options}));
        }

        // Change view to regions menu.
        refSubmitTimer.current.timer = setTimeout(() => {
            const optionsTab = document.getElementById("Sidebar_tab_options");
            const regionsTab = document.getElementById("Sidebar_tab_regions");
            const optionsMenu = document.getElementsByClassName("Sidebar_options")[0];
            const regionsMenu = document.getElementsByClassName("Sidebar_regions")[0];

            optionsTab?.classList.add("hide");
            optionsMenu.classList.add("hide");
            regionsTab?.classList.add("show");
            regionsMenu.classList.add("show");

        }, 1250);
    }



    
    



    return (
        <form className="Sidebar_options">

            <div className="Sidebar_options_slider">
                <div className="Sidebar_options_slider_text">
                    <label className="Sidebar_options_slider_text_label" htmlFor="buildingType">
                        住宅種類
                    </label>
                    <p className="Sidebar_options_slider_text_selected">
                        {translateReplace(slidersState.options.buildingType, buildingMatch)}
                    </p>
                </div>
                <input type="range" 
                    min="0" max="1" step="1"
                    name="buildingType" onChange={onSliderChange} />
                <div className="Sidebar_options_slider_ruler">
                    <p>˥</p>
                    <p>˥</p>
                </div>
            </div>

            <div className="Sidebar_options_slider">
                <div className="Sidebar_options_slider_text">
                    <label className="Sidebar_options_slider_text_label" htmlFor="stationDist">
                        駅徒歩分
                    </label>
                    <p className="Sidebar_options_slider_text_selected">
                        {slidersState.options.stationDist === '0_15' 
                            ? (slidersState.options.stationDist.replace('0_', '') + "分以下") 
                            : slidersState.options.stationDist === '30_' 
                                ? (slidersState.options.stationDist.replace('30_', '30') + "分以上")
                                : slidersState.options.stationDist.replace('_', '～') + "分"}
                    </p>
                </div>
                <input type="range"
                    min="0" max="2" step="1"
                    name="stationDist" onChange={onSliderChange} />
                <div className="Sidebar_options_slider_ruler">
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                </div>
            </div>

            <div className="Sidebar_options_slider">
                <div className="Sidebar_options_slider_text">
                    <label className="Sidebar_options_slider_text_label" htmlFor="material">
                        建物構造
                    </label>
                    <p className="Sidebar_options_slider_text_selected">
                        {translateReplace(slidersState.options.material, materialMatch)}
                    </p>
                </div>
                <input type="range" 
                    min="0" max="3" step="1"
                    name="material" onChange={onSliderChange} />
                <div className="Sidebar_options_slider_ruler">
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                </div>
            </div>

            <div className="Sidebar_options_slider">
                <div className="Sidebar_options_slider_text">
                    <label className="Sidebar_options_slider_text_label" htmlFor="age">
                        建築年
                    </label>
                    <p className="Sidebar_options_slider_text_selected">
                        {slidersState.options.age === '1920_1960' 
                            ? (slidersState.options.age.replace('1920_', '')　+ "年前")
                            : (slidersState.options.age.replace('_', '～') + "年")}
                    </p>
                </div>
                <input type="range"
                    min="0" max="5" step="1"
                    name="age" onChange={onSliderChange} />
                <div className="Sidebar_options_slider_ruler">
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                </div>
            </div>

            <div className="Sidebar_options_slider">
                <div className="Sidebar_options_slider_text">
                    <label className="Sidebar_options_slider_text_label" htmlFor="floorArea">
                        面積
                    </label>
                    <p className="Sidebar_options_slider_text_selected">
                        {slidersState.options.floorArea === '750_'
                            ? slidersState.options.floorArea.replace('_', '') + "m² 以上"
                            : slidersState.options.floorArea.replace('_', '～') + "m²"}
                    </p>
                </div>
                <input type="range" 
                    min="0" max="37" step="1"
                    name="floorArea" onChange={onSliderChange} />
                <div className="Sidebar_options_slider_ruler">
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                    <p>˥</p>
                </div>
            </div>

            <div className="Sidebar_options_save">
                <label htmlFor="slidersSave"></label>
                <button id="Sidebar_options_save_button" name="slidersSave" onClick={onSaving}>
                    条件を保存
                </button>
            </div>
        </form>
    );
}


// Types setting.
export interface SliderProps {
    [index: string]: string 
}

export default SidebarOptions;