import { FormikErrors, setNestedObjectValues, useFormikContext } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Button, Checkbox, ErrorSummary, Modal } from '@navikt/ds-react';

import { debounce } from 'lodash';

import { IInputError, IUtenlandsOpphold, Periode } from 'app/models/types';
import { Feil } from 'app/models/types/ValideringResponse';
import intlHelper from 'app/utils/intlUtils';
import { feilFraYup } from 'app/utils/validationHelpers';

import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import { OLPSoknad } from 'app/models/types/søknadTypes/OLPSoknad';
import { useMutation } from 'react-query';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import VerticalSpacer from '../../components/VerticalSpacer';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
// import EksisterendePerioder from '../components/EksisterendePerioder';
// import Medlemskap from '../components/Medlemskap';
// import NySoeknadEllerKorrigering from '../components/NySoeknadEllerKorrigering';
// import Utenlandsopphold from '../components/Utenlandsopphold';
import schema, { getSchemaContext } from '../schema';
import Soknadsperioder from './Soknadsperioder';
// import { filtrerVerdierFoerInnsending, frontendTilBackendMapping, korrigeringFilter } from '../utils';
// import OpplysningerOmOLPSoknad from './OpplysningerOmSoknad/OpplysningerOmOLPSoknad';
import { Utenlandsopphold } from './Utenlandsopphold';
import { oppdaterSoeknad } from '../api';
import EndringAvSøknadsperioder from './EndringAvSøknadsperioder/EndringAvSøknadsperioder';
import OpplysningerOmSoknad from './OpplysningerOmSoknad/OpplysningerOmSoknad';

export interface IPunchOLPFormComponentProps {
    journalpostid: string;
    visForhaandsvisModal: boolean;
    setVisForhaandsvisModal: (vis: boolean) => void;
    k9FormatErrors: Feil[];
    setK9FormatErrors: (feil: Feil[]) => void;
    submitError: unknown;
    eksisterendePerioder: Periode[];
    hentEksisterendePerioderError: boolean;
}

export interface IPunchOLPFormStateProps {
    identState: IIdentState;
}

type IPunchOLPFormProps = IPunchOLPFormComponentProps & WrappedComponentProps & IPunchOLPFormStateProps;

const initialUtenlandsopphold: IUtenlandsOpphold = { land: '', innleggelsesperioder: [] };

