import { ApiPath } from 'app/apiConfig';

const TEST_DATA = {
    fnr: '08438323288',
    fnrTomtFagsaker: '17519112922',
    fnrWithError: '05508239132',
    illegalChars: '^|~{}[]ñçßøå',
    validTitle: 'Eksempel på tittel',
    validNote: 'Eksempel på notat',
};

const åpneBrevside = () => {
    cy.visit('/brev-avsluttet-sak');
    cy.findByText('Send brev i avsluttet sak').should('exist');
};

const skrivSøkerFnr = (value) => {
    cy.findByLabelText('Søkers fødselsnummer').should('be.visible').clear({ force: true });

    value.split('').forEach((digit) => {
        cy.findByLabelText('Søkers fødselsnummer').type(digit, { force: true });
    });
};

const settSøkerFnrDirekte = (value) => {
    cy.window().then((win) => {
        cy.findByLabelText('Søkers fødselsnummer')
            .should('be.visible')
            .then(($input) => {
                const input = $input[0];
                const valueSetter = Object.getOwnPropertyDescriptor(win.HTMLInputElement.prototype, 'value')?.set;

                if (!valueSetter) {
                    throw new Error('Missing HTMLInputElement value setter');
                }

                valueSetter.call(input, value);
                input.dispatchEvent(new win.Event('input', { bubbles: true }));
                input.dispatchEvent(new win.Event('change', { bubbles: true }));
            });
    });
};

const velgFraSelect = (label, value) => {
    cy.findByLabelText(label).should('be.visible').and('not.be.disabled');
    cy.findByLabelText(label).find(`option[value="${value}"]`).should('exist');
    cy.findByLabelText(label).select(value, { force: true });
};

const fyllInnGyldigFnr = (allowRetry = true) => {
    settSøkerFnrDirekte(TEST_DATA.fnr);
    cy.wait(700);
    cy.get('body').then(($body) => {
        const harFagsakSelect = $body.text().includes('Velg fagsak');

        if (!harFagsakSelect && allowRetry) {
            åpneBrevside();
            fyllInnGyldigFnr(false);
            return;
        }

        cy.findByLabelText('Velg fagsak', { timeout: 10000 }).should('not.be.disabled');
        cy.findByLabelText('Velg fagsak').find('option').its('length').should('be.greaterThan', 1);
    });
};

const velgGyldigFagsak = (allowRetry = true) => {
    fyllInnGyldigFnr();
    velgFraSelect('Velg fagsak', '1DMU93A');
    cy.wait(300);
    cy.get('body').then(($body) => {
        const harBrevKomponent = $body.text().includes('Velg mal');

        if (!harBrevKomponent && allowRetry) {
            åpneBrevside();
            velgGyldigFagsak(false);
            return;
        }

        cy.findByLabelText('Velg mal', { timeout: 10000 }).should('exist');
        cy.findByLabelText('Velg mottaker', { timeout: 10000 }).should('exist');
        cy.findByLabelText('Send til tredjepart').should('exist');
    });
};

const velgGyldigMottaker = () => {
    cy.findByLabelText('Send til tredjepart').then(($checkbox) => {
        if ($checkbox.is(':checked')) {
            cy.wrap($checkbox).click({ force: true });
        }
    });

    cy.findByLabelText('Velg mottaker', { timeout: 10000 }).should('not.be.disabled');
    cy.findByLabelText('Velg mottaker').find('option').its('length').should('be.greaterThan', 1);
    velgFraSelect('Velg mottaker', '81549300');
};

const visTredjepartFelter = () => {
    cy.findByLabelText('Send til tredjepart').then(($checkbox) => {
        if (!$checkbox.is(':checked')) {
            cy.wrap($checkbox).click({ force: true });
        }
    });

    cy.findByLabelText('Organisasjonsnummer').should('exist');
};

