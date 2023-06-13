import { FormikErrors, setNestedObjectValues, useFormikContext } from 'formik';
import { debounce } from 'lodash';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { WrappedComponentProps, useIntl } from 'react-intl';

import { Alert, Button, ErrorSummary, Heading, Modal, Panel } from '@navikt/ds-react';

import ForhaandsvisSoeknadModal from 'app/components/forhaandsvisSoeknadModal/ForhaandsvisSoeknadModal';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import TextAreaFormik from 'app/components/formikInput/TextAreaFormik';
import IkkeRegistrerteOpplysninger from 'app/components/ikkeRegisterteOpplysninger/IkkeRegistrerteOpplysninger';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import VentModal from 'app/components/ventModal/VentModal';
import { IInputError } from 'app/models/types';
import { Feil } from 'app/models/types/ValideringResponse';
import intlHelper from 'app/utils/intlUtils';
import { feilFraYup } from 'app/utils/validationHelpers';

import VerticalSpacer from '../../components/VerticalSpacer';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';
import { IIdentState } from '../../models/types/IdentState';
import { useOppdaterSoeknadMutation, useValiderSoeknadMutation } from '../api';
import { fieldNames } from '../initialValues';
import schema from '../schema';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';
import OpplysningerOmOMPAOSoknad from './OpplysningerOmSoknad/OpplysningerOmOMPAOSoknad';
import { KvitteringContext } from './SoknadKvittering/KvitteringContext';
import { OMPAOSoknadKvittering } from './SoknadKvittering/OMPAOSoknadKvittering';

export interface IPunchOMPAOFormComponentProps {
    journalpostid: string;
    visForhaandsvisModal: boolean;
    setVisForhaandsvisModal: (vis: boolean) => void;
    k9FormatErrors: Feil[];
    setK9FormatErrors: (feil: Feil[]) => void;
    submitError: unknown;
}

export interface IPunchOMPAOFormStateProps {
    identState: IIdentState;
}

type IPunchOMPAOFormProps = IPunchOMPAOFormComponentProps & WrappedComponentProps & IPunchOMPAOFormStateProps;

