import React, { useCallback, useEffect, useState } from 'react';

import { FormikErrors, setNestedObjectValues, useFormikContext } from 'formik';
import { debounce } from 'lodash';

import { FormattedMessage, useIntl } from 'react-intl';
import { useMutation } from 'react-query';

import { Alert, Box, Button, ErrorSummary, Heading, Modal } from '@navikt/ds-react';

import ForhaandsvisSoeknadModal from 'app/components/forhaandsvisSoeknadModal/ForhaandsvisSoeknadModal';
import IkkeRegistrerteOpplysninger from 'app/components/ikkeRegisterteOpplysninger/IkkeRegistrerteOpplysninger';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import Personvelger from 'app/components/person-velger/Personvelger';
import VentModal from 'app/components/ventModal/VentModal';
import { Periode, PersonEnkel } from 'app/models/types';
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import intlHelper from 'app/utils/intlUtils';
import { feilFraYup } from 'app/utils/validationHelpers';
import JournalposterSync from 'app/components/JournalposterSync';

import VerticalSpacer from '../../../components/VerticalSpacer';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';

import { oppdaterSoeknad, validerSoeknad } from '../api';
import EksisterendePerioder from '../components/EksisterendePerioder';
import Medlemskap from '../components/Medlemskap';
import NySoeknadEllerKorrigering from '../components/NySoeknadEllerKorrigering';
import Utenlandsopphold from '../components/Utenlandsopphold';
import schema, { getSchemaContext } from '../schema';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import { IOMPUTSoknadKvittering } from '../types/OMPUTSoknadKvittering';
import { filtrerVerdierFoerInnsending, frontendTilBackendMapping, korrigeringFilter } from '../utils';
import ArbeidsforholdVelger from './ArbeidsforholdVelger';
import OpplysningerOmOMPUTSoknad from './OpplysningerOmSoknad/OpplysningerOmOMPUTSoknad';
import { OMPUTSoknadKvittering } from './SoknadKvittering/OMPUTSoknadKvittering';

interface Props {
    journalpostid: string;
    søkerId: string;
    visForhaandsvisModal: boolean;
    setVisForhaandsvisModal: (vis: boolean) => void;
    k9FormatErrors: Feil[];
    setK9FormatErrors: (feil: Feil[]) => void;
    submitError: unknown;
    eksisterendePerioder: Periode[];
    setKvittering: (kvittering?: IOMPUTSoknadKvittering) => void;
    kvittering?: IOMPUTSoknadKvittering;
    søknadsperiodeFraSak?: {
        fom: string;
        tom: string;
    };
    fosterbarnFraIdentState?: PersonEnkel[];
}

