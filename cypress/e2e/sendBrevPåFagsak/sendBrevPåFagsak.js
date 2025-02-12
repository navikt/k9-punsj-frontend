import journalpost from '../../fixtures/jpPSB300.json';
import fagsaker from '../../fixtures/fagsaker.json';
import { ApiPath } from 'app/apiConfig';

const fagsak = fagsaker[2];
const validTitle = 'Eksempel på tittel';
const validNote = 'Eksempel på notat';

describe('Send brev på fagsak og lukk oppgave', { testIsolation: false }, () => {
    it('should navigate from homepage', () => {
        cy.visit('/journalpost/300');
        cy.findByText(/Skjul/i).click();
        cy.findByText(/Ja/i).click();
        cy.findByLabelText('Velg fagsak').select(2);

        cy.get('[data-test-id="journalførOgFortsett"]').click();
        cy.get('[data-test-id="klassifiserModalJournalfør"]').click();

        cy.findByText('Send brev og lukk oppgave i LOS').click();
        cy.get('[data-test-id="bekreftKnapp"]').click();
    });

    it('should show brev component', () => {
        cy.findByText('Send brev og lukk oppgave i LOS').should('exist');
        cy.findByLabelText('Velg mal').should('exist');
        cy.findByLabelText('Velg mottaker').should('exist');
        cy.findByLabelText('Send til tredjepart').should('exist');
        cy.findByRole('button', { name: /Send brev/i }).should('exist');
    });

    it('should validate tittel input', () => {
        cy.findByLabelText('Velg mottaker').select(1);
        cy.findByLabelText('Velg mal').select(2);
        cy.findByLabelText('Tittel').type(validTitle);
        cy.findByLabelText('Innhold i brev').type(validNote);
    });

    it('should send brev', () => {
        cy.intercept('POST', ApiPath.BREV_BESTILL, (req) => {
            expect(req.body).to.have.property('soekerId').to.equal(journalpost.norskIdent);
            expect(req.body).to.have.property('mottaker');
            expect(req.body.mottaker).to.have.property('id').to.equal('979312059');
            expect(req.body.mottaker).to.have.property('type').to.equal('ORGNR');
            expect(req.body.journalpostId).to.equal(journalpost.journalpostId);
            expect(req.body).to.have.property('fagsakYtelseType').to.equal(fagsak.sakstype);
            expect(req.body).to.have.property('dokumentMal');
            expect(req.body).to.have.property('dokumentdata');
            expect(req.body.dokumentdata.fritekstbrev).to.have.property('brødtekst').to.equal(validNote);
            expect(req.body.dokumentdata.fritekstbrev).to.have.property('overskrift').to.equal(validTitle);

            req.reply({
                statusCode: 200,
                body: { success: true },
            });
        }).as('sendBrev');

        cy.findByRole('button', { name: /Send brev/i }).as('sendBrevButton');
        cy.get('@sendBrevButton').click();

        cy.findByText('Er du sikker på at du vil sende brevet?').should('exist');

        cy.findByRole('button', { name: /Fortsett/i }).as('fortsettButton');
        cy.get('@fortsettButton').click();

        cy.wait('@sendBrev').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });

        cy.findByText('Brev sendt! Du kan nå sende nytt brev til annen mottaker.').should('exist');
    });

    it('should show error message if sendes same brev', () => {
        cy.findByRole('button', { name: /Send brev/i }).as('sendBrevButton');
        cy.get('@sendBrevButton').click();
        cy.findByRole('button', { name: /Fortsett/i }).as('fortsettButton');
        cy.get('@fortsettButton').click();
        cy.findByText('Brevet er sendt. Du må endre mottaker eller innhold for å sende nytt brev.').should('exist');
    });

    it('should show error ved lukk oppgave', () => {
        cy.intercept(
            'POST',
            ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', journalpost.journalpostId),
            (req) => {
                req.reply({
                    statusCode: 500,
                    body: null,
                });
            },
        ).as('lukkOppgaveError');

        cy.findByRole('button', { name: /Lukk oppgave/i }).click();
        cy.findByText('Er du sikker på at du vil lukke oppgaven?').should('exist');
        cy.findByRole('button', { name: /Fortsett/i }).click();

        cy.wait('@lukkOppgaveError').then((interception) => {
            expect(interception.response.statusCode).to.equal(500);
        });

        cy.findByText('Noe gikk galt ved lukking av oppgave').should('exist');
    });

    it('should lukk oppgave i LOS', () => {
        cy.intercept(
            'POST',
            ApiPath.JOURNALPOST_LUKK_OPPGAVE.replace('{journalpostId}', journalpost.journalpostId),
            (req) => {
                expect(req.body).to.have.property('norskIdent').to.equal(journalpost.norskIdent);
                expect(req.body).to.have.property('sak');
                expect(req.body.sak).to.have.property('fagsakId').to.equal(fagsak.fagsakId);
                expect(req.body.sak).to.have.property('sakstype').to.equal('FAGSAK');

                req.reply({
                    statusCode: 200,
                    body: { success: true },
                });
            },
        ).as('lukkOppgave');

        cy.findByRole('button', { name: /Lukk oppgave/i }).click();
        cy.findByText('Er du sikker på at du vil lukke oppgaven?').should('exist');
        cy.findByRole('button', { name: /Fortsett/i }).click();

        cy.wait('@lukkOppgave').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });

        cy.findByText('Oppgaven er lukket').should('exist');
        cy.findByText('Du blir nå tatt tilbake til oppgavekøen i LOS').should('exist');
        cy.findByRole('button', { name: /Ok/i }).click();
        cy.findByText('Oppgaven er lukket').should('not.exist');
    });
});
