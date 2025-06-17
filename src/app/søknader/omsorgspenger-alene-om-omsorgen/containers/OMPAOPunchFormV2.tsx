import React, { useCallback, useEffect, useRef, useState } from 'react';
import { debounce } from 'lodash';
import { useFormContext } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Button, ErrorSummary, Heading } from '@navikt/ds-react';
import JournalposterSync from 'app/components/JournalposterSync';
import ForhaandsvisSoeknadModal from 'app/components/forhaandsvisSoeknadModal/ForhaandsvisSoeknadModal';
import IkkeRegistrerteOpplysningerV2 from 'app/components/ikkeRegisterteOpplysninger/IkkeRegistrerteOpplysningerV2';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import VentModal from 'app/components/ventModal/VentModal';
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import intlHelper from 'app/utils/intlUtils';
import VerticalSpacer from '../../../components/VerticalSpacer';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import { useOppdaterSoeknadMutation, useSendSoeknadMutation, useValiderSoeknadMutation } from '../api';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';
import OMPAOSoknadKvittering from './SoknadKvittering/OMPAOSoknadKvittering';
import { IOMPAOSoknadKvittering } from '../types/OMPAOSoknadKvittering';
import OpplysningerOmOMPAOSoknadV2 from './OpplysningerOmSoknad/OpplysningerOmOMPAOSoknadV2';
import { getTypedFormComponents } from 'app/components/form/getTypedFormComponents';

const { TypedFormDatePicker } = getTypedFormComponents<IOMPAOSoknad>();

const flattenErrors = (errors: object) => {
    const errorMessages: { key: string; message: string }[] = [];
    const recurse = (obj: any, path: string) => {
        if (!obj) return;
        if (typeof obj.message === 'string') {
            errorMessages.push({ key: path, message: obj.message });
        } else {
            Object.keys(obj).forEach((key) => {
                const newPath = path ? `${path}.${key}` : key;
                recurse(obj[key], newPath);
            });
        }
    };
    recurse(errors, '');
    return errorMessages;
};

interface OMPAOPunchFormV2Props {
    journalpostid: string;
    visForhaandsvisModal: boolean;
    k9FormatErrors: Feil[];
    submitError: unknown;
    kvittering?: IOMPAOSoknadKvittering;

    setVisForhaandsvisModal: (vis: boolean) => void;
    setK9FormatErrors: (feil: Feil[]) => void;
    setKvittering: (kvittering?: IOMPAOSoknadKvittering) => void;
    setSubmitError: (error: unknown) => void;
    setErSendtInn: (erSendtInn: boolean) => void;
}

