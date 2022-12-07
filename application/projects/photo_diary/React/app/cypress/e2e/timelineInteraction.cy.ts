describe('interactions with timeline menu bar', () => {
    it('reveals year items on hovering over year,\
        fetches new data on clicking year item', () => {
        // Listen to fetch calls to Mapbox.
        cy.intercept('GET', 'https://api.mapbox.com/**/*')
            .as('mapboxAPI');

        cy.visit('http://localhost:3000/');

        // Verify initial map load successful.
        cy.wait('@mapboxAPI')
            .then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
            });

        // Allow map to transition.
        cy.wait(2000);

        cy.get('[aria-label="selected year"]')
            .trigger('mouseover');

        cy.wait(500);
        
        // Verify visibility year items.
        cy.get('[aria-label="year selector option"]')
            .should((elems) => {
                expect(elems).to.have.length.above(7);   // >7 years as of this test
                expect(elems).to.be.visible;
            });      
        
        // Get number of images from counter.
        cy.get('[aria-label="month selector option"]')
            .filter('#month-item-all')
            .as('allImagesCountElem');

        cy.get('@allImagesCountElem')
            .invoke('text')
            .then((text) => text.replace(/\D/g, ''))
            .as('initAllImagesCount');

        // Click on a year.
        cy.get('[aria-label="year selector option"]')
            .filter('#year-item-2018')
            .as('yearItem2018');

        cy.get('@yearItem2018')
            .click();

        // Verify new data fetch.
        cy.wait('@mapboxAPI')
            .then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
            });

        // Allow map to transition.
        cy.wait(2000);

        // Verify updated to new dataset.
        cy.get('@allImagesCountElem')
            .invoke('text')
            .then((text) => text.replace(/\D/g, ''))
            .as('newAllImagesCount');

        cy.get('@initAllImagesCount')
            .then((initCount) => {
                cy.get('@newAllImagesCount')
                    .then((newCount) => expect(initCount).not.to.equal(newCount));
            });
    });


    it('fetches month-filtered data set on clicking month item', () => {
        // Listen to fetch calls to Mapbox.
        cy.intercept('GET', 'https://api.mapbox.com/**/*')
            .as('mapboxAPI');

        cy.visit('http://localhost:3000/');

        // Verify initial map load successful.
        cy.wait('@mapboxAPI')
            .then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
            });

        // Allow map to transition.
        cy.wait(2000);

        // Click on a month: May.
        cy.get('[aria-label="month selector"]')
            .children('div')
            .eq(5)
            .as('maySelector');

        cy.get('@maySelector')
            .click();

        cy.wait(500);

        // Verify map bound method triggered for new data set.
        cy.wait('@mapboxAPI')
            .then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
            });
    });
});