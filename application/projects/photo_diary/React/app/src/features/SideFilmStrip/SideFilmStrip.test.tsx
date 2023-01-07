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



beforeEach(() => {
    mockAxios = new MockAdapter(axios);

    // Mock scrollTo.
    window.HTMLElement.prototype.scrollTo = jest.fn();

    // Mock IntersectionObserver.
    class IntersectionObserverStub {
        // Stub methods.
        root() {}
        takeRecords() {}
        observe() {}
        disconnect() {}
    };

    jest.doMock('intersectionObserverMock', () => 
        IntersectionObserverStub, 
        { virtual: true }
    );

    window.IntersectionObserver = jest.requireMock('intersectionObserverMock');

    jest.spyOn(window.IntersectionObserver.prototype, 'observe')
        .mockImplementation(() => {
            return jest.fn();
        });
});

afterEach(() => {
    mockAxios.reset();
    jest.clearAllMocks();
    jest.restoreAllMocks();
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
        enlargeDoc: null,
        docIndex: null
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


test("changes on selected image (sideFilmStrip.enlargeDoc state) calls IntersectionObserver API", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Wait for render.
    await waitFor(() => screen.findByRole('main', { name: 'images panel' }));
    const filmStripElem = screen.getByRole('main', { name: 'images panel' });
    expect(filmStripElem).toBeInTheDocument();

    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    
    // Verify empty state.
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toBeNull();
    await waitFor(() => expect(window.IntersectionObserver.prototype.observe).not.toHaveBeenCalled());

    // Get image to click on.
    const imageToClick = imageFrameElems[0];
    expect(imageToClick.firstChild).not.toHaveClass("selected");

    await waitFor(() => user.click(imageToClick));

    await waitFor(() => expect(window.IntersectionObserver.prototype.observe).toHaveBeenCalledTimes(1));
});


test("clicks on images in film strip changes film frame styling, dispatches action", async() => {
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
    expect(imageToClick.firstChild).not.toHaveClass("selected");

    await waitFor(() => user.click(imageToClick));

    // Verify clicked image state updated.
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();
    expect(imageToClick.firstChild).toHaveClass("selected");
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


test("reveals/hides enlarger depending on state availability", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // "Reset" << enlargeDoc >> to null, unclicked state.
    newStore.dispatch(handleEnlarger({
        'enlargeDoc': null,
        'docIndex': null
    }));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toBeNull();

    // Verify enlarger panel is hidden.
    await waitFor(() => screen.findByRole('tab', { name: 'image enlarger' }));
    const imageEnlargerElem = screen.getByRole('tab', { name: 'image enlarger' });
    expect(imageEnlargerElem).toHaveAttribute("aria-expanded", 'false');
    expect(imageEnlargerElem).not.toHaveClass("show");

    // Verify enlarger panel becomes visible on imageDoc existence.
    newStore.dispatch(handleEnlarger({
        'enlargeDoc': mockDefaultData.docs[0],
        'docIndex': 0
    }));
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


test("scrolls image strip to top on timeline changes", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    expect(newStore.getState().timeline.selected.year).toEqual(2022);

    // "Select" a new year.
    newStore.dispatch(handleYearSelect(2016));

    // Verify state updated.
    expect(newStore.getState().timeline.selected.year).toEqual(2016);

    // Verify film strip element calls scrollTo to bump up view to top.
    expect(window.HTMLElement.prototype.scrollTo).toHaveBeenCalledTimes(1);
});


test("flies map to marker position on film strip thumbnail clicks", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Get thumbnail to click.
    const idForImageToEnlarge = mockDefaultData.docs[0]._id;
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === idForImageToEnlarge)[0];

    await waitFor(() => user.click(thumbnailToClick));

    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    // Verify marker locator state changed.
    expect(newStore.getState().mapCanvas.markerLocator).toEqual('clicked');
});


test("cycles through images on prev/next button clicks", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Get thumbnail to click.
    const idForImageToEnlarge = mockDefaultData.docs[10]._id;
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === idForImageToEnlarge)[0];

    await waitFor(() => user.click(thumbnailToClick));

    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    const prevImageButton = screen.getByRole('button', { name: 'show previous image' });
    const nextImageButton = screen.getByRole('button', { name: 'show next image' });
    let imageIndexA = newStore.getState().sideFilmStrip.docIndex as number;

    await waitFor(() => user.click(nextImageButton));
    
    // Verify index is + 1.
    expect(newStore.getState().sideFilmStrip.docIndex).toEqual(imageIndexA + 1);

    await waitFor(() => user.click(prevImageButton));

    // Verify index is - 1, back to original.
    expect(newStore.getState().sideFilmStrip.docIndex).toEqual(imageIndexA);
});


