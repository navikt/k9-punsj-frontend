import { setupFordeling } from './Fordeling.spec';

jest.mock('react-intl');
jest.mock('react-router');
jest.mock('app/utils/browserUtils');
jest.mock('app/utils/envUtils');
jest.mock('app/utils/intlUtils');
jest.mock('app/utils/pathUtils');

describe('Fordeling: Flyt for pleiepenger', () => {
    const fordeling = setupFordeling();

    it('Viser riktig informasjon dersom dokumentet ikke gjelder pleiepenger', () => {
        fordeling.find('RadioPanelGruppe').simulate('change', { target: { value: 'nei' } });
        expect(fordeling.find('RadioPanelGruppe')).toHaveLength(1);
        expect(fordeling.find('Hovedknapp')).toHaveLength(1);
    });

    it('Viser riktig informasjon dersom dokumentet gjelder pleiepenger', () => {
        fordeling.find('RadioPanelGruppe').simulate('change', { target: { value: 'ja' } });
        expect(fordeling.find('RadioPanelGruppe')).toHaveLength(2);
        expect(fordeling.find('Knapp')).toHaveLength(1);
        fordeling.find({ name: 'identsjekk' }).simulate('change', { target: { value: 'ja' } });
    });

    it('Viser riktig informasjon dersom søkers fødselsnummer ikke stemmer', () => {
        fordeling.find({ name: 'identsjekk' }).simulate('change', { target: { value: 'nei' } });
        expect(fordeling.find('Input')).toHaveLength(1);
    });

    it('Viser kopi av journalpost', () => {
        fordeling.find({ name: 'identsjekk' }).simulate('change', { target: { value: 'ja' } });
        expect(fordeling.find('Checkbox')).toHaveLength(0);
        fordeling.setProps({
            journalpost: {
                kanKopieres: true,
                kanSendeInn: true,
                erSaksbehandler: true,
            },
        });
        expect(fordeling.find('Checkbox')).toHaveLength(1);
        fordeling.find('Checkbox').simulate('change', { target: { checked: true } });
        expect(fordeling.find('AlertStripeInfo')).toHaveLength(1);
        expect(fordeling.find('Input')).toHaveLength(1);
        fordeling.find('Checkbox').simulate('change', { target: { checked: false } });
        expect(fordeling.find('AlertStripeInfo')).toHaveLength(0);
        expect(fordeling.find('Input')).toHaveLength(0);

        fordeling.setProps({
            journalpost: {
                kanKopieres: false,
                kanSendeInn: true,
                erSaksbehandler: true,
            },
        });
        expect(fordeling.find('Checkbox')).toHaveLength(0);
    });

    it('Viser barn i dropdown dersom det eksisterer', () => {
        expect(fordeling.find('Select')).toHaveLength(0);
        fordeling.setProps({
            fellesState: {
                hentBarnSuccess: true,
                barn: [
                    {
                        identitetsnummer: '12345678910',
                        fødselsdato: '1232333',
                        fornavn: 'Ella',
                        etternavn: 'Nordmann',
                        sammensattNavn: 'Ella Nordmann',
                    },
                ],
            },
            journalpost: {
                kanKopieres: true,
                kanSendeInn: true,
                erSaksbehandler: true,
            },
        });
        expect(fordeling.find('Select').html()).toContain('Ella Nordmann');
        expect(fordeling.find('Select').html()).toContain('12345678910');
    });

    it('Kan fylle in barns identitetsnummer manuellt dersom barn fra apikall er tom', () => {
        fordeling.setProps({
            fellesState: { hentBarnSuccess: true, barn: [] },
            journalpost: {
                kanKopieres: true,
                kanSendeInn: true,
                erSaksbehandler: true,
            },
        });
        expect(fordeling.find('.fyllUtIdentAnnetBarnContainer')).toHaveLength(1);
        expect(fordeling.find('Knapp').prop('disabled')).toEqual(true);
        fordeling.find('Input').simulate('change', { target: { value: '12345678910' } });
        expect(fordeling.find('.dobbelSjekkIdent')).toHaveLength(1);
        expect(fordeling.find('Knapp').prop('disabled')).toEqual(true);
    });

    it('Kan fylle in barns identitetsnummer manuellt dersom apikall går feil', () => {
        fordeling.setProps({
            fellesState: { hentBarnError: true, barn: [] },
            journalpost: {
                kanKopieres: true,
                kanSendeInn: true,
                erSaksbehandler: true,
            },
        });
        expect(fordeling.find('.fyllUtIdentAnnetBarnContainer')).toHaveLength(1);
        fordeling.setProps({
            fellesState: {
                hentBarnSuccess: true,
                barn: [
                    {
                        identitetsnummer: '12345678910',
                        fødselsdato: '1232333',
                        fornavn: 'Ella',
                        etternavn: 'Nordmann',
                        sammensattNavn: 'Ella Nordmann',
                    },
                ],
            },
            journalpost: {
                kanKopieres: true,
                kanSendeInn: true,
                erSaksbehandler: true,
            },
        });
        expect(fordeling.find('.fyllUtIdentAnnetBarnContainer')).toHaveLength(0);
        fordeling.setProps({
            fellesState: { hentBarnForbidden: true, barn: [] },
            journalpost: {
                kanKopieres: true,
                kanSendeInn: true,
                erSaksbehandler: true,
            },
        });
        expect(fordeling.find('.fyllUtIdentAnnetBarnContainer')).toHaveLength(1);
    });

    it('Kan fylle in barns identitetsnummer manuellt dersom apikall går feil', () => {
        expect(fordeling.find('Checkbox')).toHaveLength(2);
        fordeling
            .find('Checkbox')
            .at(1)
            .simulate('change', { target: { checked: true } });
        expect(fordeling.find('.infotrygd_info')).toHaveLength(1);
    });
});
