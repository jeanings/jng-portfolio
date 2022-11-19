import React from 'react';
import * as reactRedux from 'react-redux';
import { Provider } from 'react-redux';
import { setupStore, RootState } from '../../app/store';
import { 
    cleanup, 
    render, 
    screen, 
    waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import '@testing-library/jest-dom';
import mockDefaultData from '../../utils/mockDefaultData.json';
import {
    handleYearSelect,
    handleMonthSelect,
    GeojsonFeatureCollectionProps,
    BboxType } from '../TimelineBar/timelineSlice';
import Toolbar from '../Toolbar/Toolbar';
import { handleToolbarButtons, ToolbarProps } from '../Toolbar/toolbarSlice';
import SideFilmStrip from './SideFilmStrip';
import { handleEnlarger } from './sideFilmStripSlice';
// @ts-ignore
import mapboxgl from 'mapbox-gl'; 
import 'mapbox-gl/dist/mapbox-gl.css';


const MapboxglSpiderfier: any = require('mapboxgl-spiderifier');

var mockAxios = new MockAdapter(axios);
var user = userEvent.setup();
// // Mock scrollTo.
// global.scrollTo = jest.fn();

beforeEach(() => {
    mockAxios = new MockAdapter(axios); 
});

afterEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
    cleanup;
});

/* -------------------------------------------------
    Mocked state.
------------------------------------------------- */
const preloadedState: RootState = {
    timeline: {
        request: 'complete',
        query: { year: 2022 },
        yearInit: 2022,
        selected: { year: 2022, month: 'all' },
        years: mockDefaultData.years,
        counter: {
            'all': 0,
            'jan': 0, 'feb': 0, 'mar': 0,
            'apr': 0, 'may': 0, 'jun': 0,
            'jul': 0, 'aug': 0, 'sep': 0,
            'oct': 0, 'nov': 0, 'dec': 0,
            'previous': {
                'all': 0,
                'jan': 0, 'feb': 0, 'mar': 0,
                'apr': 0, 'may': 0, 'jun': 0,
                'jul': 0, 'aug': 0, 'sep': 0,
                'oct': 0, 'nov': 0, 'dec': 0,
            }
        },
        imageDocs: mockDefaultData.docs,
        filterSelectables: mockDefaultData.filterSelectables[0],
        filteredSelectables: null,
        geojson: mockDefaultData.featureCollection as GeojsonFeatureCollectionProps,
        bounds: mockDefaultData.bounds as BboxType
    },
    filter: {
        formatMedium: [],
        formatType: [],
        film: [],
        camera: [],
        lens: [],
        focalLength: [],
        tags: []
    },
    mapCanvas: {
        styleLoaded: false,
        sourceStatus: 'idle',
        markersStatus: 'idle',
        fitBoundsButton: 'idle',
        markerLocator: 'idle'
    },
    sideFilmStrip: {
        enlargeDoc: null
    },
    toolbar: {
        filter: 'off',
        imageEnlarger: 'off'
    }
};



/* ===============================================================
    Tests on state data, map, and image displaying interactions. 
=============================================================== */
test("renders side strip panel", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Verify data to build film strip is available.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();

    // Check for side strip panel to be rendered.
    await waitFor(() => screen.findByRole('main', { name: 'images panel' }));
    const filmStripElem = screen.getByRole('main', { name: 'images panel' });
    expect(filmStripElem).toBeInTheDocument();
});


test("displays image collection in side strip panel", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Verify data to build film strip is available.
    const imageDocs = newStore.getState().timeline.imageDocs
    expect(imageDocs).not.toBeNull();
    expect(imageDocs!.length).toEqual(40);

    // Wait for render.
    await waitFor(() => screen.findByRole('main', { name: 'images panel' }));
    const filmStripElem = screen.getByRole('main', { name: 'images panel' });
    expect(filmStripElem).toBeInTheDocument();

    // Verify correct length of image frames rendered.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    expect(imageFrameElems.length).toEqual(imageDocs!.length);
});


test("clicks on images in film strip dispatches action", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Verify data to build film strip is available.
    const imageDocs = newStore.getState().timeline.imageDocs
    expect(imageDocs).not.toBeNull();
    expect(imageDocs!.length).toEqual(40);

    // Wait for render.
    await waitFor(() => screen.findByRole('main', { name: 'images panel' }));
    const filmStripElem = screen.getByRole('main', { name: 'images panel' });
    expect(filmStripElem).toBeInTheDocument();

    // Verify correct length of image frames rendered.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    expect(imageFrameElems.length).toEqual(imageDocs!.length);
    
    // Verify empty state.
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toBeNull();

    // Get image to click on.
    const imageToClick = imageFrameElems[0];

    await waitFor(() => user.click(imageToClick));

    // Verify clicked image state updated.
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();
});


