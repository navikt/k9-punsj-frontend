import {JaNei, Sakstype} from 'app/models/enums';
import {IFordelingState, IJournalpost} from 'app/models/types';
import {setSakstypeAction,} from 'app/state/actions';
import {RootStateType} from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import {AlertStripeAdvarsel, AlertStripeFeil, AlertStripeSuksess} from 'nav-frontend-alertstriper';
import {Hovedknapp} from 'nav-frontend-knapper';
import {Checkbox, Input, Radio, RadioGruppe, RadioPanel, RadioPanelGruppe} from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, {useMemo, useState} from 'react';
import {FormattedMessage, injectIntl, WrappedComponentProps,} from 'react-intl';
import {connect} from 'react-redux';
import PdfVisning from '../../components/pdf/PdfVisning';
import {ISakstypeDefault, ISakstypePunch} from '../../models/Sakstype';
import {Sakstyper} from '../SakstypeImpls';
import './fordeling.less';
import VerticalSpacer from '../../components/VerticalSpacer';
import FormPanel from '../../components/FormPanel';
import JournalpostPanel from '../../components/journalpost-panel/JournalpostPanel';
import {opprettGosysOppgave as omfordelAction} from "../../state/actions/GosysOppgaveActions";
import {setHash} from "../../utils";
import {IdentRules} from "../../rules";
import {IIdentState} from "../../models/types/IdentState";
import {setIdentFellesAction} from "../../state/actions/IdentActions";

export interface IFordelingStateProps {
  journalpost?: IJournalpost;
  fordelingState: IFordelingState;
  journalpostId: string;
  identState: IIdentState;
}

export interface IFordelingDispatchProps {
  setSakstypeAction: typeof setSakstypeAction;
  omfordel: typeof omfordelAction;
  setIdentAction: typeof setIdentFellesAction;
}

type IFordelingProps = WrappedComponentProps &
  IFordelingStateProps &
  IFordelingDispatchProps;

type BehandlingsknappProps = Pick<
  IFordelingProps,
  'omfordel' | 'journalpost'
> & {
  norskIdent?: string;
  sakstypeConfig?: ISakstypeDefault;

};

const Behandlingsknapp: React.FunctionComponent<BehandlingsknappProps> = ({
  norskIdent,
  omfordel,
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
          <FormattedMessage id="fordeling.knapp.punsj" />
        </Hovedknapp>
    );
  }

  return (
    <Hovedknapp
      onClick={() => omfordel(journalpost!.journalpostId, norskIdent)}
    >
      <FormattedMessage id="fordeling.knapp.omfordel" />
    </Hovedknapp>
  );
};

const FordelingComponent: React.FunctionComponent<IFordelingProps> = (
  props: IFordelingProps
) => {
  const { intl, fordelingState, omfordel, journalpost, identState } = props;
  const { sakstype } = fordelingState;
  const sakstyper: ISakstypeDefault[] = useMemo(
    () => [...Sakstyper.punchSakstyper, ...Sakstyper.omfordelingssakstyper],
    []
  );
  const konfigForValgtSakstype = useMemo(
    () => sakstyper.find((st) => st.navn === sakstype),
    [sakstype]
  );

  const identer = [identState.ident1, identState.ident2];
  const antallIdenter = identer.filter((id) => id && id.length).length;
  const journalpostident = journalpost?.norskIdent;

  const [omsorgspengerValgt, setOmsorgspengerValgt] = useState<boolean>(false);
  const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);
  const [ riktigIdentIJournalposten, setRiktigIdentIJournalposten] = useState<JaNei>(JaNei.NEI);

  const [sokersIdent, setSokersIdent] = useState<string>('');
  const [barnetsIdent, setBarnetsIdent] = useState<string>('');

  const skalViseFeilmelding = (ident: string | null) =>
      ident && ident.length && !IdentRules.isIdentValid(ident);

const handleIdent1Change = (event: any) =>
      setSokersIdent(event.target.value.replace(/\D+/, ''))
const handleIdent2Change = (event: any) =>
      setBarnetsIdent(event.target.value.replace(/\D+/, ''));

const handleIdent1Blur = (event: any) =>
      props.setIdentAction(event.target.value, identState.ident2);
const handleIdent2Blur = (event: any) =>
      props.setIdentAction(identState.ident1, event.target.value);

const handleRadioChange = (jn: JaNei) => {
    setRiktigIdentIJournalposten(jn);
    if (jn === JaNei.JA) {
      props.setIdentAction(journalpostident || '', identState.ident2)
    }
  }

  const handleCheckboxChange = (checked: boolean) => {
    setBarnetHarIkkeFnr(checked);
    if (checked) {
      setBarnetsIdent('');
      props.setIdentAction(identState.ident1, null);
    }
  }

  if (fordelingState.isAwaitingOmfordelingResponse) {
    return <NavFrontendSpinner />;
  }

  if (fordelingState.omfordelingDone) {
    return (
      <AlertStripeSuksess>
        {intlHelper(intl, 'fordeling.omfordeling.utfort')}
      </AlertStripeSuksess>
    );
  }

  return (
    <div className="fordeling-container">
      <FormPanel>
        <div className="fordeling-page">
          {!!fordelingState.omfordelingError && (
            <AlertStripeFeil>
              {intlHelper(intl, 'fordeling.omfordeling.feil')}
            </AlertStripeFeil>
          )}
          <JournalpostPanel
            journalpostId={journalpost!.journalpostId}
            identitetsnummer={journalpost?.norskIdent}
          />
          <div>
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
                onChange={(event) => handleRadioChange((event.target as HTMLInputElement).value as JaNei)}
            />
            {riktigIdentIJournalposten === JaNei.NEI && <Input
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
            />}
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
            <VerticalSpacer sixteenPx={true}/>
            <Checkbox
                label={intlHelper(intl, 'ident.identifikasjon.barnHarIkkeFnr')}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
            />
            <VerticalSpacer sixteenPx={true}/>
            {
            antallIdenter > 0 &&
            journalpostident &&
            props &&
            identer.every(
                (ident) =>
                    !ident ||
                    (IdentRules.isIdentValid(ident) && ident !== journalpostident)
            ) && (
                <AlertStripeAdvarsel>
                  {intlHelper(intl, 'ident.advarsel.samsvarerikke', {
                    antallIdenter: antallIdenter.toString(),
                    journalpostident,
                  })}
                </AlertStripeAdvarsel>
            )}
          </div>

            <RadioGruppe
            legend={intlHelper(intl, 'fordeling.overskrift')}
            className="fordeling-page__options"
          >
            {Object.keys(Sakstype)
              .filter((key) => !key.includes(`${Sakstype.OMSORGSPENGER}_`))
              .map((key) => {
                if (key === Sakstype.OMSORGSPENGER) {
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
                }
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
          <VerticalSpacer sixteenPx={true} />
          <Behandlingsknapp
            norskIdent={journalpost?.norskIdent}
            omfordel={omfordel}
            journalpost={journalpost}
            sakstypeConfig={konfigForValgtSakstype}
          />
        </div>
      </FormPanel>
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
});

const mapDispatchToProps = (dispatch: any) => ({
  setSakstypeAction: (sakstype: Sakstype) =>
    dispatch(setSakstypeAction(sakstype)),
  omfordel: (journalpostid: string, norskIdent: string) =>
    dispatch(omfordelAction(journalpostid, norskIdent)),
  setIdentAction: (ident1: string, ident2: string | null) =>
      dispatch(setIdentFellesAction(ident1, ident2))
});

const Fordeling = injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(FordelingComponent)
);

export { Fordeling, FordelingComponent };
