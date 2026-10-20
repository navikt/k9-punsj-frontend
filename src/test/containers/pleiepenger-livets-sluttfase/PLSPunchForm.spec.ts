import { PunchFormComponent } from 'app/søknader/pleiepenger-livets-sluttfase/containers/PLSPunchForm';

describe('PLSPunchForm', () => {
    test('viser feltfeil uten å oppdatere React-state og beholder uhåndterte feil i oppsummeringen', () => {
        const component = new PunchFormComponent({
            intl: { formatMessage: ({ id }: { id: string }) => id },
            punchFormState: {
                inputErrors: [
                    { felt: 'ytelse.lovbestemtFerie.perioder[0]', feilmelding: 'Ugyldig ferieperiode' },
                    { felt: 'ytelse.ukjent', feilmelding: 'Ukjent feil' },
                ],
            },
        } as unknown as ConstructorParameters<typeof PunchFormComponent>[0]);
        const setState = vi.fn();
        component.setState = setState as typeof component.setState;
        const getErrorMessage = Reflect.get(component, 'getErrorMessage') as (attribute: string) => string | undefined;
        const getUhaandterteFeil = Reflect.get(component, 'getUhaandterteFeil') as (attribute: string) => string[];

        expect(getErrorMessage('ytelse.lovbestemtFerie.perioder[0]')).toBe(
            'skjema.feil.ytelse.lovbestemtFerie.perioder[].Ugyldig ferieperiode',
        );
        expect(getErrorMessage('ytelse.lovbestemtFerie.perioder[0]')).toBe(
            'skjema.feil.ytelse.lovbestemtFerie.perioder[].Ugyldig ferieperiode',
        );
        expect(getUhaandterteFeil('ytelse.lovbestemtFerie')).toEqual([]);
        expect(getUhaandterteFeil('')).toEqual(['ytelse.ukjent: Ukjent feil']);
        expect(setState).not.toHaveBeenCalled();
    });

    test('validerer hos backend når frilanser slutter før startdato', () => {
        const validateSoknad = vi.fn();
        const component = new PunchFormComponent({ validateSoknad } as unknown as ConstructorParameters<
            typeof PunchFormComponent
        >[0]);
        const setState = vi.fn();

        component.state = {
            ...component.state,
            soknad: {
                ...component.state.soknad,
                opptjeningAktivitet: {
                    ...component.state.soknad.opptjeningAktivitet,
                    frilanser: {
                        startdato: '2022-10-10',
                        sluttdato: '2022-10-01',
                        jobberFortsattSomFrilans: false,
                    },
                },
            },
        };
        component.setState = setState as typeof component.setState;

        const handleSubmit = Reflect.get(component, 'handleSubmit') as () => void;
        handleSubmit.call(component);

        expect(setState).toHaveBeenCalledWith({ harForsoektAaSendeInn: true });
        expect(validateSoknad).toHaveBeenCalledTimes(1);
    });

    test('revaliderer ikke ugyldige frilanserdatoer før de er korrigert', () => {
        const validateSoknad = vi.fn();
        const updateSoknad = vi.fn();
        const component = new PunchFormComponent({
            validateSoknad,
            updateSoknad,
            journalpostid: '200',
        } as unknown as ConstructorParameters<typeof PunchFormComponent>[0]);
        const invalidFrilanser = {
            startdato: '2022-10-10',
            sluttdato: '2022-10-01',
            jobberFortsattSomFrilans: false,
        };

        component.state = {
            ...component.state,
            soknad: {
                ...component.state.soknad,
                opptjeningAktivitet: { ...component.state.soknad.opptjeningAktivitet, frilanser: invalidFrilanser },
            },
        };
        component.setState = vi.fn() as typeof component.setState;
        Reflect.set(component, 'getSoknadFromStore', () => ({
            journalposter: new Set(),
            opptjeningAktivitet: { frilanser: invalidFrilanser },
        }));

        (Reflect.get(component, 'handleSubmit') as () => void).call(component);
        component.state = { ...component.state, harForsoektAaSendeInn: true };

        (Reflect.get(component, 'updateSoknad') as (soknad: object) => void).call(component, {
            mottattDato: '2022-10-11',
        });

        expect(validateSoknad).toHaveBeenCalledTimes(1);

        (Reflect.get(component, 'updateSoknad') as (soknad: object) => void).call(component, {
            opptjeningAktivitet: {
                frilanser: { ...invalidFrilanser, sluttdato: '2022-10-10' },
            },
        });

        expect(validateSoknad).toHaveBeenCalledTimes(2);
    });
});
