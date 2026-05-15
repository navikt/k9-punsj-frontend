import { ApiPath } from 'app/apiConfig';

const TEST_DATA = {
    fnr: '08438323288',
    fnrTomtFagsaker: '17519112922',
    fnrWithError: '05508239132',
    journalpostId: '200',
    illegalChars: '^|~{}[]ñçßøå',
    validTitle: 'Eksempel på tittel',
    validNote: 'Eksempel på notat',
};

const åpneBrevside = () => {
    cy.visit('/brev-avsluttet-sak');
    cy.findByText('Send brev i avsluttet sak').should('exist');
};

const fyllInnGyldigFnr = () => {
    cy.findByLabelText('Søkers fødselsnummer').clear().type(TEST_DATA.fnr);
    cy.findByLabelText('Velg fagsak').should('not.be.disabled');
    cy.findByLabelText('Velg fagsak').find('option').its('length').should('be.greaterThan', 1);
};

const velgGyldigFagsak = () => {
    fyllInnGyldigFnr();
    cy.findByLabelText('Velg fagsak').select('1DMU93A');
    cy.findByLabelText('Velg mal').should('exist');
    cy.findByLabelText('Velg mottaker').should('exist');
    cy.findByLabelText('Send til tredjepart').should('exist');
};

const velgGyldigMottaker = () => {
    cy.findByLabelText('Velg mottaker').find('option').its('length').should('be.greaterThan', 1);
    cy.findByLabelText('Velg mottaker').select('81549300');
};

const fyllInnGyldigBrev = () => {
    velgGyldigFagsak();
    cy.findByLabelText('Velg mal').select('GENERELT_FRITEKSTBREV');
    cy.findByLabelText('Send til tredjepart').click();
    cy.findByLabelText('Organisasjonsnummer').type('889640782');
    cy.findByText('Test Navn').should('exist');
    cy.findByLabelText('Tittel').type(TEST_DATA.validTitle);
    cy.findByLabelText('Innhold i brev').type(TEST_DATA.validNote);
};

