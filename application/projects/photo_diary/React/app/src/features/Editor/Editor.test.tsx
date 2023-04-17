import React from 'react';
import * as reactRedux from 'react-redux';
import { Provider } from 'react-redux';
import { setupStore } from '../../app/store';
import { 
    cleanup, 
    render, 
    screen, 
    waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom';
import { 
    preloadedState, 
    preloadedStateEditor,
    preloadedStateEditorOwner } from '../../utils/testHelpers';
import SideFilmStrip from '../SideFilmStrip/SideFilmStrip';


var user = userEvent.setup();


beforeEach(() => {

    // Mocked React functions.
    // const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    // const mockDispatch = jest.fn();
    // useDispatchSpy.mockReturnValue(mockDispatch);

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
    jest.clearAllMocks();
    jest.restoreAllMocks();
    cleanup;
});



test("shows edit form, input if user is editor and owner of doc", async() => {
    const newStore = setupStore(preloadedStateEditorOwner);
    render(
        <Provider store={newStore}>
            <SideFilmStrip />
        </Provider>
    );

    // Verify editor is owner of collection.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('editor');
    const mockUser = newStore.getState().login.user;
    const docOwner = newStore.getState().timeline.imageDocs![0].owner;
    expect(mockUser?._id).toEqual(docOwner);
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const imageToClick = imageFrameElems[0];
    await waitFor(() => user.click(imageToClick));

    // Verify form is displayed.
    expect(newStore.getState().toolbar.imageEnlarger).toEqual('on');
    await waitFor(() => screen.findByRole('form', { name: 'edit form of metadata for enlarged image' }));
    const formForEdit = screen.getByRole('form', { name: 'edit form of metadata for enlarged image' });
    expect(formForEdit).toBeInTheDocument();

    // Verify inputs are displayed.
    const formInputs = screen.queryAllByRole('textbox');
    expect(formInputs).not.toEqual(null);
});


test("shows edit UI buttons if user is editor and owner of doc", async() => {
    const newStore = setupStore(preloadedStateEditorOwner);
    render(
        <Provider store={newStore}>
            <SideFilmStrip />
        </Provider>
    );

    // Verify editor is owner of collection.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('editor');
    const mockUser = newStore.getState().login.user;
    const docOwner = newStore.getState().timeline.imageDocs![0].owner;
    expect(mockUser?._id).toEqual(docOwner);
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const imageToClick = imageFrameElems[0];
    await waitFor(() => user.click(imageToClick));

    // Verify form is displayed.
    expect(newStore.getState().toolbar.imageEnlarger).toEqual('on');
    await waitFor(() => screen.findByRole('form', { name: 'edit form of metadata for enlarged image' }));
    const formForEdit = screen.getByRole('form', { name: 'edit form of metadata for enlarged image' });
    expect(formForEdit).toBeInTheDocument();

    // Verify inputs are displayed.
    const formInputs = screen.queryAllByRole('textbox');
    expect(formInputs).not.toEqual(null);

    // Verify editor UI buttons displayed.
    const saveEditsButton = screen.queryByRole('button', { name: 'save metadata edits on image' });
    const clearEditsButton = screen.queryByRole('button', { name: 'clear metadata form edits'} );
    expect(saveEditsButton).toBeVisible();
    expect(clearEditsButton).toBeVisible();
});


test("does not show edit form if user is editor but not owner of doc", async() => {
    const newStore = setupStore(preloadedStateEditor);
    render(
        <Provider store={newStore}>
            <SideFilmStrip />
        </Provider>
    );

    // Verify user is editor.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('editor');

    // Verify user is not owner of collection.
    const mockUser = newStore.getState().login.user;
    const docOwner = newStore.getState().timeline.imageDocs![0].owner;
    expect(mockUser?._id).not.toEqual(docOwner);
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const imageToClick = imageFrameElems[0];
    await waitFor(() => user.click(imageToClick));

    // Verify form is not displayed.
    expect(newStore.getState().toolbar.imageEnlarger).toEqual('on');
    const formForEdit = screen.queryByRole('form');
    expect(formForEdit).toEqual(null);
});


test("does not show edit form if user is not editor", async() => {
    const newStore = setupStore(preloadedState);
    render(
        <Provider store={newStore}>
            <SideFilmStrip />
        </Provider>
    );

    // Verify user is viewer.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('viewer');
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const imageToClick = imageFrameElems[0];
    await waitFor(() => user.click(imageToClick));

    // Verify form is not displayed.
    expect(newStore.getState().toolbar.imageEnlarger).toEqual('on');
    const formForEdit = screen.queryByRole('form');
    expect(formForEdit).toEqual(null);
});


test("does not show edit UI buttons if user is viewer", async() => {
    const newStore = setupStore(preloadedState);
    render(
        <Provider store={newStore}>
            <SideFilmStrip />
        </Provider>
    );

    // Verify editor is owner of collection.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('viewer');
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image container' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image container' });
    const imageToClick = imageFrameElems[0];
    await waitFor(() => user.click(imageToClick));

    // Verify editor UI buttons hidden.
    const saveEditsButton = screen.queryByRole('button', { name: 'save metadata edits on image' });
    const clearEditsButton = screen.queryByRole('button', { name: 'clear metadata form edits'} );
    expect(saveEditsButton).toEqual(null);
    expect(clearEditsButton).toEqual(null);
});



