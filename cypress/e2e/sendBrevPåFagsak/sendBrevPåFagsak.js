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

    it('should validate mal select', () => {
        cy.findByRole('button', { name: /Send brev/i }).click();

        cy.findByText('Du må velge mal.').should('exist');
        cy.findByLabelText('Velg mal').select(1);
        cy.findByText('Du må velge mal.').should('not.exist');
    });

    it('should not show tittel if mal not support and show innhold', () => {
        cy.findByText('Tittel').should('not.exist');
        cy.findByText('Innhold i brev').should('exist');
    });

    it('should validate velg mottaker select', () => {
        cy.findByText('Du må velge mottaker.').should('exist');
        cy.findByLabelText('Velg mottaker').select(1);
        cy.findByText('Du må velge mottaker.').should('not.exist');
    });

    it('should validate tittel input', () => {
        cy.findByLabelText('Velg mal').select(2);
        cy.findByRole('button', { name: /Send brev/i }).click();
        cy.findByText('Du må skrive inn tittel.').should('exist');
        cy.findByLabelText('Tittel').type(validTitle);
        cy.findByText('Du må skrive inn tittel.').should('not.exist');
    });

    it('sould validate innhold ibrev input', () => {
        cy.findByText('Du må skrive inn innhold.').should('exist');
        cy.findByLabelText('Innhold i brev').type(validNote);
        cy.findByText('Du må skrive inn innhold.').should('not.exist');
    });

    it('should send correct post for forhåndsvis brev', () => {
        cy.intercept('POST', ApiPath.BREV_FORHAANDSVIS, (req) => {
            expect(req.body).to.have.property('aktørId').to.equal('81549300');
            expect(req.body).to.have.property('avsenderApplikasjon').to.equal('K9PUNSJ');
            expect(req.body).to.have.property('dokumentMal').to.equal('GENERELT_FRITEKSTBREV');
            expect(req.body.dokumentdata.fritekstbrev).to.have.property('overskrift').to.equal(validTitle);
            expect(req.body.dokumentdata.fritekstbrev).to.have.property('brødtekst').to.equal(validNote);
            expect(req.body).to.have.property('eksternReferanse').to.equal(journalpost.journalpostId);
            expect(req.body.overstyrtMottaker.id).to.equal('979312059');
            expect(req.body.overstyrtMottaker.type).to.equal('ORGNR');
            expect(req.body).to.have.property('saksnummer').to.equal(fagsak.fagsakId);
            expect(req.body.ytelseType).to.have.property('kode').to.equal(fagsak.sakstype);
            expect(req.body.ytelseType).to.have.property('kodeverk').to.equal('FAGSAK_YTELSE');

            req.reply({
                statusCode: 200,
            });
        }).as('forhandsvisBrev');

        cy.findByRole('button', { name: /Forhåndsvis brev/i }).click();

        cy.wait('@forhandsvisBrev').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });

        cy.findByText('Not Found').should('not.exist');
    });

    it('should send brev', () => {
        cy.intercept('POST', ApiPath.BREV_BESTILL, (req) => {
            req.reply({
                statusCode: 500,
                body: null,
            });
        }).as('sendBrevError');
        cy.findByRole('button', { name: /Send brev/i }).click();
        cy.findByRole('button', { name: /Fortsett/i }).click();

        cy.wait('@sendBrevError').then((interception) => {
            expect(interception.response.statusCode).to.equal(500);
        });
        cy.findByText(/Sending av brev feilet./i).should('exist');

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

        cy.findByRole('button', { name: /Send brev/i }).click();
        cy.findByText('Er du sikker på at du vil sende brevet?').should('exist');
        cy.findByRole('button', { name: /Fortsett/i }).click();

        cy.wait('@sendBrev').then((interception) => {
            expect(interception.response.statusCode).to.equal(200);
        });

        cy.findByText('Brev sendt! Du kan nå sende nytt brev til annen mottaker.').should('exist');
    });

    it('shout show error message if sendes same brev', () => {
        cy.findByRole('button', { name: /Send brev/i }).click();
        cy.findByRole('button', { name: /Fortsett/i }).click();
        cy.findByText('Brev sendt! Du kan nå sende nytt brev til annen mottaker.').should('not.exist');
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
