describe('interactions with filter panel', () => {
    it('filters and fetches resulting data on filter button clicks, \
    enables filter reset button on filters activation, \
    clears all active filters on reset button click', () => {
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

        // Get image counts for default year.
        cy.get('[aria-label="month selector"]')
            .children('div')
            .eq(0)
            .invoke('text')
            .then((text) => text.replace(/\D/g, ''))
            .as('defaultImagesCount');

        // Open filter drawer.
        cy.get('[aria-label="open filter drawer"]')
            .click();

        // Wait for transition.
        cy.wait(500);

        // Verify filter panel is open.
        cy.get('[aria-label="filters menu"]')
            .then((elem) => expect(elem).to.be.visible);

        // Verify filter reset button disabled.
        cy.get('.FilterDrawer__reset.unavailable')
            .should('exist');

        // Get a film option to click.
        cy.get('[aria-label="film filter option"]')
            .eq(1)
            .as('filterFilmOption')
        
        cy.get('@filterFilmOption')
            .click();

        // Verify new bounds on filtered data.
        cy.wait('@mapboxAPI')
            .then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
            });

        // Allow map to transition.
        cy.wait(2000);

        // Verify updated images count.
        cy.get('[aria-label="month selector"]')
            .children('div')
            .eq(0)
            .invoke('text')
            .then((text) => text.replace(/\D/g, ''))
            .as('filteredImagesCount');

        cy.get('@defaultImagesCount')
            .then((defaultCount) => {
                cy.get('@filteredImagesCount')
                    .then((filteredCount) => expect(defaultCount).not.to.be.equal(filteredCount));
            });

        // Verify filter reset button enabled.
        cy.get('.FilterDrawer__reset.unavailable')
            .should('not.exist');

        // Click now-enabled filter reset button.
        cy.get('[aria-label="reset filters"]')
            .click();

        // Verify new bounds on returning to default data.
        cy.wait('@mapboxAPI')
            .then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
            });

        // Allow map to transition.
        cy.wait(2000);

        // Allow count to transition.
        cy.wait(1000);

        // Verify images count matches default count.
        cy.get('[aria-label="month selector"]')
            .children('div')
            .eq(0)
            .invoke('text')
            .then((text) => text.replace(/\D/g, ''))
            .as('filterClearedImagesCount');

        cy.get('@defaultImagesCount')
            .then((defaultCount) => {
                cy.get('@filterClearedImagesCount')
                    .then((clearedCount) => expect(defaultCount).to.be.equal(clearedCount));
            });
    });
})