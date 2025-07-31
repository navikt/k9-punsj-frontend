import React, { useCallback, useEffect, useState } from 'react';

import { FormikErrors, setNestedObjectValues, useFormikContext } from 'formik';
import { debounce } from 'lodash';
import { RadioPanelGruppe } from 'nav-frontend-skjema';
import { useMutation } from '@tanstack/react-query';
import { useDispatch, useSelector } from 'react-redux';
import { FormattedMessage, useIntl } from 'react-intl';
import { Accordion, Alert, Button, Checkbox, ErrorSummary } from '@navikt/ds-react';
import ArbeidsforholdPanel from 'app/components/arbeidsforholdFormik/ArbeidsforholdPanel';
import ForhåndsvisSøknadModal from 'app/components/forhåndsvisSøknadModal/ForhåndsvisSøknadModal';
import MellomlagringEtikett from 'app/components/mellomlagringEtikett/MellomlagringEtikett';
import VentModal from 'app/components/ventModal/VentModal';
import { FordelingActionKeys } from 'app/models/enums';
import { JaNeiIkkeOpplyst } from 'app/models/enums/JaNeiIkkeOpplyst';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import { IInputError, Periode } from 'app/models/types';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import { Feil, ValideringResponse } from 'app/models/types/ValideringResponse';
import { IdentActionKeys } from 'app/state/actions/IdentActions';
import intlHelper from 'app/utils/intlUtils';
import { feilFraYup } from 'app/utils/validationHelpers';
import JournalposterSync from 'app/components/JournalposterSync';

import VerticalSpacer from '../../../components/VerticalSpacer';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import { RootStateType } from '../../../state/RootState';
import { oppdaterSoeknad, validerSoeknad } from '../api';
import schema, { getSchemaContext } from '../schema';
import Bosteder from './Bosteder';
import EndringAvSøknadsperioder from './EndringAvSøknadsperioder/EndringAvSøknadsperioder';
import KursComponent from './Kurs';
import LovbestemtFerie from './LovbestemtFerie';
import OpplysningerOmSoknad from './OpplysningerOmSoknad/OpplysningerOmSoknad';
import Soknadsperioder from './Soknadsperioder';
import UtenlandsoppholdContainer from './UtenlandsoppholdContainer';
import OLPSoknadKvittering from './kvittering/OLPSoknadKvittering';
import { IOLPSoknadKvittering } from '../OLPSoknadKvittering';
import { GodkjentOpplæringsinstitusjon } from 'app/models/types/GodkjentOpplæringsinstitusjon';
import Reisedager from './Reisedager';
import RelasjonTilBarnet from './RelasjonTilBarnet';

interface OwnProps {
    journalpostid: string;
    visForhaandsvisModal: boolean;
    setVisForhaandsvisModal: (vis: boolean) => void;
    k9FormatErrors: Feil[];
    setK9FormatErrors: (feil: Feil[]) => void;
    submitError: unknown;
    eksisterendePerioder: Periode[];
    hentEksisterendePerioderError: boolean;
    setKvittering?: (kvittering?: IOLPSoknadKvittering) => void;
    kvittering: IOLPSoknadKvittering | undefined;
    institusjoner: GodkjentOpplæringsinstitusjon[];
    hentInstitusjonerLoading: boolean;
    hentInstitusjonerError: boolean;
}

