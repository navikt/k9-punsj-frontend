import { FormikErrors, setNestedObjectValues, useFormikContext } from 'formik';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Button, ErrorSummary, Heading, Modal, Panel } from '@navikt/ds-react';

import { debounce } from 'lodash';
import { useMutation } from 'react-query';

import ForhaandsvisSoeknadModal from 'app/components/forhaandsvisSoeknadModal/ForhaandsvisSoeknadModal';
import IkkeRegistrerteOpplysninger from 'app/components/ikkeRegisterteOpplysninger/IkkeRegistrerteOpplysninger';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import Personvelger from 'app/components/person-velger/Personvelger';
import VentModal from 'app/components/ventModal/VentModal';
import { IInputError, Periode } from 'app/models/types';
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import intlHelper from 'app/utils/intlUtils';
import { feilFraYup } from 'app/utils/validationHelpers';

import VerticalSpacer from '../../components/VerticalSpacer';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
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
import { KvitteringContext } from './SoknadKvittering/KvitteringContext';
import { OMPUTSoknadKvittering } from './SoknadKvittering/OMPUTSoknadKvittering';

export interface IPunchOMPUTFormComponentProps {
    journalpostid: string;
    visForhaandsvisModal: boolean;
    setVisForhaandsvisModal: (vis: boolean) => void;
    k9FormatErrors: Feil[];
    setK9FormatErrors: (feil: Feil[]) => void;
    submitError: unknown;
    eksisterendePerioder: Periode[];
}

export interface IPunchOMPUTFormStateProps {
    identState: IIdentState;
}

type IPunchOMPUTFormProps = IPunchOMPUTFormComponentProps & WrappedComponentProps & IPunchOMPUTFormStateProps;

export const PunchOMPUTFormComponent: React.FC<IPunchOMPUTFormProps> = (props) => {
    const {
        intl,
        identState,
        visForhaandsvisModal,
        setVisForhaandsvisModal,
        k9FormatErrors,
        setK9FormatErrors,
        journalpostid,
        submitError,
        eksisterendePerioder,
    } = props;
    const [harMellomlagret, setHarMellomlagret] = useState(false);
    const [visVentModal, setVisVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [feilmeldingStier, setFeilmeldingStier] = useState(new Set());
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);
    const { values, errors, setTouched, handleSubmit, isValid, validateForm, setFieldValue } =
        useFormikContext<IOMPUTSoknad>();
    const { kvittering, setKvittering } = React.useContext(KvitteringContext);
    // OBS: SkalForhaandsviseSoeknad brukes i onSuccess
    const { mutate: valider } = useMutation(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ skalForhaandsviseSoeknad }: { skalForhaandsviseSoeknad?: boolean }) =>
            values.erKorrigering
                ? validerSoeknad(
                      korrigeringFilter(frontendTilBackendMapping(filtrerVerdierFoerInnsending(values))),
                      identState.ident1
                  )
                : validerSoeknad(frontendTilBackendMapping(filtrerVerdierFoerInnsending(values)), identState.ident1),
        {
            onSuccess: (data: ValideringResponse | IOMPUTSoknadKvittering, { skalForhaandsviseSoeknad }) => {
                if (data?.ytelse && skalForhaandsviseSoeknad && isValid) {
                    const kvitteringResponse = data as IOMPUTSoknadKvittering;
                    setVisForhaandsvisModal(true);
                    if (setKvittering) {
                        setKvittering(kvitteringResponse);
                    } else {
                        throw Error('Kvittering-context er ikke satt');
                    }
                }
                if (data?.feil?.length) {
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
        }
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
                          korrigeringFilter(frontendTilBackendMapping(filtrerVerdierFoerInnsending(values)))
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
        }
    );

    const updateSoknad = ({ submitSoknad }: { submitSoknad: boolean }) => {
        if (harForsoektAaSendeInn) {
            valider({ skalForhaandsviseSoeknad: false });
            setTouched(setNestedObjectValues(values, true));
        }
        return mellomlagreSoeknad({ submitSoknad });
    };

    const debounceCallback = useCallback(
        debounce(() => updateSoknad({ submitSoknad: false }), 3000),
        []
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

    const harFeilISkjema = (errorList: FormikErrors<IOMPUTSoknad>) =>
        !![...getUhaandterteFeil(''), ...Object.keys(errorList)].length;

    return (
        <>
            <MellomlagringEtikett lagrer={mellomlagrer} lagret={harMellomlagret} error={!!mellomlagringError} />
            <VerticalSpacer sixteenPx />
            <OpplysningerOmOMPUTSoknad />
            <VerticalSpacer sixteenPx />
            <Panel border>
                <Heading size="small" spacing>
                    Fosterbarn
                </Heading>
                <Personvelger name="barn" />
            </Panel>
            <EksisterendePerioder eksisterendePerioder={eksisterendePerioder} />
            <VerticalSpacer sixteenPx />
            <NySoeknadEllerKorrigering eksisterendePerioder={eksisterendePerioder} />
            <VerticalSpacer fourtyPx />
            <ArbeidsforholdVelger />
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
                <ErrorSummary heading="Du må fikse disse feilene før du kan sende inn punsjemeldingen.">
                    {getUhaandterteFeil('').map((feil) => (
                        <ErrorSummary.Item key={feil.felt}>{`${feil.felt}: ${feil.feilmelding}`}</ErrorSummary.Item>
                    ))}
                    {/* Denne bør byttes ut med errors fra formik */}
                    {feilFraYup(schema, values, getSchemaContext(values, eksisterendePerioder))?.map(
                        (error: { message: string; path: string }) => (
                            <ErrorSummary.Item key={`${error.path}-${error.message}`}>
                                {error.message}
                            </ErrorSummary.Item>
                        )
                    )}
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
                            validateForm(values).then(() => valider({ skalForhaandsviseSoeknad: true }));
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
                    <OMPUTSoknadKvittering kvittering={kvittering} />
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

const mapStateToProps = (state: RootStateType): IPunchOMPUTFormStateProps => ({
    identState: state.identState,
});

export const OMPUTPunchForm = injectIntl(connect(mapStateToProps)(PunchOMPUTFormComponent));
/* eslint-enable */
