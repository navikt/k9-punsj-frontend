import { FormikErrors, setNestedObjectValues, useFormikContext } from 'formik';
import React, { useCallback, useEffect, useState } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Button, Checkbox, ErrorSummary, HelpText, Modal } from '@navikt/ds-react';

import { debounce } from 'lodash';

import { IInputError, Periode } from 'app/models/types';
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import intlHelper from 'app/utils/intlUtils';
import { feilFraYup } from 'app/utils/validationHelpers';

import ArbeidsforholdPanel from 'app/components/arbeidsforholdFormik/ArbeidsforholdPanel';
import CheckboksPanelFormik from 'app/components/formikInput/CheckboksPanelFormik';
import SelectFormik from 'app/components/formikInput/SelectFormik';
import TextFieldFormik from 'app/components/formikInput/TextFieldFormik';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import VentModal from 'app/components/ventModal/VentModal';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import { RelasjonTilBarnet } from 'app/models/enums/RelasjonTilBarnet';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { useMutation } from 'react-query';
import VerticalSpacer from '../../components/VerticalSpacer';
import ErDuSikkerModal from '../../containers/pleiepenger/ErDuSikkerModal';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import { oppdaterSoeknad, validerSoeknad } from '../api';
import schema, { getSchemaContext } from '../schema';
import Bosteder from './Bosteder';
import EndringAvSøknadsperioder from './EndringAvSøknadsperioder/EndringAvSøknadsperioder';
import KursComponent from './Kurs';
import LovbestemtFerie from './LovbestemtFerie';
import OpplysningerOmSoknad from './OpplysningerOmSoknad/OpplysningerOmSoknad';
import Soknadsperioder from './Soknadsperioder';
import UtenlandsoppholdContainer from './UtenlandsoppholdContainer';

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
    const [harForsoektAaSendeInn, setHarForsoektAaSendeInn] = useState(false);
    const [expandAll, setExpandAll] = useState(false);
    const { values, errors, setTouched, handleSubmit, isValid, validateForm, setFieldValue, setFieldError } =
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

    const getFormaterteUhaandterteFeilmeldinger = (formatErrors: Feil[]) =>
        formatErrors?.filter((m: IInputError) => {
            const felter = m.felt?.split('.') || [];
            for (let index = felter.length - 1; index >= -1; index--) {
                const felt = felter.slice(0, index + 1).join('.');
                if (felt === '') {
                    return true;
                }
            }
            return false;
        });

    useEffect(() => {
        const panelerSomSkalÅpnes = [];
        if (values.utenlandsopphold) {
            panelerSomSkalÅpnes.push(PunchFormPaneler.UTENLANDSOPPHOLD);
        }
        if (values.lovbestemtFerie) {
            panelerSomSkalÅpnes.push(PunchFormPaneler.FERIE);
        }
        if (
            values.arbeidstid?.arbeidstakerList?.length > 0 ||
            values.opptjeningAktivitet?.frilanser ||
            values.opptjeningAktivitet?.selvstendigNaeringsdrivende
        ) {
            panelerSomSkalÅpnes.push(PunchFormPaneler.ARBEID);
        }
        if (values.omsorg.relasjonTilBarnet) {
            panelerSomSkalÅpnes.push(PunchFormPaneler.OPPLYSINGER_OM_SOKER);
        }
        if (values.bosteder.length > 0) {
            panelerSomSkalÅpnes.push(PunchFormPaneler.MEDLEMSKAP);
        }

        setÅpnePaneler([...åpnePaneler, ...panelerSomSkalÅpnes]);
    }, []);

    // const { kvittering, setKvittering } = React.useContext(KvitteringContext);
    // OBS: SkalForhaandsviseSoeknad brukes i onSuccess
    const { mutate: valider } = useMutation(
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        ({ skalForhaandsviseSoeknad }: { skalForhaandsviseSoeknad?: boolean }) =>
            validerSoeknad(values, identState.ident1),
        {
            onSuccess: (data: ValideringResponse | any, { skalForhaandsviseSoeknad }) => {
                if (data?.ytelse && skalForhaandsviseSoeknad && isValid) {
                    const kvitteringResponse = data as any;
                    setVisForhaandsvisModal(true);
                    // if (setKvittering) {
                    //     setKvittering(kvitteringResponse);
                    // } else {
                    //     throw Error('Kvittering-context er ikke satt');
                    // }
                }
                if (data?.feil?.length) {
                    setK9FormatErrors(data.feil);
                    // if (setKvittering) {
                    //     setKvittering(undefined);
                    // } else {
                    //     throw Error('Kvittering-context er ikke satt');
                    // }
                    const uhaandterteFeilmeldinger = getFormaterteUhaandterteFeilmeldinger(data.feil);
                    uhaandterteFeilmeldinger.forEach((uhaandtertFeilmelding) => {
                        const feilmeldingKey = uhaandtertFeilmelding.felt.replace('ytelse.', '');
                        setFieldError(feilmeldingKey, uhaandtertFeilmelding.feilmelding);
                    });
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

    useEffect(() => {
        if ((!values.barn || !values.barn.norskIdent) && identState.ident2) {
            setFieldValue('barn.norskIdent', identState.ident2);
        }
    }, [identState]);

    // TODO: bør flytttes
    const getUhaandterteFeil = (): Feil[] => {
        const uhaandterteFeilmeldinger = getFormaterteUhaandterteFeilmeldinger(k9FormatErrors);

        if (uhaandterteFeilmeldinger && uhaandterteFeilmeldinger?.length > 0) {
            return uhaandterteFeilmeldinger.map((error) => error).filter(Boolean);
        }
        return [];
    };

    const harFeilISkjema = (errorList: FormikErrors<OLPSoknad>) =>
        !![...getUhaandterteFeil(), ...Object.keys(errorList)].length;

    const checkOpenState = (panel: string) => åpnePaneler.includes(panel);

    const updateUtenlandsopphold = (jaNeiIkkeOpplyst: JaNeiIkkeOpplyst) => {
        setIUtlandet(jaNeiIkkeOpplyst);

        if (jaNeiIkkeOpplyst === JaNeiIkkeOpplyst.JA && values.utenlandsopphold.length === 0) {
            setFieldValue('utenlandsopphold', [{ land: undefined, periode: {}, innleggelsesperioder: [] }]);
        }

        if (jaNeiIkkeOpplyst !== JaNeiIkkeOpplyst.JA) {
            setFieldValue('utenlandsopphold', []);
        }
    };

    const toggleAllePaneler = (erCheckboxChecked: boolean) => {
        setExpandAll(erCheckboxChecked);
        if (erCheckboxChecked) {
            setÅpnePaneler([
                PunchFormPaneler.UTENLANDSOPPHOLD,
                PunchFormPaneler.FERIE,
                PunchFormPaneler.ARBEID,
                PunchFormPaneler.OPPLYSINGER_OM_SOKER,
                PunchFormPaneler.MEDLEMSKAP,
            ]);
        } else {
            setÅpnePaneler([]);
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
            <KursComponent />
            <VerticalSpacer sixteenPx />
            <Checkbox
                onChange={(e) => {
                    toggleAllePaneler(e.target.checked);
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
                {!!values.utenlandsopphold.length && <UtenlandsoppholdContainer />}
            </EkspanderbartpanelBase>
            <EkspanderbartpanelBase
                apen={checkOpenState(PunchFormPaneler.FERIE)}
                className="punchform__paneler"
                tittel={intlHelper(intl, PunchFormPaneler.FERIE)}
                onClick={() => handlePanelClick(PunchFormPaneler.FERIE)}
            >
                <LovbestemtFerie />
            </EkspanderbartpanelBase>
            <ArbeidsforholdPanel
                isOpen={checkOpenState(PunchFormPaneler.ARBEID)}
                onPanelClick={() => handlePanelClick(PunchFormPaneler.ARBEID)}
                eksisterendePerioder={eksisterendePerioder}
            />
            <EkspanderbartpanelBase
                apen={checkOpenState(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                className="punchform__paneler"
                tittel={intlHelper(intl, PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                onClick={() => handlePanelClick(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
            >
                <SelectFormik
                    value={values.omsorg.relasjonTilBarnet}
                    label={intlHelper(intl, 'skjema.relasjontilbarnet')}
                    name="omsorg.relasjonTilBarnet"
                    options={Object.values(RelasjonTilBarnet).map((rel) => ({ value: rel, label: rel }))}
                />
                {values.omsorg.relasjonTilBarnet === RelasjonTilBarnet.ANNET && (
                    <TextFieldFormik
                        label={intlHelper(intl, 'skjema.omsorg.beskrivelse')}
                        className="beskrivelseAvOmsorgsrollen"
                        name="omsorg.beskrivelseAvOmsorgsrollen"
                    />
                )}
            </EkspanderbartpanelBase>
            <EkspanderbartpanelBase
                apen={checkOpenState(PunchFormPaneler.MEDLEMSKAP)}
                className="punchform__paneler"
                tittel={intlHelper(intl, PunchFormPaneler.MEDLEMSKAP)}
                onClick={() => handlePanelClick(PunchFormPaneler.MEDLEMSKAP)}
            >
                <Bosteder />
            </EkspanderbartpanelBase>
            <VerticalSpacer thirtyTwoPx />
            <p className="ikkeregistrert">{intlHelper(intl, 'skjema.ikkeregistrert')}</p> {/* TODO: Hva er dette? */}
            <div className="flex-container">
                <CheckboksPanelFormik
                    name="harMedisinskeOpplysninger"
                    label={intlHelper(intl, 'skjema.medisinskeopplysninger')}
                    valueIsBoolean
                />
                <HelpText className="hjelpetext" placement="top-end">
                    {intlHelper(intl, 'skjema.medisinskeopplysninger.hjelpetekst')}
                </HelpText>
            </div>
            <VerticalSpacer eightPx />
            <div className="flex-container">
                <CheckboksPanelFormik
                    name="harInfoSomIkkeKanPunsjes"
                    label={intlHelper(intl, 'skjema.opplysningerikkepunsjet')}
                    valueIsBoolean
                />
                <HelpText className="hjelpetext" placement="top-end">
                    {intlHelper(intl, 'skjema.opplysningerikkepunsjet.hjelpetekst')}
                </HelpText>
            </div>
            <VerticalSpacer twentyPx />
            {harForsoektAaSendeInn && harFeilISkjema(errors) && (
                <ErrorSummary heading="Du må fikse disse feilene før du kan sende inn punsjemeldingen.">
                    {getUhaandterteFeil().map((feil) => (
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
                                    valider({ skalForhaandsviseSoeknad: false });
                                } else {
                                    valider({ skalForhaandsviseSoeknad: true });
                                }
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
