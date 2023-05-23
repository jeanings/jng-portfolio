import React from 'react';
import * as reactRedux from 'react-redux';
import { Provider } from 'react-redux';
import { setupStore, RootState } from '../../app/store';
import { 
    cleanup, 
    render, 
    screen, 
    waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { updateUrl } from '../../app/App';
import { 
    preloadedState, 
    preloadedStateEditor,
    preloadedStateEditorOwner } from '../../utils/testHelpers';
import SideFilmStrip from '../SideFilmStrip/SideFilmStrip';
import TimelineBar from '../TimelineBar/TimelineBar';
import { EnhancedStore } from '@reduxjs/toolkit';

var mockAxios = new MockAdapter(axios);
var user = userEvent.setup();


beforeEach(() => {
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
    cleanup;
    mockAxios.reset();
    jest.clearAllMocks();
    jest.restoreAllMocks();
});

afterAll(() => {
    cleanup;
    mockAxios.reset();
    jest.clearAllMocks();
    jest.restoreAllMocks();
});


/* --------------------------------------
    Boilerplate for rendering document.
-------------------------------------- */
function renderBoilerplate(preloadedState: RootState) {
    const newStore = setupStore(preloadedState);
    const container = render(
        <Provider store={newStore}>
            <MemoryRouter>
                <SideFilmStrip />
            </MemoryRouter>
        </Provider>
    );
    return { ...container, newStore };
}


test("shows edit form, input if user is editor and owner of doc", async() => {
    const { newStore } = renderBoilerplate(preloadedStateEditorOwner);

    // Verify editor is owner of collection.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('editor');
    const mockUser = newStore.getState().login.user;
    const docOwner = newStore.getState().timeline.imageDocs![0].owner;
    expect(mockUser?._id).toEqual(docOwner);
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image' });
    const imageToClick = imageFrameElems[0];
    await user.click(imageToClick);

    // Verify form is enabled/exists.
    await waitFor(() => screen.findByRole('form', { name: 'edit form of metadata for enlarged image' }));
    const formForEdit = screen.getByRole('form', { name: 'edit form of metadata for enlarged image' });
    expect(formForEdit).toBeInTheDocument();

    // Verify inputs are displayed.
    const formInputs = screen.queryAllByRole('textbox');
    expect(formInputs).not.toEqual(null);
});


test("shows edit UI buttons if user is editor and owner of doc", async() => {
    const { newStore } = renderBoilerplate(preloadedStateEditorOwner);

    // Verify editor is owner of collection.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('editor');
    const mockUser = newStore.getState().login.user;
    const docOwner = newStore.getState().timeline.imageDocs![0].owner;
    expect(mockUser?._id).toEqual(docOwner);
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image' });
    const imageToClick = imageFrameElems[0];
    const imageToClickId = imageToClick.getAttribute('id');
    console.log(imageToClickId);
    await user.click(imageToClick);

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
    const { newStore } = renderBoilerplate(preloadedStateEditor);

    // Verify user is editor.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('editor');

    // Verify user is not owner of collection.
    const mockUser = newStore.getState().login.user;
    const docOwner = newStore.getState().timeline.imageDocs![0].owner;
    expect(mockUser?._id).not.toEqual(docOwner);
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image' });
    const imageToClick = imageFrameElems[0];
    await user.click(imageToClick);

    // Verify form is not enabled.
    const formForEdit = screen.queryByRole('form');
    expect(formForEdit).toEqual(null);
});


test("does not show edit form if user is not editor", async() => {
    const { newStore } = renderBoilerplate(preloadedState);

    // Verify user is viewer.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('viewer');
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image' });
    const imageToClick = imageFrameElems[0];
    await user.click(imageToClick);

    // Verify form is not enabled.
    const formForEdit = screen.queryByRole('form');
    expect(formForEdit).toEqual(null);
});


test("does not show edit UI buttons if user is viewer", async() => {
    const { newStore } = renderBoilerplate(preloadedState);

    // Verify editor is owner of collection.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('viewer');
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image' });
    const imageToClick = imageFrameElems[0];
    await user.click(imageToClick);

    // Verify editor UI buttons hidden.
    const saveEditsButton = screen.queryByRole('button', { name: 'save metadata edits on image' });
    const clearEditsButton = screen.queryByRole('button', { name: 'clear metadata form edits' } );
    expect(saveEditsButton).toEqual(null);
    expect(clearEditsButton).toEqual(null);
});


test("enables submit button on input existence", async() => {
    const { newStore } = renderBoilerplate(preloadedStateEditorOwner);

    // Verify editor is owner of collection.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('editor');
    const mockUser = newStore.getState().login.user;
    const docOwner = newStore.getState().timeline.imageDocs![0].owner;
    expect(mockUser?._id).toEqual(docOwner);
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image' });
    const imageToClick = imageFrameElems[0];
    await user.click(imageToClick);

    // Verify inputs are displayed.
    await waitFor(() => screen.findAllByRole('textbox'));
    const formInputs = screen.queryAllByRole('textbox');
    expect(formInputs).not.toEqual(null);

    // Verify submission displayed.
    const saveEditsButton = screen.getByRole('button', { name: 'save metadata edits on image' });
    
    // Verify onClick disabled for submit button.
    expect(saveEditsButton.onclick).toEqual(null);

    // Type in some input.
    const dateInput = formInputs[0];
    await user.type(dateInput, '2022/06');

    // Verify onClick enabled.
    await waitFor(() => expect(dateInput).toHaveValue('2022/06'));
    expect(saveEditsButton.onclick).not.toEqual(null);
});


test("enables clear edits button on input existence", async() => {
    const { newStore } = renderBoilerplate(preloadedStateEditorOwner);

    // Verify editor is owner of collection.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('editor');
    const mockUser = newStore.getState().login.user;
    const docOwner = newStore.getState().timeline.imageDocs![0].owner;
    expect(mockUser?._id).toEqual(docOwner);
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image' });
    const imageToClick = imageFrameElems[0];
    await user.click(imageToClick);

    // Verify inputs are displayed.
    await waitFor(() => screen.findAllByRole('textbox'));
    const formInputs = screen.queryAllByRole('textbox');
    expect(formInputs).not.toEqual(null);

    // Verify editor UI buttons displayed.
    const clearEditsButton = screen.getByRole('button', { name: 'clear metadata form edits' });

    // Type in some input.
    const dateInput = formInputs[0] as HTMLInputElement;
    await user.type(dateInput, '2022/06');

    // Verify data in input.
    await waitFor(() => expect(dateInput.value).toEqual('2022/06'));

    // Clear edits.
    await user.click(clearEditsButton);
    
    // Verify input cleared.
    await waitFor(() => expect(dateInput.value).toEqual(''));
});


test("dispatches action on form submission", async() => {
    mockAxios = new MockAdapter(axios);
    mockAxios
            .onAny(updateUrl)
            .reply(200, {
                'updateStatus': 'successful',
                'updatedDoc': {...preloadedStateEditorOwner.timeline.imageDocs![0],
                    'format': {
                        'medium': 'film',
                        'type': 'some sheet'
                    }
                },
                'updateMessage': 'All (mocked) edits OK!'
            });

    const { newStore } = renderBoilerplate(preloadedStateEditorOwner);

    // Verify editor is owner of collection.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('editor');
    const mockUser = newStore.getState().login.user;
    const docOwner = newStore.getState().timeline.imageDocs![0].owner;
    expect(mockUser?._id).toEqual(docOwner);
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image' });
    const imageToClick = imageFrameElems[0];
    await user.click(imageToClick);

    // Verify inputs are displayed.
    await waitFor(() => screen.findAllByRole('textbox'));
    const formInputs = screen.queryAllByRole('textbox');
    await waitFor(() => expect(formInputs).not.toEqual(null));

    // Verify submission button displayed.
    const saveEditsButton = screen.getByRole('button', { name: 'save metadata edits on image' });
    // Verify update status idle.
    expect(newStore.getState().editor.response).toEqual('idle');

    // Type in some input.
    const dateInput = formInputs[0] as HTMLInputElement;
    await user.type(dateInput, '2022/06');

    // Submit edit.
    await waitFor(() => expect(saveEditsButton.onclick).not.toEqual(null));
    await user.click(saveEditsButton);
    
    // Verify dispatch/fetch.
    await waitFor(() => expect(newStore.getState().editor.response).not.toEqual('idle'));
});


test("clears inputs on changing enlarged image", async() => {
    const { newStore } = renderBoilerplate(preloadedStateEditorOwner);

    // Verify editor is owner of collection.
    expect(newStore.getState().timeline.imageDocs).not.toBeNull();
    expect(newStore.getState().login.role).toEqual('editor');
    const mockUser = newStore.getState().login.user;
    const docOwner = newStore.getState().timeline.imageDocs![0].owner;
    expect(mockUser?._id).toEqual(docOwner);
    
    // Enlarge an image.
    await waitFor(() => screen.findAllByRole('img', { name: 'thumbnail image' }));
    const imageFrameElems = screen.getAllByRole('img', { name: 'thumbnail image' });
    const imageToClick = imageFrameElems[0];
    await user.click(imageToClick);

    // Verify inputs are displayed.
    await waitFor(() => screen.findAllByRole('textbox'));
    const formInputs = screen.queryAllByRole('textbox');
    await waitFor(() => expect(formInputs).not.toEqual(null));

    // Type in some input.
    const dateInput = formInputs[0] as HTMLInputElement;
    await user.type(dateInput, '2022/06');
    await waitFor(() => expect(dateInput.value).toEqual('2022/06'));

    // Change enlarged doc.
    await user.click(imageFrameElems[1]);
    
    // Verify inputs cleared.
    await waitFor(() => expect(dateInput.value).toEqual(''));
});


describe("on input blur, input formatting gets checked", () => {
    /* --------------------------
        Helper: initial tests.
    -------------------------- */
    const doMoreBoilerPlate = (newStore: EnhancedStore) => {
        // Verify editor and owner.
        expect(newStore.getState().timeline.imageDocs).not.toBeNull();
        expect(newStore.getState().login.role).toEqual('editor');
        const mockUser = newStore.getState().login.user;
        const docOwner = newStore.getState().timeline.imageDocs![0].owner;
        expect(mockUser?._id).toEqual(docOwner);

        const imageToClick = screen.getAllByRole('img', { name: 'thumbnail image'})[0];
        return { imageToClick };
    };

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
    });

    afterEach(() => {
        cleanup;
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    afterAll(() => {
        cleanup;
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });
    
    /* -------------------------------
        Helper: input check process.
    ------------------------------- */
    const checkInputs = async(inputElem: HTMLInputElement, testType: 'pass' | 'fail', input: string) => {
        // Type and wait for input.
        inputElem.focus();
        await user.type(inputElem, input);
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
        inputElem.focus();
        await user.clear(inputElem);
        await waitFor(() => expect(inputElem).toHaveValue(''));
    };


    test("date input passes check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Date editable metadata value' }));
        const dateInput = screen.getByRole('textbox', { name: 'Date editable metadata value' }) as HTMLInputElement;
        await checkInputs(dateInput, 'pass', '2022/12');
        await checkInputs(dateInput, 'pass', '2022/12/31');
        await checkInputs(dateInput, 'pass', '2022/12/31 23:59:59');
    });

    test("date input fails check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Date editable metadata value' }));
        const dateInput = screen.getByRole('textbox', { name: 'Date editable metadata value' }) as HTMLInputElement;
        const today = new Date();
        const [ nextYear, thisMonth, thisDay ] = [ 
            today.getFullYear() + 1, 
            today.getMonth() + 1,   // getMonth() indexes January as 0.
            today.getDate()
        ];

        // Fail year only.
        await checkInputs(dateInput, 'fail', '2022');
        // Fail future year.
        await checkInputs(dateInput, 'fail', (nextYear + '/12'));
        // Fail deep past year.
        await checkInputs(dateInput, 'fail', '1919/12');
        // Fail bad months.
        await checkInputs(dateInput, 'fail', '2022/00/31');
        await checkInputs(dateInput, 'fail', '2022/13/31');
        // Fail bad days.
        await checkInputs(dateInput, 'fail', '2022/12/0');
        await checkInputs(dateInput, 'fail', '2022/12/32');
        // Fail bad hours.
        await checkInputs(dateInput, 'fail', '2022/12/31 24:59:59');
        // Fail bad minutes.
        await checkInputs(dateInput, 'fail', '2022/12/31 23:60:59');
        // Fail bad seconds.
        await checkInputs(dateInput, 'fail', '2022/12/31 23:59:60');
        // Fail non-digits.
        await checkInputs(dateInput, 'fail', 'today');
        await checkInputs(dateInput, 'fail', '2022/Xmas');
    });

    test("format input passes check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Format editable metadata value' }));
        const formatInput = screen.getByRole('textbox', { name: 'Format editable metadata value' }) as HTMLInputElement;
        await checkInputs(formatInput, 'pass', 'film');
        await checkInputs(formatInput, 'pass', 'digital');
    });

    test("format input fails check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Format editable metadata value' }));
        const formatInput = screen.getByRole('textbox', { name: 'Format editable metadata value' }) as HTMLInputElement;
        // Fail missing 'film' or 'digital'
        await checkInputs(formatInput, 'fail', 'digi');
    });


    test("focal length input passes check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'FocalLength editable metadata value' }));
        const fLenInput = screen.getByRole('textbox', { name: 'FocalLength editable metadata value' }) as HTMLInputElement;
        // Pass 'mm' and 'cm' included inputs.
        await checkInputs(fLenInput, 'pass', 'mm');
        await checkInputs(fLenInput, 'pass', 'cm');
    });
 
    test("focal length fails  passes check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'FocalLength editable metadata value' }));
        const fLenInput = screen.getByRole('textbox', { name: 'FocalLength editable metadata value' }) as HTMLInputElement;
        // Fail missing 'mm' or 'cm' units.
        await checkInputs(fLenInput, 'fail', '50');
    });

    test("iso input passes check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'ISO editable metadata value' }));
        const isoInput = screen.getByRole('textbox', { name: 'ISO editable metadata value' }) as HTMLInputElement;
        // Pass numbers larger than 0.
        await checkInputs(isoInput, 'pass', '400');
    });

    test("iso input fails check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'ISO editable metadata value' }));
        const isoInput = screen.getByRole('textbox', { name: 'ISO editable metadata value' }) as HTMLInputElement;
        // Fail numbers less than 0.
        await checkInputs(isoInput, 'fail', '-35');
        // Fail NaN.
        await checkInputs(isoInput, 'fail', 'iso');
    });

    test("camera input passes check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Camera editable metadata value' }));
        const cameraInput = screen.getByRole('textbox', { name: 'Camera editable metadata value' }) as HTMLInputElement;
        // Pass inputs with 2 or more words (brand and model).
        await checkInputs(cameraInput, 'pass', 'Leica M5');
        await checkInputs(cameraInput, 'pass', 'iPotato 99XXSL');
    });

    test("camera input fails check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Camera editable metadata value' }));
        const cameraInput = screen.getByRole('textbox', { name: 'Camera editable metadata value' }) as HTMLInputElement;
        // Fail single words.
        await checkInputs(cameraInput, 'fail', 'iPhone');
    });

    test("coordinates input passes check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Coordinates editable metadata value' }));
        const coordsInput = screen.getByRole('textbox', { name: 'Coordinates editable metadata value' }) as HTMLInputElement;
        // Pass lat between -90, 90 and lng between -180, 180.
        await checkInputs(coordsInput, 'pass', '-89.9999991, -179.9999999992');
        await checkInputs(coordsInput, 'pass', '89.99999991, 179.9999999992');
    });

    test("coordinates input fails check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Coordinates editable metadata value' }));
        const coordsInput = screen.getByRole('textbox', { name: 'Coordinates editable metadata value' }) as HTMLInputElement;
        // Fail lat under -90, over 90 and lng under -180, over 180.
        await checkInputs(coordsInput, 'fail', '-90.00000001, -180.0000000002');
        await checkInputs(coordsInput, 'fail', '90.00000001, 180.000000002');
        // Fail NaN.
        await checkInputs(coordsInput, 'fail', '49th parallel');
    });

    test("film, lens, tags input always passes check", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findAllByRole('textbox'));
        const filmInput = screen.getByRole('textbox', { name: 'Film editable metadata value' }) as HTMLInputElement;
        const lensInput = screen.getByRole('textbox', { name: 'Lens editable metadata value' }) as HTMLInputElement;
        const tagsInput = screen.getByRole('textbox', { name: 'Tags editable metadata value' }) as HTMLInputElement;
        // Passes any kind of string.
        await checkInputs(filmInput, 'pass', 'alternative process');
        await checkInputs(lensInput, 'pass', 'myopic glasses');
        await checkInputs(tagsInput, 'pass', 'jurassic park, alpha centauri, 4th dimension');
    });
});