const OMPUTPunchForm: React.FC<Props> = ({
    søkerId,
    visForhaandsvisModal,
    setVisForhaandsvisModal,
    k9FormatErrors,
    setK9FormatErrors,
    journalpostid,
    submitError,
    eksisterendePerioder,
    kvittering,
    søknadsperiodeFraSak,
    fosterbarnFraIdentState,
    setKvittering,
}: Props) => {
    const intl = useIntl();

    const [harMellomlagret, setHarMellomlagret] = useState(false);
    const [visVentModal, setVisVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);

    const { values, errors, setTouched, handleSubmit, isValid, validateForm, setFieldValue } =
        useFormikContext<IOMPUTSoknad>();

    // OBS: SkalForhaandsviseSoeknad brukes i onSuccess
    const { mutate: valider } = useMutation(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ skalForhaandsviseSoeknad }: { skalForhaandsviseSoeknad?: boolean }) =>
            values.erKorrigering
                ? validerSoeknad(
                      korrigeringFilter(frontendTilBackendMapping(filtrerVerdierFoerInnsending(values))),
                      søkerId,
                  )
                : validerSoeknad(frontendTilBackendMapping(filtrerVerdierFoerInnsending(values)), søkerId),
        {
            onSuccess: (data: ValideringResponse | IOMPUTSoknadKvittering, { skalForhaandsviseSoeknad }) => {
                if ('ytelse' in data && skalForhaandsviseSoeknad && isValid) {
                    const kvitteringResponse = data as IOMPUTSoknadKvittering;
                    setVisForhaandsvisModal(true);
                    if (setKvittering) {
                        setKvittering(kvitteringResponse);
                    } else {
                        throw Error('Kvittering-context er ikke satt');
                    }
                }
                if ('feil' in data && data?.feil?.length) {
                    setK9FormatErrors(data.feil);
                    if (setKvittering) {
                        setKvittering(undefined);
                    } else {
                        throw Error('Kvittering-context er ikke satt');
                    }
                } else {
                    setK9FormatErrors([]);
                }
            },
        },
    );

    const {
        isLoading: mellomlagrer,
        error: mellomlagringError,
        mutate: mellomlagreSoeknad,
    } = useMutation(
        ({ submitSoknad }: { submitSoknad: boolean }) => {
            if (values.erKorrigering) {
                return submitSoknad
                    ? oppdaterSoeknad(
                          korrigeringFilter(frontendTilBackendMapping(filtrerVerdierFoerInnsending(values))),
                      )
                    : oppdaterSoeknad(korrigeringFilter(frontendTilBackendMapping(values)));
            }

            return submitSoknad
                ? oppdaterSoeknad(frontendTilBackendMapping(filtrerVerdierFoerInnsending(values)))
                : oppdaterSoeknad(frontendTilBackendMapping(values));
        },
        {
            onSuccess: (data, { submitSoknad }) => {
                setHarMellomlagret(true);
                if (submitSoknad) {
                    handleSubmit();
                }
            },
        },
    );

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
        if (!values.journalposter.includes(journalpostid)) {
            setFieldValue('journalposter', [...values.journalposter, journalpostid], false);
        }
    }, []);

    useEffect(() => {
        if (harMellomlagret) {
            setTimeout(() => setHarMellomlagret(false), 3000);
        }
    }, [harMellomlagret]);

    useEffect(() => {
        if (fosterbarnFraIdentState) {
            const prevBarn = values.barn;
            const updatedBarn = Array.isArray(prevBarn) ? [...prevBarn] : [];
            fosterbarnFraIdentState.forEach((newItem) => {
                if (!updatedBarn.some((item) => item.norskIdent === newItem.norskIdent)) {
                    updatedBarn.push(newItem);
                }
            });
            setFieldValue('barn', updatedBarn, false);
        }
    }, [fosterbarnFraIdentState]);

    const harFeilISkjema = (errorList: FormikErrors<IOMPUTSoknad>) =>
        !![...k9FormatErrors, ...Object.keys(errorList)].length;

    return (
        <>
            <JournalposterSync journalposter={values.journalposter} />

            <MellomlagringEtikett lagrer={mellomlagrer} lagret={harMellomlagret} error={!!mellomlagringError} />

            <VerticalSpacer sixteenPx />

            <OpplysningerOmOMPUTSoknad />

            <VerticalSpacer sixteenPx />

            <Box padding="4" borderWidth="1" borderRadius="small">
                <Heading size="small" spacing>
                    <FormattedMessage id={'omsorgspenger.utbetaling.punchForm.fosterbarn.header'} />
                </Heading>
                <Personvelger name="barn" />
            </Box>

            <EksisterendePerioder eksisterendePerioder={eksisterendePerioder} />

            <VerticalSpacer sixteenPx />

            <NySoeknadEllerKorrigering eksisterendePerioder={eksisterendePerioder} />

            <VerticalSpacer fourtyPx />

            <ArbeidsforholdVelger søknadsperiodeFraSak={søknadsperiodeFraSak} />

            <VerticalSpacer fourtyPx />

            {!values.erKorrigering && (
                <>
                    <Medlemskap />

                    <VerticalSpacer fourtyPx />

                    <Utenlandsopphold />
                </>
            )}

            <IkkeRegistrerteOpplysninger intl={intl} />

            <VerticalSpacer twentyPx />

            {harForsoektAaSendeInn && harFeilISkjema(errors) && (
                <ErrorSummary heading={intlHelper(intl, 'omsorgspenger.utbetaling.punchForm.errorSummary.header')}>
                    {k9FormatErrors.map((feil) => (
                        <ErrorSummary.Item key={feil.felt}>{`${feil.felt}: ${feil.feilmelding}`}</ErrorSummary.Item>
                    ))}

                    {/* Denne bør byttes ut med errors fra formik */}
                    {feilFraYup(schema, values, getSchemaContext(values, eksisterendePerioder))?.map(
                        (error: { message: string; path: string }) => (
                            <ErrorSummary.Item key={`${error.path}-${error.message}`}>
                                {error.message}
                            </ErrorSummary.Item>
                        ),
                    )}
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
                        <FormattedMessage id={`skjema.knapp.send`} />
                    </Button>

                    <Button
                        variant="secondary"
                        className="vent-knapp"
                        onClick={() => setVisVentModal(true)}
                        disabled={false}
                    >
                        <FormattedMessage id={`skjema.knapp.settpaavent`} />
                    </Button>
                </p>
            </div>

            <VerticalSpacer sixteenPx />

            {mellomlagringError instanceof Error && (
                <Alert size="small" variant="error">
                    <FormattedMessage id={`skjema.feil.ikke_lagret`} />
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
                    <OMPUTSoknadKvittering kvittering={kvittering} />
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

export default OMPUTPunchForm;