const OMPAOPunchForm: React.FC<IPunchOMPAOFormProps> = (props) => {
    const {
        visForhaandsvisModal,
        setVisForhaandsvisModal,
        k9FormatErrors,
        setK9FormatErrors,
        journalpostid,
        submitError,
    } = props;
    const [harMellomlagret, setHarMellomlagret] = useState(false);
    const [visVentModal, setVisVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [feilmeldingStier, setFeilmeldingStier] = useState(new Set());
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);
    const { values, errors, isValid, setTouched, handleSubmit, validateForm, setFieldValue } =
        useFormikContext<IOMPAOSoknad>();
    const { kvittering, setKvittering } = React.useContext(KvitteringContext);
    const intl = useIntl();
    // OBS: SkalForhaandsviseSoeknad brukes i onSuccess
    const { mutate: valider } = useValiderSoeknadMutation(values, isValid, {
        setKvittering,
        setK9FormatErrors,
        setVisForhaandsvisModal,
    });

    const {
        isLoading: mellomlagrer,
        error: mellomlagringError,
        mutate: mellomlagreSoeknad,
    } = useOppdaterSoeknadMutation(values, {
        onSuccess: (data: any, { submitSoknad }: { submitSoknad: boolean }) => {
            setHarMellomlagret(true);
            if (submitSoknad) {
                handleSubmit();
            }
        },
    });

    const updateSoknad = ({ submitSoknad }: { submitSoknad: boolean }) => {
        if (harForsoektAaSendeInn) {
            valider({ skalForhaandsviseSoeknad: false });
            setTouched(setNestedObjectValues(values, true));
        }
        return mellomlagreSoeknad({ submitSoknad });
    };

    const debounceCallback = useCallback(
        debounce(() => updateSoknad({ submitSoknad: false }), 3000),
        [],
    );

    useEffect(() => {
        debounceCallback();
    }, [values]);

    useEffect(() => {
        if (!values.journalposter.includes(props.journalpostid)) {
            setFieldValue('journalposter', [...values.journalposter, props.journalpostid], false);
        }
    }, []);

    useEffect(() => {
        if (harMellomlagret) {
            setTimeout(() => setHarMellomlagret(false), 3000);
        }
    }, [harMellomlagret]);

    // TODO: bør flytttes
    const getUhaandterteFeil = (attribute: string): Feil[] => {
        if (!feilmeldingStier.has(attribute)) {
            setFeilmeldingStier(feilmeldingStier.add(attribute));
        }
        const uhaandterteFeilmeldinger = k9FormatErrors?.filter((m: IInputError) => {
            const felter = m.felt?.split('.') || [];
            for (let index = felter.length - 1; index >= -1; index--) {
                const felt = felter.slice(0, index + 1).join('.');
                const andreFeilmeldingStier = new Set(feilmeldingStier);
                andreFeilmeldingStier.delete(attribute);
                if (attribute === felt) {
                    return true;
                }
                if (andreFeilmeldingStier.has(felt)) {
                    return false;
                }
            }
            return false;
        });

        if (uhaandterteFeilmeldinger && uhaandterteFeilmeldinger?.length > 0) {
            return uhaandterteFeilmeldinger.map((error) => error).filter(Boolean);
        }
        return [];
    };

    const harFeilISkjema = (errorList: FormikErrors<IOMPAOSoknad>) =>
        !![...getUhaandterteFeil(''), ...Object.keys(errorList)].length;

    return (
        <>
            <MellomlagringEtikett lagrer={mellomlagrer} lagret={harMellomlagret} error={!!mellomlagringError} />
            <VerticalSpacer sixteenPx />
            <OpplysningerOmOMPAOSoknad />
            <VerticalSpacer sixteenPx />
            <Panel border className="my-12">
                <Heading size="small" className="mb-4">
                    Søknadsperiode
                </Heading>

                <div className="fom-tom-rad mb-4">
                    <DatoInputFormik label="Fra og med" name={`${fieldNames.soeknadsperiode}.fom`} />
                    <DatoInputFormik label="Til og med" name={`${fieldNames.soeknadsperiode}.tom`} />
                </div>
            </Panel>
            <Panel border className="my-12">
                <Heading size="small" className="mb-4">
                    Begrunnelse for innsending
                </Heading>

                <TextAreaFormik
                    label="Begrunnelse for innsending"
                    name={`${fieldNames.begrunnelseForInnsending}`}
                    hideLabel
                />
            </Panel>
            <VerticalSpacer sixteenPx />
            <VerticalSpacer fourtyPx />
            <IkkeRegistrerteOpplysninger intl={intl} />
            <VerticalSpacer twentyPx />
            {harForsoektAaSendeInn && harFeilISkjema(errors) && (
                <ErrorSummary heading="Du må fikse disse feilene før du kan sende inn punsjemeldingen.">
                    {getUhaandterteFeil('').map((feil) => (
                        <ErrorSummary.Item key={feil.felt}>{`${feil.felt}: ${feil.feilmelding}`}</ErrorSummary.Item>
                    ))}
                    {/* Denne bør byttes ut med errors fra formik */}
                    {feilFraYup(schema, values)?.map((error: { message: string; path: string }) => (
                        <ErrorSummary.Item key={`${error.path}-${error.message}`}>{error.message}</ErrorSummary.Item>
                    ))}
                </ErrorSummary>
            )}
            <div className="submit-knapper">
                <p className="sendknapp-wrapper">
                    <Button
                        variant="secondary"
                        className="send-knapp"
                        onClick={() => {
                            if (!harForsoektAaSendeInn) {
                                setHarForsoektAaSendeInn(true);
                                setTouched(setNestedObjectValues(values, true));
                            }
                            validateForm(values).then((v) => {
                                if (Object.keys(v).length) {
                                    valider({ skalForhaandsviseSoeknad: false });
                                    return;
                                }

                                valider({ skalForhaandsviseSoeknad: true });
                            });
                        }}
                    >
                        {intlHelper(intl, 'skjema.knapp.send')}
                    </Button>

                    <Button
                        variant="secondary"
                        className="vent-knapp"
                        onClick={() => setVisVentModal(true)}
                        disabled={false}
                    >
                        {intlHelper(intl, 'skjema.knapp.settpaavent')}
                    </Button>
                </p>
            </div>
            <VerticalSpacer sixteenPx />
            {mellomlagringError instanceof Error && (
                <Alert size="small" variant="error">
                    {intlHelper(intl, 'skjema.feil.ikke_lagret')}
                </Alert>
            )}
            {submitError instanceof Error && (
                <Alert size="small" variant="error">
                    {intlHelper(intl, submitError.message)}
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
                <Modal
                    key="erdusikkermodal"
                    className="erdusikkermodal"
                    onClose={() => setVisErDuSikkerModal(false)}
                    aria-label="erdusikkermodal"
                    closeButton={false}
                    open={visErDuSikkerModal}
                >
                    <ErDuSikkerModal
                        melding="modal.erdusikker.sendinn"
                        extraInfo="modal.erdusikker.sendinn.extrainfo"
                        onSubmit={() => {
                            updateSoknad({ submitSoknad: true });
                        }}
                        submitKnappText="skjema.knapp.send"
                        onClose={() => {
                            setVisErDuSikkerModal(false);
                        }}
                    />
                </Modal>
            )}
        </>
    );
};

export default OMPAOPunchForm;
/* eslint-enable */
