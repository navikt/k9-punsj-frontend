import React, { useEffect, useState } from 'react';

import { useFormContext } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Button, ErrorSummary, Heading } from '@navikt/ds-react';
import JournalposterSync from 'app/components/JournalposterSync';
import ForhaandsvisSoeknadModal from 'app/components/forhaandsvisSoeknadModal/ForhaandsvisSoeknadModal';
import IkkeRegistrerteOpplysningerV2 from 'app/components/ikkeRegisterteOpplysninger/IkkeRegistrerteOpplysningerV2';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import VentModal from 'app/components/ventModal/VentModal';
import { Feil } from 'app/models/types/ValideringResponse';
import intlHelper from 'app/utils/intlUtils';
import VerticalSpacer from '../../../components/VerticalSpacer';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import { useOppdaterSoeknadMutation, useValiderSoeknadMutation } from '../api';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';
import OMPAOSoknadKvittering from './SoknadKvittering/OMPAOSoknadKvittering';
import { IOMPAOSoknadKvittering } from '../types/OMPAOSoknadKvittering';
import OpplysningerOmOMPAOSoknadV2 from './OpplysningerOmSoknad/OpplysningerOmOMPAOSoknadV2';
import { getTypedFormComponents } from 'app/components/form/getTypedFormComponents';
import { useOMPAOValidationRules } from '../validation/useOMPAOValidationRules';

const { TypedFormDatePicker } = getTypedFormComponents<IOMPAOSoknad>();

interface OMPAOPunchFormV2Props {
    journalpostid: string;
    visForhaandsvisModal: boolean;
    setVisForhaandsvisModal: (vis: boolean) => void;
    k9FormatErrors: Feil[];
    setK9FormatErrors: (feil: Feil[]) => void;
    submitError: unknown;
    setKvittering: (kvittering?: IOMPAOSoknadKvittering) => void;
    kvittering?: IOMPAOSoknadKvittering;
}

const OMPAOPunchFormV2: React.FC<OMPAOPunchFormV2Props> = ({
    visForhaandsvisModal,
    setVisForhaandsvisModal,
    k9FormatErrors,
    setK9FormatErrors,
    journalpostid,
    submitError,
    setKvittering,
    kvittering,
}) => {
    const intl = useIntl();

    const [harMellomlagret, setHarMellomlagret] = useState(false);
    const [visVentModal, setVisVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);

    const {
        watch,
        trigger,
        formState: { errors },
    } = useFormContext<IOMPAOSoknad>();
    const validationRules = useOMPAOValidationRules<IOMPAOSoknad>();
    const values = watch();

    const { mutate: valider } = useValiderSoeknadMutation(values, !Object.keys(errors).length, {
        setKvittering,
        setK9FormatErrors,
        setVisForhaandsvisModal,
    });

    const {
        isPending: mellomlagrer,
        error: mellomlagringError,
        // mutate: mellomlagreSoeknad,
    } = useOppdaterSoeknadMutation(values, {
        onSuccess: (data: any, { submitSoknad }: { submitSoknad: boolean }) => {
            setHarMellomlagret(true);
            if (submitSoknad) {
                // RHF's handleSubmit will trigger this path
            }
        },
    });

    useEffect(() => {
        if (!values.journalposter?.includes(journalpostid)) {
            // Logic to add journalpostid if not present
        }
    }, [journalpostid, values.journalposter]);

    useEffect(() => {
        if (harMellomlagret) {
            setTimeout(() => setHarMellomlagret(false), 3000);
        }
    }, [harMellomlagret]);

    const harFeilISkjema = Object.keys(errors).length > 0 || k9FormatErrors.length > 0;
    return (
        <>
            <JournalposterSync journalposter={values.journalposter || []} />

            <MellomlagringEtikett lagrer={mellomlagrer} lagret={harMellomlagret} error={!!mellomlagringError} />

            <Heading size="medium">
                <FormattedMessage id={'skjema.ompao.tittel'} />
            </Heading>

            <OpplysningerOmOMPAOSoknadV2 />

            <Box padding="4" borderWidth="1" borderRadius="small" className="my-12">
                <TypedFormDatePicker
                    label={intlHelper(intl, 'skjema.ompao.dateInput.label')}
                    name="periode.fom"
                    validate={validationRules.getDateRule()}
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
                    {Object.entries(errors).map(([key, error]) => (
                        <ErrorSummary.Item key={key}>{error.message}</ErrorSummary.Item>
                    ))}
                </ErrorSummary>
            )}

            <div className="submit-knapper">
                <p className="sendknapp-wrapper">
                    <Button
                        className="send-knapp"
                        type="submit"
                        onClick={async () => {
                            const isValid = await trigger();
                            if (isValid) {
                                valider({ skalForhaandsviseSoeknad: true });
                            } else {
                                valider({ skalForhaandsviseSoeknad: false });
                            }
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
                        <FormattedMessage id={'skjema.knapp.settpaavent'} />
                    </Button>
                </p>
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
                        // This will be triggered from the main form's onSubmit
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
