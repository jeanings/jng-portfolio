import React from 'react';
import { useAppDispatch, useAppSelector } from './hooks';
import { useMediaQuery } from 'react-responsive';
import TimelineBar from './components/TimelineBar/TimelineBar';
import FilterDrawer from './components/FilterDrawer/FilterDrawer';
import MainCanvas from './components/MainCanvas/MainCanvas';
import './App.css';



const App: React.FC = () => {




    // CSS Classes
    const classBase: string = 'App';

    return (
        <div className={useMediaQueries(classBase)}>
            <TimelineBar />
            <FilterDrawer />
            <MainCanvas />
        </div>
    )
}


export function useMediaQueries(base: string) {
    /* ----------------------------------------
        Set media query based on breakpoints.
    -----------------------------------------*/
    const isPortrait = useMediaQuery({
        orientation: 'portrait',
        // minWidth: '700px',
        maxWidth: '1200px'
    });

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
        'isPortableHdLandscape': isPortableHdLandscape,
        'isScreen1080': isScreen1080,
        'isScreen1440': isScreen1440,
        'isScreen4k': isScreen4k
    };

    const classFor = {
        'isPortrait': 'portrait',
        'isPortableHdLandscape': 'portable_hd_land',
        'isScreen1080': '',
        'isScreen1440': 'screen_1440',
        'isScreen4k': 'screen_4k'
    };

    var mediaQuery: string = '';

    if (mediaQueries.isPortrait) {
        mediaQuery = base.concat(' ', classFor.isPortrait);
    } else if (mediaQueries.isPortableHdLandscape) {
        mediaQuery = base.concat(' ', classFor.isPortableHdLandscape);
    } else if (mediaQueries.isScreen1080) {
        mediaQuery = base.concat(' ', classFor.isScreen1080);
    } else if (mediaQueries.isScreen1440) {
        mediaQuery = base.concat(' ', classFor.isScreen1440);
    } else if (mediaQueries.isScreen4k) {
        mediaQuery = base.concat(' ', classFor.isScreen4k);
    }

    return mediaQuery;
}


export default App;
