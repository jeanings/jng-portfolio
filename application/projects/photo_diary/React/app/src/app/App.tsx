import React from 'react';
import { useAppDispatch, useAppSelector, useMediaQueries } from '../common/hooks';
import { useMediaQuery } from 'react-responsive';
import TimelineBar from '../features/TimelineBar/TimelineBar';
import FilterDrawer from '../features/FilterDrawer/FilterDrawer';
import MapCanvas from '../features/MapCanvas/MapCanvas';
import './App.css';



const App: React.FC = () => {
    // CSS Classes
    const classBase: string = 'App';

    return (
        <div className={useMediaQueries(classBase)}>
            <TimelineBar />
            <FilterDrawer />
            <MapCanvas />
        </div>
    )
}


export default App;
