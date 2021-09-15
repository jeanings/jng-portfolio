import React from 'react';
import './Header.css';

const Dashboard: React.FC = () => {
    return (
        <main className="Header">
            <div className="Header_title_block">
                <div className="Header_title_block_main">
                    <span id="Header_title_block_title">不動産取引</span>
                    <span id="Header_title_block_sub">ダッシュボード</span>
                </div>
                <div className="Header_title_block_year">
                    <span id="Header_title_block_year-2010">2010</span>
                    <span id="Header_title_block_year-2020">2020</span>
                    <span id="Header_title_block_year-unit">年</span>
                </div>
            </div>
            <div className="Header_menu_block">
            </div>
        </main>
    );
}

export default Dashboard;
