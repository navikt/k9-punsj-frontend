import React, { useEffect, useState } from 'react';
import { useFormContext } from 'react-hook-form';
import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Box, Button, ErrorSummary, Heading } from '@navikt/ds-react';
import JournalposterSync from 'app/components/JournalposterSync';
import ForhaandsvisSoeknadModal from 'app/components/forhaandsvisSoeknadModal/ForhaandsvisSoeknadModal';
import IkkeRegistrerteOpplysningerV2 from 'app/components/ikkeRegisterteOpplysninger/IkkeRegistrerteOpplysningerV2';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import VentModal from 'app/components/ventModal/VentModal';
import intlHelper from 'app/utils/intlUtils';
import VerticalSpacer from '../../../components/VerticalSpacer';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';
import OMPAOSoknadKvittering from './SoknadKvittering/OMPAOSoknadKvittering';
import { IOMPAOSoknadKvittering } from '../types/OMPAOSoknadKvittering';
import OpplysningerOmOMPAOSoknadV2 from './OpplysningerOmSoknad/OpplysningerOmOMPAOSoknadV2';
import { getTypedFormComponents } from 'app/components/form/getTypedFormComponents';
import { flattenErrors, useOmpaoSoknadMutations } from '../hooks/useOmpaoSoknadMutations';

const { TypedFormDatePicker } = getTypedFormComponents<IOMPAOSoknad>();

interface OMPAOPunchFormV2Props {
    journalpostid: string;
    onSoknadSent: (kvittering: IOMPAOSoknadKvittering) => void;
}

const OMPAOPunchFormV2: React.FC<OMPAOPunchFormV2Props> = ({ journalpostid, onSoknadSent }) => {
    const intl = useIntl();
    const [visVentModal, setVisVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [harMellomlagret, setHarMellomlagret] = useState(false);
    const [submitError, setSubmitError] = useState<Error | null>(null);

    const {
        watch,
        trigger,
        formState: { errors },
        setValue,
        getValues,
    } = useFormContext<IOMPAOSoknad>();
    const values = watch();
    const periodeFomValue = watch('periode.fom');

    const {
        mellomlagrer,
        mellomlagringError,
        k9FormatErrors,
        visForhaandsvisModal,
        setVisForhaandsvisModal,
        kvittering,
        submit,
        confirmAndSend,
    } = useOmpaoSoknadMutations({
        onSoknadSent,
        onSoknadSendError: setSubmitError,
        onSoknadUpdated: () => setHarMellomlagret(true),
    });

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
                        const isValid = await trigger();
                        submit(isValid);
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
                        confirmAndSend();
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
