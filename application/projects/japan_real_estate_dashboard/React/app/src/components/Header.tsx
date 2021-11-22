import React from 'react';
import { useAppSelector } from '../hooks';
import { HeaderSet } from '../imports/languageSet';
import './Header.css';



const Dashboard: React.FC = () => {
     /* -----------------------------------------------------
        A main component - container for the title header.
    ------------------------------------------------------ */
    // Selector hooks.
    const languageState = useAppSelector(state => state.language);
    const locale = languageState.en === true ? 'en' : 'jp';

    return (
        <main className="Header">
            <div className="Header_title_block">

                <div className="Header_title_block_main">
                    <span id="Header_title_block_title">
                        {HeaderSet[locale].main.title}
                    </span>
                    <span id="Header_title_block_sub">
                        {HeaderSet[locale].main.sub}
                    </span>
                </div>

                <div className="Header_title_block_year">
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


export default Dashboard;