test("loops image doc if prev/next button leads to collection out of range", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Get thumbnail to click.
    const idForImageToEnlarge = mockDefaultData.docs[0]._id;
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === idForImageToEnlarge)[0];

    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    const prevImageButton = screen.getByRole('button', { name: 'show previous image' });
    const nextImageButton = screen.getByRole('button', { name: 'show next image' });
    const imageDocs = newStore.getState().timeline.imageDocs;

    await waitFor(() => user.click(prevImageButton));
    
    // Verify image doc looped to end of collection.
    expect(newStore.getState().sideFilmStrip.docIndex).toEqual(imageDocs!.length - 1);

    await waitFor(() => user.click(nextImageButton));

    // Verify image doc looped back to beginning of collection.
    expect(newStore.getState().sideFilmStrip.docIndex).toEqual(0);
});


test("opens slide viewer on clicking full screen button in image enlarger panel, \
    closes on clicking anywhere on slide viewer that's not nav button", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    const slideViewElement = screen.getByRole('img', { name: 'full screen slide view mode' });
    expect(slideViewElement).not.toHaveClass("show");

    // Get thumbnail to click.
    const idForImageToEnlarge = mockDefaultData.docs[0]._id;
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === idForImageToEnlarge)[0];

    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    const fullScreenButton = screen.getByRole('button', { name: 'show image full screen' });

    await waitFor(() => user.click(fullScreenButton));
    
    // Verify slide viewing mode opened.
    expect(slideViewElement).toHaveClass("show");

    await waitFor(() => user.click(slideViewElement));
    
    // Verify slide viewing mode closed.
    expect(slideViewElement).not.toHaveClass("show");
});


test("changes image in slide view mode on arrow button clicks", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Get thumbnail to click.
    const idForImageToEnlarge = mockDefaultData.docs[1]._id;
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === idForImageToEnlarge)[0];

    // Set up enlarger.
    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    const fullScreenButton = screen.getByRole('button', { name: 'show image full screen' });
    await waitFor(() => user.click(fullScreenButton));

    // Get image nav buttons.
    const prevButton = screen.getByRole('button', { name: 'show previous slide image'} );
    const nextButton = screen.getByRole('button', { name: 'show next slide image'} );

    // Get image element.
    const slideImageElem = screen.getByRole('img', { name: 'enlarged image in full screen mode' } ) as HTMLImageElement;
    const slideImageA: string = slideImageElem.src;

    await waitFor(() => user.click(prevButton));

    // Verify image changed.
    expect(slideImageElem.src).not.toEqual(slideImageA);

    await waitFor(() => user.click(nextButton));

    // Verify image changed back to initial.
    expect(slideImageElem.src).toEqual(slideImageA);
});


test("loops slide image if prev/next button leads to collection out of range", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Get thumbnail to click.
    const idForImageToEnlarge = mockDefaultData.docs[0]._id;
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === idForImageToEnlarge)[0];

    // Set up enlarger.
    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    const fullScreenButton = screen.getByRole('button', { name: 'show image full screen' });
    await waitFor(() => user.click(fullScreenButton));

    // Get image nav buttons.
    const prevButton = screen.getByRole('button', { name: 'show previous slide image'} );
    const nextButton = screen.getByRole('button', { name: 'show next slide image'} );

    // Get image element.
    const slideImageElem = screen.getByRole('img', { name: 'enlarged image in full screen mode' } ) as HTMLImageElement;

    await waitFor(() => user.click(prevButton));

    const firstImageSrc: string = mockDefaultData.docs[0].url;
    const lastImageSrc: string = mockDefaultData.docs[mockDefaultData.docs.length - 1].url;

    // Verify image looped to last image in collection.
    expect(slideImageElem.src).toEqual(lastImageSrc);

    await waitFor(() => user.click(nextButton));

    // Verify image changed back to initial, looped to beginning of collection.
    expect(slideImageElem.src).toEqual(firstImageSrc);
});


test("changes enlargeDoc to that of last image viewed in slide view", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Get thumbnail to click.
    const initImageToEnlarge = mockDefaultData.docs[0];
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === initImageToEnlarge._id)[0];

    // Set up enlarger.
    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    const fullScreenButton = screen.getByRole('button', { name: 'show image full screen' });
    await waitFor(() => user.click(fullScreenButton));

    const slideImageElem = screen.getByRole('img', { name: 'enlarged image in full screen mode' } ) as HTMLImageElement;
    
    // Verify slide image is init enlarged image.
    expect(slideImageElem.src).toEqual(initImageToEnlarge.url);

    const nextButton = screen.getByRole('button', { name: 'show next slide image'} );
    await waitFor(() => user.click(nextButton));

    // Verify slide image changed.
    expect(slideImageElem.src).not.toEqual(initImageToEnlarge.url);

    // Get expected new enlarge doc on slide view closing.
    const expectedNewEnlargeDoc = newStore.getState().timeline.imageDocs!.filter(doc => 
        doc.url === slideImageElem.src)[0];

    
    const slideViewElement = screen.getByRole('img', { name: 'full screen slide view mode' });
    await waitFor(() => user.click(slideViewElement));
    
    // Verify slide viewing mode closed.
    expect(slideViewElement).not.toHaveClass("show");

    // Verify enlarge doc changed to last viewed in slide mode.
    expect(newStore.getState().sideFilmStrip.enlargeDoc).toEqual(expectedNewEnlargeDoc);
});