export const OLPPunchForm: React.FC<OwnProps> = (props) => {
    const {
        visForhaandsvisModal,
        setVisForhaandsvisModal,
        k9FormatErrors,
        setK9FormatErrors,
        journalpostid,
        submitError,
        eksisterendePerioder,
        hentEksisterendePerioderError,
        setKvittering,
        kvittering,
        institusjoner,
        hentInstitusjonerLoading,
        hentInstitusjonerError,
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
    const dispatch = useDispatch();
    const intl = useIntl();
    const identState = useSelector((state: RootStateType) => state.identState);

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
        if (values.kurs.reise.reisedager.length > 0) {
            panelerSomSkalÅpnes.push(PunchFormPaneler.REISE);
        }
        if (values.utenlandsopphold.length > 0) {
            panelerSomSkalÅpnes.push(PunchFormPaneler.UTENLANDSOPPHOLD);
        }
        if (values.lovbestemtFerie.length > 0) {
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

    // OBS: SkalForhaandsviseSoeknad brukes i onSuccess
    const { mutate: valider } = useMutation({
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        mutationFn: ({ skalForhaandsviseSoeknad }: { skalForhaandsviseSoeknad?: boolean }) =>
            validerSoeknad(values, identState.søkerId),
        onSuccess: (data: ValideringResponse | any, { skalForhaandsviseSoeknad }) => {
            if (data?.ytelse && skalForhaandsviseSoeknad && isValid) {
                const kvitteringResponse = data as any;
                setVisForhaandsvisModal(true);
                if (setKvittering) {
                    setKvittering(kvitteringResponse);
                }
            }
            if (data?.feil?.length) {
                setK9FormatErrors(data.feil);
                if (setKvittering) {
                    setKvittering(undefined);
                }
                const uhaandterteFeilmeldinger = getFormaterteUhaandterteFeilmeldinger(data.feil);
                uhaandterteFeilmeldinger.forEach((uhaandtertFeilmelding) => {
                    const feilmeldingKey = uhaandtertFeilmelding.felt
                        .replace('ytelse.', '')
                        // støgg fiks for validering av reisedager
                        .replace('.<list element>', '');
                    setFieldError(feilmeldingKey, uhaandtertFeilmelding.feilmelding);
                });
            } else {
                setK9FormatErrors([]);
            }
        },
    });

    const {
        isPending: mellomlagrer,
        error: mellomlagringError,
        mutate: mellomlagreSoeknad,
    } = useMutation({
        mutationFn: ({ submitSoknad }: { submitSoknad: boolean }) =>
            submitSoknad ? oppdaterSoeknad(values) : oppdaterSoeknad(values),
        onSuccess: (data, { submitSoknad }) => {
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
        if ((!values.barn || !values.barn.norskIdent) && identState.pleietrengendeId) {
            setFieldValue('barn.norskIdent', identState.pleietrengendeId);
        }
        if (
            (values.barn && values.barn.norskIdent && !identState.pleietrengendeId) ||
            (values.soekerId && !identState.søkerId)
        ) {
            const søkerId = identState.søkerId || values.soekerId;
            const pleietrengendeId = identState.pleietrengendeId || values.barn?.norskIdent;
            dispatch({ type: IdentActionKeys.IDENT_FELLES_SET, søkerId, pleietrengendeId });
            if (søkerId) {
                dispatch({ type: FordelingActionKeys.IDENT_BEKREFT_IDENT1, erSøkerIdBekreftet: true });
            }
        }
    }, [identState, values.barn]);

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
                PunchFormPaneler.REISE,
            ]);
        } else {
            setÅpnePaneler([]);
        }
    };

    return (
        <>
            <JournalposterSync journalposter={values.journalposter} />
            <MellomlagringEtikett lagrer={mellomlagrer} lagret={harMellomlagret} error={!!mellomlagringError} />
            <VerticalSpacer thirtyTwoPx />
            <Soknadsperioder
                eksisterendePerioder={eksisterendePerioder}
                hentEksisterendePerioderError={hentEksisterendePerioderError}
            />
            <VerticalSpacer thirtyTwoPx />
            <OpplysningerOmSoknad />
            <VerticalSpacer thirtyTwoPx />
            <KursComponent
                institusjoner={institusjoner}
                hentInstitusjonerLoading={hentInstitusjonerLoading}
                hentInstitusjonerError={hentInstitusjonerError}
            />
            <VerticalSpacer thirtyTwoPx />
            <Checkbox
                onChange={(e) => {
                    toggleAllePaneler(e.target.checked);
                }}
            >
                {intlHelper(intl, 'skjema.ekspander')}
            </Checkbox>
            <VerticalSpacer thirtyTwoPx />
            <Accordion>
                <EndringAvSøknadsperioder
                    onClick={() => handlePanelClick(PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER)}
                    eksisterendePerioder={eksisterendePerioder}
                    isOpen={checkOpenState(PunchFormPaneler.ENDRING_AV_SØKNADSPERIODER) || expandAll}
                />
                <Accordion.Item
                    defaultOpen={checkOpenState(PunchFormPaneler.REISE)}
                    open={checkOpenState(PunchFormPaneler.REISE)}
                    onOpenChange={() => handlePanelClick(PunchFormPaneler.REISE)}
                    data-test-id="accordionItem-reisepanel"
                >
                    <Accordion.Header>Reisedager</Accordion.Header>
                    <Accordion.Content>
                        <Reisedager />
                    </Accordion.Content>
                </Accordion.Item>
                <Accordion.Item
                    defaultOpen={checkOpenState(PunchFormPaneler.UTENLANDSOPPHOLD)}
                    open={checkOpenState(PunchFormPaneler.UTENLANDSOPPHOLD)}
                    onOpenChange={() => handlePanelClick(PunchFormPaneler.UTENLANDSOPPHOLD)}
                    data-test-id="accordionItem-utenlandsoppholdpanel"
                >
                    <Accordion.Header>
                        <FormattedMessage id={PunchFormPaneler.UTENLANDSOPPHOLD} />
                    </Accordion.Header>

                    <Accordion.Content>
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
                                values.utenlandsopphold && values.utenlandsopphold?.length
                                    ? JaNeiIkkeOpplyst.JA
                                    : iUtlandet
                            }
                        />
                        {!!values.utenlandsopphold.length && <UtenlandsoppholdContainer />}
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item
                    open={checkOpenState(PunchFormPaneler.FERIE)}
                    defaultOpen={checkOpenState(PunchFormPaneler.FERIE)}
                    onOpenChange={() => handlePanelClick(PunchFormPaneler.FERIE)}
                    data-test-id="accordionItem-feriepanel"
                >
                    <Accordion.Header>
                        <FormattedMessage id={PunchFormPaneler.FERIE} />
                    </Accordion.Header>

                    <Accordion.Content>
                        <LovbestemtFerie />
                    </Accordion.Content>
                </Accordion.Item>

                <ArbeidsforholdPanel
                    isOpen={checkOpenState(PunchFormPaneler.ARBEID)}
                    onPanelClick={() => handlePanelClick(PunchFormPaneler.ARBEID)}
                    eksisterendePerioder={eksisterendePerioder}
                />

                <Accordion.Item
                    open={checkOpenState(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                    defaultOpen={checkOpenState(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                    onOpenChange={() => handlePanelClick(PunchFormPaneler.OPPLYSINGER_OM_SOKER)}
                    data-test-id="accordionItem-opplysningerOmSøkerPanel"
                >
                    <Accordion.Header>
                        <FormattedMessage id={PunchFormPaneler.OPPLYSINGER_OM_SOKER} />
                    </Accordion.Header>

                    <Accordion.Content>
                        <RelasjonTilBarnet />
                    </Accordion.Content>
                </Accordion.Item>

                <Accordion.Item
                    open={checkOpenState(PunchFormPaneler.MEDLEMSKAP)}
                    defaultOpen={checkOpenState(PunchFormPaneler.MEDLEMSKAP)}
                    onOpenChange={() => handlePanelClick(PunchFormPaneler.MEDLEMSKAP)}
                    data-test-id="accordionItem-medlemskapPanel"
                >
                    <Accordion.Header>
                        <FormattedMessage id={PunchFormPaneler.MEDLEMSKAP} />
                    </Accordion.Header>

                    <Accordion.Content>
                        <Bosteder />
                    </Accordion.Content>
                </Accordion.Item>
            </Accordion>
            <VerticalSpacer thirtyTwoPx />
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
            <VerticalSpacer thirtyTwoPx />
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
                <ForhåndsvisSøknadModal
                    avbryt={() => setVisForhaandsvisModal(false)}
                    videre={() => {
                        setVisForhaandsvisModal(false);
                        setVisErDuSikkerModal(true);
                    }}
                    dataTestId="validertOLPSoknadModal"
                >
                    {kvittering ? <OLPSoknadKvittering kvittering={kvittering} /> : null}
                </ForhåndsvisSøknadModal>
            )}
            {visErDuSikkerModal && (
                <ErDuSikkerModal
                    melding="modal.erdusikker.sendinn"
                    modalKey="erdusikkermodal"
                    extraInfo="modal.erdusikker.sendinn.extrainfo"
                    open={visErDuSikkerModal}
                    submitKnappText="skjema.knapp.send"
                    onSubmit={() => {
                        updateSoknad({ submitSoknad: true });
                    }}
                    onClose={() => {
                        setVisErDuSikkerModal(false);
                    }}
                />
            )}
        </>
    );
};
