describe('interactions with film strip panel', () => {
    it('reveals second images column on hover', () => {
        cy.visit('http://localhost:3000/');

        cy.get('[aria-label="images strip"]')
            .children('div')
            .eq(1)
            .as('hiddenColumnImage');
        
        // Verify visibility of second image column.
        cy.get('@hiddenColumnImage')
            .then(image => expect(image).not.to.be.visible);           
        
        // Verify hovering over film strip reveals another column.
        cy.get('[aria-label="images strip"]')
            .trigger('mouseover')
        
        // Verify hover revealing second column.
        cy.get('@hiddenColumnImage')
            .then(image => expect(image).to.be.visible); 
    });


    it('opens image enlarger and displays correct image on film strip thumbnail clicks', () => {
        cy.visit('http://localhost:3000/');

        // Verify image enlarger is hidden when nothing to "enlarge".
        cy.get('[aria-label="image enlarger"]')
            .as('imageEnlarger');
        
        cy.get('@imageEnlarger')
            .should((elem) => expect(elem).not.to.be.visible);

        // Get thumbnail src for comparision later.
        cy.get('[aria-label="images strip"]')
            .children('div')
            .eq(0)
            .as('thumbnailToClick');

        cy.get('@thumbnailToClick')
            .children('img')
            .first()
            .invoke('attr', 'src')
            .as('thumbnailClickedSrc');

        // Click thumbnail.
        cy.get('@thumbnailToClick')
            .click();

        // Verify image enlarger opened.
        cy.get('@imageEnlarger')
            .should((elem) => expect(elem).to.be.visible);
        
        // Get enlarged image's src.
        cy.get('[aria-label="enlarged image"]')
            .invoke('attr', 'src')
            .as('enlargedImageSrc');

        // Verify thumbnail shows enlarged version.
        cy.get('@thumbnailClickedSrc')
            .then((thumbnailSrc) => {
                const enlargedImageShouldEqual = thumbnailSrc.replace('thumbs', 'images');

                cy.get('@enlargedImageSrc')
                    .then((enlargedSrc) => 
                        expect(enlargedSrc).to.equal(enlargedImageShouldEqual)
                    )
            });
    });

    
    it('flies to image marker on clicking thumbnail, prev/next arrow buttons', () => {
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

        // Click a thumbnail.
        cy.get('[aria-label="images strip"]')
            .as('imageStrip')
        cy.get('@imageStrip')
            .children('div')
            .eq(1)
            .click();

        // Verify Mapbox API called to fly to image marker on thumbnail click.
        cy.wait('@mapboxAPI')
            .then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
            });

        // Allow map to transition.
        cy.wait(2000);

        // Get initial image source.
        cy.get('[aria-label="enlarged image"')
            .invoke('attr', 'src')
            .as('initialImageSrc');

        // Unhover image strip.
        cy.get('@imageStrip')
            .trigger('mouseleave');

        cy.wait(500);

        // Click on image nav button, left arrow (previous image).
        cy.get('[aria-label="show previous image"]')
            .as('previousArrowButton');
        
        cy.get('@previousArrowButton')
            .click();

        // Verify Mapbox API called to fly to image marker on nav button click.
        cy.wait('@mapboxAPI')
            .then((interception) => {
                expect(interception.response?.statusCode).to.equal(200);
            });

        // Allow map to transition.
        cy.wait(2000);

        // Get current image source.
        cy.get('[aria-label="enlarged image"')
            .invoke('attr', 'src')
            .as('currentImageSrc');

        // Verify enlarged image changed.
        cy.get('@currentImageSrc')
            .then((currentSrc) => {
                cy.get('@initialImageSrc')
                    .then((initSrc) => expect(initSrc).not.to.equal(currentSrc))
            })
    })
})