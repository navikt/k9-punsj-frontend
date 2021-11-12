import { setIdentFellesAction } from 'app/state/actions/IdentActions';

describe('Eksisterende søknader pleiepenger', () => {
    before(() => {
        cy.intercept(
            {
                method: 'GET',
                url: '/me',
            },
            JSON.stringify({ name: 'Bobby Binders' })
        );

        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/journalpost/200',
            },
            { fixture: 'journalpost.json' }
        );

        cy.intercept(
            {
                method: 'POST',
                url: '/api/k9-punsj/journalpost/hent',
            },
            JSON.stringify({ poster: [] })
        );
        cy.intercept(
            {
                method: 'GET',
                url: '/api/k9-punsj/pleiepenger-sykt-barn-soknad/mappe',
            },
            JSON.stringify({
                søker: '29099000129',
                fagsakTypeKode: 'PSB',
                søknader: [],
            })
        );

        cy.visit('/');
    });
    it('rendrer', () => {
        cy.window()
            .its('__store__')
            .then((store) => {
                console.log(store);
                store.dispatch(setIdentFellesAction('29099000129', '26121376996'));
            });

            cy.wait(5000)

            cy.visit('/journalpost/200#/pleiepenger/hentsoknader');

    });
});