test("renders 'image-enlarger' popup for showing enlarged image", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Verify data to build film strip is available.
    const imageDocs = newStore.getState().timeline.imageDocs
    expect(imageDocs).not.toBeNull();
    expect(imageDocs!.length).toEqual(40);

    // Wait for render.
    await waitFor(() => screen.findByRole('main', { name: 'images panel' }));
    const filmStripElem = screen.getByRole('main', { name: 'images panel' });
    expect(filmStripElem).toBeInTheDocument();

    // Verify correct length of image frames rendered.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    expect(imageFrameElems.length).toEqual(imageDocs!.length);
    
    // Verify empty state.
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toBeNull();
    
    // Get image to click on.
    const imageToClick = imageFrameElems[0];

    await waitFor(() => user.click(imageToClick));

    // Verify clicked image state updated.
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    // Check for enlarger popup to be rendered.
    await waitFor(() => screen.findByRole('tab', { name: 'image enlarger' }));
    const imageEnlargerElem = screen.getByRole('tab', { name: 'image enlarger'} );
    expect(imageEnlargerElem).toBeInTheDocument();
});


test("renders 'image-enlarger' element", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Verify data to build film strip is available.
    const imageDocs = newStore.getState().timeline.imageDocs
    expect(imageDocs).not.toBeNull();
    expect(imageDocs!.length).toEqual(40);

    // Wait for render.
    await waitFor(() => screen.findByRole('main', { name: 'images panel' }));
    const filmStripElem = screen.getByRole('main', { name: 'images panel' });
    expect(filmStripElem).toBeInTheDocument();

    // Verify correct length of image frames rendered.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    expect(imageFrameElems.length).toEqual(imageDocs!.length);
    
    // Get image to click on.
    const imageToClick = imageFrameElems[0];

    await waitFor(() => user.click(imageToClick));

    // Verify clicked image state updated.
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    // Check for enlarger popup to be rendered.
    await waitFor(() => screen.findByRole('tab', { name: 'image enlarger' }));
    const imageEnlargerElem = screen.getByRole('tab', { name: 'image enlarger'} );
    expect(imageEnlargerElem).toBeInTheDocument();

    const imageStatsElem = screen.getByRole('figure', { name: 'metadata for enlarged image' });
    expect(imageStatsElem).toBeInTheDocument();
});


test("renders image to be enlarged based on << enlargeDoc >> state", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Verify data to build film strip is available.
    const imageDocs = newStore.getState().timeline.imageDocs
    expect(imageDocs).not.toBeNull();
    expect(imageDocs!.length).toEqual(40);

    // Wait for render.
    await waitFor(() => screen.findByRole('main', { name: 'images panel' }));
    const filmStripElem = screen.getByRole('main', { name: 'images panel' });
    expect(filmStripElem).toBeInTheDocument();

    // Verify correct length of image frames rendered.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    expect(imageFrameElems.length).toEqual(imageDocs!.length);
    
    // Get image to click on.
    const imageToClick = imageFrameElems[0];

    await waitFor(() => user.click(imageToClick));

    // Verify clicked image state updated.
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    // Check for enlarger popup to be rendered.
    await waitFor(() => screen.findByRole('tab', { name: 'image enlarger' }));
    const imageEnlargerElem = screen.getByRole('tab', { name: 'image enlarger'} );
    expect(imageEnlargerElem).toBeInTheDocument();

    // Verify correct image gets shown.
    await waitFor(() => screen.findByRole('img', { name: 'enlarged image' }));
    const enlargedImageElem = screen.getByRole('img', { name: 'enlarged image' });
    
    const imageDocUrl = newStore.getState().sideFilmStrip.enlargeDoc!.url;
    const renderedImageUrl = enlargedImageElem.getAttribute('src');
    expect(renderedImageUrl).toEqual(imageDocUrl);
});


test("expands/contracts second column of thumbnails on hovering over strip", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Verify data to build film strip is available.
    const imageDocs = newStore.getState().timeline.imageDocs
    expect(imageDocs).not.toBeNull();
    expect(imageDocs!.length).toEqual(40);

    // Wait for render.
    await waitFor(() => screen.findByRole('main', { name: 'images panel' }));
    const filmStripElem = screen.getByRole('main', { name: 'images panel' });
    expect(filmStripElem).toBeInTheDocument();

    const imageEnlargerContainerElem = screen.getByRole('figure', { name: 'enlarged image with metadata' });
    const filmStripContainerElem = screen.getByRole('listbox', { name: 'images strip' });
    expect(imageEnlargerContainerElem).not.toHaveClass("slide");
    expect(filmStripContainerElem).not.toHaveClass("expand");

    // Verify hovering will add reveal animation.
    await waitFor(() => user.hover(filmStripContainerElem));
    expect(imageEnlargerContainerElem).toHaveClass("slide");
    expect(filmStripContainerElem).toHaveClass("expand");
});


