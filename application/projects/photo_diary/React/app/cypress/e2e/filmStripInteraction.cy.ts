describe('interactions with film strip panel', () => {
    it('reveals second column on hover', () => {
        cy.visit('http://localhost:3000/');

        cy.get('[aria-label="images strip"]')
            .children('div')
            .eq(1)
            .as('hiddenColumnImage');
        
        // Verify visibility of second image column.
        cy.get('@hiddenColumnImage')
            .then(image => expect(image).not.to.be.visible);           
        
        // (secondColumnImage).not.to.be.visible;

        // Verify hovering over film strip reveals another column.
        cy.get('[aria-label="images strip"]')
            .trigger('mouseover')
        
        // Verify hover revealing second column.
        cy.get('@hiddenColumnImage')
            .then(image => expect(image).to.be.visible); 


       


        
        // cy.get('#6369e853d8f1287884c23ba3')
        //     .then((imageOdd) => 
        //         expect(imageOdd).to.be.visible
        //     );
        
        // cy.get('#6369e853d8f1287884c23ba2')
        //     .then((imageEven) => 
        //         expect(imageEven).to.be.visible    
        //     )

    })
})