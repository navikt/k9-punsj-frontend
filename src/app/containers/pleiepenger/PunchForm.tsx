import {Listepaneler} from 'app/containers/pleiepenger/Listepaneler';
import {PeriodeinfoPaneler} from 'app/containers/pleiepenger/PeriodeinfoPaneler';
import {pfArbeidstaker} from 'app/containers/pleiepenger/pfArbeidstaker';
import {JaNeiVetikke, PunchStep} from 'app/models/enums';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import {
  IFrilanser, IInputError,
  IPeriode,
  IPleiepengerPunchState,
  IPunchFormState,
  ISelvstendigNaerinsdrivende, ISoknadFelles,
  ITilsyn,
  Periodeinfo,
  Tilleggsinformasjon,
  Tilsyn,
} from 'app/models/types';
import {
  getSoknad,
  resetPunchFormAction,
  resetSoknadAction,
  setIdentAction,
  setStepAction,
  submitSoknad,
  undoChoiceOfEksisterendeSoknadAction,
  updateSoknad,
} from 'app/state/actions';
import {setHash} from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import {AlertStripeFeil, AlertStripeSuksess} from 'nav-frontend-alertstriper';
import {Knapp} from 'nav-frontend-knapper';
import {Input, RadioPanelGruppe, SkjemaGruppe,} from 'nav-frontend-skjema';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import {Col, Container, Row} from 'react-bootstrap';
import {ArbeidstakerV2} from "../../models/types/ArbeidstakerV2";
import {ISoknadV2, SoknadV2, TilleggsinformasjonV2, TilsynsordningV2} from "../../models/types/Soknadv2";
import {EtikettAdvarsel, EtikettFokus, EtikettSuksess} from "nav-frontend-etiketter";
import {RootStateType} from "../../state/RootState";
import {connect} from "react-redux";
import {IPeriodeV2} from "../../models/types/PeriodeV2";
import {ISelvstendigNaeringsdrivendeV2} from "../../models/types/SelvstendigNæringsdrivendeV2";
import {IFrilanserV2} from "../../models/types/FrilanserV2";
import {pfTilleggsinformasjon} from "./pfTilleggsinformasjon";
import {pfTilsyn} from "./pfTilsyn";
import {PeriodInput} from "../../components/period-input/PeriodInput";
import {Periodepaneler} from "./Periodepaneler";


export interface IPunchFormComponentProps {
  getPunchPath: (step: PunchStep, values?: any) => string;
  journalpostid: string;
  id: string;
}

export interface IPunchFormStateProps {
  punchFormState: IPunchFormState;
  punchState: IPleiepengerPunchState;
}

export interface IPunchFormDispatchProps {
  getSoknad: typeof getSoknad;
  resetSoknadAction: typeof resetSoknadAction;
  setIdentAction: typeof setIdentAction;
  setStepAction: typeof setStepAction;
  undoChoiceOfEksisterendeSoknadAction: typeof undoChoiceOfEksisterendeSoknadAction;
  updateSoknad: typeof updateSoknad;
  submitSoknad: typeof submitSoknad;
  resetPunchFormAction: typeof resetPunchFormAction;
}

export interface IPunchFormComponentState {
  soknad: ISoknadV2;
  isFetched: boolean;
  showStatus: boolean;
  faktiskeTimer: string[][];
}

type IPunchFormProps = IPunchFormComponentProps &
  WrappedComponentProps &
  IPunchFormStateProps &
  IPunchFormDispatchProps;

export class PunchFormComponent extends React.Component<
  IPunchFormProps,
  IPunchFormComponentState
