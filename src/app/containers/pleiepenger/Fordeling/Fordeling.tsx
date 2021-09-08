import {JaNei, Sakstype, TilgjengeligSakstype} from 'app/models/enums';
import {IFordelingState, IJournalpost} from 'app/models/types';
import {
    lukkJournalpostOppgave as lukkJournalpostOppgaveAction,
    lukkOppgaveResetAction, setErIdent1BekreftetAction,
    setIdentAction,
    setSakstypeAction,
    sjekkOmSkalTilK9Sak,
} from 'app/state/actions';
import {v4 as uuidv4} from 'uuid';
import {RootStateType} from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import {AlertStripeAdvarsel, AlertStripeFeil, AlertStripeInfo} from 'nav-frontend-alertstriper';
import {Hovedknapp, Knapp} from 'nav-frontend-knapper';
import {Checkbox, Input, RadioGruppe, RadioPanel, RadioPanelGruppe, Select} from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, {useEffect, useMemo, useState} from 'react';
import {FormattedMessage, injectIntl, WrappedComponentProps,} from 'react-intl';
import {connect} from 'react-redux';
import PdfVisning from '../../../components/pdf/PdfVisning';
import {ISakstypeDefault, ISakstypePunch} from '../../../models/Sakstype';
import {Sakstyper} from '../../SakstypeImpls';
import './fordeling.less';
import VerticalSpacer from '../../../components/VerticalSpacer';
import FormPanel from '../../../components/FormPanel';
import {JournalpostPanel} from '../../../components/journalpost-panel/JournalpostPanel';
import {
    opprettGosysOppgave as omfordelAction,
    opprettGosysOppgaveResetAction
} from "../../../state/actions/GosysOppgaveActions";
import {setHash} from "../../../utils";
import { setIdentFellesAction} from "../../../state/actions/IdentActions";
import {IIdentState} from "../../../models/types/IdentState";
import {IGosysOppgaveState} from "../../../models/types/GosysOppgaveState";
import OkGaaTilLosModal from "../OkGaaTilLosModal";
import ModalWrapper from "nav-frontend-modal";
import {IFellesState, kopierJournalpost} from "../../../state/reducers/FellesReducer";
import {hentBarn} from "../../../state/reducers/HentBarn";
import WarningCircle from "../../../assets/SVG/WarningCircle";
import {skalViseFeilmelding, visFeilmeldingForAnnenIdentVidJournalKopi} from "./FordelingFeilmeldinger";
import JournalPostKopiFelmeldinger from "./Komponenter/JournalPostKopiFelmeldinger";
import {PopoverOrientering} from "nav-frontend-popover";
import Hjelpetekst from "nav-frontend-hjelpetekst";

export interface IFordelingStateProps {
    journalpost?: IJournalpost;
    fordelingState: IFordelingState;
    journalpostId: string;
    identState: IIdentState;
    opprettIGosysState: IGosysOppgaveState;
    fellesState: IFellesState;
    dedupkey: string;
}

export interface IFordelingDispatchProps {
    setSakstypeAction: typeof setSakstypeAction;
    omfordel: typeof omfordelAction;
    setIdentAction: typeof setIdentFellesAction;
    sjekkOmSkalTilK9: typeof sjekkOmSkalTilK9Sak;
    kopierJournalpost: typeof kopierJournalpost;
    hentBarn: typeof hentBarn;
    lukkJournalpostOppgave: typeof lukkJournalpostOppgaveAction;
    resetOmfordelAction: typeof opprettGosysOppgaveResetAction;
    lukkOppgaveReset: typeof lukkOppgaveResetAction;
    setErIdent1Bekreftet: typeof setErIdent1BekreftetAction;
}

type IFordelingProps = WrappedComponentProps &
    IFordelingStateProps &
    IFordelingDispatchProps;

type BehandlingsknappProps = Pick<IFordelingProps,
    'omfordel' | 'journalpost' | 'lukkJournalpostOppgave'> & {
    norskIdent: string;
    sakstypeConfig?: ISakstypeDefault;
};

