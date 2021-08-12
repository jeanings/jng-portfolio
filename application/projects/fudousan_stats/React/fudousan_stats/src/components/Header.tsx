import React from 'react';
import './Header.css';

const Dashboard: React.FC = () => {
    return (
        <main className='Header'>
            <h1 className='Header_title'>不動産取引　
                <span id="Header_title_year">2010～2020年</span>
            </h1>
            <h2 className='Header_title-sub'>ダッシュボード</h2>
        </main>
    );
}

export default Dashboard;