// xdescribe("on input blur, input formatting gets checked", () => {
//     /* --------------------------------------------------------
//         Mocks                                          start
//     -------------------------------------------------------- */
//     // Mocked React functions.
//     // const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
//     // const mockDispatch = jest.fn();
//     // useDispatchSpy.mockReturnValue(mockDispatch);

//     // Mock scrollTo.
//      window.HTMLElement.prototype.scrollTo = jest.fn();

//     // Mock IntersectionObserver.
//     class IntersectionObserverStub {
//         // Stub methods.
//         root() {}
//         takeRecords() {}
//         observe() {}
//         disconnect() {}
//     };

//     jest.doMock('intersectionObserverMock', () => 
//         IntersectionObserverStub, 
//         { virtual: true }
//     );

//     window.IntersectionObserver = jest.requireMock('intersectionObserverMock');

//     jest.spyOn(window.IntersectionObserver.prototype, 'observe')
//         .mockImplementation(() => {
//             return jest.fn();
//         });

//     /* --------------------------------------------------------
//         Mocks                                            end
//     -------------------------------------------------------- */

//     const newStore = setupStore(preloadedStateLoggedIn);
//     render(
//         <Provider store={newStore}>
//             <SideFilmStrip />
//         </Provider>
//     );

//     expect(newStore.getState().timeline.imageDocs).not.toBeNull();
//     expect(newStore.getState().login.role).toEqual('editor');
    
//     // Enlarge an image.
//     const imageToClick = screen.getAllByRole('img', { name: 'thumbnail image container'})[0];
//     user.click(imageToClick);


//     test("date input passes check", async() => {
        


//     });

//     test("date input fails check", async() => {

//     });

//     test("format input passes check", async() => {

//     });

//     test("format input fails check", async() => {

//     });

//     test("focal length input passes check", async() => {

//     });

//     test("focal length fails  passes check", async() => {

//     });

//     test("iso input passes check", async() => {

//     });

//     test("iso input fails check", async() => {

//     });

//     test("camera input passes check", async() => {

//     });

//     test("camera input fails check", async() => {

//     });

//     test("coordinates input passes check", async() => {

//     });

//     test("coordinates input fails check", async() => {

//     });

//     test("film, lens, tags input always passes check", async() => {

//     });
// });


// test("enables submit button on input existence", async() => {
//     /* --------------------------------------------------------
//         Mocks                                          start
//     -------------------------------------------------------- */
//      // Mocked React functions.
//     const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
//     const mockDispatch = jest.fn();
//     useDispatchSpy.mockReturnValue(mockDispatch);

//     /* --------------------------------------------------------
//         Mocks                                            end
//     -------------------------------------------------------- */

//     const newStore = setupStore(preloadedState);
//         render(
//             <Provider store={newStore}>
//             </Provider>
//         );

   
// });


// test("enables clear edits button on input existence", async() => {

// });


// test("clears unsubmitted inputs on transition to different image", async() => {

// });


// describe("shows save status indicators on form submission", () => {
//     test("indicates green check on successful edits", async() => {

//     });

//     test("indicates amber exclamation on issues with submission", async() => {

//     });

//     test("indicates red exclamation on network issues with submission", async() => {

//     });
// })
