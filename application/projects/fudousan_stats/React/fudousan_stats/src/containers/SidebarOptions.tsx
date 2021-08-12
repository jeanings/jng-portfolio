import React from "react";
import { useAppDispatch, useAppSelector } from '../hooks';
import { handleSliders } from '../slices/slidersSlice';
import "./SidebarOptions.css";



const SidebarOptions: React.FC = () => {
    const dispatch = useAppDispatch();
    const slidersState = useAppSelector(state => state.sliders);

   
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
        '11': '10_50', '10': '50_75', '9': '75_100', '8': '100_150', 
        '7': '150_200', '6': '200_250', '5': '250_300', '4': '300_350', 
        '3': '350_400', '2': '400_500', '1': '500_600', '0': '600_'
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
        'con':　'コンクリートブロック造'
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
                        {slidersState.options.floorArea === '600_'
                            ? slidersState.options.floorArea.replace('_', '') + "m² 以上"
                            : slidersState.options.floorArea.replace('_', '～') + "m²"}
                    </p>
                </div>
                <input type="range" 
                    min="0" max="11" step="1"
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