import React from 'react';
import { useAppSelector } from '../hooks';
import { HeaderSet } from '../imports/languageSet';
import { getMediaQueries } from '../App';
import './Header.css';



const Header: React.FC = () => {
     /* -----------------------------------------------------
        A main component - container for the title header.
    ------------------------------------------------------ */
    // Selector hooks.
    const languageState = useAppSelector(state => state.language);
    const locale = languageState.en === true ? 'en' : 'jp';


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'Header';


    return (
        <main className={getMediaQueries(classBase, locale)}>
            <div className={getMediaQueries(classBase.concat('_title_block'), locale)}>

                <div className={getMediaQueries(classBase.concat('_title_block_main'), locale)}>
                    <span id="Header_title_block_title">
                        {HeaderSet[locale].main.title}
                    </span>
                    <span id="Header_title_block_sub">
                        {HeaderSet[locale].main.sub}
                    </span>
                </div>

                <div className={getMediaQueries(classBase.concat('_title_block_year'), locale)}>
                    <span id="Header_title_block_year-2010">2010</span>
                    <span id="Header_title_block_year-2020">2020</span>
                    <span id="Header_title_block_year-unit">
                        {HeaderSet[locale].year.unit}
                    </span>
                </div>

            </div>

            <div className="Header_menu_block">
            </div>
        </main>
    );
}


export default Header;
