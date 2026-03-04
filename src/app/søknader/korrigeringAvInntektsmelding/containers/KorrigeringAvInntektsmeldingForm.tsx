import React, { useCallback, useEffect, useReducer, useRef, useState } from 'react';

import { Form, Formik, FormikProps, setNestedObjectValues, useFormikContext } from 'formik';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Button, ErrorSummary, Heading, List, Modal } from '@navikt/ds-react';
import Feilmelding from 'app/components/Feilmelding';
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import {
    submitOMSKorrigering,
    updateOMSKorrigering,
    validerOMSKorrigering,
} from 'app/state/actions/OMSPunchFormActions';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import ErDuSikkerModal from '../../../components/ErDuSikkerModal';
import {
    KorrigeringAvInntektsmeldingFormFields,
    KorrigeringAvInntektsmeldingFormValues,
} from '../types/KorrigeringAvInntektsmeldingFormFieldsValues';
import LeggTilDelvisFravær from './LeggTilDelvisFravær/LeggTilDelvisFravær';
import OMSKvittering from './SøknadKvittering/OMSKvittering';
import OpplysningerOmKorrigering from './OpplysningerOmKorrigering/OpplysningerOmKorrigering';
import TrekkPerioder from './TrekkPerioder';
import VirksomhetPanel from './VirksomhetPanel/VirksomhetPanel';
import { FormErrors, getFormErrors } from './korrigeringAvFormValidering';
import ActionType from '../state/actions/korrigeringAvInntektsmeldingActions';
import korrigeringAvInntektsmeldingReducer from '../state/reducers/korrigeringAvInntektsmeldingReducer';
import { OMSKorrigering } from 'app/models/types/OMSKorrigering';
import {
    arbeidsforholdIdFieldId,
    delvisFravaerDatoFieldId,
    delvisFravaerTimerFieldId,
    klokkeslettFieldId,
    mottattDatoFieldId,
    refusjonskravFieldId,
    trekkperiodeFieldId,
    virksomhetFieldId,
} from './formFieldIds';

import './KorrigeringAvInntektsmeldingForm.css';

interface Props {
    søkerId: string;
    søknadId: string;
    journalposter: string[];
}

const initialFormState = {
    åpnePaneler: {
        trekkperioderPanel: false,
        leggTilHelePerioderPanel: false,
        leggTilDelvisFravær: false,
    },
    isLoading: false,
    visBekreftelsemodal: false,
    visErDuSikkerModal: false,
    korrigeringErInnsendt: false,
    innsendteFormverdier: undefined,
    formError: '',
    hasSubmitted: false,
};

const getInitialPeriode = () => ({ fom: '', tom: '' });

interface ErrorSummaryItemData {
    message: string;
    href?: string;
}

const addErrorSummaryItem = (items: ErrorSummaryItemData[], seen: Set<string>, message?: string, href?: string) => {
    if (!message) {
        return;
    }

    const dedupeKey = `${href || ''}::${message}`;
    if (seen.has(dedupeKey)) {
        return;
    }

    seen.add(dedupeKey);
    items.push({ message, href });
};

const getFravaersperiodeFieldHrefs = (values: KorrigeringAvInntektsmeldingFormValues) => {
    const hrefs: string[] = [];

    values.Trekkperioder.forEach((value, index) => {
        if (value.fom) {
            hrefs.push(`#${trekkperiodeFieldId(index)}`);
        }
    });

    values.PerioderMedRefusjonskrav.forEach((value, index) => {
        if (value.fom) {
            hrefs.push(`#${refusjonskravFieldId(index)}`);
        }
    });

    values.DagerMedDelvisFravær.forEach((value, index) => {
        if (value.dato || value.timer) {
            hrefs.push(`#${delvisFravaerDatoFieldId(index)}`);
        }
    });

    return hrefs;
};

