describe('interactions with mapbox (markers)', () => {
    beforeEach(() => {
        // Run tests in 1080 screen.
        cy.viewport(1920, 1080)
    })

    it('expands stacked markers on click, \
        scrolls film strip to marker\'s image and opens image enlarger', () => {
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

        // Verify selected year is 2022, else click it.
        cy.get('[aria-label="selected year"]')
            .as('selectedYear');

        cy.get('@selectedYear')
            .invoke('text')
            .then((year) => {
                if(!expect(year).to.equal('2022')) {
                    // Click to access 2022 data set.
                    cy.get('[aria-label="selected year"]')
                        .trigger('mouseover');
        
                    cy.wait(500);
                    
                    // Verify visibility year items.
                    cy.get('[aria-label="year selector option"]')
                        .should((elems) => {
                            expect(elems).to.have.length.above(7);   // >7 years as of this test
                            expect(elems).to.be.visible;
                        });

                    // Click on a year.
                    cy.get('[aria-label="year selector option"]')
                        .filter('#year-item-2022')
                        .as('yearItem2022');

                    cy.get('@yearItem2022')
                        .click();

                    // Verify new data fetch.
                    cy.wait('@mapboxAPI')
                        .then((interception) => {
                            expect(interception.response?.statusCode).to.equal(200);
                        });
                }
            });

        // Click a thumbnail.
        cy.get('[aria-label="images strip"]')
            .as('imageStrip')
        cy.get('@imageStrip')
            .children('div')
            .eq(0)
            .click();

        // Verify Mapbox API called to fly to image marker on thumbnail click.
        cy.wait('@mapboxAPI')
            .then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
            });
        
        // Allow map to transition.
        cy.wait(2000);

        // Unhover image strip.
        cy.get('@imageStrip')
            .trigger('mouseleave');

        cy.wait(500);

        // Close enlarger to test its opening on marker clicks..
        cy.get('[aria-label="image enlarger"]')
            .as('imageEnlarger');
        
        cy.get('@imageEnlarger')
            .should((elem) => expect(elem).be.visible);

        cy.get('[aria-label="open image enlarger"]')
            .click();

        cy.wait(500);

        cy.get('@imageEnlarger')
            .should((elem) => expect(elem).not.be.visible);
        /* -------------------------------------------------------------------------------
            Mapbox marker interactions.
            
            View is now in a cluster of images, so we can "target" the marker cluster
            which lives on a Mapbox layer by clicking on its viewport coordinates.

            From there, the marker will expand its spiral rendering DOM elements of 
            individual markers, which can be targeted using conventional means.
        ------------------------------------------------------------------------------- */
        const markerPos = {
            'x': 478,
            'y': 540,
        };

        // Click to expand marker cluster.
        cy.get('[aria-label="Map"]')
            .click(markerPos.x, markerPos.y, { force: true });
        
        // Verify expanded DOM markers rendered.
        cy.get('.spider-leg-pin')
            .as('expandedClusterMarkers')
        
        cy.get('@expandedClusterMarkers')
            .should('exist');

        cy.get('@expandedClusterMarkers')
            .should((markers) => expect(markers).to.have.length(19));

        // Get image to enlarge.
        cy.get('@expandedClusterMarkers')
            .eq(0)
            .as('markerToClick');

        cy.get('@markerToClick')
            .invoke('attr', 'id')
            .should('exist')
            .then((id) => id!.replace('spider-pin__', ''))
            .as('imageToShowId');   // id as string

        // Verify image's thumbnail isn't in view in film strip (to test scrollTo).
        cy.get('@imageToShowId')
            .then((idString) => {
                if (typeof(idString) === 'string') {
                    cy.get('#'.concat(idString))
                        .as('thumbnailToShow');
                }
            });

        cy.get('@thumbnailToShow')
            .should('not.be.visible');

        // Unhover image strip.
        cy.get('@imageStrip')
            .trigger('mouseleave');

        cy.wait(300);

        // Click on marker.
        cy.get('@markerToClick')
            .click();

        // Verify Mapbox API called to fly to image marker on thumbnail click.
        cy.wait('@mapboxAPI')
            .then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
            });

        // Allow map to transition.
        cy.wait(2000);

        // Allow film strip to transition.
        cy.wait(500);

        // Verify film strip scrolled to thumbnail of marker/image.
        cy.get('@thumbnailToShow')
            .should('be.visible');
        
        cy.wait(500);

        // Verify image enlarger panel opened.
        cy.get('@imageEnlarger')
            .should('be.visible');
    });
});