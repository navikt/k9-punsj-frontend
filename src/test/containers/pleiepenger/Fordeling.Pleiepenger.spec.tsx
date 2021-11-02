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
        fordeling.find('RadioPanelGruppe').simulate('change', { target: { value: 'ANNET' } });
        expect(fordeling.find('RadioPanelGruppe')).toHaveLength(1);
        expect(fordeling.find('Hovedknapp')).toHaveLength(1);
    });

    it('Viser riktig informasjon dersom dokumentet gjelder pleiepenger', () => {
        fordeling.find('RadioPanelGruppe').simulate('change', { target: { value: 'PLEIEPENGER' } });
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

    it('Kan ikke gå videre dersom man ikke fyllt in barn', () => {
        fordeling.setProps({
            fellesState: { hentBarnSuccess: true, barn: [] },
            journalpost: { kanKopieres: true, kanSendeInn: true, erSaksbehandler: true },
        });
        expect(fordeling.find('Knapp').prop('disabled')).toEqual(true);
    });

    it('Kan ikke gå videre dersom barnets ident ikke er riktig', () => {
        fordeling.setProps({
            fellesState: { hentBarnSuccess: true, barn: [] },
            identState: { ident2: '12' },
            journalpost: { kanKopieres: true, kanSendeInn: true, erSaksbehandler: true },
        });
        expect(fordeling.find('Knapp').prop('disabled')).toEqual(true);
    });
});
