import { setIdentFellesAction } from 'app/state/actions/IdentActions';
import initialState from './initialState';

describe('Eksisterende søknader pleiepenger', () => {
    before(() => {

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
    });
    it('rendrer', () => {
        cy.visit('/journalpost/200#/pleiepenger/hentsoknader', {
            onBeforeLoad: (window) => {
                window.__initialState__ = initialState;
            },
        });
    });
});