export const PunchOLPFormComponent: React.FC<IPunchOLPFormProps> = (props) => {
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
        hentEksisterendePerioderError,
    } = props;
    const [harMellomlagret, setHarMellomlagret] = useState(false);
    const [visVentModal, setVisVentModal] = useState(false);
    const [visErDuSikkerModal, setVisErDuSikkerModal] = useState(false);
    const [feilmeldingStier, setFeilmeldingStier] = useState(new Set());
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);
    const [expandAll, setExpandAll] = useState(false);
    const { values, errors, setTouched, handleSubmit, isValid, validateForm, setFieldValue } =
        useFormikContext<OLPSoknad>();
    const [åpnePaneler, setÅpnePaneler] = useState<string[]>([]);
    const [iUtlandet, setIUtlandet] = useState<JaNeiIkkeOpplyst | undefined>(undefined);

    const handlePanelClick = (panel: string) => {
        if (åpnePaneler.includes(panel)) {
            setÅpnePaneler(åpnePaneler.filter((p) => p !== panel));
        } else {
            setÅpnePaneler([...åpnePaneler, panel]);
        }
    };

    // const { kvittering, setKvittering } = React.useContext(KvitteringContext);
    // OBS: SkalForhaandsviseSoeknad brukes i onSuccess
    // const { mutate: valider } = useMutation(
    //     // eslint-disable-next-line @typescript-eslint/no-unused-vars
    //     ({ skalForhaandsviseSoeknad }: { skalForhaandsviseSoeknad?: boolean }) =>
    //         values.erKorrigering
    //             ? validerSoeknad(
    //                   korrigeringFilter(frontendTilBackendMapping(filtrerVerdierFoerInnsending(values))),
    //                   identState.ident1
    //               )
    //             : validerSoeknad(frontendTilBackendMapping(filtrerVerdierFoerInnsending(values)), identState.ident1),
    //     {
    //         onSuccess: (data: ValideringResponse | IOLPSoknadKvittering, { skalForhaandsviseSoeknad }) => {
    //             if (data?.ytelse && skalForhaandsviseSoeknad && isValid) {
    //                 const kvitteringResponse = data as IOLPSoknadKvittering;
    //                 setVisForhaandsvisModal(true);
    //                 if (setKvittering) {
    //                     setKvittering(kvitteringResponse);
    //                 } else {
    //                     throw Error('Kvittering-context er ikke satt');
    //                 }
    //             }
    //             if (data?.feil?.length) {
    //                 setK9FormatErrors(data.feil);
    //                 if (setKvittering) {
    //                     setKvittering(undefined);
    //                 } else {
    //                     throw Error('Kvittering-context er ikke satt');
    //                 }
    //             } else {
    //                 setK9FormatErrors([]);
    //             }
    //         },
    //     }
    // );

    const {
        isLoading: mellomlagrer,
        error: mellomlagringError,
        mutate: mellomlagreSoeknad,
    } = useMutation(
        ({ submitSoknad }: { submitSoknad: boolean }) =>
            submitSoknad ? oppdaterSoeknad(values) : oppdaterSoeknad(values),
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
            // valider({ skalForhaandsviseSoeknad: false });
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
        if (values.journalposter && !values.journalposter.includes(props.journalpostid)) {
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

    const harFeilISkjema = (errorList: FormikErrors<OLPSoknad>) =>
        !![...getUhaandterteFeil(''), ...Object.keys(errorList)].length;

    const checkOpenState = (panel: string) => åpnePaneler.includes(panel);

    const updateUtenlandsopphold = (jaNeiIkkeOpplyst: JaNeiIkkeOpplyst) => {
        setIUtlandet(jaNeiIkkeOpplyst);

        if (jaNeiIkkeOpplyst === JaNeiIkkeOpplyst.JA && values.utenlandsopphold.length === 0) {
            setFieldValue('utenlandsopphold', [{ land: undefined, periode: {} }]);
        }

        if (jaNeiIkkeOpplyst !== JaNeiIkkeOpplyst.JA) {
            setFieldValue('utenlandsopphold', []);
        }
    };

    return (
        <>
            <MellomlagringEtikett lagrer={mellomlagrer} lagret={harMellomlagret} error={!!mellomlagringError} />
            <VerticalSpacer sixteenPx />
            <Soknadsperioder
                eksisterendePerioder={eksisterendePerioder}
                hentEksisterendePerioderError={hentEksisterendePerioderError}
            />
            <VerticalSpacer sixteenPx />
            <OpplysningerOmSoknad />
            <VerticalSpacer sixteenPx />
            <Checkbox
                onChange={(e) => {
                    setExpandAll(e.target.checked);
                }}
            >
                {intlHelper(intl, 'skjema.ekspander')}
            </Checkbox>
            <VerticalSpacer sixteenPx />
            <EndringAvSøknadsperioder
                onClick={() => handlePanelClick(PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER)}
                eksisterendePerioder={eksisterendePerioder}
                isOpen={checkOpenState(PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER) || expandAll}
            />
            <EkspanderbartpanelBase
                apen={checkOpenState(PunchFormPaneler.UTENLANDSOPPHOLD)}
                className="punchform__paneler"
                tittel={intlHelper(intl, PunchFormPaneler.UTENLANDSOPPHOLD)}
                onClick={() => handlePanelClick(PunchFormPaneler.UTENLANDSOPPHOLD)}
            >
                <RadioPanelGruppe
                    className="horizontalRadios"
                    radios={Object.values(JaNeiIkkeOpplyst).map((jnv) => ({
                        label: intlHelper(intl, jnv),
                        value: jnv,
                    }))}
                    name="utlandjaneiikeeopplyst"
                    legend={intlHelper(intl, 'skjema.utenlandsopphold.label')}
                    onChange={(event) =>
                        updateUtenlandsopphold((event.target as HTMLInputElement).value as JaNeiIkkeOpplyst)
                    }
                    checked={
                        values.utenlandsopphold && values.utenlandsopphold?.length ? JaNeiIkkeOpplyst.JA : iUtlandet
                    }
                />
                {!!values.utenlandsopphold.length && (
                    <Utenlandsopphold
                        intl={intl}
                        periods={values.utenlandsopphold}
                        panelid={(i) => `utenlandsoppholdpanel_${i}`}
                        initialPeriodeinfo={initialUtenlandsopphold}
                        textLeggTil="skjema.perioder.legg_til"
                        textFjern="skjema.perioder.fjern"
                        className="utenlandsopphold"
                        panelClassName="utenlandsoppholdpanel"
                        kanHaFlere
                        medSlettKnapp={false}
                    />
                )}
            </EkspanderbartpanelBase>
            {/* <NySoeknadEllerKorrigering eksisterendePerioder={eksisterendePerioder} /> */}
            <VerticalSpacer fourtyPx />
            {/* <ArbeidsforholdVelger /> */}
            <VerticalSpacer fourtyPx />
            {/* {!values.erKorrigering && (
                <>
                    <Medlemskap />
                    <VerticalSpacer fourtyPx />
                    <Utenlandsopphold />
                </>
            )} */}
            {/* <IkkeRegistrerteOpplysninger intl={intl} /> */}
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
                            validateForm(values).then((v) => {
                                if (Object.keys(v).length) {
                                    // valider({ skalForhaandsviseSoeknad: false });
                                }

                                // valider({ skalForhaandsviseSoeknad: true });
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
            {/* {visVentModal && (
                <VentModal journalpostId={journalpostid} soeknadId={values.soeknadId} visModalFn={setVisVentModal} />
            )} */}
            {/* {visForhaandsvisModal && (
                <ForhaandsvisSoeknadModal
                    avbryt={() => setVisForhaandsvisModal(false)}
                    videre={() => {
                        setVisForhaandsvisModal(false);
                        setVisErDuSikkerModal(true);
                    }}
                    intl={intl}
                >
                    <OLPSoknadKvittering kvittering={kvittering} />
                </ForhaandsvisSoeknadModal>
            )} */}

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

const mapStateToProps = (state: RootStateType): IPunchOLPFormStateProps => ({
    identState: state.identState,
});

export const OLPPunchForm = injectIntl(connect(mapStateToProps)(PunchOLPFormComponent));
/* eslint-enable */