const Behandlingsknapp: React.FunctionComponent<BehandlingsknappProps> = ({
                                                                              norskIdent,
                                                                              omfordel,
                                                                              lukkJournalpostOppgave,
                                                                              journalpost,
                                                                              sakstypeConfig
                                                                          }) => {
    if (!sakstypeConfig) {
        return null;
    }

    if ((sakstypeConfig as ISakstypePunch).punchPath) {
        const punchConfig = sakstypeConfig as ISakstypePunch;

        return (
            <Hovedknapp onClick={() => setHash(punchConfig.punchPath)}>
                <FormattedMessage id="fordeling.knapp.punsj"/>
            </Hovedknapp>
        );
    }

    if (sakstypeConfig.navn === Sakstype.SKAL_IKKE_PUNSJES) {
        return (
            <Hovedknapp onClick={() => lukkJournalpostOppgave(journalpost!.journalpostId)}>
                <FormattedMessage id="fordeling.knapp.bekreft"/>
            </Hovedknapp>
        );
    }

    return (
        <Hovedknapp
            onClick={() => omfordel(journalpost!.journalpostId, norskIdent)}
        >
            <FormattedMessage id="fordeling.knapp.bekreft"/>
        </Hovedknapp>
    );
};

const FordelingComponent: React.FunctionComponent<IFordelingProps> = (
    props: IFordelingProps
) => {
    const {
        intl,
        fordelingState,
        omfordel,
        journalpost,
        identState,
        opprettIGosysState,
        lukkJournalpostOppgave,
        resetOmfordelAction,
        lukkOppgaveReset
    } = props;
    const {sakstype} = fordelingState;
    const sakstyper: ISakstypeDefault[] = useMemo(
        () => [...Sakstyper.punchSakstyper, ...Sakstyper.omfordelingssakstyper],
        []
    );
    const konfigForValgtSakstype = useMemo(
        () => sakstyper.find((st) => st.navn === sakstype),
        [sakstype]
    );

    const identer = [identState.ident1, identState.ident2];
    const journalpostident = journalpost?.norskIdent;

    const [omsorgspengerValgt, setOmsorgspengerValgt] = useState<boolean>(false);
    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);
    const [riktigIdentIJournalposten, setRiktigIdentIJournalposten] = useState<JaNei>();
    const [erBarnUtdatert, setErBarnUtdatert]= useState<boolean>(false);

    const [gjelderPP, setGjelderPP] = useState<JaNei | undefined>(undefined);

    const [visSakstypeValg, setVisSakstypeValg] = useState<boolean>(false);

    const [sokersIdent, setSokersIdent] = useState<string>('');
    const [barnetsIdent, setBarnetsIdent] = useState<string>('');
    const [annenSokerIdent, setAnnenSokerIdent] = useState<string>('');

    const [toSokereIJournalpost, setToSokereIJournalpost] = useState<boolean>(false);
    const [gjelderAnnetBarn, setGjelderAnnetBarn] = useState<boolean>(false);
    const [skalJournalpostSomIkkeStottesKopieres, setSkalJournalpostSomIkkeStottesKopieres] = useState<boolean>(false);

    const handleIdent1Change = (event: any) =>
        setSokersIdent(event.target.value.replace(/\D+/, ''))
    const handleIdent2Change = (event: any) => {
        setBarnetsIdent(event.target.value.replace(/\D+/, ''));
        setIdentAction(identState.ident1, event.target.value)
    }
    const nullUtBarnetsIdent = () => {
        setBarnetsIdent('');
        setIdentAction(identState.ident1, '');
        props.setIdentAction(identState.ident1, '', identState.annenSokerIdent);
    }

    const handleIdent1Blur = (event: any) => {
        props.setIdentAction(event.target.value, identState.ident2);
        props.hentBarn(event.target.value);
        props.setErIdent1Bekreftet(true);
        setErBarnUtdatert(false);
    }
    const handleIdent2Blur = (event: any) =>{
        props.setIdentAction(riktigIdentIJournalposten === JaNei.JA ? (journalpostident || '') : sokersIdent, event.target.value, identState.annenSokerIdent);}
    const handleIdentAnnenSokerBlur = (event: any) =>
        props.setIdentAction(identState.ident1, identState.ident2, event.target.value);

    const handleIdentRadioChange = (jn: JaNei) => {
        setRiktigIdentIJournalposten(jn);
        setErBarnUtdatert(true);
        if (jn === JaNei.JA) {
            props.setIdentAction(journalpostident || '', identState.ident2)
           if(journalpost?.norskIdent) {props.hentBarn(journalpost?.norskIdent); setErBarnUtdatert(false);}
        } else {
            props.setIdentAction('', identState.ident2)
        }
    }

    const handleVidereClick = () => {
        if(identState.ident1 && identState.ident2 && identState.annenSokerIdent && journalpost?.journalpostId && !!journalpost?.kanKopieres){
            props.kopierJournalpost(identState.ident1, identState.ident2, identState.annenSokerIdent, props.dedupkey, journalpost.journalpostId);
        }

        if (!identState.ident2 || !journalpost?.journalpostId) {
            setVisSakstypeValg(true);
        }
        else {
            props.sjekkOmSkalTilK9(identState.ident1, identState.ident2, journalpost.journalpostId)
        }
    }

    const kopierJournalpostOgLukkOppgave = () => {
        if(identState.ident1 && identState.ident2 && journalpost?.journalpostId){
            props.kopierJournalpost(identState.ident1, identState.ident2, identState.ident1, props.dedupkey, journalpost?.journalpostId);
        }
    };

    const handleGjelderPP = (jn: JaNei) => {
        if(jn === JaNei.NEI){
            if(!identState.ident1 && !!journalpost?.norskIdent) {
                setSokersIdent(journalpost?.norskIdent);
                props.setIdentAction(journalpost?.norskIdent, identState.ident2);
            }else{
                setSokersIdent(identState.ident1)
            }
        }else if(jn === JaNei.JA) {
            setSokersIdent('');
            props.setIdentAction('', identState.ident2);
        }
        setGjelderPP(jn);
    }

    const handleCheckboxChange = (checked: boolean) => {
        setBarnetHarIkkeFnr(checked);
        if (checked) {
            setBarnetsIdent('');
            props.setIdentAction(riktigIdentIJournalposten === JaNei.JA ? (journalpostident || '') : sokersIdent, null);
        }
    }

    useEffect(() => {
        if(skalJournalpostSomIkkeStottesKopieres && !props.fellesState.isAwaitingKopierJournalPostResponse && !!props.fellesState.kopierJournalpostSuccess){
            lukkJournalpostOppgave(journalpost?.journalpostId!);
        }
    }, [props.fellesState.isAwaitingKopierJournalPostResponse])

    if (!!opprettIGosysState.isAwaitingGosysOppgaveRequestResponse) {
        return <NavFrontendSpinner/>;
    }

    if (!!opprettIGosysState.gosysOppgaveRequestSuccess) {
        return (
            <ModalWrapper
                key={"opprettigosysokmodal"}
                onRequestClose={() => resetOmfordelAction()}
                contentLabel={"settpaaventokmodal"}
                closeButton={false}
                isOpen={!!opprettIGosysState.gosysOppgaveRequestSuccess}
            >
                <OkGaaTilLosModal melding={'fordeling.opprettigosys.utfort'}/>
            </ModalWrapper>
        );
    }

    if (!!fordelingState.isAwaitingLukkOppgaveResponse) {
        return <NavFrontendSpinner/>;
    }

    if (!!fordelingState.lukkOppgaveDone) {
        return (
            <ModalWrapper
                key={"lukkoppgaveokmodal"}
                onRequestClose={() => lukkOppgaveReset()}
                contentLabel={"settpaaventokmodal"}
                closeButton={false}
                isOpen={!!fordelingState.lukkOppgaveDone}
            >
                <OkGaaTilLosModal melding={'fordeling.lukkoppgave.utfort'}/>
            </ModalWrapper>
        );
    }


    return (
        <div className="fordeling-container">
            {!!journalpost?.kanSendeInn && !!journalpost?.erSaksbehandler && <FormPanel>
                <JournalpostPanel/>
                <div className="fordeling-page">
                    {!!opprettIGosysState.gosysOppgaveRequestError && (
                        <AlertStripeFeil>
                            {intlHelper(intl, 'fordeling.omfordeling.feil')}
                        </AlertStripeFeil>
                    )}
                    <div>
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            name={"ppsjekk"}
                            radios={Object.values(JaNei).map((jn) => ({
                                label: intlHelper(intl, jn),
                                value: jn,
                            }))}
                            legend={intlHelper(intl, 'fordeling.gjelderpp')}
                            checked={gjelderPP}
                            onChange={(event) => handleGjelderPP((event.target as HTMLInputElement).value as JaNei)}
                        />
                        {gjelderPP === JaNei.NEI && <>
                          <VerticalSpacer sixteenPx={true} />
                          <Input
                            label={intlHelper(intl, 'ident.identifikasjon.felt')}
                            onChange={handleIdent1Change}
                            onBlur={handleIdent1Blur}
                            value={sokersIdent}
                            className="bold-label ident-soker-1"
                            maxLength={11}
                            feil={skalViseFeilmelding(identState.ident1) || identState.ident1.length <= 0 ? intlHelper(intl, 'ident.feil.ugyldigident') : undefined}
                            bredde={"M"}
                          />
                          <VerticalSpacer eightPx={true}/>
                          <Hovedknapp
                            mini={true}
                            disabled={!identState.ident1 || !!identState.ident1 && !!skalViseFeilmelding(identState.ident1)}
                            onClick={() => omfordel(journalpost!.journalpostId, identState.ident1)}>
                            <FormattedMessage id="fordeling.sakstype.ANNET"/>
                          </Hovedknapp>
                        </>}
                        {gjelderPP === JaNei.JA && <>
                          <VerticalSpacer sixteenPx={true} />
                          <RadioPanelGruppe
                            className="horizontalRadios"
                            name={"identsjekk"}
                            radios={Object.values(JaNei).map((jn) => ({
                                label: intlHelper(intl, jn),
                                value: jn,
                            }))}
                            legend={<FormattedMessage
                                id="ident.identifikasjon.sjekkident"
                                values={{ident: journalpost?.norskIdent}}
                            />}
                            checked={riktigIdentIJournalposten}
                            onChange={(event) => {props.setErIdent1Bekreftet((event.target as HTMLInputElement).value === JaNei.JA ? true : false); handleIdentRadioChange((event.target as HTMLInputElement).value as JaNei)}}
                        />
                        </>}
                        {riktigIdentIJournalposten === JaNei.NEI && <>
                          <VerticalSpacer sixteenPx={true} />
                          <Input
                            label={intlHelper(
                                intl, 'ident.identifikasjon.felt'
                            )}
                            onChange={handleIdent1Change}
                            onBlur={handleIdent1Blur}
                            value={sokersIdent}
                            className="bold-label ident-soker-1"
                            maxLength={11}
                            feil={
                                skalViseFeilmelding(identState.ident1)
                                    ? intlHelper(intl, 'ident.feil.ugyldigident')
                                    : undefined
                            }
                            bredde={"M"}
                        />
                        </>}
                        {gjelderPP === JaNei.JA && !!journalpost?.kanKopieres && <>
                          <VerticalSpacer eightPx={true}/>
                          <Checkbox
                            label={intlHelper(intl, 'ident.identifikasjon.tosokere')}
                            onChange={(e) => {
                                setToSokereIJournalpost(e.target.checked)
                            }}
                          />
                          <VerticalSpacer sixteenPx={true}/>
                            {toSokereIJournalpost && <div className="fordeling-page__to-sokere-i-journalpost">
                              <AlertStripeInfo>{intlHelper(intl, 'ident.identifikasjon.infoOmRegisteringAvToSokere')}</AlertStripeInfo>
                              <Input
                                label={intlHelper(intl, 'ident.identifikasjon.annenSoker')}
                                onChange={(e) => setAnnenSokerIdent(e.target.value.replace(/\D+/, ''))}
                                onBlur={handleIdentAnnenSokerBlur}
                                value={annenSokerIdent}
                                className="bold-label"
                                maxLength={11}
                                feil={visFeilmeldingForAnnenIdentVidJournalKopi(identState.annenSokerIdent, identState.ident1, identState.ident2, intl)}
                                bredde={"M"}
                              />
                              <JournalPostKopiFelmeldinger
                                skalVisesNårJournalpostSomIkkeStottesKopieres={!skalJournalpostSomIkkeStottesKopieres}
                                fellesState={props.fellesState}
                                intl={intl}
                              />
                            </div>
                            }
                        </>}
                      <VerticalSpacer eightPx={true}/>
                        {gjelderPP === JaNei.JA && <>
                          <VerticalSpacer sixteenPx={true}/>
                            {!erBarnUtdatert && !!props.fellesState.hentBarnSuccess && typeof props.fellesState.barn !== 'undefined' && props.fellesState.barn.length > 0 && <>
                              <Select
                                value={barnetsIdent}
                                bredde="l"
                                label={intlHelper(intl, 'ident.identifikasjon.velgBarn')}
                                onChange={handleIdent2Change}
                                disabled={gjelderAnnetBarn}
                                onBlur={handleIdent2Blur}
                              >
                                <option key={uuidv4()} value={""}>
                                    {``}
                                </option>)

                                  {props.fellesState.barn.map(b =>
                                      <option key={uuidv4()} value={b.identitetsnummer}>
                                          {`${b.fornavn} ${b.etternavn} - ${b.identitetsnummer}`}
                                      </option>)
                                  }
                              </Select>
                              <VerticalSpacer eightPx={true}/>
                              <Checkbox
                                label={intlHelper(intl, 'ident.identifikasjon.annetBarn')}
                                onChange={(e) => {
                                    setGjelderAnnetBarn(e.target.checked);
                                    nullUtBarnetsIdent();
                                }}
                              />
                            </>
                            }
                          <VerticalSpacer sixteenPx={true}/>
                            {(gjelderAnnetBarn
                                || !!props.fellesState.hentBarnError
                                || !!props.fellesState.hentBarnForbidden
                                || (typeof props.fellesState.barn !== 'undefined' && props.fellesState.barn.length === 0))
                            && <>
                              <div className={'fyllUtIdentAnnetBarnContainer'}>
                                <Input
                                  label={intlHelper(intl, 'ident.identifikasjon.barn')}
                                  onChange={handleIdent2Change}
                                  onBlur={handleIdent2Blur}
                                  value={barnetsIdent}
                                  className="bold-label ident-soker-2"
                                  maxLength={11}
                                  feil={
                                      skalViseFeilmelding(identState.ident2)
                                          ? intlHelper(intl, 'ident.feil.ugyldigident')
                                          : undefined
                                  }
                                  bredde={"M"}
                                  disabled={barnetHarIkkeFnr}
                                />
                                  {barnetsIdent.length === 11 && !skalViseFeilmelding(identState.ident2) &&
                                  <div className="dobbelSjekkIdent"><div><WarningCircle/></div><p><b>{intlHelper(intl, 'ident.identifikasjon.dobbelsjekkident')}</b></p></div>}
                              </div>
                              <VerticalSpacer eightPx={true}/>
                              <Checkbox
                                label={intlHelper(intl, 'ident.identifikasjon.barnHarIkkeFnr')}
                                onChange={(e) => handleCheckboxChange(e.target.checked)}
                              />
                                {barnetHarIkkeFnr && <AlertStripeInfo
                                  className={"infotrygd_info"}> {intlHelper(intl, 'ident.identifikasjon.barnHarIkkeFnrInformasjon')}</AlertStripeInfo>}
                              <VerticalSpacer sixteenPx={true}/>
                            </>}

                            {(!(!!fordelingState.skalTilK9 || visSakstypeValg)) && <Knapp
                            mini={true}
                            onClick={() => handleVidereClick()}
                            disabled={skalViseFeilmelding(barnetsIdent) || (!barnetsIdent && !barnetHarIkkeFnr)}>
                            {intlHelper(intl, 'fordeling.knapp.videre')}</Knapp>}
                        </>}
                    </div>
                    <VerticalSpacer sixteenPx={true}/>
                    {(!!fordelingState.skalTilK9 || visSakstypeValg) && <>
                        <RadioGruppe
                            legend={intlHelper(intl, 'fordeling.overskrift')}
                            className="fordeling-page__options"
                        >
                            {Object.keys(TilgjengeligSakstype)
                              //  .filter((key) => !key.includes(`${Sakstype.OMSORGSPENGER}_`))
                                .map((key) => {
                                    /*    if (key === Sakstype.OMSORGSPENGER) {
                                            const radioOmsorgspenger = (
                                                <RadioPanel
                                                    key={key}
                                                    label={intlHelper(
                                                        intl,
                                                        `fordeling.sakstype.${Sakstype[key]}`
                                                    )}
                                                    value={Sakstype[key]}
                                                    onChange={() => {
                                                        setOmsorgspengerValgt(true);
                                                        props.setSakstypeAction(undefined);
                                                    }}
                                                    checked={omsorgspengerValgt}
                                                />
                                            );
                                            if (omsorgspengerValgt) {
                                                return (
                                                    <React.Fragment key={key}>
                                                        {radioOmsorgspenger}
                                                        <RadioGruppe className="omsorgspenger-radios">
                                                            {Object.keys(Sakstype)
                                                                .filter((sakstypenavn) =>
                                                                    sakstypenavn.includes(
                                                                        `${Sakstype.OMSORGSPENGER}_`
                                                                    )
                                                                )
                                                                .map((sakstypenavn) => (
                                                                    <Radio
                                                                        key={sakstypenavn}
                                                                        label={intlHelper(
                                                                            intl,
                                                                            `fordeling.sakstype.${Sakstype[sakstypenavn]}`
                                                                        )}
                                                                        value={Sakstype[sakstypenavn]}
                                                                        onChange={() =>
                                                                            props.setSakstypeAction(
                                                                                Sakstype[sakstypenavn]
                                                                            )
                                                                        }
                                                                        name="sakstype"
                                                                        checked={
                                                                            Sakstype[sakstypenavn] ===
                                                                            konfigForValgtSakstype?.navn
                                                                        }
                                                                    />
                                                                ))}
                                                        </RadioGruppe>
                                                    </React.Fragment>
                                                );
                                            }
                                        return radioOmsorgspenger;
                                    }*/
                                    return (
                                        <RadioPanel
                                            key={key}
                                            label={intlHelper(
                                                intl,
                                                `fordeling.sakstype.${Sakstype[key]}`
                                            )}
                                            value={Sakstype[key]}
                                            onChange={() => {
                                                props.setSakstypeAction(Sakstype[key]);
                                                setOmsorgspengerValgt(false);
                                            }}
                                            checked={konfigForValgtSakstype?.navn === key}
                                        />
                                    );
                                })}
                        </RadioGruppe>
                        <VerticalSpacer eightPx={true}/>
                        {typeof fordelingState.sakstype !== 'undefined' && fordelingState.sakstype === Sakstype.ANNET && <AlertStripeInfo> {intlHelper(intl, 'fordeling.infobox.opprettigosys')}</AlertStripeInfo>}
                        {typeof fordelingState.sakstype !== 'undefined' && fordelingState.sakstype === Sakstype.SKAL_IKKE_PUNSJES && <AlertStripeInfo> {intlHelper(intl, 'fordeling.infobox.lukkoppgave')}</AlertStripeInfo>}
                      <Behandlingsknapp
                      norskIdent={identState.ident1}
                      omfordel={omfordel}
                      lukkJournalpostOppgave={lukkJournalpostOppgave}
                      journalpost={journalpost}
                      sakstypeConfig={konfigForValgtSakstype}
                    />
                    </>}
                    {fordelingState.skalTilK9 === false &&
                    <>
                        <AlertStripeInfo
                            className={"infotrygd_info"}> {intlHelper(intl, 'fordeling.infotrygd')}</AlertStripeInfo>
                        <Hovedknapp
                            mini={true}
                            onClick={() => omfordel(journalpost!.journalpostId, identState.ident1)}
                        >
                            <FormattedMessage id="fordeling.sakstype.ANNET"/>
                        </Hovedknapp>
                    </>}
                    <VerticalSpacer sixteenPx={true} />
                    {!!fordelingState.sjekkTilK9Error && <AlertStripeFeil>{intlHelper(intl, 'fordeling.infortygd.error')}</AlertStripeFeil>}
                    {!!fordelingState.sjekkTilK9JournalpostStottesIkke && <div className={'fordeling-page__sjekk-til-K9-journalpost-stottes-ikke'}>
                      <AlertStripeFeil>{intlHelper(intl, 'fordeling.infotrygd.journalpoststottesikke')}</AlertStripeFeil>
                      <VerticalSpacer sixteenPx={true}/>
                      <div className="journalikkestottetkopi-checkboks">
                        <Checkbox
                          label={intlHelper(intl, 'fordeling.kopiereJournal')}
                          onChange={(e) => {
                              setSkalJournalpostSomIkkeStottesKopieres(e.target.checked);
                          }}
                        />
                        <Hjelpetekst
                          className="journalikkestottetkopi-checkboks__hjelpetekst"
                          type={PopoverOrientering.Hoyre}
                          tabIndex={-1}
                        >{intlHelper(intl, 'fordeling.kopiereJournal.hjelpetekst')}
                        </Hjelpetekst>
                      </div>
                      <JournalPostKopiFelmeldinger
                        skalVisesNårJournalpostSomIkkeStottesKopieres={skalJournalpostSomIkkeStottesKopieres}
                        fellesState={props.fellesState}
                        intl={intl}
                      />
                        {!!props.fellesState.isAwaitingKopierJournalPostResponse && <NavFrontendSpinner/>}
                      <Knapp onClick={() => {
                          if (skalJournalpostSomIkkeStottesKopieres) {
                              kopierJournalpostOgLukkOppgave();
                          } else {
                              lukkJournalpostOppgave(journalpost?.journalpostId);
                          }
                      }}>
                        <FormattedMessage id="fordeling.sakstype.SKAL_IKKE_PUNSJES"/>
                      </Knapp>

                    </div>}
                    {!!fordelingState.isAwaitingSjekkTilK9Response && <NavFrontendSpinner/>}
                </div>
            </FormPanel>}
            {!journalpost?.kanSendeInn && <div><AlertStripeAdvarsel>{intlHelper(intl, 'fordeling.kanikkesendeinn')}</AlertStripeAdvarsel></div>}
            {!journalpost?.erSaksbehandler && <div><AlertStripeAdvarsel>{intlHelper(intl, 'fordeling.ikkesaksbehandler')}</AlertStripeAdvarsel></div>}
            <PdfVisning
                dokumenter={journalpost!.dokumenter}
                journalpostId={journalpost!.journalpostId}
            />
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    journalpost: state.felles.journalpost,
    fordelingState: state.fordelingState,
    identState: state.identState,
    opprettIGosysState: state.opprettIGosys,
    fellesState: state.felles,
    dedupkey: state.felles.dedupKey
});

