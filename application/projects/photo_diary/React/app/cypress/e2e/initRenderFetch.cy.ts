describe('initial render', () => {
    it('loads MongoDB API successfully', () => {
        cy.visit('http://localhost:3000/');

        // Verify initial API call fetches data successfully by
        // checking if 'selected year' exists as a year.
        cy.get('[aria-label="selected year"]')
            .invoke('text')
            .should('match', /^(20)\d{2}/);            

        // Verifies image containers in film strip panel are rendered,
        // also meaning API call successful.
        cy.get('[aria-label="images strip"]')
            .children('div')
            .filter('[aria-label="thumbnail image container"]')
            .then((childrenLength) => {
                expect(childrenLength).not.to.equal(0)
            });
    });
});