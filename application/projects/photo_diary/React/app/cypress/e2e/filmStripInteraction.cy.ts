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

    
    it('flies to image marker on clicking image enlarger locator button', () => {
        cy.visit('http://localhost:3000/');
      
        // Click a thumbnail.
        cy.get('[aria-label="images strip"]')
            .children('div')
            .eq(1)
            .click();

        cy.get('[aria-label="Map"]')
            .as('mapbox');

        cy.get('[aria-label="images strip"]')
            .trigger('mouseleave')

        // Get snapshot of pre-locate view.
        cy.wait(3000)
        
        cy.get('@mapbox')
            .compareSnapshot('base year-bounded map');
     
        // Click on marker locator button.
        cy.get('[aria-label="locate enlarged image on map"]')
            .click();

        // Get snapshot of located view.
        // cy.wait(6000)
        // cy.get('@mapbox')
        //     .compareSnapshot('marker-located map');




    })
})