import React, { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import Navbar from './components/Navbar';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import { mongoDbFetchRegions, MongoDbMenuFetchProps } from './slices/menuApiSlice';
import { handleLanguage, LocaleProps } from './slices/languageSlice';
import { PayloadAction } from '@reduxjs/toolkit';
import { useMediaQuery } from 'react-responsive';
import './App.css';

export const DEV_MODE = process.env.REACT_APP_DEV_MODE;
export const DEV_LANG: LocaleProps["lang"] = process.env.REACT_APP_DEV_MODE_LANG as 'en' | 'jp';



const App: React.FC = () => {
    /* --------------------------------
        Starting point of the main app.
    -------------------------------- */
    const dispatch = useAppDispatch();
    const languageState = useAppSelector(state => state.language);
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


    /* -----------------------------------------------------
                        CSS classes
    ------------------------------------------------------*/
    const classBase: string = 'App';
    const locale: string = languageState.en === true ? 'en' : '';


    return (
        <div className={getMediaQueries(classBase, locale)}>
            <Header />
            <Sidebar />
            <Dashboard />
        </div>
    );
}


export function getMediaQueries(base: string, lang: string) {
    /* ----------------------------------------
        Set media query based on breakpoints.
    -----------------------------------------*/
    lang = lang === 'en' ? 'en' : '';
    const isPortrait = useMediaQuery({
        orientation: 'portrait',
        // minWidth: '700px',
        maxWidth: '1200px'
    });

    // const isPortableHdPortrait = useMediaQuery({
    //     minResolution: '1.5dppx',
    //     orientation: 'portrait',
    //     maxWidth: '1200px'
    // });

    const isPortableHdLandscape = useMediaQuery({
        minResolution: '1.5dppx',
        orientation: 'landscape',
        maxWidth: '1700px'
    });

    const isScreen1080 = useMediaQuery({
        orientation: 'landscape',
        maxWidth: '2000px'
    });

    const isScreen1440 = useMediaQuery({
        orientation: 'landscape',
        maxWidth: '2800px'
    });

    const isScreen4k = useMediaQuery({
        orientation: 'landscape',
        maxWidth: '5000px'
    });

    const mediaQueries = {
        'isPortrait': isPortrait,
        // 'isPortableHdPortrait': isPortableHdPortrait,
        'isPortableHdLandscape': isPortableHdLandscape,
        'isScreen1080': isScreen1080,
        'isScreen1440': isScreen1440,
        'isScreen4k': isScreen4k
    };

    const classFor = {
        'isPortrait': 'portrait',
        // 'isPortableHdPortrait': 'portable_hd_port',
        'isPortableHdLandscape': 'portable_hd_land',
        'isScreen1080': '',
        'isScreen1440': 'screen_1440',
        'isScreen4k': 'screen_4k'
    };

    var mediaQuery: string = '';

    if (mediaQueries.isPortrait) {
        // console.log('isPortrait', mediaQueries);
        mediaQuery = base.concat(' ', lang, ' ', classFor.isPortrait);
    // } else if (mediaQueries.isPortableHdPortrait) {
        // console.log('isPortHd.p', mediaQueries);
        // mediaQuery = base.concat(' ', lang, ' ', classFor.isPortableHdPortrait);
    } else if (mediaQueries.isPortableHdLandscape) {
        // console.log('isPortHd.L', mediaQueries);
        mediaQuery = base.concat(' ', lang, ' ', classFor.isPortableHdLandscape);
    } else if (mediaQueries.isScreen1080) {
        // console.log('is1080', mediaQueries);
        mediaQuery = base.concat(' ', lang, ' ', classFor.isScreen1080);
    } else if (mediaQueries.isScreen1440) {
        // console.log('is1440', mediaQueries);
        mediaQuery = base.concat(' ', lang, ' ', classFor.isScreen1440);
    } else if (mediaQueries.isScreen4k) {
        // console.log('is4k', mediaQueries);
        mediaQuery = base.concat(' ', lang, ' ', classFor.isScreen4k);
    }

    // console.log(mediaQuery);
    return mediaQuery;
}


export default App;
