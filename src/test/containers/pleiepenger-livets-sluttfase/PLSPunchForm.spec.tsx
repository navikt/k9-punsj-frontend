import React from 'react';

import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { createIntl, IntlProvider } from 'react-intl';

import messages from 'app/i18n/nb.json';
import { PunchFormComponent } from 'app/søknader/pleiepenger-livets-sluttfase/containers/PLSPunchForm';
import { IPunchPLSFormState } from 'app/søknader/pleiepenger-livets-sluttfase/types/PunchPLSFormState';
import { JaNeiIkkeRelevant } from 'app/models/enums/JaNeiIkkeRelevant';

vi.mock('app/components/JournalposterSync', () => ({ default: () => null }));

describe('PLSPunchForm', () => {
    test('viser alle backendfeil i oppsummeringen og beholder klientfeil ved feltet', async () => {
        const inputErrors = [
            { felt: 'mottattDato', feilmelding: 'must not be null' },
            { felt: 'ytelse.ukjent.perioder[0].fom', feilmelding: 'UKJENT_KODE' },
            { felt: 'nattevåk', feilmelding: 'must be greater than 0' },
        ];
        const soknad = {
            soeknadId: 'test',
            soekerId: 'test',
            journalposter: new Set<string>(),
            pleietrengende: { norskIdent: 'test' },
            opptjeningAktivitet: {},
            arbeidstid: {},
            bosteder: [],
            utenlandsopphold: [],
            lovbestemtFerie: [],
            lovbestemtFerieSomSkalSlettes: [],
            harInfoSomIkkeKanPunsjes: false,
            harMedisinskeOpplysninger: false,
        };
        const emptyFormState: IPunchPLSFormState = {
            isSoknadLoading: false,
            perioder: [],
            inputErrors,
        };
        const props = {
            id: 'test',
            journalpostid: 'test',
            navigate: vi.fn(),
            intl: createIntl({ locale: 'nb', messages, onError: () => undefined }),
            punchFormState: emptyFormState,
            signaturState: { signert: JaNeiIkkeRelevant.IKKE_RELEVANT },
            journalposterState: { journalposter: [] },
            identState: {},
            getSoknad: vi.fn(),
            hentPerioder: vi.fn(),
            resetSoknadAction: vi.fn(),
            setIdentAction: vi.fn(),
            updateSoknad: vi.fn(),
            submitSoknad: vi.fn(),
            resetAllStateAction: vi.fn(),
            resetPunchFormAction: vi.fn(),
            setSignaturAction: vi.fn(),
            settJournalpostPaaVent: vi.fn(),
            settPaaventResetAction: vi.fn(),
            validateSoknad: vi.fn(),
            validerSoknadReset: vi.fn(),
            undoChoiceOfEksisterendeSoknadAction: vi.fn(),
        } as unknown as ConstructorParameters<typeof PunchFormComponent>[0];
        const renderForm = (formProps: typeof props) => (
            <IntlProvider locale="nb" messages={messages} onError={() => undefined}>
                <PunchFormComponent {...formProps} />
            </IntlProvider>
        );
        const { rerender } = render(renderForm(props));

        rerender(
            renderForm({
                ...props,
                punchFormState: { ...emptyFormState, soknad },
            }),
        );

        fireEvent.blur(screen.getByLabelText('Mottatt dato:'));

        const backendDateError = /Mottakelsesdato må være satt/;
        const unknownErrorFallback = /Kontroller opplysningene og prøv igjen\./;
        await waitFor(() => {
            expect(screen.getAllByText(backendDateError)).toHaveLength(1);
            expect(screen.getAllByText(unknownErrorFallback)).toHaveLength(2);
            expect(screen.queryByText(/ytelse\.ukjent\.perioder\[0\]\.fom/)).not.toBeInTheDocument();
            expect(screen.queryByText(/UKJENT_KODE/)).not.toBeInTheDocument();
            expect(screen.queryByText(/must be greater than 0/)).not.toBeInTheDocument();
            expect(screen.queryByText(/skjema\.feil\.datoMottatt\.MAA_SETTES/)).not.toBeInTheDocument();
            expect(screen.getByText('Mottatt dato: Kan ikke være tom')).toBeInTheDocument();
        });

        const updatedInputErrors = [
            { felt: 'søknad', feilkode: 'mottattDato', feilmelding: 'Mottatt dato mangler' },
            { felt: 'ytelse.søknadsperiode.perioder[0]', feilmelding: 'Mangler søknadsperiode' },
            { felt: 'ytelse.ukjent.perioder[0].fom', feilmelding: 'NY_UKJENT_KODE' },
        ];
        rerender(
            renderForm({
                ...props,
                punchFormState: { ...emptyFormState, soknad, inputErrors: updatedInputErrors },
            }),
        );

        await waitFor(() => {
            expect(screen.getAllByText(backendDateError)).toHaveLength(1);
            expect(screen.getAllByText(/Mangler søknadsperiode\./)).toHaveLength(1);
            expect(screen.getAllByText(unknownErrorFallback)).toHaveLength(1);
            expect(screen.queryByText(/ytelse\.ukjent\.perioder\[0\]\.fom/)).not.toBeInTheDocument();
            expect(screen.queryByText(/NY_UKJENT_KODE/)).not.toBeInTheDocument();
            expect(screen.getByText('Mottatt dato: Kan ikke være tom')).toBeInTheDocument();
        });

        rerender(
            renderForm({
                ...props,
                punchFormState: {
                    ...emptyFormState,
                    soknad,
                    inputErrors: [
                        { felt: 'søknad', feilkode: 'klokkeslett', feilmelding: 'Klokkeslett mangler' },
                        { felt: 'ytelse.søknadsperiode.perioder[0].fraOgMed', feilkode: 'MAA_SETTES' },
                    ],
                },
            }),
        );

        expect(screen.getByText(/Klokkeslett mangler/)).toBeInTheDocument();
        expect(screen.getByText(/Startdato må være satt\./)).toBeInTheDocument();
        expect(screen.queryByText(backendDateError)).not.toBeInTheDocument();
        expect(screen.queryByText(unknownErrorFallback)).not.toBeInTheDocument();
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