> {
  state: IPunchFormComponentState = {
    soknad: {
      soeknadId: '',
      soekerId: '',
      erFraK9: false,
      mottattDato: '',
      journalposter: [],
      sendtInn: false,
      barn: {
        norskIdent: '',
        foedselsdato: '',
      },
      arbeidAktivitet: {},
      arbeidstid: {},

      omsorg: {
        samtykketOmsorgForBarnet: false,
        beskrivelseAvOmsorgsrollen: '',
        relasjonTilBarnet: ''
      }
    },
    isFetched: false,
    showStatus: false,
    faktiskeTimer: [], // Lagrer tilstedeværelsesgrad i stringformat her for å gjøre det enklere å redigere feltet}
  };

  private initialTilsyn: Periodeinfo<ITilsyn> = {
    periode: { fraOgMed: '', tilOgMed: '' },
    mandag: null,
    tirsdag: null,
    onsdag: null,
    torsdag: null,
    fredag: null,
  };

  componentDidMount(): void {
    const { id } = this.props;
    this.props.getSoknad(id);
    this.props.setStepAction(PunchStep.FILL_FORM);
    this.setState(this.state);
  }

  componentDidUpdate(
      prevProps: Readonly<IPunchFormProps>,
      prevState: Readonly<IPunchFormComponentState>,
      snapshot?: any
  ): void {
    const { soknad } = this.props.punchFormState;
    if (!!soknad && !this.state.isFetched) {
      this.setState({
        soknad: new SoknadV2(this.props.punchFormState.soknad as ISoknadV2),
        isFetched: true,
      });
      this.props.setIdentAction(
          soknad.soekerId || '',
      );
    }
  }

  componentWillUnmount(): void {
    this.props.resetPunchFormAction();
  }

  render() {
    const { intl, punchFormState, punchState } = this.props;
    const soknad = new SoknadV2(this.state.soknad)
 //   const isSoknadComplete =
//   !!this.getManglerFromStore(1) &&
//             !this.getManglerFromStore(1)!.length &&
//             !!this.getManglerFromStore(2) &&
//             !this.getManglerFromStore(2)!.length;

    if (punchFormState.isComplete) {
      setHash(this.props.getPunchPath(PunchStep.COMPLETED));
      return null;
    }

    if (punchFormState.isSoknadLoading) {
      return <NavFrontendSpinner />;
    }

    if (!!punchFormState.error) {
      return (
        <>
          <AlertStripeFeil>
            {intlHelper(intl, 'skjema.feil.ikke_funnet', { id: this.props.id })}
          </AlertStripeFeil>
          <p>
            <Knapp onClick={this.handleStartButtonClick}>
              {intlHelper(intl, 'skjema.knapp.tilstart')}
            </Knapp>
          </p>
        </>
      );
    }

    if (!soknad) {
      return null;
    }

    const initialPeriode: IPeriodeV2 = { fom: '', tom: '' };

    const initialArbeidstaker = new ArbeidstakerV2({
      arbeidstidInfo: undefined,
      organisasjonsnummer: '',
      norskIdent: null,
    });

    const initialSelvstendigNaeringsdrivende: ISelvstendigNaeringsdrivendeV2 = {
      perioder: [],
    };
    const initialFrilanser: IFrilanserV2 = {
      startDato: '',
      jobberFortsattSomFrilans: false,
    };

 /*
   const initialTilsyn = new TilsynV2({
      periode: initialPeriode,
      mandag: null,
      tirsdag: null,
      onsdag: null,
      torsdag: null,
      fredag: null,
    });

  */

  const initialTilsyn = new TilsynsordningV2({
      periode: initialPeriode,
      etablertTilsynTimerPerDag: '',
  });


    const initialBeredskap = new TilleggsinformasjonV2({
      periode: initialPeriode,
      tilleggsinformasjon: '',
    });

    const initialNattevaak = new TilleggsinformasjonV2({
      periode: initialPeriode,
      tilleggsinformasjon: '',
    });

    const soknadsperioder = () => (
      <Periodepaneler
        intl={intl}
        periods={[soknad.soeknadsperiode]}
        panelid={(i) => `soknadsperiodepanel_${i}`}
        initialPeriodeinfo={ initialPeriode }
        editSoknad={(perioder) =>
          this.updateSoknadInformasjon(
            { soeknadsperiode: {
                fom: perioder.length > 0 && perioder[0] ? perioder[0].fom : '',
                tom: perioder.length > 0 && perioder[0] ? perioder[0].tom : ''} })
        }
        editSoknadState={(perioder, showStatus) =>
          this.updateSoknadState(
              { soeknadsperiode: {
                      fom: perioder.length > 0 && perioder[0] ? perioder[0].fom : '',
                      tom: perioder.length > 0 && perioder[0] ? perioder[0].tom : ''}},
            showStatus
          )
        }
        getErrorMessage={() => undefined}
        feilkodeprefiks={'perioder'}
        minstEn={true}
      />
    );

      const soknadsperioder2 = () => (
          <PeriodInput
              intl={intl}
              periode={soknad.soeknadsperiode}
              onChange={(periode) =>
                  this.updateSoknadInformasjon(
                      {soeknadsperiode: periode})
              }
              onBlur={(periode) => this.updateSoknadState({soeknadsperiode: periode}, true)}

          />
      );

    const arbeidsperioder = () => {
      const updateTgStrings = () =>
        this.setState({
          faktiskeTimer: this.faktiskTimer(soknad),
        });
      const  arbeid = soknad.arbeidstid;
      const errorMessageFunction = (code: string) =>
          () => undefined;

      const arbeidstakerperioder = (harOverskrift?: boolean) => (
        <Listepaneler
          intl={intl}
          items={arbeid.arbeidstakerList}
          component={pfArbeidstaker(
            this.state.faktiskeTimer,
            (faktiskeTimer) => this.setState({ faktiskeTimer }),
            () => this.faktiskTimer(soknad)
          )}
          panelid={(i) => `arbeidstakerpanel_${i}`}
          initialItem={initialArbeidstaker}
          editSoknad={(arbeidstakerList) =>
            this.updateSoknad(
              {
                arbeidstid: {
                    arbeidstakerList
                  }
              }
            )
          }
          editSoknadState={(arbeidstakerList, showStatus) =>
            this.updateSoknadState(
                {
                  arbeidstid: {
                    arbeidstakerList
                  }
                },
              showStatus
            )
          }
          textLeggTil={
            harOverskrift
              ? 'skjema.arbeid.arbeidstaker.leggtilarbeidsgiver'
              : 'skjema.arbeid.arbeidstaker.leggtilperiode'
          }
          textFjern="skjema.arbeid.arbeidstaker.fjernarbeidsgiver"
          panelClassName="arbeidstakerpanel"
          getErrorMessage={errorMessageFunction}
          feilkodeprefiks={'arbeid.arbeidstaker'}
          onAdd={updateTgStrings}
          onRemove={updateTgStrings}
        />
      );

      const selvstendigperioder = (harOverskrift?: boolean) => (
        <PeriodeinfoPaneler
          intl={intl}
          periods={arbeid.selvstendigNæringsdrivendeArbeidstidInfo.perioder}
          panelid={(i) => `selvstendignaeringsdrivendepanel_${i}`}
          initialPeriodeinfo={initialSelvstendigNaeringsdrivende}
          editSoknad={(perioder) =>
            this.updateSoknadInformasjon(
                {
                  arbeidstid: {
                    selvstendigNæringsdrivendeArbeidstidInfo: {
                      ...arbeid.selvstendigNæringsdrivendeArbeidstidInfo,
                      perioder
                    }
                  }
                }
            )
          }
          editSoknadState={(perioder, showStatus) =>
            this.updateSoknadState(
                {
                  arbeidstid: {
                    selvstendigNæringsdrivendeArbeidstidInfo: {
                      ...arbeid.selvstendigNæringsdrivendeArbeidstidInfo,
                      perioder
                    }
                  }
                },
              showStatus
            )
          }
          textLeggTil={
            harOverskrift
              ? 'skjema.arbeid.leggtilperiode'
              : 'skjema.arbeid.selvstendignaeringsdrivende.leggtilperiode'
          }
          textFjern="skjema.arbeid.selvstendignaeringsdrivende.fjernperiode"
          panelClassName="selvstendignaeringsdrivendepanel"
          getErrorMessage={errorMessageFunction}
          feilkodeprefiks={'arbeid.selvstendigNaeringsdrivende'}
        />
      );

      const frilanserperioder = (harOverskrift?: boolean) => (
        <PeriodeinfoPaneler
          intl={intl}
          periods={arbeid.frilanserArbeidstidInfo.perioder}
          panelid={(i) => `frilanserpanel_${i}`}
          initialPeriodeinfo={initialFrilanser}
          editSoknad={(perioder) =>
            this.updateSoknadInformasjon(
                {
                  arbeidstid: {
                    frilanserArbeidstidInfo: {
                      ...arbeid.frilanserArbeidstidInfo,
                      perioder
                    }
                  }
                },
            )
          }
          editSoknadState={(perioder, showStatus) =>
              this.updateSoknadState(
                  {
                    arbeidstid: {
                      frilanserArbeidstidInfo: {
                        ...arbeid.frilanserArbeidstidInfo,
                        perioder
                      }
                    }
                  },
                  showStatus
              )
          }
          textLeggTil={
            harOverskrift
              ? 'skjema.arbeid.leggtilperiode'
              : 'skjema.arbeid.frilanser.leggtilperiode'
          }
          textFjern="skjema.arbeid.frilanser.fjernperiode"
          panelClassName="frilanserpanel"
          getErrorMessage={errorMessageFunction}
          feilkodeprefiks={'arbeid.frilanser'}
        />
      );

      const antallArbeidsperioder = soknad.arbeidAktivitet.numberOfWorkPeriods();

      const visning = () => {
        if (!antallArbeidsperioder) {
          return (
            <Container className="arbeidsknapper">
              <Row>
                <Col>{arbeidstakerperioder()}</Col>
                <Col>{selvstendigperioder()}</Col>
              </Row>
            </Container>
          );
        } else if (arbeid.arbeidstakerList.length === antallArbeidsperioder) {
          return (
            <>
              <h3>
                {intlHelper(intl, 'skjema.arbeid.arbeidstaker.overskrift')}
              </h3>
              {arbeidstakerperioder(true)}
              <h3>
                {intlHelper(intl, 'skjema.arbeid.andrearbeidstyper.overskrift')}
              </h3>
              <Container className="arbeidsknapper">
                <Row>
                  <Col>{selvstendigperioder()}</Col>
                </Row>
              </Container>
            </>
          );
        } else if (
          arbeid.selvstendigNæringsdrivendeArbeidstidInfo.perioder.length === antallArbeidsperioder
        ) {
          return (
            <>
              <h3>
                {intlHelper(
                  intl,
                  'skjema.arbeid.selvstendignaeringsdrivende.overskrift'
                )}
              </h3>
              {selvstendigperioder(true)}
              <h3>
                {intlHelper(intl, 'skjema.arbeid.andrearbeidstyper.overskrift')}
              </h3>
              <Container className="arbeidsknapper">
                <Row>
                  <Col>{arbeidstakerperioder()}</Col>
                </Row>
              </Container>
            </>
          );
        } else if (arbeid.frilanserArbeidstidInfo) {
          return (
            <>
              <h3>{intlHelper(intl, 'skjema.arbeid.frilanser.overskrift')}</h3>
                {frilanserperioder(true)}
              <h3>
                {intlHelper(intl, 'skjema.arbeid.andrearbeidstyper.overskrift')}
              </h3>
              <Container className="arbeidsknapper">
                <Row>
                  <Col>{arbeidstakerperioder()}</Col>
                  <Col>{selvstendigperioder()}</Col>
                </Row>
              </Container>
            </>
          );
        } else {
          return (
            <>
              <h3>
                {intlHelper(intl, 'skjema.arbeid.arbeidstaker.overskrift')}
              </h3>
              {arbeidstakerperioder(true)}
              <h3>
                {intlHelper(
                  intl,
                  'skjema.arbeid.selvstendignaeringsdrivende.overskrift'
                )}
              </h3>
              {selvstendigperioder(true)}
              <h3>{intlHelper(intl, 'skjema.arbeid.frilanser.overskrift')}</h3>
            </>
          );
        }
      };

      return visning();
    };



    const beredskapperioder = (
      <PeriodeinfoPaneler
        intl={intl}
        periods={soknad.beredskap}
        component={pfTilleggsinformasjon('beredskap')}
        panelid={(i) => `beredskapspanel_${i}`}
        initialPeriodeinfo={initialBeredskap}
        editSoknad={(beredskap) => this.updateSoknad( { beredskap })}
        editSoknadState={(beredskap, showStatus) =>
          this.updateSoknadState({ beredskap }, showStatus)
        }
        textLeggTil="skjema.beredskap.leggtilperiode"
        textFjern="skjema.beredskap.fjernperiode"
        className="beredskapsperioder"
        panelClassName="beredskapspanel"
        getErrorMessage={() => undefined}
        feilkodeprefiks={'beredskap'}
      />
    );

    const nattevaakperioder = (
      <PeriodeinfoPaneler
        intl={intl}
        periods={soknad.nattevaak}
        component={pfTilleggsinformasjon('nattevaak')}
        panelid={(i) => `nattevaakspanel_${i}`}
        initialPeriodeinfo={initialNattevaak}
        editSoknad={(nattevaak) => this.updateSoknadInformasjon({ nattevaak } )}
        editSoknadState={(nattevaak, showStatus) =>
          this.updateSoknadState({nattevaak} , showStatus)
        }
        textLeggTil="skjema.nattevaak.leggtilperiode"
        textFjern="skjema.nattevaak.fjernperiode"
        className="nattevaaksperioder"
        panelClassName="nattevaakspanel"
        getErrorMessage={() => undefined}
        feilkodeprefiks={'nattevaak'}
      />
    );

    const dobbel = (component: (nr: 1 | 2) => React.ReactElement) => {
      return
      component(1)
    };

    return (
      <>
        {this.statusetikett()}
        {this.backButton()}
        {!!punchFormState.updateSoknadError && (
          <AlertStripeFeil>
            {intlHelper(intl, 'skjema.feil.ikke_lagret')}
          </AlertStripeFeil>
        )}
        {!!punchFormState.submitSoknadError && (
          <AlertStripeFeil>
            {intlHelper(intl, 'skjema.feil.ikke_sendt')}
          </AlertStripeFeil>
        )}
        {/*
          !punchFormState.updateSoknadError &&
            !punchFormState.submitSoknadError &&
            (isSoknadComplete ? (
              <AlertStripeSuksess>
                {intlHelper(intl, 'skjema.melding.komplett')}
              </AlertStripeSuksess>
            ) : (
              <></>
            )) /*<AlertStripeInfo>{intlHelper(intl, 'skjema.melding.fyll_ut')}</AlertStripeInfo>*/
        }
        <SkjemaGruppe feil={''}>
          <div className="inputs-soknad">
            <h2>{intlHelper(intl, 'skjema.opplysningeromsoknad')}</h2>
            <Input
              id="soknad-dato"
              label={intlHelper(intl, 'skjema.mottakelsesdato')}
              type="date"
              className="bold-label"
              value={soknad.mottattDato}
              {...this.changeAndBlurUpdatesSoknad((event) => ({
                mottattDato: event.target.value,
              }))}
       //       feil={this.getErrorMessage('datoMottatt')}
            />
          </div>
          <SkjemaGruppe
   //         feil={this.getErrorMessage('barn')}
            className="inputs-barn"
          >
            <h2>{intlHelper(intl, 'skjema.opplysningerombarn')}</h2>
            <Input
              id="barn-ident"
              label={intlHelper(intl, 'skjema.barn.ident')}
              className="bold-label"
              value={soknad.barn.norskIdent}
              {...this.changeAndBlurUpdatesSoknad((event) => ({
                barn: {
                  ...soknad.barn,
                  norskIdent: event.target.value,
                },
              }))}
   //           feil={this.getErrorMessage('barn.norskIdent')}
              maxLength={11}
            />
            <Input
              id="barn-fdato"
              type="date"
              label={intlHelper(intl, 'skjema.barn.foedselsdato')}
              className="bold-label"
              value={soknad.barn.foedselsdato}
              {...this.changeAndBlurUpdatesSoknad((event) => ({
                  barn: {
                    ...soknad.barn,
                    foedselsdato: event.target.value,
                  },
              }))}
    //          feil={this.getErrorMessage('barn.foedselsdato')}
            />
          </SkjemaGruppe>
          <h2>{intlHelper(intl, 'skjema.periode')}</h2>
          {soknadsperioder()}
          <h2>{intlHelper(intl, 'skjema.arbeid.overskrift')}</h2>
          {arbeidsperioder()}
          <h2>{intlHelper(intl, 'skjema.tilsyn.overskrift')}</h2>
          <SkjemaGruppe
  //          feil={this.getErrorMessage('tilsynsordning')}
            className="tilsynsordning"
          >
            <SkjemaGruppe
    //          feil={this.getErrorMessage('tilsynsordning.iTilsynsordning')}
              className="janeivetikke"
            >
              <RadioPanelGruppe
                className="horizontalRadios"
                radios={Object.values(JaNeiVetikke).map((jnv) => ({
                  label: intlHelper(intl, jnv),
                  value: jnv,
                }))}
                name="tilsynjaneivetikke"
                legend={intlHelper(intl, 'skjema.tilsyn.janeivetikke')}
                onChange={() => undefined}
              /*  onChange={(event) =>
                  this.updateTilsynsordning(
                    (event.target as HTMLInputElement).value as JaNeiVetikke
                  )
                }*/
                checked={soknad.tilsynsordning.length > 0 ? JaNeiVetikke.JA : JaNeiVetikke.NEI}
              />
            </SkjemaGruppe>
            {soknad.tilsynsordning.length > 0 && (
              <PeriodeinfoPaneler
                intl={intl}
                periods={soknad.tilsynsordning}
                component={pfTilsyn}
                panelid={(i) => `tilsynpanel_${i}`}
                initialPeriodeinfo={initialTilsyn}
                editSoknad={(tilsynsordning) =>
                  this.updateSoknadInformasjon({ tilsynsordning }
                  )
                }
                editSoknadState={(tilsynsordning, showStatus) =>
                  this.updateSoknadState(
                    { tilsynsordning },
                    showStatus
                  )
                }
                textLeggTil="skjema.tilsyn.leggtilperiode"
                textFjern="skjema.tilsyn.fjernperiode"
                panelClassName="tilsynpanel"
      //          getErrorMessage={this.getErrorMessage}
                feilkodeprefiks={'tilsynsordning.opphold'}
                minstEn={
                  soknad.tilsynsordning !== null
                }
              />
            )}

          {soknad.tilsynsordning.length > 0 && (
            <>
              <h2>{intlHelper(intl, 'skjema.beredskap.overskrift')}</h2>
              {beredskapperioder}
              <h2>{intlHelper(intl, 'skjema.nattevaak.overskrift')}</h2>
              {nattevaakperioder}
            </>
          )}
          {/*<h2>{intlHelper(intl, 'skjema.utenlandsopphold.opplysninger')}</h2>
                {!!soknad?.medlemskap?.opphold?.length && (
                    <table className="tabell tabell--stripet">
                        <thead>
                            <tr>
                                <th>{intlHelper(intl, 'skjema.utenlandsopphold.land')}</th>
                                <th>{intlHelper(intl, 'skjema.utenlandsopphold.fom')}</th>
                                <th>{intlHelper(intl, 'skjema.utenlandsopphold.tom')}</th>
                                <th>{intlHelper(intl, 'skjema.utenlandsopphold.fjern')}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {Object.keys(soknad.medlemskap.opphold).map((key) => (
                                <tr key={key}>
                                    <td><CountrySelect
                                        name={`opphold_land_${key}`}
                                        onChange={event => this.handleOppholdLandChange(+key, event.target.value)}
                                        onBlur={() => this.setOpphold()}
                                        selectedcountry={_.get(soknad.medlemskap!.opphold[key], 'land', '')}
                                        unselectedoption={'Velg …'}
                                        label=""
                                    /></td>
                                    <td><Input
                                        name={`opphold_fom_${key}`}
                                        onChange={event => this.handleOppholdFomChange(+key, event.target.value)}
                                        onBlur={() => this.setOpphold()}
                                        type="date"
                                        value={_.get(soknad.medlemskap!.opphold[key], 'periode.fra_og_med', '')}
                                        label=""
                                    /></td>
                                    <td><Input
                                        name={`opphold_tom_${key}`}
                                        onChange={event => this.handleOppholdTomChange(+key, event.target.value)}
                                        onBlur={() => this.setOpphold()}
                                        type="date"
                                        value={_.get(soknad.medlemskap!.opphold[key], 'periode.til_og_med', '')}
                                        label=""
                                    /></td>
                                    <td><Lukknapp bla={true} onClick={() => this.removeOpphold(+key)}/></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
                <p><Knapp onClick={this.addOpphold}>{intlHelper(intl, 'skjema.utenlandsopphold.legg_til')}</Knapp></p>
                <Checkbox
                    label="Har bodd i utlandet i løpet av de siste 12 månedene"
                    checked={_.get(soknad, 'medlemskap.har_bodd_i_utlandet_siste_12_mnd', false)}
                    {...this.onChangeOnlyUpdate(event => ({medlemskap: {...soknad.medlemskap!, har_bodd_i_utlandet_siste_12_mnd: event.target.checked}}))}
                />
                <Checkbox
                    label="Skal bo i utlandet i løpet av de neste 12 månedene"
                    checked={_.get(soknad, 'medlemskap.skal_bo_i_utlandet_neste_12_mnd', false)}
                    {...this.onChangeOnlyUpdate(event => ({medlemskap: {...soknad.medlemskap!, skal_bo_i_utlandet_neste_12_mnd: event.target.checked}}))}
                />*/}
          </SkjemaGruppe>
          {!!punchFormState.submitSoknadError && (
            <AlertStripeFeil className="margin-top-1">
              {intlHelper(intl, 'skjema.feil.ikke_sendt')}
            </AlertStripeFeil>
          )}
          <p className="sendknapp-wrapper">
            <Knapp
              onClick={() =>
                this.props.submitSoknad(
                  this.props.id,
                  this.props.punchState.ident1
                )
              }
           //   disabled={!isSoknadComplete}
                disabled={false}
            >
              {intlHelper(intl, 'skjema.knapp.send')}
            </Knapp>
          </p>
          </SkjemaGruppe>
      </>
    );
  }


  private faktiskTimer = (soknad: SoknadV2) => {
    // Genererer liste med tilsteværelsesgrader i stringformat fra arbeidstakerforhold
    return soknad ? soknad.arbeidstid.faktiskeTimer() : [];
  };

 /* private updateTilsynsordning(jaNeiVetikke: JaNeiVetikke) {

    const tilsynsordning: ITilsynsordningV2 = {
      ...this.state.soknadInfo.søknad?.ytelse.tilsynsordning,
      iTilsynsordning: jaNeiVetikke,
    };
    if (
      jaNeiVetikke === JaNeiVetikke.JA &&
      tilsynsordning.opphold!.length === 0
    ) {
      tilsynsordning.opphold!.push(this.initialTilsyn);
    }
    this.updateSoknadState({ tilsynsordning }, true);
    this.updateSoknadInformasjon({ tilsynsordning });
  } */

  private backButton() {
    return (
      <p>
        <Knapp onClick={this.handleBackButtonClick}>
          {intlHelper(this.props.intl, 'skjema.knapp.tilbake')}
        </Knapp>
      </p>
    );
  }


  private getSoknadFromStore = () => {
    return new SoknadV2(this.props.punchFormState.soknad as ISoknadV2)
  };

 /*private getManglerFromStore = (nr?: 1 | 2) => {
    const { ident1, ident2 } = this.props.punchState;
    const ident = nr === 2 && ident2 ? ident2 : ident1;
    const personlig = this.props.punchFormState.mappe?.personer;
    return personlig?.[ident]?.mangler;
  };

  private getErrorMessage = (attribute: string, nr?: 1 | 2) => {
    const errorMsg = this.getManglerFromStore(nr)?.filter(
      (m: IInputError) => m.attributt === attribute
    )?.[0]?.melding;
    return !!errorMsg
      ? intlHelper(
          this.props.intl,
          `skjema.feil.${attribute}.${errorMsg}`
            .replace(/\[\d+]/g, '[]')
            .replace(
              /^skjema\.feil\..+\.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED$/,
              'skjema.feil.FRA_OG_MED_MAA_VAERE_FOER_TIL_OG_MED'
            )
            .replace(
              /^skjema\.feil\..+\.fraOgMed\.MAA_SETTES$/,
              'skjema.feil.fraOgMed.MAA_SETTES'
            )
            .replace(
              /^skjema\.feil\..+\.fraOgMed\.MAA_VAERE_FOER_TIL_OG_MED$/,
              'skjema.feil.fraOgMed.MAA_VAERE_FOER_TIL_OG_MED'
            )
            .replace(
              /^skjema\.feil\..+\.tilOgMed\.MAA_SETTES$/,
              'skjema.feil.tilOgMed.MAA_SETTES'
            )
        )
      : undefined;
  };

  */


  private updateSoknadState(
      soknad: Partial<ISoknadV2>,
      showStatus?: boolean
  ) {
    this.setState({
      soknad: { ...this.state.soknad, ...soknad },
      showStatus: !!showStatus,
    });
  }

private updateSoknadInformasjon = (
    soknad: Partial<ISoknadV2>
) => {
  this.setState({ showStatus: true });
  return this.props.updateSoknad(
      { ...this.getSoknadFromStore(), ...soknad }
  );
};

  private handleBackButtonClick = () => {
    const { getPunchPath } = this.props;
    this.props.resetSoknadAction();
    this.props.undoChoiceOfEksisterendeSoknadAction();
    setHash(
      getPunchPath(PunchStep.CHOOSE_SOKNAD)
    );
  };

  private handleStartButtonClick = () => {
    this.props.resetPunchFormAction();
    setHash('/');
  };

  private changeAndBlurUpdatesSoknad = (
    change: (event: any) => Partial<ISoknadV2>
  ) => ({
    onChange: (event: any) =>
      this.updateSoknadState(change(event), false),
    onBlur: (event: any) => this.updateSoknadInformasjon(change(event)),
  });

  private onChangeOnlyUpdateFelles = (
    change: (event: any) => Partial<ISoknadV2>
  ) => ({
    onChange: (event: any) => {
      this.updateSoknadState(change(event), true);
      this.updateSoknadInformasjon(change(event));
    },
  });


  /*private handleOppholdLandChange = (index: number, land: string) => {
        this.state.soknad.medlemskap!.opphold[index].land = land;
        this.forceUpdate();
    };

    private handleOppholdFomChange = (index: number, fom: string) => {
        this.state.soknad.medlemskap!.opphold[index].periode = {...this.state.soknad.medlemskap!.opphold[index].periode, fra_og_med: fom};
        this.forceUpdate();
    };

    private handleOppholdTomChange = (index: number, tom: string) => {
        this.state.soknad.medlemskap!.opphold[index].periode = {...this.state.soknad.medlemskap!.opphold[index].periode, til_og_med: tom};
        this.forceUpdate();
    };

    private addOpphold = () => {
        if (!this.state.soknad.medlemskap) {
            this.state.soknad = {...this.state.soknad, medlemskap: {opphold: []}};
        } else if (!this.state.soknad.medlemskap.opphold) {
            this.state.soknad.medlemskap = {...this.state.soknad.medlemskap, opphold: []};
        }
        this.state.soknad.medlemskap!.opphold.push({land: '', periode: {}});
        this.forceUpdate();
        this.setOpphold();
    };

    private removeOpphold = (index: number) => {
        this.state.soknad.medlemskap!.opphold.splice(index, 1);
        this.forceUpdate();
        this.setOpphold();
    };

    private setOpphold = () => this.updateSoknad({medlemskap: {...this.props.punchFormState.mappe.innhold.medlemskap, opphold: this.state.soknad.medlemskap!.opphold}});*/


  private updateSoknad = (soknad: Partial<ISoknadV2>) => {
    this.setState({ showStatus: true });
    return this.props.updateSoknad(
      { ...this.getSoknadFromStore(), ...soknad },
    );
  };

  private statusetikett() {
    if (!this.state.showStatus) {
      return null;
    }

    const { punchFormState } = this.props;
    const className = 'statusetikett';

    if (punchFormState.isAwaitingUpdateResponse) {
      return <EtikettFokus {...{ className }}>Lagrer …</EtikettFokus>;
    }
    if (!!punchFormState.updateSoknadError) {
      return (
        <EtikettAdvarsel {...{ className }}>Lagring feilet</EtikettAdvarsel>
      );
    }
    return <EtikettSuksess {...{ className }}>Lagret</EtikettSuksess>;
  }
}

const mapStateToProps = (state: RootStateType): IPunchFormStateProps => ({
  punchFormState: state.PLEIEPENGER_SYKT_BARN.punchFormState,
  punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
});

const mapDispatchToProps = (dispatch: any) => ({
  getSoknad: (id: string) => dispatch(getSoknad(id)),
  resetSoknadAction: () => dispatch(resetSoknadAction()),
  setIdentAction: (ident1: string, ident2: string | null) =>
    dispatch(setIdentAction(ident1, ident2)),
  setStepAction: (step: PunchStep) => dispatch(setStepAction(step)),
  undoChoiceOfEksisterendeSoknadAction: () => dispatch(undoChoiceOfEksisterendeSoknadAction()),
  updateSoknad: (
    soknad: Partial<ISoknadV2>
  ) => dispatch(updateSoknad(soknad)),
  submitSoknad: (soknadid: string, ident: string) =>
    dispatch(submitSoknad(soknadid, ident)),
  resetPunchFormAction: () => dispatch(resetPunchFormAction()),
});

export const PunchForm = injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(PunchFormComponent)
);
