import { useState, useEffect } from 'react';
import { 
    TypedUseSelectorHook, 
    useDispatch, 
    useSelector } from 'react-redux';
import type { RootState, AppDispatch } from '../app/store';
import { useMediaQuery } from 'react-responsive';



/* ----------------------------------------------------------------------
    Use throughout app instead of plain `useDispatch` and `useSelector`
---------------------------------------------------------------------- */
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;


/* --------------------------------------------
    Get size of window, updates with resizing.
-------------------------------------------- */
export function useWindowSize() {
    let windowState: { [index: string]: number } = { 
        width: 0, 
        height: 0
    };

    const [ windowSize, setWindowSize ] = useState(windowState);

    useEffect(() => {
        const handleResize = () => {
            setWindowSize({
                width: window.innerWidth,
                height: window.innerHeight
            });
        }
        
        window.addEventListener('resize', handleResize);

        // Call handler right away so state gets updated with initial window size
        handleResize();
        
        // Remove event listener on cleanup
        return () => window.removeEventListener('resize', handleResize);
    }, [window.innerHeight]);

    return windowSize;
};


/* ----------------------------------------
    Set media query based on breakpoints.
---------------------------------------- */
export function useMediaQueries(base: string) {
    // Get booleans for each breakpoint.
    const isMobilePortrait: boolean = useMediaQuery({
        minResolution: '1.5dppx',
        orientation: 'portrait',
        maxWidth: '600px'
    });

    const isMobileLandscape: boolean = useMediaQuery({
        minResolution: '1.5dppx',
        orientation: 'landscape',
        maxWidth: '1200px'
    });

    const isPortablePortrait: boolean = useMediaQuery({
        minResolution: '1.5dppx',
        orientation: 'portrait',
        maxWidth: '1200px'
    });

    const isPortableLandscape: boolean = useMediaQuery({
        minResolution: '1.5dppx',
        orientation: 'landscape',
        maxWidth: '1700px'
    });

    const isScreenUnder1080Portrait: boolean = useMediaQuery({
        orientation: 'portrait',
        maxWidth: '800px'
    });

    const isScreenUnder1080Landscape: boolean = useMediaQuery({
        orientation: 'landscape',
        maxWidth: '1600px'
    });

    const isScreen1080Portrait: boolean = useMediaQuery({
        orientation: 'portrait',
        maxWidth: '1200px'
    });

    const isScreen1080Landscape: boolean = useMediaQuery({
        orientation: 'landscape',
        maxWidth: '2100px'
    });

    const isScreen1440Portrait: boolean = useMediaQuery({
        orientation: 'portrait',
        maxWidth: '1700px'
    });

    const isScreen1440Landscape: boolean = useMediaQuery({
        orientation: 'landscape',
        maxWidth: '2800px'
    });

    const isScreen4kPortrait: boolean = useMediaQuery({
        orientation: 'portrait',
        maxWidth: '2500px'
    });

    const isScreen4kLandscape: boolean = useMediaQuery({
        orientation: 'landscape',
        maxWidth: '6000px'
    });

    const mediaQueries: { [index: string]: boolean } = {
        'isMobilePortrait': isMobilePortrait,
        'isMobileLandscape': isMobileLandscape,
        'isPortablePortrait': isPortablePortrait,
        'isPortableLandscape': isPortableLandscape,
        'isScreenUnder1080Portrait': isScreenUnder1080Portrait,
        'isScreenUnder1080Landscape': isScreenUnder1080Landscape,
        'isScreen1080Portrait': isScreen1080Portrait,
        'isScreen1080Landscape': isScreen1080Landscape,
        'isScreen1440Portrait': isScreen1440Portrait,
        'isScreen1440Landscape': isScreen1440Landscape,
        'isScreen4kPortrait': isScreen4kPortrait,
        'isScreen4kLandscape': isScreen4kLandscape
    };

    const classFor: { [index: string]: string } = {
        'isMobilePortrait': "mobile port",
        'isMobileLandscape': "mobile land",
        'isPortablePortrait': "portable port",
        'isPortableLandscape': "portable land",
        'isScreenUnder1080Portrait': "screen-lt-1080 port",
        'isScreenUnder1080Landscape': "screen-lt-1080 land",
        'isScreen1080Portrait': "screen-1080 port",
        'isScreen1080Landscape': "screen-1080 land",
        'isScreen1440Portrait': "screen-1440 port",
        'isScreen1440Landscape': "screen-1440 land",
        'isScreen4kPortrait': "screen-4k port",
        'isScreen4kLandscape': "screen-4k land"
    };

    let mediaQuery: string = "";

    switch(true) {
        case mediaQueries.isMobilePortrait:
            mediaQuery = base.concat(" ", classFor.isMobilePortrait);
            break;

        case mediaQueries.isMobileLandscape:
            mediaQuery = base.concat(" ", classFor.isMobileLandscape);
            break;
        
        case mediaQueries.isPortablePortrait:
            mediaQuery = base.concat(" ", classFor.isPortablePortrait);
            break;

        case mediaQueries.isPortableLandscape:
            mediaQuery = base.concat(" ", classFor.isPortableLandscape);
            break;

        case mediaQueries.isScreenUnder1080Portrait:
            mediaQuery = base.concat(" ", classFor.isScreenUnder1080Portrait);
            break;

        case mediaQueries.isScreenUnder1080Landscape:
            mediaQuery = base.concat(" ", classFor.isScreenUnder1080Landscape);
            break;

        case mediaQueries.isScreen1080Portrait:
            mediaQuery = base.concat(" ", classFor.isScreen1080Portrait);
            break;
        
        case mediaQueries.isScreen1080Landscape:
            mediaQuery = base.concat(" ", classFor.isScreen1080Landscape);
            break;

        case mediaQueries.isScreen1440Portrait:
            mediaQuery = base.concat(" ", classFor.isScreen1440Portrait);
            break;

        case mediaQueries.isScreen1440Landscape:
            mediaQuery = base.concat(" ", classFor.isScreen1440Landscape);
            break;    

        case mediaQueries.isScreen4kPortrait:
            mediaQuery = base.concat(" ", classFor.isScreen4kPortrait);
            break;

        case mediaQueries.isScreen4kLandscape:
            mediaQuery = base.concat(" ", classFor.isScreen4kLandscape);
            break;    
    }

    return mediaQuery;
}