describe('Send brev i avsluttet sak', () => {
    describe('Navigering', () => {
        it('skal navigere fra hovedsiden til brevkomponent', () => {
            cy.visit('/');
            cy.findByTestId('brev-avsluttet-sak-inngang').click();
            cy.url().should('contains', '/brev-avsluttet-sak');
            cy.findByText('Send brev i avsluttet sak').should('exist');
        });
    });

    describe('Test av brev', () => {
        beforeEach(() => {
            åpneBrevside();
        });

        it('skal validere fødselsnummer format og lengde', () => {
            const fnrInput = cy.findByLabelText('Søkers fødselsnummer');

            fnrInput.type('1');
            cy.findByText('Søkers fødselsnummer må være 11 siffer.').should('exist');

            fnrInput.type('1'.repeat(11));
            cy.findByText('Søkers fødselsnummer er ugyldig.').should('exist');

            fnrInput.clear();
            cy.findByText('Du må skrive inn søkers fødselsnummer.').should('exist');
            fnrInput.type(TEST_DATA.fnrTomtFagsaker);
            cy.findByText('Du må skrive inn søkers fødselsnummer.').should('not.exist');
            cy.findByText('Det finnes ingen fagsaker for denne søkeren. Du kan ikke sende brev uten fagsak.').should(
                'exist',
            );
            fnrInput.clear().type(TEST_DATA.fnrWithError);
            cy.findByText('Noe gikk galt ved henting av fagsaker. Prøv å hente fagsaker på nytt.').should('exist');
            fnrInput.clear().type(TEST_DATA.fnr);
        });

        it('skal velge fagsak og vise brevkomponent', () => {
            velgGyldigFagsak();
            cy.findByRole('button', { name: /Send brev/i }).should('exist');
        });

        it('skal validere malvalg', () => {
            velgGyldigFagsak();
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Du må velge mal.').should('exist');
            cy.findByLabelText('Velg mal').select('INNHEN');
            cy.findByText('Du må velge mal.').should('not.exist');
        });

        it('skal validere mottakervalg', () => {
            velgGyldigFagsak();
            cy.findByLabelText('Velg mal').select('INNHEN');
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Du må velge mottaker.').should('exist');
            velgGyldigMottaker();
            cy.findByText('Du må velge mottaker.').should('not.exist');
        });

        it('skal validere sending til tredjepart', () => {
            velgGyldigFagsak();
            cy.findByLabelText('Velg mal').select('INNHEN');
            cy.findByLabelText('Send til tredjepart').click();
            cy.findByLabelText('Organisasjonsnummer').should('exist').type(1);
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Organisasjonsnummeret er ugyldig.').should('exist');
            cy.findByLabelText('Organisasjonsnummer').clear();
            cy.findByLabelText('Organisasjonsnummer').type('1'.repeat(9));
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Organisasjonsnummeret er ugyldig.').should('exist');
            cy.findByLabelText('Organisasjonsnummer').clear();
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Du må skrive inn organisasjonsnummer.').should('exist');
        });

        it('skal hente organisasjonsnavn', () => {
            velgGyldigFagsak();
            cy.findByLabelText('Send til tredjepart').click();
            cy.findByLabelText('Organisasjonsnummer').type('889640782');
            cy.findByText('Test Navn').should('exist');
        });

        it('skal ikke vise tittel hvis malen ikke støtter det og vise innhold', () => {
            velgGyldigFagsak();
            cy.findByLabelText('Velg mal').select('INNHEN');
            cy.findByText('Tittel').should('not.exist');
            cy.findByText('Innhold i brev').should('exist');
        });

        it('skal vise tittel hvis malen støtter det og vise innhold', () => {
            velgGyldigFagsak();
            cy.findByLabelText('Velg mal').select('GENERELT_FRITEKSTBREV');
            cy.findByText('Tittel').should('exist');
            cy.findByText('Innhold i brev').should('exist');
        });

        it('skal validere tittelfeltet', () => {
            velgGyldigFagsak();
            cy.findByLabelText('Velg mal').select('GENERELT_FRITEKSTBREV');
            velgGyldigMottaker();
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Du må skrive inn tittel.').should('exist');
            cy.findByLabelText('Tittel').type('E');
            cy.findByText('Tittel må være minst 3 tegn.').should('exist');
            cy.findByLabelText('Tittel').type(TEST_DATA.illegalChars);
            cy.findByText(/Feltet inneholder ugyldige tegn:/i).should('exist');
            cy.findByLabelText('Tittel').clear().type(TEST_DATA.validTitle);
            cy.findByText(/Feltet inneholder ugyldige tegn:/i).should('not.exist');
        });

        it('skal validere innholdfeltet', () => {
            velgGyldigFagsak();
            cy.findByLabelText('Velg mal').select('INNHEN');
            velgGyldigMottaker();
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByLabelText('Innhold i brev').type('E');
            cy.findByText('Innhold må være minst 3 tegn.').should('exist');
            cy.findByLabelText('Innhold i brev').type(TEST_DATA.illegalChars);
            cy.findByText(/Feltet inneholder ugyldige tegn:/i).should('exist');
            cy.findByLabelText('Innhold i brev').clear().type(TEST_DATA.validNote);
            cy.findByText(/Feltet inneholder ugyldige tegn:/i).should('not.exist');
        });

        /*
        Testen er deaktivert fordi feiler av og til på grunn av åpning av nytt vindu.
        it('skal forhåndsvise brevet', () => {
            cy.findByRole('button', { name: /Forhåndsvis brev/i }).click();
            cy.findByText('Not Found').should('exist');

            cy.intercept('POST', ApiPath.BREV_FORHAANDSVIS, (req) => {
                expect(req.body).to.have.property('aktørId').to.equal('81549300');
                expect(req.body).to.have.property('avsenderApplikasjon').to.equal('K9PUNSJ');
                expect(req.body).to.have.property('dokumentMal').to.equal('GENERELT_FRITEKSTBREV');
                expect(req.body.dokumentdata.fritekstbrev)
                    .to.have.property('overskrift')
                    .to.equal(TEST_DATA.validTitle);
                expect(req.body.dokumentdata.fritekstbrev).to.have.property('brødtekst').to.equal(TEST_DATA.validNote);
                expect(req.body).to.have.property('eksternReferanse').to.equal('1DMU93A');
                expect(req.body.overstyrtMottaker.id).to.equal('889640782');
                expect(req.body.overstyrtMottaker.type).to.equal('ORGNR');
                expect(req.body).to.have.property('saksnummer').to.equal('1DMU93A');
                expect(req.body.ytelseType).to.have.property('kode').to.equal('PSB');
                expect(req.body.ytelseType).to.have.property('kodeverk').to.equal('FAGSAK_YTELSE');

                req.reply({
                    statusCode: 200,
                    body: { success: true },
                });
            }).as('forhandsvisBrev');

            cy.window().then((win) => {
                cy.stub(win, 'open').callsFake((url) => {
                    // Optionally log or verify the URL that would have been opened
                    cy.log(`Attempted to open: ${url}`);
                });
            });

            cy.findByRole('button', { name: /Forhåndsvis brev/i }).click();

            cy.findByText('Not Found').should('not.exist');
        });*/

        it('skal sende brevet', () => {
            fyllInnGyldigBrev();
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
                expect(req.body).to.have.property('soekerId').to.equal(TEST_DATA.fnr);
                expect(req.body).to.have.property('mottaker');
                expect(req.body.mottaker).to.have.property('id').to.equal('889640782');
                expect(req.body.mottaker).to.have.property('type').to.equal('ORGNR');
                expect(req.body).to.have.property('fagsakYtelseType').to.equal('PSB');
                expect(req.body).to.have.property('dokumentMal');
                expect(req.body).to.have.property('dokumentdata');
                expect(req.body.dokumentdata.fritekstbrev).to.have.property('brødtekst').to.equal(TEST_DATA.validNote);
                expect(req.body.dokumentdata.fritekstbrev)
                    .to.have.property('overskrift')
                    .to.equal(TEST_DATA.validTitle);

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

            cy.findByText('Brevet er sendt. Du blir nå tatt til LOS.').should('exist');
        });
    });
});
