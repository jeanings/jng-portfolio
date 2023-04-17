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
import { loadOptions } from '@babel/core';


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

afterAll(() => {
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
    user.click(imageToClick);

    // Verify form is enabled/exists.
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
    user.click(imageToClick);

    // Verify form is enabled/exists.
    await waitFor(() => screen.findByRole('form', { name: 'edit form of metadata for enlarged image' }));
    const formForEdit = screen.getByRole('form', { name: 'edit form of metadata for enlarged image' });
    expect(formForEdit).toBeInTheDocument();

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
    user.click(imageToClick);

    // Verify form is not enabled.
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
    user.click(imageToClick);

    // Verify form is not enabled.
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
    user.click(imageToClick);

    // Verify editor UI buttons hidden.
    const saveEditsButton = screen.queryByRole('button', { name: 'save metadata edits on image' });
    const clearEditsButton = screen.queryByRole('button', { name: 'clear metadata form edits' } );
    expect(saveEditsButton).toEqual(null);
    expect(clearEditsButton).toEqual(null);
});


test("enables submit button on input existence", async() => {
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
    user.click(imageToClick);

    // Verify inputs are displayed.
    await waitFor(() => screen.findAllByRole('textbox'));
    const formInputs = screen.queryAllByRole('textbox');
    expect(formInputs).not.toEqual(null);

    // Verify submission displayed.
    const saveEditsButton = screen.getByRole('button', { name: 'save metadata edits on image' });
    
    // Verify onClick disabled for submit button.
    expect(saveEditsButton.onclick).toEqual(null);

    // Type in some input.
    const dateInput = formInputs[0] as HTMLInputElement;
    user.type(dateInput, '2022/06');

    // Verify onClick enabled.
    await waitFor(() => expect(dateInput.value).toEqual('2022/06'));
    expect(saveEditsButton.onclick).not.toEqual(null);
});


test("enables clear edits button on input existence", async() => {
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
    user.click(imageToClick);

    // Verify inputs are displayed.
    await waitFor(() => screen.findAllByRole('textbox'));
    const formInputs = screen.queryAllByRole('textbox');
    expect(formInputs).not.toEqual(null);

    // Verify editor UI buttons displayed.
    const clearEditsButton = screen.getByRole('button', { name: 'clear metadata form edits' });

    // Type in some input.
    const dateInput = formInputs[0] as HTMLInputElement;
    user.type(dateInput, '2022/06');

    // Verify data in input.
    await waitFor(() => expect(dateInput.value).toEqual('2022/06'));

    // Clear edits.
    user.click(clearEditsButton);
    
    // Verify input cleared.
    await waitFor(() => expect(dateInput.value).toEqual(''));
});


test("dispatches action on form submission", async() => {
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
    user.click(imageToClick);

    // Verify inputs are displayed.
    await waitFor(() => screen.findAllByRole('textbox'));
    const formInputs = screen.queryAllByRole('textbox');
    await waitFor(() => expect(formInputs).not.toEqual(null));

    // Verify submission displayed.
    const saveEditsButton = screen.getByRole('button', { name: 'save metadata edits on image' });
    
    // Type in some input.
    user.type(formInputs[0], '2022/06');

    // Mock dispatch function.
    const useDispatchSpy = jest.spyOn(reactRedux, 'useDispatch');
    const mockDispatch = jest.fn();
    useDispatchSpy.mockReturnValue(mockDispatch);

    // Submit edit.
    await waitFor(() => expect(saveEditsButton.onclick).not.toEqual(null));
    user.click(saveEditsButton);
    
    // Verify dispatch.
    await waitFor(() => expect(mockDispatch).toHaveBeenCalled());
});


// test("clears unsubmitted inputs on transition to different image", async() => {

// });



