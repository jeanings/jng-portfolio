import { RootState } from '../app/store';
import mockDefaultData from '../utils/mockDefaultData.json';
import { GeojsonFeatureCollectionProps, BboxType } from '../features/TimelineBar/timelineSlice';


export const preloadedState: RootState = {
    timeline: {
        responseStatus: 'successful',
        query: { year: 2022 },
        initYear: 2022,
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
    },
    login: {
        tokenResponse: 'idle',
        user: null,
        role: 'viewer',
        loggedIn: false
    },
    editor: {
        response: 'idle',
        message: null,
        updated: {}
    }
};


const mockUser = {
    "visitor": {
        "_id": 'some_visitor',
        "email": "test@gmail.com",
        "name": "Test",
        "profilePic": "https://lh3.googleusercontent.com/a/some-profile-pic",
        "role": "editor"
    },
    "editor": {
        "_id": 'some_editor',
        "email": "test@gmail.com",
        "name": "Test",
        "profilePic": "https://lh3.googleusercontent.com/a/some-profile-pic",
        "role": "editor"
    },
    "owner": {
        "_id": preloadedState.timeline.imageDocs![0].owner,
        "email": "test@gmail.com",
        "name": "Test",
        "profilePic": "https://lh3.googleusercontent.com/a/some-profile-pic",
        "role": "editor"
    }
};


export const preloadedStateEditor: RootState = {...preloadedState,
    login: {
        tokenResponse: 'idle',
        user: mockUser.editor,
        role: 'editor',
        loggedIn: true
    }
};


export const preloadedStateEditorOwner: RootState = {...preloadedState,
    login: {
        tokenResponse: 'idle',
        user: mockUser.owner,
        role: 'editor',
        loggedIn: true
    }
};


export default preloadedState;