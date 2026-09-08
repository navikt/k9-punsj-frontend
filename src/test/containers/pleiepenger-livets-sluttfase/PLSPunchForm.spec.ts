import { PunchFormComponent } from 'app/søknader/pleiepenger-livets-sluttfase/containers/PLSPunchForm';

describe('PLSPunchForm', () => {
    test('validerer ikke hos backend når frilanser slutter før startdato', () => {
        const validateSoknad = jest.fn();
        const component = new PunchFormComponent({ validateSoknad } as ConstructorParameters<typeof PunchFormComponent>[0]);
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
        expect(validateSoknad).not.toHaveBeenCalled();
    });
});