test("reveals/hides enlarger depending on state availability", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // "Reset" << enlargeDoc >> to null, unclicked state.
    newStore.dispatch(handleEnlarger(null));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toBeNull();

    // Verify enlarger panel is hidden.
    await waitFor(() => screen.findByRole('tab', { name: 'image enlarger' }));
    const imageEnlargerElem = screen.getByRole('tab', { name: 'image enlarger' });
    expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'false');
    expect(imageEnlargerElem).not.toHaveClass("show");

    // Verify enlarger panel becomes visible on imageDoc existence.
    newStore.dispatch(handleEnlarger(mockDefaultData.docs[0]));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();
    await waitFor(() => {
        expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'true');
        expect(imageEnlargerElem).toHaveClass("show");
    });
});


test("opens image enlarger (if closed) if same image clicked on", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <Toolbar />
                <SideFilmStrip />
            </Provider>
        );
    
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toBeNull();

    // Verify enlarger panel is hidden.
    await waitFor(() => screen.findByRole('tab', { name: 'image enlarger' }));
    const imageEnlargerElem = screen.getByRole('tab', { name: 'image enlarger' });
    expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'false');
    expect(imageEnlargerElem).not.toHaveClass("show");

    // Verify enlarger panel becomes visible on imageDoc existence.
    const idForImageToEnlarge = mockDefaultData.docs[0]._id;
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === idForImageToEnlarge)[0];

    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();
    
    await waitFor(() => {
        expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'true');
        expect(imageEnlargerElem).toHaveClass("show");
    });

    // Close image enlarger with toolbar button.
    const payloadToolbarButtons: ToolbarProps = {
        'filter': 'on',
        'imageEnlarger': 'off'
    };
    newStore.dispatch(handleToolbarButtons(payloadToolbarButtons));

    // Verify enlarger panel is hidden.
    await waitFor(() => {
        expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'false');
        expect(imageEnlargerElem).not.toHaveClass("show");
    });

    // Click on image in strip again.
    await waitFor(() => user.click(thumbnailToClick));

    // Verify image enlarger opens.
    await waitFor(() => {
        expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'true');
        expect(imageEnlargerElem).toHaveClass("show");
    });
});


test("closes image enlarger on year or month selection", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <Toolbar />
                <SideFilmStrip />
            </Provider>
        );
    
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toBeNull();
    const imageEnlargerElem = screen.getByRole('tab', { name: 'image enlarger' });

    // Verify enlarger panel becomes visible on imageDoc existence.
    const idForImageToEnlarge = mockDefaultData.docs[0]._id;
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === idForImageToEnlarge)[0];

    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();
    
    await waitFor(() => {
        expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'true');
        expect(imageEnlargerElem).toHaveClass("show");
    });

    // Select year.
    newStore.dispatch(handleYearSelect(2017));

    // Verify enlarger panel is hidden.
    await waitFor(() => {
        expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'false');
        expect(imageEnlargerElem).not.toHaveClass("show");
    });

    // Click on image in strip again.
    await waitFor(() => user.click(thumbnailToClick));

    // Verify enlarger opened.
    await waitFor(() => {
        expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'true');
        expect(imageEnlargerElem).toHaveClass("show");
    });

    // Select year.
    newStore.dispatch(handleMonthSelect('may'));

    // Verify enlarger panel is hidden.
    await waitFor(() => {
        expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'false');
        expect(imageEnlargerElem).not.toHaveClass("show");
    });
});


test("expands film strip on hover and slides image enlarger to the left", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toBeNull();
    const imageEnlargerElem = screen.getByRole('tab', { name: 'image enlarger' });

    // Verify enlarger panel becomes visible on imageDoc existence.
    const idForImageToEnlarge = mockDefaultData.docs[0]._id;
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === idForImageToEnlarge)[0];

    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();
    
    await waitFor(() => {
        expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'true');
        expect(imageEnlargerElem).toHaveClass("show");
    });

    // Hover onto film strip.
    const filmStripElem = screen.getByRole('listbox', { name: 'images strip' });
    const imageEnlargerMetadataContainer = screen.getByRole(
        'figure', { name: 'enlarged image with metadata' });

    await waitFor(() => user.hover(filmStripElem));
    
    // Verify film strip expanded and image enlarger panel shifted.
    expect(filmStripElem).toHaveAttribute("aria-expanded", 'true');
    expect(imageEnlargerMetadataContainer).toHaveClass("slide");
});


test("flies to map position on gps lock on button click", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toBeNull();
    const imageEnlargerElem = screen.getByRole('tab', { name: 'image enlarger' });

    // Verify enlarger panel becomes visible on imageDoc existence.
    const idForImageToEnlarge = mockDefaultData.docs[0]._id;
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === idForImageToEnlarge)[0];

    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();
    
    // Verify image enlarger opened.
    await waitFor(() => {
        expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'true');
        expect(imageEnlargerElem).toHaveClass("show");
    });

    const markerLocatorButton = screen.getByRole('button', { name: 'locate enlarged image on map' });

    await waitFor(() => user.click(markerLocatorButton));

    // Verify marker locator state change.
    expect(newStore.getState().mapCanvas.markerLocator).toEqual('clicked');
});