test("presses on Esc key closes slide view mode", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Get thumbnail to click.
    const initImageToEnlarge = mockDefaultData.docs[0];
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === initImageToEnlarge._id)[0];

    // Set up enlarger.
    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    const fullScreenButton = screen.getByRole('button', { name: 'show image full screen' });
    await waitFor(() => user.click(fullScreenButton));
    
    // Verify slide view mode opened.
    expect(newStore.getState().sideFilmStrip.slideView).toEqual('on');
    expect(newStore.getState().toolbar.imageEnlarger).toEqual('hidden');

    await waitFor(() => user.keyboard('[Escape]'));

    // Verify slide view mode closed.
    expect(newStore.getState().sideFilmStrip.slideView).toEqual('off');
    expect(newStore.getState().toolbar.imageEnlarger).toEqual('on');
});


test("presses on L/R arrow keys change enlarger image", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Get thumbnail to click.
    const initImageToEnlarge = mockDefaultData.docs[0];
    const prevImageToEnlarge = mockDefaultData.docs[mockDefaultData.docs.length - 1];
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === initImageToEnlarge._id)[0];
    
    // Set up image enlarger.
    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    await waitFor(() => user.keyboard('[ArrowLeft]'));

    // Verify image enlarger cycled to previous image.
    expect(newStore.getState().sideFilmStrip.enlargeDoc!._id).toEqual(prevImageToEnlarge._id);

    await waitFor(() => user.keyboard('[ArrowRight]'));

    // Verify image enlarger cycled to next image (initial image).
    expect(newStore.getState().sideFilmStrip.enlargeDoc!._id).toEqual(initImageToEnlarge._id);
});


test("presses on L/R arrow keys change slide viewer image", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Get thumbnail to click.
    const initImageToEnlarge = mockDefaultData.docs[0];
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === initImageToEnlarge._id)[0];

    // Set up image enlarger.
    await waitFor(() => user.click(thumbnailToClick));
    expect(newStore.getState().sideFilmStrip.enlargeDoc).not.toBeNull();

    const fullScreenButton = screen.getByRole('button', { name: 'show image full screen' });
    await waitFor(() => user.click(fullScreenButton));
    
    // Verify slide view mode opened.
    expect(newStore.getState().sideFilmStrip.slideView).toEqual('on');
    expect(newStore.getState().toolbar.imageEnlarger).toEqual('hidden');

    // Get image element.
    const slideImageElem = screen.getByRole('img', { name: 'enlarged image in full screen mode' } ) as HTMLImageElement;
    // const slideImageA: string = slideImageElem.src;
    expect(slideImageElem.src).toEqual(initImageToEnlarge.url);

    await waitFor(() => user.keyboard('[ArrowRight]'));

    // Verify slide image cycled to next image.
    const nextImageToSlideView = mockDefaultData.docs[1];
    expect(slideImageElem.src).toEqual(nextImageToSlideView.url);

    await waitFor(() => user.keyboard('[ArrowLeft]'));

    // Verify image enlarger cycled to previous image (initial image).
    expect(slideImageElem.src).toEqual(initImageToEnlarge.url);
});


test("presses on L/R arrow keys in slide viewer won't change base enlarger image", async() => {
    const newStore = setupStore(preloadedState);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
    // Get thumbnail to click.
    const initImageToEnlarge = mockDefaultData.docs[0];
    const thumbnailElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const thumbnailToClick = thumbnailElems.filter(thumbnail => 
        thumbnail.id === initImageToEnlarge._id)[0];

    // Set up image enlarger.
    await waitFor(() => user.click(thumbnailToClick));
    const enlargeDoc = newStore.getState().sideFilmStrip.enlargeDoc?._id;
    expect(enlargeDoc).toEqual(initImageToEnlarge._id);

    const fullScreenButton = screen.getByRole('button', { name: 'show image full screen' });
    await waitFor(() => user.click(fullScreenButton));
    
    // Verify slide view mode opened.
    expect(newStore.getState().sideFilmStrip.slideView).toEqual('on');
    expect(newStore.getState().toolbar.imageEnlarger).toEqual('hidden');

    // Get image element.
    const slideImageElem = screen.getByRole('img', { name: 'enlarged image in full screen mode' } ) as HTMLImageElement;
    // const slideImageA: string = slideImageElem.src;
    expect(slideImageElem.src).toEqual(initImageToEnlarge.url);

    await waitFor(() => user.keyboard('[ArrowRight]'));

    // Verify slide image cycled to next image.
    const nextImageToSlideView = mockDefaultData.docs[1];
    expect(slideImageElem.src).toEqual(nextImageToSlideView.url);

    // Verify enlargeDoc unchanged.
    expect(enlargeDoc).toEqual(initImageToEnlarge._id);

    await waitFor(() => user.keyboard('[ArrowLeft]'));

    // Verify image enlarger cycled to previous image (initial image).
    expect(slideImageElem.src).toEqual(initImageToEnlarge.url);

    // Verify enlargeDoc unchanged.
    expect(enlargeDoc).toEqual(initImageToEnlarge._id);
});