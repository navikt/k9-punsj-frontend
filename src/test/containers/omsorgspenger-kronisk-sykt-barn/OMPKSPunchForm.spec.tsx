import { PunchOMPKSFormComponent } from 'app/søknader/omsorgspenger-kronisk-sykt-barn/containers/OMPKSPunchForm';

const createProps = () =>
    ({
        journalpostid: '123',
        id: 'abc',
        navigate: jest.fn(),
        punchFormState: {
            inputErrors: [],
        },
        signaturState: {},
        journalposterState: {},
        identState: {},
        kopierJournalpostSuccess: false,
        getSoknad: jest.fn(),
        resetSoknadAction: jest.fn(),
        undoChoiceOfEksisterendeSoknadAction: jest.fn(),
        updateSoknad: jest.fn(),
        submitSoknad: jest.fn(),
        resetPunchFormAction: jest.fn(),
        resetAllStateAction: jest.fn(),
        setSignaturAction: jest.fn(),
        settJournalpostPaaVent: jest.fn(),
        settPaaventResetAction: jest.fn(),
        validateSoknad: jest.fn(),
        validerSoknadReset: jest.fn(),
        intl: {
            formatMessage: ({ id }: { id: string }) => id,
        },
    }) as any;

describe('PunchOMPKSFormComponent getErrorMessage', () => {
    it('only marks mottattDato as required when klokkeslett is filled', () => {
        const component = new PunchOMPKSFormComponent(createProps());

        component.state = {
            ...component.state,
            soknad: {
                ...component.state.soknad,
                mottattDato: '',
                klokkeslett: '10:00',
            },
        };

        expect((component as any).getErrorMessage('mottattDato')).toBe('skjema.feil.ikketom');
        expect((component as any).getErrorMessage('klokkeslett')).toBeUndefined();
    });

    it('only marks klokkeslett as required when mottattDato is filled', () => {
        const component = new PunchOMPKSFormComponent(createProps());

        component.state = {
            ...component.state,
            soknad: {
                ...component.state.soknad,
                mottattDato: '2020-01-01',
                klokkeslett: '',
            },
        };

        expect((component as any).getErrorMessage('mottattDato')).toBeUndefined();
        expect((component as any).getErrorMessage('klokkeslett')).toBe('skjema.feil.ikketom');
    });
});
