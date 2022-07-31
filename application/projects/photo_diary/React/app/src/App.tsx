import React from 'react';
import { useAppDispatch, useAppSelector, useMediaQueries } from './hooks';
import { useMediaQuery } from 'react-responsive';
import TimelineBar from './containers/TimelineBar/TimelineBar';
import FilterDrawer from './containers/FilterDrawer/FilterDrawer';
import MainCanvas from './containers/MainCanvas/MainCanvas';
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


export default App;