describe("on input blur, input formatting gets checked", () => {
    var imageToClick: HTMLElement;

    beforeEach(() => {
        /* --------------------------------------------------------
            Mocks                                          start
        -------------------------------------------------------- */
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
    
        /* --------------------------------------------------------
            Mocks                                            end
        -------------------------------------------------------- */
    
        const newStore = setupStore(preloadedStateEditorOwner);
        render(
            <Provider store={newStore}>
                <SideFilmStrip />
            </Provider>
        );
    
        expect(newStore.getState().timeline.imageDocs).not.toBeNull();
        expect(newStore.getState().login.role).toEqual('editor');
        const mockUser = newStore.getState().login.user;
        const docOwner = newStore.getState().timeline.imageDocs![0].owner;
        expect(mockUser?._id).toEqual(docOwner);

        imageToClick = screen.getAllByRole('img', { name: 'thumbnail image container'})[0];
        user.click(imageToClick);
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
        cleanup;
    });
    
    /* -------------------------------
        Helper: input check process.
    ------------------------------- */
    const checkInputs = async(inputElem: HTMLInputElement, testType: 'pass' | 'fail', input: string) => {
        // Type and wait for input.
        user.click(inputElem);
        user.type(inputElem, input);
        await waitFor(() => expect(inputElem.value).toEqual(input), { timeout: 9000 });

        // Lose focus on input to trigger onBlur input checking event.
        inputElem.blur();
        await waitFor(() => expect(inputElem).not.toHaveFocus());
        
        if (testType === 'pass') {
            await waitFor(() => expect(inputElem).not.toHaveClass('wrongFormat'));
        }
        else if (testType === 'fail') {
            await waitFor(() => expect(inputElem).toHaveClass('wrongFormat'));
        }

        // Clean up inputs.
        user.click(inputElem);
        user.clear(inputElem);
    };


    test("date input passes check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'Date editable metadata value' }));
        const dateInput = screen.getByRole('textbox', { name: 'Date editable metadata value' }) as HTMLInputElement;
        checkInputs(dateInput, 'pass', '2022/12');
        checkInputs(dateInput, 'pass', '2022/12/31');
        checkInputs(dateInput, 'pass', '2022/12/31 23:59:59');
    });

    test("date input fails check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'Date editable metadata value' }));
        const dateInput = screen.getByRole('textbox', { name: 'Date editable metadata value' }) as HTMLInputElement;
        const today = new Date();
        const [ nextYear, thisMonth, thisDay ] = [ 
            today.getFullYear() + 1, 
            today.getMonth() + 1,   // getMonth() indexes January as 0.
            today.getDate()
        ];

        // Fail year only.
        checkInputs(dateInput, 'fail', '2022');
        // Fail future year.
        checkInputs(dateInput, 'fail', (nextYear + '/12'));
        // Fail deep past year.
        checkInputs(dateInput, 'fail', '1919/12');
        // Fail bad months.
        checkInputs(dateInput, 'fail', '2022/00/31');
        checkInputs(dateInput, 'fail', '2022/13/31');
        // Fail bad days.
        checkInputs(dateInput, 'fail', '2022/12/0');
        checkInputs(dateInput, 'fail', '2022/12/32');
        // Fail bad hours.
        checkInputs(dateInput, 'fail', '2022/12/31 24:59:59');
        // Fail bad minutes.
        checkInputs(dateInput, 'fail', '2022/12/31 23:60:59');
        // Fail bad seconds.
        checkInputs(dateInput, 'fail', '2022/12/31 23:59:60');
        // Fail non-digits.
        checkInputs(dateInput, 'fail', 'today');
        checkInputs(dateInput, 'fail', '2022/Xmas');
    });

    test("format input passes check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'Format editable metadata value' }));
        const formatInput = screen.getByRole('textbox', { name: 'Format editable metadata value' }) as HTMLInputElement;
        checkInputs(formatInput, 'pass', 'film');
        checkInputs(formatInput, 'pass', 'digital');
    });

    test("format input fails check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'Format editable metadata value' }));
        const formatInput = screen.getByRole('textbox', { name: 'Format editable metadata value' }) as HTMLInputElement;
        // Fail missing 'film' or 'digital'
        checkInputs(formatInput, 'fail', 'digi');
    });


    test("focal length input passes check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'FocalLength editable metadata value' }));
        const fLenInput = screen.getByRole('textbox', { name: 'FocalLength editable metadata value' }) as HTMLInputElement;
        // Pass 'mm' and 'cm' included inputs.
        checkInputs(fLenInput, 'pass', 'mm');
        checkInputs(fLenInput, 'pass', 'cm');
    });
 
    test("focal length fails  passes check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'FocalLength editable metadata value' }));
        const fLenInput = screen.getByRole('textbox', { name: 'FocalLength editable metadata value' }) as HTMLInputElement;
        // Fail missing 'mm' or 'cm' units.
        checkInputs(fLenInput, 'fail', '50');
    });

    test("iso input passes check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'ISO editable metadata value' }));
        const isoInput = screen.getByRole('textbox', { name: 'ISO editable metadata value' }) as HTMLInputElement;
        // Pass numbers larger than 0.
        checkInputs(isoInput, 'pass', '400');
    });

    test("iso input fails check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'ISO editable metadata value' }));
        const isoInput = screen.getByRole('textbox', { name: 'ISO editable metadata value' }) as HTMLInputElement;
        // Fail numbers less than 0.
        checkInputs(isoInput, 'fail', '-35');
        // Fail NaN.
        checkInputs(isoInput, 'fail', 'iso');
    });

    test("camera input passes check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'Camera editable metadata value' }));
        const cameraInput = screen.getByRole('textbox', { name: 'Camera editable metadata value' }) as HTMLInputElement;
        // Pass inputs with 2 or more words (brand and model).
        checkInputs(cameraInput, 'pass', 'Leica M5');
        checkInputs(cameraInput, 'pass', 'iPotato 99XXSL');
    });

    test("camera input fails check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'Camera editable metadata value' }));
        const cameraInput = screen.getByRole('textbox', { name: 'Camera editable metadata value' }) as HTMLInputElement;
        // Fail single words.
        checkInputs(cameraInput, 'fail', 'iPhone');
    });

    test("coordinates input passes check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'Coordinates editable metadata value' }));
        const coordsInput = screen.getByRole('textbox', { name: 'Coordinates editable metadata value' }) as HTMLInputElement;
        // Pass lat between -90, 90 and lng between -180, 180.
        checkInputs(coordsInput, 'pass', '-89.9999991, -179.9999999992');
        checkInputs(coordsInput, 'pass', '89.99999991, 179.9999999992');
    });

    test("coordinates input fails check", async() => {
        await waitFor(() => screen.findByRole('textbox', { name: 'Coordinates editable metadata value' }));
        const coordsInput = screen.getByRole('textbox', { name: 'Coordinates editable metadata value' }) as HTMLInputElement;
        // Fail lat under -90, over 90 and lng under -180, over 180.
        checkInputs(coordsInput, 'fail', '-90.00000001, -180.0000000002');
        checkInputs(coordsInput, 'fail', '90.00000001, 180.000000002');
        // Fail NaN.
        checkInputs(coordsInput, 'fail', '49th parallel');
    });

    test("film, lens, tags input always passes check", async() => {
        await waitFor(() => screen.findAllByRole('textbox'));
        const filmInput = screen.getByRole('textbox', { name: 'Film editable metadata value' }) as HTMLInputElement;
        const lensInput = screen.getByRole('textbox', { name: 'Lens editable metadata value' }) as HTMLInputElement;
        const tagsInput = screen.getByRole('textbox', { name: 'Tags editable metadata value' }) as HTMLInputElement;
        // Passes any kind of string.
        checkInputs(filmInput, 'pass', 'alternative process');
        checkInputs(lensInput, 'pass', 'myopic glasses');
        checkInputs(tagsInput, 'pass', 'jurassic park, alpha centauri, 4th dimension');
    });
});





// describe("shows save status indicators on form submission", () => {
//     test("indicates green check on successful edits", async() => {

//     });

//     test("indicates amber exclamation on issues with submission", async() => {

//     });

//     test("indicates red exclamation on network issues with submission", async() => {

//     });
// })