const mapDispatchToProps = (dispatch: any) => ({
    setSakstypeAction: (sakstype: Sakstype) =>
        dispatch(setSakstypeAction(sakstype)),
    omfordel: (journalpostid: string, norskIdent: string) =>
        dispatch(omfordelAction(journalpostid, norskIdent)),
    setIdentAction: (ident1: string, ident2: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(ident1, ident2, annenSokerIdent)),
    setErIdent1Bekreftet: (erBekreftet: boolean) => dispatch(setErIdent1BekreftetAction(erBekreftet)),
    sjekkOmSkalTilK9: (ident1: string, ident2: string, jpid: string) =>
        dispatch(sjekkOmSkalTilK9Sak(ident1, ident2, jpid)),
    kopierJournalpost: (ident1: string, ident2: string, annenIdent: string, dedupkey: string, journalpostId: string) =>
        dispatch(kopierJournalpost(ident1, annenIdent, ident2, journalpostId, dedupkey)),
    hentBarn: (ident1: string) =>
        dispatch(hentBarn(ident1)),
    lukkJournalpostOppgave: (jpid: string) =>
        dispatch(lukkJournalpostOppgaveAction(jpid)),
    resetOmfordelAction: () =>
        dispatch(opprettGosysOppgaveResetAction()),
    lukkOppgaveReset: () =>
        dispatch(lukkOppgaveResetAction())
});

const Fordeling = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(FordelingComponent)
);

export {Fordeling, FordelingComponent};