const fyllInnGyldigBrevFelter = () => {
    velgFraSelect('Velg mal', 'GENERELT_FRITEKSTBREV');
    visTredjepartFelter();
    cy.findByLabelText('Organisasjonsnummer').clear().type('889640782');
    cy.findByText('Test Navn').should('exist');
    cy.findByLabelText('Tittel').clear().type(TEST_DATA.validTitle);
    cy.findByLabelText('Innhold i brev').clear().type(TEST_DATA.validNote);
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

    describe('Validering av fødselsnummer', () => {
        beforeEach(() => {
            åpneBrevside();
        });

        it('skal validere fødselsnummer format og tom verdi', () => {
            skrivSøkerFnr('1');
            cy.findByText('Søkers fødselsnummer må være 11 siffer.').should('exist');

            skrivSøkerFnr('');
            cy.findByText('Du må skrive inn søkers fødselsnummer.').should('exist');
        });

        it('skal validere ugyldig fødselsnummer', () => {
            settSøkerFnrDirekte('1'.repeat(11));
            cy.findByText('Søkers fødselsnummer er ugyldig.').should('exist');
        });

        it('skal vise melding når søker ikke har fagsaker', () => {
            settSøkerFnrDirekte(TEST_DATA.fnrTomtFagsaker);
            cy.findByText('Det finnes ingen fagsaker for denne søkeren. Du kan ikke sende brev uten fagsak.', {
                timeout: 10000,
            }).should('exist');
        });

        it('skal vise feil ved henting av fagsaker', () => {
            settSøkerFnrDirekte(TEST_DATA.fnrWithError);
            cy.findByText('Noe gikk galt ved henting av fagsaker. Prøv å hente fagsaker på nytt.', {
                timeout: 10000,
            }).should('exist');
        });
    });

    describe('Test av brev', { testIsolation: false }, () => {
        before(() => {
            åpneBrevside();
            velgGyldigFagsak();
        });

        it('skal velge fagsak og vise brevkomponent', () => {
            cy.findByRole('button', { name: /Send brev/i }).should('exist');
        });

        it('skal validere malvalg', () => {
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Du må velge mal.').should('exist');
            velgFraSelect('Velg mal', 'INNHEN');
            cy.findByText('Du må velge mal.').should('not.exist');
        });

        it('skal validere mottakervalg', () => {
            velgFraSelect('Velg mal', 'INNHEN');
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Du må velge mottaker.').should('exist');
            velgGyldigMottaker();
            cy.findByText('Du må velge mottaker.').should('not.exist');
        });

        it('skal validere sending til tredjepart', () => {
            velgFraSelect('Velg mal', 'INNHEN');
            visTredjepartFelter();
            cy.findByLabelText('Organisasjonsnummer').clear().type('1');
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Organisasjonsnummeret er ugyldig.').should('exist');
            cy.findByLabelText('Organisasjonsnummer').clear().type('1'.repeat(9));
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Organisasjonsnummeret er ugyldig.').should('exist');
            cy.findByLabelText('Organisasjonsnummer').clear();
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByText('Du må skrive inn organisasjonsnummer.').should('exist');
        });

        it('skal hente organisasjonsnavn', () => {
            visTredjepartFelter();
            cy.findByLabelText('Organisasjonsnummer').clear().type('889640782');
            cy.findByText('Test Navn').should('exist');
        });

        it('skal ikke vise tittel hvis malen ikke støtter det og vise innhold', () => {
            velgFraSelect('Velg mal', 'INNHEN');
            cy.findByText('Tittel').should('not.exist');
            cy.findByText('Innhold i brev').should('exist');
        });

        it('skal vise tittel hvis malen støtter det og vise innhold', () => {
            velgFraSelect('Velg mal', 'GENERELT_FRITEKSTBREV');
            cy.findByText('Tittel').should('exist');
            cy.findByText('Innhold i brev').should('exist');
        });

        it('skal validere tittelfeltet', () => {
            velgFraSelect('Velg mal', 'GENERELT_FRITEKSTBREV');
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
            velgFraSelect('Velg mal', 'INNHEN');
            velgGyldigMottaker();
            cy.findByRole('button', { name: /Send brev/i }).click();
            cy.findByLabelText('Innhold i brev').type('E');
            cy.findByText('Innhold må være minst 3 tegn.').should('exist');
            cy.findByLabelText('Innhold i brev').type(TEST_DATA.illegalChars);
            cy.findByText(/Feltet inneholder ugyldige tegn:/i).should('exist');
            cy.findByLabelText('Innhold i brev').clear().type(TEST_DATA.validNote);
            cy.findByText(/Feltet inneholder ugyldige tegn:/i).should('not.exist');
        });

        it('skal sende brevet', () => {
            fyllInnGyldigBrevFelter();
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
