import {Listepaneler} from 'app/containers/pleiepenger/Listepaneler';
import {Periodepaneler} from 'app/containers/pleiepenger/Periodepaneler';
import {pfArbeidstaker} from 'app/containers/pleiepenger/pfArbeidstaker';
import {JaNeiVetikke, PunchStep} from 'app/models/enums';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import {
  IFrilanser, IInputError,
  IPeriode,
  IPleiepengerPunchState,
  IPunchFormState,
  ISelvstendigNaerinsdrivende,
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
import {ISoknadInfo} from "../../models/types/SoknadSvar";
import {ArbeidstakerV2} from "../../models/types/ArbeidstakerV2";
import {ISoknadV2, SoknadV2} from "../../models/types/Soknadv2";
import {EtikettAdvarsel, EtikettFokus, EtikettSuksess} from "nav-frontend-etiketter";
import {RootStateType} from "../../state/RootState";
import {connect} from "react-redux";


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
  soknadInfo: ISoknadInfo;
  isFetched: boolean;
  showStatus: boolean;
  tgStrings1: string[][];
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
    soknadInfo: {
      søknadId: '',
      søkerId: '',
      erFraK9: false,
      søknad: {
        søknadId: '',
        mottattDato: '',
        journalposter: [],
        sendtInn: false,
        erFraK9: false,
        ytelse: {}
      }
    },
    isFetched: false,
    showStatus: false,
    tgStrings1: [], // Lagrer tilstedeværelsesgrad i stringformat her for å gjøre det enklere å redigere feltet
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
    const { soknadInfo } = this.props.punchFormState;
    if (!!soknadInfo && !this.state.isFetched) {
      const soknadFromStore = this.getSoknadFromStore();
      this.setState({
        soknadInfo: {
          ...this.state.soknadInfo,
          søknad : soknadFromStore} ,
       // tgStrings1: this.tgStrings(soknadFromStore),
        isFetched: true,
      });
      this.props.setIdentAction(soknadInfo.søkerId || '');
    }
  }

  componentWillUnmount(): void {
    this.props.resetPunchFormAction();
  }

  render() {
    const { intl, punchFormState, punchState } = this.props;
    const soknad = this.getSoknadFromStore()
    const isSoknadComplete = true

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

    const initialPeriode: IPeriode = { fraOgMed: '', tilOgMed: '' };

    const initialArbeidstaker = new ArbeidstakerV2({
      arbeidstidInfo: undefined,
      organisasjonsnummer: '',
      norskIdentitetsnummer: null,
    });

    const initialSelvstendigNaeringsdrivende: Periodeinfo<ISelvstendigNaerinsdrivende> = {
      periode: { fraOgMed: '', tilOgMed: '' },
    };
    const initialFrilanser: Periodeinfo<IFrilanser> = {
      periode: { fraOgMed: '', tilOgMed: '' },
    };

    const initialTilsyn = new Tilsyn({
      periode: initialPeriode,
      mandag: null,
      tirsdag: null,
      onsdag: null,
      torsdag: null,
      fredag: null,
    });

    const initialBeredskap = new Tilleggsinformasjon({
      periode: initialPeriode,
      tilleggsinformasjon: '',
    });

    const initialNattevaak = new Tilleggsinformasjon({
      periode: initialPeriode,
      tilleggsinformasjon: '',
    });

    const soknadsperioder = () => (
      <Periodepaneler
        intl={intl}
        periods={[]}
        panelid={(i) => `soknadsperiodepanel_${i}`}
        initialPeriodeinfo={{ periode: initialPeriode }}
        editSoknad={() => undefined}
        editSoknadState={() => undefined}
        /*editSoknad={(perioder) =>

          this.updateSoknadInformasjon(
            { perioder: perioder.map((p) => p.periode as IPeriode) })
        }
        editSoknadState={(perioder, showStatus) =>
          this.updateSoknadState(
            { perioder: perioder.map((p) => p.periode as IPeriode) },
            showStatus
          )
        }*/
        getErrorMessage={() => undefined}
        feilkodeprefiks={'perioder'}
        minstEn={true}
      />
    );

    const arbeidsperioder = () => {
      const updateTgStrings = () =>
        this.setState({
          tgStrings1: this.tgStrings(soknad),
        });
      const  arbeid = soknad.ytelse.arbeidAktivitet;
      const errorMessageFunction = (code: string) =>
          () => undefined;

      const arbeidstakerperioder = (harOverskrift?: boolean) => (
        <Listepaneler
          intl={intl}
          items={arbeid.arbeidstakerList}
          component={pfArbeidstaker(
            this.state.tgStrings1,
            (tgStrings1) => this.setState({ tgStrings1 }),
            () => this.tgStrings(soknad)
          )}
          panelid={(i) => `arbeidstakerpanel_${i}`}
          initialItem={initialArbeidstaker}
          editSoknad={(arbeidstaker) =>
            this.updateSoknad(
              { ytelse: {arbeidAktivitet: { ...arbeid, arbeidstakerList: arbeidstaker }} }
            )
          }
          editSoknadState={(arbeidstaker, showStatus) =>
            this.updateSoknadState(
              {ytelse: {
                arbeidAktivitet: {
                  ...arbeid,
                  arbeidstakerList: arbeidstaker,
                }},
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
        <Periodepaneler
          intl={intl}
          periods={[arbeid.selvstendigNaeringsdrivende]}
          panelid={(i) => `selvstendignaeringsdrivendepanel_${i}`}
          initialPeriodeinfo={initialSelvstendigNaeringsdrivende}
          editSoknad={(selvstendigNaeringsdrivende) =>
            this.updateSoknadInformasjon(
              {ytelse: {
                arbeidAktivitet: {
                  ...arbeid,
                  selvstendigNaeringsdrivende,
                }},
              }
            )
          }
          editSoknadState={(selvstendigNaeringsdrivende, showStatus) =>
            this.updateSoknadState(
              {
                ytelse: {
                arbeidAktivitet: {
                  ...arbeid,
                  selvstendigNaeringsdrivende,
                }},
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

   /*   const frilanserperioder = (harOverskrift?: boolean) => (
        <Periodepaneler
          intl={intl}
          periods={arbeid.frilanser.description(intl)}
          panelid={(i) => `frilanserpanel_${i}`}
          initialPeriodeinfo={initialFrilanser}
          editSoknad={(frilanser) =>
            this.updateSoknadIndividuelt(
              { arbeid: { ...arbeid, frilanser } },
              nr
            )
          }
          editSoknadState={(frilanser, showStatus) =>
            this.updateIndividuellSoknadState(
              {
                arbeid: {
                  ...arbeid,
                  frilanser,
                },
              },
              nr,
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
      ); */

      const antallArbeidsperioder = soknad.ytelse.getNumberOfWorkPeriods();

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
          arbeid.selvstendigNaeringsdrivende.length === antallArbeidsperioder
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
        } else if (arbeid.frilanser) {
          return (
            <>
              <h3>{intlHelper(intl, 'skjema.arbeid.frilanser.overskrift')}</h3>
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


  /*  const beredskapperioder = (
      <Periodepaneler
        intl={intl}
        periods={sok.beredskap}
        component={pfTilleggsinformasjon('beredskap')}
        panelid={(i) => `beredskapspanel_${i}`}
        initialPeriodeinfo={initialBeredskap}
        editSoknad={(beredskap) => this.updateSoknadFelles({ beredskap })}
        editSoknadState={(beredskap, showStatus) =>
          this.updateFellesSoknadState({ beredskap }, showStatus)
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
      <Periodepaneler
        intl={intl}
        periods={soknad.ytelse.nattevaak}
        component={pfTilleggsinformasjon('nattevaak')}
        panelid={(i) => `nattevaakspanel_${i}`}
        initialPeriodeinfo={initialNattevaak}
        editSoknadState={() => undefined}
        editSoknad={() => undefined}
    /*    editSoknad={(nattevaak) => this.updateSoknadInformasjon({ ytelse: { nattevaak } })}
        editSoknadState={(nattevaak, showStatus) =>
          this.updateSoknadState({ ytelse: {nattevaak} }, showStatus)
        }
        textLeggTil="skjema.nattevaak.leggtilperiode"
        textFjern="skjema.nattevaak.fjernperiode"
        className="nattevaaksperioder"
        panelClassName="nattevaakspanel"
        getErrorMessage={() => undefined}
        feilkodeprefiks={'nattevaak'}
      />
    );*/

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
              value={soknad.ytelse.barn.norskIdentitetsnummer}
              {...this.changeAndBlurUpdatesSoknad((event) => ({
                ytelse: {
                barn: {
                  ...soknad.ytelse.barn,
                  norskIdentitetsnummer: event.target.value,
                }},
              }))}
   //           feil={this.getErrorMessage('barn.norskIdent')}
              maxLength={11}
            />
            <Input
              id="barn-fdato"
              type="date"
              label={intlHelper(intl, 'skjema.barn.foedselsdato')}
              className="bold-label"
              value={soknad.ytelse.barn.foedselsdato}
              {...this.changeAndBlurUpdatesSoknad((event) => ({
                ytelse: {
                  barn: {
                    ...soknad.ytelse.barn,
                    norskIdentitetsnummer: event.target.value,
                  }},
              }))}
    //          feil={this.getErrorMessage('barn.foedselsdato')}
            />
          </SkjemaGruppe>
          <h2>{intlHelper(intl, 'skjema.periode')}</h2>
          {dobbel(soknadsperioder)}
          <h2>{intlHelper(intl, 'skjema.arbeid.overskrift')}</h2>
          {dobbel(arbeidsperioder)}
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
                checked={soknad.ytelse.tilsynsordning !== null ? JaNeiVetikke.JA : JaNeiVetikke.NEI}
              />
            </SkjemaGruppe>
            {/*soknad.ytelse.tilsynsordning !== null && (
              <Periodepaneler
                intl={intl}
                periods={soknad.ytelse.tilsynsordning[0].periode}
                component={pfTilsyn}
                panelid={(i) => `tilsynpanel_${i}`}
                initialPeriodeinfo={initialTilsyn}
                editSoknad={(opphold) =>
                  this.updateSoknadInformasjon({
                    tilsynsordning: { ...soknad.ytelse.tilsynsordning, opphold },
                  })
                }
                editSoknadState={(opphold, showStatus) =>
                  this.updateSoknadState(
                    { tilsynsordning: { ...soknad.ytelse.tilsynsordning, opphold } },
                    showStatus
                  )
                }
                textLeggTil="skjema.tilsyn.leggtilperiode"
                textFjern="skjema.tilsyn.fjernperiode"
                panelClassName="tilsynpanel"
      //          getErrorMessage={this.getErrorMessage}
                feilkodeprefiks={'tilsynsordning.opphold'}
                minstEn={
                  soknad.ytelse.tilsynsordning !== null
                }
              />
            )}

          {soknad.artilsynsordning.iTilsynsordning !== JaNeiVetikke.NEI && (
            <>
              <h2>{intlHelper(intl, 'skjema.beredskap.overskrift')}</h2>
              {beredskapperioder}
              <h2>{intlHelper(intl, 'skjema.nattevaak.overskrift')}</h2>
              {nattevaakperioder}
            </>
          )*/}
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
              disabled={!isSoknadComplete}
            >
              {intlHelper(intl, 'skjema.knapp.send')}
            </Knapp>
          </p>
          </SkjemaGruppe>
      </>
    );
  }

  private tgStrings = (soknad: SoknadV2 | null) => {
    // Genererer liste med tilsteværelsesgrader i stringformat fra arbeidstakerforhold
    return soknad ? soknad.ytelse.arbeidAktivitet.generateTgStrings(this.props.intl) : [];
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
    return new SoknadV2(this.props.punchFormState.soknadInfo?.søknad || {});
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
      soknadInfo: {
        ...this.state.soknadInfo,
        søknad: { ...this.state.soknadInfo.søknad, ...soknad },
      },
      showStatus: !!showStatus,
    });
  }


private updateSoknadInformasjon = (
    soknad: Partial<ISoknadV2>
) => {
  this.setState({ showStatus: true });
  return this.props.updateSoknad(
      this.props.id,
      this.props.punchState.ident1,
      this.props.journalpostid,
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
      this.props.id,
      this.props.punchState.ident1,
      this.props.journalpostid,
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
    soknadid: string,
    norskIdent: string,
    journalpostid: string,
    soknad: Partial<ISoknadV2>
  ) => dispatch(updateSoknad(soknadid, norskIdent, journalpostid, soknad)),
  submitSoknad: (soknadid: string, ident: string) =>
    dispatch(submitSoknad(soknadid, ident)),
  resetPunchFormAction: () => dispatch(resetPunchFormAction()),
});

export const PunchForm = injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(PunchFormComponent)
);