const OMPAOPunchFormV2: React.FC<OMPAOPunchFormV2Props> = (props: OMPAOPunchFormV2Props) => {
    const intl = useIntl();

    const {
        journalpostid,
        visForhaandsvisModal,
        k9FormatErrors,
        submitError,
        kvittering,
        setVisForhaandsvisModal,
        setK9FormatErrors,
        setKvittering,
        setSubmitError,
        setErSendtInn,
    } = props;

    const [harMellomlagret, setHarMellomlagret] = useState(false);
    const [visVentModal, setVisVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);

    const {
        watch,
        trigger,
        formState: { errors },
        setValue,
        getValues,
    } = useFormContext<IOMPAOSoknad>();
    const values = watch();
    const periodeFomValue = watch('periode.fom');

    const { mutate: valider } = useValiderSoeknadMutation({
        setKvittering,
        setK9FormatErrors,
        setVisForhaandsvisModal,
    });

    const { mutate: sendSoeknadMutate } = useSendSoeknadMutation(
        (data: IOMPAOSoknadKvittering | ValideringResponse) => {
            if ('søknadId' in data) {
                setKvittering(data as IOMPAOSoknadKvittering);
                setErSendtInn(true);
            }
        },
        (error: Error) => {
            setSubmitError(error);
        },
    );

    const {
        isPending: mellomlagrer,
        error: mellomlagringError,
        mutate: mellomlagreSoeknad,
    } = useOppdaterSoeknadMutation({
        onSuccess: (data: any, { submitSoknad }: { soeknad: Partial<IOMPAOSoknad>; submitSoknad: boolean }) => {
            setHarMellomlagret(true);
            if (submitSoknad) {
                const valuesAfterUpdate = getValues();
                sendSoeknadMutate({
                    soeknadId: valuesAfterUpdate.soeknadId,
                    ident: valuesAfterUpdate.soekerId,
                });
            }
        },
    });

    const callbackDependencies = useRef({
        getValues,
        harForsoektAaSendeInn,
        valider,
        mellomlagreSoeknad,
    });

    callbackDependencies.current = {
        getValues,
        harForsoektAaSendeInn,
        valider,
        mellomlagreSoeknad,
    };

    const debounceCallback = useCallback(
        debounce(() => {
            const currentValues = callbackDependencies.current.getValues();
            if (callbackDependencies.current.harForsoektAaSendeInn) {
                callbackDependencies.current.valider({
                    soeknad: currentValues,
                    skalForhaandsviseSoeknad: false,
                    isValid: false,
                });
            }
            callbackDependencies.current.mellomlagreSoeknad({ soeknad: currentValues, submitSoknad: false });
        }, 1000),
        [],
    );

    const isMounted = useRef(false);
    useEffect(() => {
        const subscription = watch(() => {
            if (isMounted.current) {
                debounceCallback();
            } else {
                isMounted.current = true;
            }
        });

        return () => {
            subscription.unsubscribe();
            debounceCallback.cancel();
        };
    }, [watch, debounceCallback]);

    useEffect(() => {
        const currentJournalposter = getValues('journalposter') || [];
        if (!currentJournalposter.includes(journalpostid)) {
            setValue('journalposter', [...currentJournalposter, journalpostid]);
        }
    }, [journalpostid, setValue, getValues]);

    useEffect(() => {
        if (harMellomlagret) {
            setTimeout(() => setHarMellomlagret(false), 3000);
        }
    }, [harMellomlagret]);

    const harFeilISkjema = Object.keys(errors).length > 0 || k9FormatErrors.length > 0;
    const flatErrors = flattenErrors(errors);

    return (
        <>
            <JournalposterSync journalposter={values.journalposter || []} />

            <MellomlagringEtikett lagrer={mellomlagrer} lagret={harMellomlagret} error={!!mellomlagringError} />

            <VerticalSpacer fourtyPx />

            <Heading size="medium">
                <FormattedMessage id="skjema.ompao.tittel" />
            </Heading>

            <OpplysningerOmOMPAOSoknadV2 />

            <Box padding="4" borderWidth="1" borderRadius="small" className="my-12">
                <TypedFormDatePicker
                    key={periodeFomValue}
                    label={intlHelper(intl, 'skjema.ompao.dateInput.label')}
                    name="periode.fom"
                />
            </Box>

            <VerticalSpacer fourtyPx />

            <IkkeRegistrerteOpplysningerV2 />

            <VerticalSpacer twentyPx />

            {harFeilISkjema && (
                <ErrorSummary heading={intlHelper(intl, 'skjema.ompao.dateInput.errorSummaryHeading')}>
                    {k9FormatErrors.map((feil) => (
                        <ErrorSummary.Item key={feil.felt}>{`${feil.felt}: ${feil.feilmelding}`}</ErrorSummary.Item>
                    ))}
                    {flatErrors.map((error) => (
                        <ErrorSummary.Item key={error.key}>{error.message}</ErrorSummary.Item>
                    ))}
                </ErrorSummary>
            )}

            <div className="submit-knapper">
                <Button
                    className="send-knapp"
                    type="button"
                    onClick={async () => {
                        if (!harForsoektAaSendeInn) {
                            setHarForsoektAaSendeInn(true);
                        }
                        const isValid = await trigger();
                        valider({ soeknad: getValues(), skalForhaandsviseSoeknad: isValid, isValid });
                    }}
                >
                    <FormattedMessage id={'skjema.knapp.send'} />
                </Button>

                <Button
                    variant="secondary"
                    type="button"
                    className="vent-knapp"
                    onClick={() => setVisVentModal(true)}
                    disabled={false}
                >
                    <FormattedMessage id="skjema.knapp.settpaavent" />
                </Button>
            </div>

            <VerticalSpacer sixteenPx />

            {mellomlagringError instanceof Error && (
                <Alert size="small" variant="error">
                    <FormattedMessage id={'skjema.feil.ikke_lagret'} />
                </Alert>
            )}

            {submitError instanceof Error && (
                <Alert size="small" variant="error">
                    <FormattedMessage id={submitError.message} />
                </Alert>
            )}

            {visVentModal && (
                <VentModal journalpostId={journalpostid} soeknadId={values.soeknadId} visModalFn={setVisVentModal} />
            )}

            {visForhaandsvisModal && (
                <ForhaandsvisSoeknadModal
                    avbryt={() => setVisForhaandsvisModal(false)}
                    videre={() => {
                        setVisForhaandsvisModal(false);
                        setVisErDuSikkerModal(true);
                    }}
                    intl={intl}
                >
                    <OMPAOSoknadKvittering kvittering={kvittering} />
                </ForhaandsvisSoeknadModal>
            )}

            {visErDuSikkerModal && (
                <ErDuSikkerModal
                    modalKey="erdusikkermodal"
                    melding="modal.erdusikker.sendinn"
                    extraInfo="modal.erdusikker.sendinn.extrainfo"
                    open={visErDuSikkerModal}
                    submitKnappText="skjema.knapp.send"
                    onSubmit={() => {
                        const currentValues = callbackDependencies.current.getValues();
                        if (callbackDependencies.current.harForsoektAaSendeInn) {
                            callbackDependencies.current.valider({
                                soeknad: currentValues,
                                skalForhaandsviseSoeknad: false,
                                isValid: false,
                            });
                        }
                        callbackDependencies.current.mellomlagreSoeknad({
                            soeknad: currentValues,
                            submitSoknad: true,
                        });
                        setVisErDuSikkerModal(false);
                    }}
                    onClose={() => {
                        setVisErDuSikkerModal(false);
                    }}
                />
            )}
        </>
    );
};

export default OMPAOPunchFormV2;