const getServerValidationHref = (error: Feil, values: KorrigeringAvInntektsmeldingFormValues) => {
    if (error.felt === 'mottattDato' || (error.felt === 'søknad' && error.feilkode === 'mottattDato')) {
        return `#${mottattDatoFieldId}`;
    }

    if (error.felt === 'klokkeslett' || (error.felt === 'søknad' && error.feilkode === 'klokkeslett')) {
        return `#${klokkeslettFieldId}`;
    }

    if (error.felt === 'arbeidsforholdId') {
        return `#${arbeidsforholdIdFieldId}`;
    }

    if (error.felt === 'organisasjonsnummer' || error.feilkode === 'ikkeSpesifisertOrgNr') {
        return `#${virksomhetFieldId}`;
    }

    const indexMatch = error.felt?.match(/^ytelse\.fraværsperioderKorrigeringIm\[(\d+)]$/);
    if (!indexMatch) {
        return undefined;
    }

    return getFravaersperiodeFieldHrefs(values)[Number(indexMatch[1])];
};

const isMappedServerValidationError = (error: Feil) =>
    error.felt === 'mottattDato' ||
    error.felt === 'klokkeslett' ||
    error.felt === 'organisasjonsnummer' ||
    error.felt === 'arbeidsforholdId' ||
    (error.felt === 'søknad' && ['mottattDato', 'klokkeslett'].includes(error.feilkode)) ||
    /^fraværsperioderKorrigeringIm\.perioder\[/.test(error.felt || '') ||
    /^ytelse\.fraværsperioderKorrigeringIm\[(\d+)]$/.test(error.felt || '');

const getErrorSummaryItems = (
    values: KorrigeringAvInntektsmeldingFormValues,
    formErrors: Partial<FormErrors>,
    serverValidationErrors: Feil[],
) => {
    const items: ErrorSummaryItemData[] = [];
    const seen = new Set<string>();

    if (formErrors.OpplysningerOmKorrigering) {
        addErrorSummaryItem(items, seen, formErrors.OpplysningerOmKorrigering?.dato, `#${mottattDatoFieldId}`);
        addErrorSummaryItem(items, seen, formErrors.OpplysningerOmKorrigering?.klokkeslett, `#${klokkeslettFieldId}`);
    }

    if (formErrors.Virksomhet) {
        addErrorSummaryItem(items, seen, formErrors.Virksomhet, `#${virksomhetFieldId}`);
    }

    if (formErrors.ArbeidsforholdId) {
        addErrorSummaryItem(items, seen, formErrors.ArbeidsforholdId, `#${arbeidsforholdIdFieldId}`);
    }

    if (formErrors.Trekkperioder) {
        formErrors.Trekkperioder?.forEach((message, index) => {
            addErrorSummaryItem(items, seen, message, `#${trekkperiodeFieldId(index)}`);
        });
    }

    if (formErrors.PerioderMedRefusjonskrav) {
        formErrors.PerioderMedRefusjonskrav?.forEach((message, index) => {
            addErrorSummaryItem(items, seen, message, `#${refusjonskravFieldId(index)}`);
        });
    }

    if (formErrors.DagerMedDelvisFravær) {
        formErrors.DagerMedDelvisFravær?.forEach((error, index) => {
            addErrorSummaryItem(items, seen, error?.dato, `#${delvisFravaerDatoFieldId(index)}`);
            addErrorSummaryItem(items, seen, error?.timer, `#${delvisFravaerTimerFieldId(index)}`);
        });
    }

    serverValidationErrors.forEach((error) => {
        if (isMappedServerValidationError(error)) {
            return;
        }

        addErrorSummaryItem(items, seen, error.feilmelding, getServerValidationHref(error, values));
    });

    return items;
};

interface FormChangeObserverProps {
    hasSubmitted: boolean;
    oppdaterKorrigering: (values: KorrigeringAvInntektsmeldingFormValues) => void;
    validerKorrigering: (
        values: KorrigeringAvInntektsmeldingFormValues,
        options?: { openConfirmationOnSuccess?: boolean },
    ) => Promise<number | void>;
}

const FormChangeObserver = ({ hasSubmitted, oppdaterKorrigering, validerKorrigering }: FormChangeObserverProps) => {
    const { values } = useFormikContext<KorrigeringAvInntektsmeldingFormValues>();
    const hasMounted = useRef(false);

    useEffect(() => {
        if (!hasMounted.current) {
            hasMounted.current = true;
            return;
        }

        oppdaterKorrigering(values);

        if (hasSubmitted) {
            void validerKorrigering(values, { openConfirmationOnSuccess: false });
        }
    }, [hasSubmitted, oppdaterKorrigering, validerKorrigering, values]);

    return null;
};

const KorrigeringAvInntektsmeldingForm: React.FC<Props> = ({ søkerId, søknadId, journalposter }: Props) => {
    const intl = useIntl();
    const harGyldigSoeknadId = søknadId.trim().length > 0;
    const formikRef = useRef<FormikProps<KorrigeringAvInntektsmeldingFormValues>>(null);
    const validationRequestIdRef = useRef(0);

    const [state, dispatch] = useReducer(korrigeringAvInntektsmeldingReducer, initialFormState);
    const [serverValidationErrors, setServerValidationErrors] = useState<Feil[]>([]);

    const {
        åpnePaneler,
        visBekreftelsemodal,
        visErDuSikkerModal,
        korrigeringErInnsendt,
        innsendteFormverdier,
        formError,
        hasSubmitted,
    } = state;

    const togglePaneler = (panel: { [key: string]: boolean }) =>
        dispatch({ type: ActionType.SET_ÅPNE_PANELER, åpnePaneler: { ...åpnePaneler, ...panel } });

    const oppdaterKorrigering = useCallback(
        (values: KorrigeringAvInntektsmeldingFormValues) => {
            if (!harGyldigSoeknadId) {
                return;
            }

            const korrigering = new OMSKorrigering(values, søknadId, søkerId, journalposter);

            updateOMSKorrigering(korrigering);
        },
        [harGyldigSoeknadId, journalposter, søkerId, søknadId],
    );

    const validerKorrigering = useCallback(
        async (values: KorrigeringAvInntektsmeldingFormValues, options?: { openConfirmationOnSuccess?: boolean }) => {
            const openConfirmationOnSuccess = options?.openConfirmationOnSuccess ?? true;
            const validationRequestId = ++validationRequestIdRef.current;

            dispatch({ type: ActionType.VALIDER_KORRIGERING_START });

            if (!harGyldigSoeknadId) {
                setServerValidationErrors([]);
                dispatch({
                    type: ActionType.SET_FORM_ERROR,
                    formError: intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.innsendingError'),
                });
                dispatch({ type: ActionType.VALIDER_KORRIGERING_ERROR });
                return 400;
            }

            const korrigering = new OMSKorrigering(values, søknadId, søkerId, journalposter);
            const response = await validerOMSKorrigering(korrigering);
            const responseData = response.status === 400 ? ((await response.json()) as ValideringResponse) : undefined;

            if (validationRequestId !== validationRequestIdRef.current) {
                return response.status;
            }

            if (response.status === 202) {
                setServerValidationErrors([]);
                dispatch({ type: ActionType.SET_FORM_ERROR, formError: '' });
                oppdaterKorrigering(values);
                dispatch({ type: ActionType.VALIDER_KORRIGERING_SUCCESS });
                if (openConfirmationOnSuccess) {
                    dispatch({ type: ActionType.VIS_BEKREFTELSEMODAL });
                }
            } else if (response.status === 400) {
                setServerValidationErrors(responseData?.feil || []);
                dispatch({ type: ActionType.SET_FORM_ERROR, formError: '' });
                dispatch({ type: ActionType.VALIDER_KORRIGERING_ERROR });
            } else {
                setServerValidationErrors([]);
                dispatch({
                    type: ActionType.SET_FORM_ERROR,
                    formError: intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.innsendingError'),
                });
                dispatch({ type: ActionType.VALIDER_KORRIGERING_ERROR });
            }
            return response.status;
        },
        [harGyldigSoeknadId, intl, journalposter, oppdaterKorrigering, søkerId, søknadId],
    );

    useEffect(() => {
        if (!formikRef.current) {
            return;
        }

        void formikRef.current.validateForm();
    }, [serverValidationErrors]);

    const sendInnKorrigering = (formVerdier: KorrigeringAvInntektsmeldingFormValues) => {
        submitOMSKorrigering(søkerId, søknadId, (response) => {
            if (response.status === 202) {
                dispatch({ type: ActionType.SET_KORRIGERING_INNSENDT, innsendteFormverdier: formVerdier });
            } else {
                dispatch({
                    type: ActionType.SET_FORM_ERROR,
                    formError: intlHelper(intl, 'omsorgspenger.korrigeringAvInntektsmelding.innsendingError'),
                });
            }
        });
    };

    if (korrigeringErInnsendt && innsendteFormverdier) {
        return (
            <>
                <Alert size="small" variant="info" className="fullfortmelding">
                    <FormattedMessage id="skjema.sentInn" />
                </Alert>

                <div className="my-8">
                    <Button
                        onClick={() => {
                            window.location.href = getEnvironmentVariable('K9_LOS_URL');
                        }}
                    >
                        <FormattedMessage id="tilbaketilLOS" />
                    </Button>
                </div>

                <div className="mb-6">
                    <Heading size="small" level="3">
                        <FormattedMessage id="skjema.kvittering.oppsummering" />
                    </Heading>
                </div>

                <Box padding="6" borderWidth="1" borderRadius="medium" borderColor="border-info">
                    <OMSKvittering feltverdier={innsendteFormverdier} />
                </Box>
            </>
        );
    }

    return (
        <Formik
            innerRef={formikRef}
            initialValues={{
                [KorrigeringAvInntektsmeldingFormFields.OpplysningerOmKorrigering]: { dato: '', klokkeslett: '' },
                [KorrigeringAvInntektsmeldingFormFields.Virksomhet]: '',
                [KorrigeringAvInntektsmeldingFormFields.ArbeidsforholdId]: '',
                [KorrigeringAvInntektsmeldingFormFields.Trekkperioder]: [getInitialPeriode()],
                [KorrigeringAvInntektsmeldingFormFields.PerioderMedRefusjonskrav]: [getInitialPeriode()],
                [KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær]: [{ dato: '', timer: '' }],
            }}
            onSubmit={() => undefined}
            validate={(values) =>
                getFormErrors(
                    values,
                    hasSubmitted ? { søknadIdDto: søknadId, feil: serverValidationErrors } : undefined,
                )
            }
        >
            {({ errors, setFieldValue, setTouched, validateForm, values }) => {
                const errorSummaryItems = getErrorSummaryItems(
                    values,
                    errors as Partial<FormErrors>,
                    serverValidationErrors,
                );

                return (
                    <>
                        <FormChangeObserver
                            hasSubmitted={!!hasSubmitted}
                            oppdaterKorrigering={oppdaterKorrigering}
                            validerKorrigering={validerKorrigering}
                        />

                        <Form className="korrigering">
                            <Box padding="4">
                                <div className="mb-4">
                                    <Heading size="medium" level="2">
                                        <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.header" />
                                    </Heading>
                                </div>

                                <Alert size="small" variant="info" className="mb-4">
                                    <Heading size="small" level="2">
                                        <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.header" />
                                    </Heading>

                                    <List as="ul">
                                        <List.Item>
                                            <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.header.info.listElement.1" />
                                        </List.Item>
                                        <List.Item>
                                            <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.header.info.listElement.2" />
                                        </List.Item>
                                    </List>
                                </Alert>

                                <OpplysningerOmKorrigering />

                                <VirksomhetPanel søkerId={søkerId} />

                                <TrekkPerioder
                                    isPanelOpen={!!åpnePaneler.trekkperioderPanel}
                                    togglePanel={() => {
                                        const toggledPanel = !åpnePaneler.trekkperioderPanel;

                                        togglePaneler({ trekkperioderPanel: toggledPanel });

                                        if (!toggledPanel) {
                                            setFieldValue(KorrigeringAvInntektsmeldingFormFields.Trekkperioder, [
                                                getInitialPeriode(),
                                            ]);
                                        }
                                    }}
                                />

                                <LeggTilDelvisFravær
                                    isPanelOpen={!!åpnePaneler.leggTilDelvisFravær}
                                    togglePanel={() => {
                                        const toggledPanel = !åpnePaneler.leggTilDelvisFravær;

                                        togglePaneler({ leggTilDelvisFravær: toggledPanel });

                                        if (!toggledPanel) {
                                            setFieldValue(KorrigeringAvInntektsmeldingFormFields.DagerMedDelvisFravær, [
                                                {
                                                    dato: '',
                                                    timer: '',
                                                },
                                            ]);
                                        }
                                    }}
                                />

                                {hasSubmitted && errorSummaryItems.length > 0 && (
                                    <div className="mb-6">
                                        <ErrorSummary
                                            heading={intlHelper(
                                                intl,
                                                'omsorgspenger.utbetaling.punchForm.errorSummary.header',
                                            )}
                                        >
                                            {errorSummaryItems.map((item) => (
                                                <ErrorSummary.Item
                                                    key={`${item.href || 'no-href'}-${item.message}`}
                                                    href={item.href}
                                                >
                                                    {item.message}
                                                </ErrorSummary.Item>
                                            ))}
                                        </ErrorSummary>
                                    </div>
                                )}

                                {formError && hasSubmitted && (
                                    <div className="korrigering__feilmelding">
                                        <Feilmelding feil={formError} />
                                    </div>
                                )}
                            </Box>

                            <Button
                                type="button"
                                onClick={async () => {
                                    dispatch({ type: ActionType.SET_HAS_SUBMITTED });
                                    await setTouched(setNestedObjectValues(values, true));
                                    const validationErrors = await validateForm();

                                    if (Object.keys(validationErrors).length > 0) {
                                        return;
                                    }

                                    await validerKorrigering(values, { openConfirmationOnSuccess: true });
                                }}
                            >
                                <FormattedMessage id="omsorgspenger.korrigeringAvInntektsmelding.sendInn" />
                            </Button>
                        </Form>

                        {visBekreftelsemodal && (
                            <Modal
                                key="validertSoknadModal"
                                onClose={() => dispatch({ type: ActionType.SKJUL_BEKREFTELSEMODAL })}
                                aria-label="validertSoknadModal"
                                data-test-id="validertSoknadModal"
                                open
                            >
                                <Modal.Header closeButton={false}>
                                    <Heading
                                        size="medium"
                                        level="1"
                                        data-test-id="OMPKorrigeringPunchFormKvitteringHeader"
                                    >
                                        <FormattedMessage id="skjema.kvittering.oppsummering" />
                                    </Heading>
                                </Modal.Header>

                                <Modal.Body>
                                    <OMSKvittering feltverdier={values} />
                                </Modal.Body>

                                <Modal.Footer>
                                    <Button
                                        size="small"
                                        onClick={() => dispatch({ type: ActionType.VIS_ER_DU_SIKKER_MODAL })}
                                    >
                                        <FormattedMessage id="fordeling.knapp.videre" />
                                    </Button>

                                    <Button
                                        variant="secondary"
                                        size="small"
                                        onClick={() => dispatch({ type: ActionType.SKJUL_BEKREFTELSEMODAL })}
                                    >
                                        <FormattedMessage id="skjema.knapp.avbryt" />
                                    </Button>
                                </Modal.Footer>
                            </Modal>
                        )}

                        {visErDuSikkerModal && (
                            <ErDuSikkerModal
                                modalKey="modalerdusikkersendinn"
                                melding="modal.erdusikker.sendinn"
                                extraInfo="modal.erdusikker.sendinn.extrainfo"
                                open
                                submitKnappText="skjema.knapp.send"
                                onSubmit={() => sendInnKorrigering(values)}
                                onClose={() => {
                                    dispatch({ type: ActionType.SKJUL_ER_DU_SIKKER_MODAL });
                                }}
                            />
                        )}
                    </>
                );
            }}
        </Formik>
    );
};

export default KorrigeringAvInntektsmeldingForm;