describe("shows save status indicators on form submission", () => {
    /* --------------------------
        Helper: initial tests.
    -------------------------- */
    const doMoreBoilerPlate = (newStore: EnhancedStore) => {
        // Verify editor and owner.
        expect(newStore.getState().timeline.imageDocs).not.toBeNull();
        expect(newStore.getState().login.role).toEqual('editor');
        const mockUser = newStore.getState().login.user;
        const docOwner = newStore.getState().timeline.imageDocs![0].owner;
        expect(mockUser?._id).toEqual(docOwner);

        const imageToClick = screen.getAllByRole('img', { name: 'thumbnail image'})[0];
        return { imageToClick };
    };

    beforeEach(() => {
        /* --------------------------------------------------------
            Mocks                                          start
        -------------------------------------------------------- */
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
        /* --------------------------------------------------------
            Mocks                                            end
        -------------------------------------------------------- */
    });

    afterEach(() => {
        cleanup;
        mockAxios.reset();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    afterAll(() => {
        cleanup;
        mockAxios.reset();
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });


    test("indicates green check on successful edits", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Format editable metadata value' }));
        const formatInput = screen.getByRole('textbox', { name: 'Format editable metadata value' });

        // Enter an accepted input.
        const input = 'some sheet film';
        formatInput.focus();
        await user.type(formatInput, input);
        await waitFor(() => expect(formatInput).toHaveValue(input), { timeout: 9000 });

        // Mocked Axios calls.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onAny(updateUrl)
            .reply(200, {
                'updateStatus': 'successful',
                'updatedDoc': {...preloadedStateEditorOwner.timeline.imageDocs![0],
                    'format': {
                        'medium': 'film',
                        'type': 'some sheet'
                    }
                },
                'updateMessage': 'All (mocked) edits OK!'
            });

        // Save (dispatch fetch) to update doc.
        const saveInputButton = screen.getByRole('button', { name: 'save metadata edits on image' });
        await user.click(saveInputButton);
        
        // Verify request successful.
        await waitFor(() => expect(newStore.getState().editor.message).not.toEqual(null));
        expect(mockAxios.history.patch.length).toEqual(1);
        expect(newStore.getState().editor.response).toEqual('successful');

        // Indicator style change to green.
        const responseIndicator = screen.getByRole('button', { name: 'metadata edit status' });
        expect(responseIndicator).toHaveClass('green');

        // Cleanup.
        formatInput.focus();
        await user.clear(formatInput);
        await waitFor(() => expect(formatInput).toHaveValue(''));
    });

    test("indicates amber exclamation on issues with submission", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Camera editable metadata value' }));
        const cameraInput = screen.getByRole('textbox', { name: 'Camera editable metadata value' });

        // Enter a incorrectly formatted input.
        // Still goes through but backend will not update that field.
        const input = 'iPhone';
        cameraInput.focus();
        await user.type(cameraInput, input);
        await waitFor(() => expect(cameraInput).toHaveValue(input), { timeout: 9000 });

        // Mocked Axios calls.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onAny(updateUrl)
            .reply(200, {
                'updateStatus': 'passed with error',
                'updatedDoc': preloadedStateEditorOwner.timeline.imageDocs![0],
                'updateMessage': 'Some (mocked) edit(s) in wrong format.'
            });

        // Save (dispatch fetch) to update doc.
        const saveInputButton = screen.getByRole('button', { name: 'save metadata edits on image' });
        await user.click(saveInputButton);
        
        // Verify request successful.
        await waitFor(() => expect(newStore.getState().editor.message).not.toEqual(null));
        expect(mockAxios.history.patch.length).toEqual(1);
        expect(newStore.getState().editor.response).toEqual('passed with error');

        // Indicator style change to green.
        const responseIndicator = screen.getByRole('button', { name: 'metadata edit status' });
        expect(responseIndicator).toHaveClass('amber');

        // Cleanup.
        cameraInput.focus();
        await user.clear(cameraInput);
        await waitFor(() => expect(cameraInput).toHaveValue(''));
    });

    test("indicates red exclamation on request/auth issues with submission", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'ISO editable metadata value' }));
        const isoInput = screen.getByRole('textbox', { name: 'ISO editable metadata value' });

        // Enter an input.
        const input = '50';
        isoInput.focus();
        await user.type(isoInput, input);
        await waitFor(() => expect(isoInput).toHaveValue(input), { timeout: 9000 });

        // Mocked Axios calls.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onAny(updateUrl)
            .reply(401, {
                'updateStatus': 'Error: Not authorized.'
            });

        // Save (dispatch fetch) to update doc.
        const saveInputButton = screen.getByRole('button', { name: 'save metadata edits on image' });
        await user.click(saveInputButton);
        
        // Verify request successful.
        await waitFor(() => expect(newStore.getState().editor.message).not.toEqual(null));
        expect(mockAxios.history.patch.length).toEqual(1);
        expect(newStore.getState().editor.response).toEqual('failed');

        // Indicator style change to green.
        await waitFor(() => screen.findByRole('button', { name: 'metadata edit status' }));
        const responseIndicator = screen.getByRole('button', { name: 'metadata edit status' });
        expect(responseIndicator).toHaveClass('red');

        // Cleanup.
        isoInput.focus();
        await user.clear(isoInput);
        await waitFor(() => expect(isoInput).toHaveValue(''));
    });

    test("shows updated metadata after successful edit", async() => {
        const { newStore } = renderBoilerplate(preloadedStateEditorOwner);
        const { imageToClick } = doMoreBoilerPlate(newStore);
        await user.click(imageToClick);
        await waitFor(() => screen.findByRole('textbox', { name: 'Film editable metadata value' }));
        const filmInput = screen.getByRole('textbox', { name: 'Film editable metadata value' }) as HTMLInputElement;

        // Confirm original placeholder text.
        expect(filmInput.placeholder).toEqual(preloadedStateEditorOwner.timeline.imageDocs![0].film);

        // Enter an accepted input.
        const updateToThisInput = 'Fujimockedfilm Superia 400';
        await user.type(filmInput, updateToThisInput);
        await waitFor(() => expect(filmInput.value).toEqual(updateToThisInput));

        // Mocked Axios calls.
        mockAxios = new MockAdapter(axios);
        mockAxios
            .onAny(updateUrl)
            .reply(200, {
                'updateStatus': 'successful',
                'updatedDoc': {...preloadedStateEditorOwner.timeline.imageDocs![0],
                    'film': updateToThisInput
                },
                'updateMessage': 'All (mocked) edits OK!'
            })

        // Save (dispatch fetch) to update doc.
        const saveInputButton = screen.getByRole('button', { name: 'save metadata edits on image' });
        await user.click(saveInputButton);
        
        // Verify request successful.
        await waitFor(() => expect(newStore.getState().editor.message).not.toEqual(null));
        expect(mockAxios.history.patch.length).toEqual(1);
        expect(newStore.getState().editor.message).toEqual('All (mocked) edits OK!');

        // Verify updated metadata view.
        expect(filmInput.placeholder).not.toEqual(preloadedStateEditorOwner.timeline.imageDocs![0].film);
        expect(filmInput.placeholder).toEqual(updateToThisInput);

        // Cleanup.
        filmInput.focus();
        await user.clear(filmInput);
        await waitFor(() => expect(filmInput).toHaveValue(''));
    });
});
