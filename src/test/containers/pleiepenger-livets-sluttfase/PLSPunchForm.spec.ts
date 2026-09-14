import { PunchFormComponent } from 'app/søknader/pleiepenger-livets-sluttfase/containers/PLSPunchForm';

describe('PLSPunchForm', () => {
    test('validerer hos backend når frilanser slutter før startdato', () => {
        const validateSoknad = jest.fn();
        const component = new PunchFormComponent({ validateSoknad } as ConstructorParameters<
            typeof PunchFormComponent
        >[0]);
        const setState = jest.fn();

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
        const validateSoknad = jest.fn();
        const updateSoknad = jest.fn();
        const component = new PunchFormComponent({
            validateSoknad,
            updateSoknad,
            journalpostid: '200',
        } as ConstructorParameters<typeof PunchFormComponent>[0]);
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
        component.setState = jest.fn() as typeof component.setState;
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
