import { FormikErrors, setNestedObjectValues, useFormikContext } from 'formik';
import { debounce } from 'lodash';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useIntl } from 'react-intl';

import { Alert, Button, ErrorSummary, Heading, Modal, Panel } from '@navikt/ds-react';

import JournalposterSync from 'app/components/JournalposterSync';
import ForhaandsvisSoeknadModal from 'app/components/forhaandsvisSoeknadModal/ForhaandsvisSoeknadModal';
import DatoInputFormik from 'app/components/formikInput/DatoInputFormik';
import IkkeRegistrerteOpplysninger from 'app/components/ikkeRegisterteOpplysninger/IkkeRegistrerteOpplysninger';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import VentModal from 'app/components/ventModal/VentModal';
import { Feil } from 'app/models/types/ValideringResponse';
import intlHelper from 'app/utils/intlUtils';
import { feilFraYup } from 'app/utils/validationHelpers';

import VerticalSpacer from '../../../components/VerticalSpacer';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import { useOppdaterSoeknadMutation, useValiderSoeknadMutation } from '../api';
import { fieldNames } from '../initialValues';
import schema from '../schema';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';
import OpplysningerOmOMPAOSoknad from './OpplysningerOmSoknad/OpplysningerOmOMPAOSoknad';
import { OMPAOSoknadKvittering } from './SoknadKvittering/OMPAOSoknadKvittering';
import { IOMPAOSoknadKvittering } from '../types/OMPAOSoknadKvittering';

export interface IPunchOMPAOFormComponentProps {
    journalpostid: string;
    visForhaandsvisModal: boolean;
    setVisForhaandsvisModal: (vis: boolean) => void;
    k9FormatErrors: Feil[];
    setK9FormatErrors: (feil: Feil[]) => void;
    submitError: unknown;
    setKvittering: (kvittering?: IOMPAOSoknadKvittering) => void;
    kvittering?: IOMPAOSoknadKvittering;
}

type IPunchOMPAOFormProps = IPunchOMPAOFormComponentProps;

const OMPAOPunchForm: React.FC<IPunchOMPAOFormProps> = (props) => {
    const {
        visForhaandsvisModal,
        setVisForhaandsvisModal,
        k9FormatErrors,
        setK9FormatErrors,
        journalpostid,
        submitError,
        setKvittering,
        kvittering,
    } = props;

    const [harMellomlagret, setHarMellomlagret] = useState(false);
    const [visVentModal, setVisVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);
    const { values, errors, isValid, setTouched, handleSubmit, validateForm, setFieldValue } =
        useFormikContext<IOMPAOSoknad>();
    const intl = useIntl();

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
        debounce(() => updateSoknad({ submitSoknad: false }), 1000),
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

    const harFeilISkjema = (errorList: FormikErrors<IOMPAOSoknad>) =>
        !![...k9FormatErrors, ...Object.keys(errorList)].length;

    return (
        <>
            <JournalposterSync journalposter={values.journalposter} />
            <MellomlagringEtikett lagrer={mellomlagrer} lagret={harMellomlagret} error={!!mellomlagringError} />
            <Heading size="medium">Alene om omsorgen</Heading>
            <VerticalSpacer sixteenPx />
            <OpplysningerOmOMPAOSoknad />
            <Panel border className="my-12">
                <DatoInputFormik label="Søker er alene om omsorgen fra og med" name={`${fieldNames.periode}.fom`} />
            </Panel>
            <VerticalSpacer fourtyPx />
            <IkkeRegistrerteOpplysninger intl={intl} />
            <VerticalSpacer twentyPx />
            {harForsoektAaSendeInn && harFeilISkjema(errors) && (
                <ErrorSummary heading="Du må fikse disse feilene før du kan sende inn punsjemeldingen.">
                    {k9FormatErrors.map((feil) => (
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
