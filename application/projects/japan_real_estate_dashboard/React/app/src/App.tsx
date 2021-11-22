import React, { useEffect } from 'react';
import { useAppDispatch } from './hooks';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { mongoDbFetchRegions, MongoDbMenuFetchProps } from './slices/menuApiSlice';
import { handleLanguage, LocaleProps } from './slices/languageSlice';
import { PayloadAction } from '@reduxjs/toolkit';
import './App.css';

export const DEV_MODE = process.env.REACT_APP_DEV_MODE;
export const DEV_LANG: LocaleProps["lang"] = process.env.REACT_APP_DEV_MODE_LANG as 'en' | 'jp';



const App: React.FC = () => {
    /* --------------------------------
        Starting point of the main app.
    -------------------------------- */
    const dispatch = useAppDispatch();
    const hrefBase = window.location.href;
    const hrefEN = process.env.REACT_APP_HREF_EN;
    const hrefJP = process.env.REACT_APP_HREF_JP;
    const localhost = process.env.REACT_APP_LOCALHOST;


    useEffect(() => {
        /* ---------------------
            Set app language.
        --------------------- */
        // Get locale/language.
        let locale: MongoDbMenuFetchProps["lang"] = hrefBase === hrefEN
            ? 'en'
            : hrefBase === hrefJP
                ? 'jp'
                : hrefBase === localhost
                    ? DEV_LANG  // set for dev
                    : 'jp'  // placeholder, ignore

        const languagePayload: object = {
            [locale]: true,
        };
        dispatch(handleLanguage(languagePayload));


         /* ---------------------------------
            Initial render menu item request.
        --------------------------------- */
        const initMenuParam: MongoDbMenuFetchProps = {
            'lang': locale, 
            'country': 'j'
        };
        dispatch(mongoDbFetchRegions(initMenuParam));
    }, []);

  
    return (
        <div className='App'>
            <Header />
            <Sidebar />
            <Dashboard />
        </div>
    );
}


export default App;
