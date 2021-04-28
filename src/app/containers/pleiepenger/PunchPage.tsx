import React, {ChangeEvent} from 'react';
import Page from 'app/components/page/Page';
import { Ident } from 'app/containers/pleiepenger/Ident';
import {
   IEksisterendeSoknaderComponentProps,
} from 'app/containers/pleiepenger/EksisterendeSoknader';
import 'app/containers/pleiepenger/punchPage.less';
import useQuery from 'app/hooks/useQuery';
import { PunchStep } from 'app/models/enums';
import { IJournalpost, IPath, IPleiepengerPunchState } from 'app/models/types';
import { IdentRules } from 'app/rules';
import { setIdentAction, setStepAction } from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import { getPath, setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import {
  AlertStripeAdvarsel,
  AlertStripeSuksess,
} from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
import { Checkbox, Input } from 'nav-frontend-skjema';
import 'nav-frontend-tabell-style';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import PdfVisning from '../../components/pdf/PdfVisning';
import {peiepengerPaths} from "./PeiepengerRoutes";
import VerticalSpacer from "../../components/VerticalSpacer";
import {RegistreringsValg} from "./RegistreringsValg";
import {PunchForm} from "./PunchForm";

export interface IPunchPageStateProps {
  punchState: IPleiepengerPunchState;
  journalpost?: IJournalpost;
}

export interface IPunchPageDispatchProps {
  setIdentAction: typeof setIdentAction;
  setStepAction: typeof setStepAction;
}

export interface IPunchPageQueryProps {
  dok?: string | null;
}

export interface IPunchPageComponentProps {
  match?: any;
  step: PunchStep;
  journalpostid?: string;
  paths: IPath[];
}

export interface IPunchPageComponentState {
  ident1: string;
  ident2: string;
  barnetHarIkkeFnr: boolean;
  }

type IPunchPageProps = WrappedComponentProps &
  RouteComponentProps &
  IPunchPageComponentProps &
  IPunchPageStateProps &
  IPunchPageDispatchProps &
  IPunchPageQueryProps;

export class PunchPageComponent extends React.Component<
  IPunchPageProps,
  IPunchPageComponentState
> {
  state: IPunchPageComponentState = {
    ident1: '',
    ident2: '',
    barnetHarIkkeFnr: false,
  };

  componentDidMount(): void {
    this.setState({
      ident1: this.props.punchState.ident1,
      ident2: this.props.punchState.ident2 || '',
      barnetHarIkkeFnr: false,
    });
  }

  componentDidUpdate(
    prevProps: Readonly<IPunchPageProps>,
    prevState: Readonly<IPunchPageComponentState>,
    snapshot?: any
  ): void {
    !this.state.ident1 &&
      this.props.punchState.ident1 &&
      this.setState({ ident1: this.props.punchState.ident1 });
    !this.state.ident2 &&
      this.props.punchState.ident2 &&
      this.setState({ ident2: this.props.punchState.ident2 });
  }

  render() {
    const { intl } = this.props;
    return (
      <Page title={intlHelper(intl, 'startPage.tittel')} className="punch">
        {this.content()}
      </Page>
    );
  }

  private content() {
    const { punchState, journalpostid, journalpost } = this.props;
    const dokumenter = journalpost?.dokumenter || [];

    return (
      <div className="panels-wrapper" id="panels-wrapper">
        <Panel className="pleiepenger_punch_form" border={true}>
          {punchState.step !== PunchStep.IDENT &&
            this.identInput2(this.state)}
          {this.underFnr()}
        </Panel>
        {journalpostid &&
        <PdfVisning dokumenter={dokumenter} journalpostId={journalpostid} />}
      </div>
    );
  }

  private getPath = (step: PunchStep, values?: any) =>
    getPath(
      peiepengerPaths,
      step,
      values,
      this.props.dok ? { dok: this.props.dok } : undefined
    );

  private handleClick = (e: ChangeEvent<HTMLInputElement>) => {
    this.setState({barnetHarIkkeFnr: e.target.checked})
    if (e.target.checked) {
      this.setState({ ident2: ""})
    }
  }

  private identInput2 = (state: IPunchPageComponentState) => () => {
    const { punchState, intl, journalpost } = this.props;
    const skalViseFeilmelding = (ident: string | null) =>
        ident && ident.length && !IdentRules.isIdentValid(ident);
    const identer = [punchState.ident1, punchState.ident2];
    const antallIdenter = identer.filter((id) => id && id.length).length;
    const journalpostident = journalpost?.norskIdent;
    return (
        <div>
          <Input
              label={intlHelper(
                  intl, 'ident.identifikasjon.felt'
              )}
              onChange={this.handleIdent1Change}
              onBlur={this.handleIdent1Blur}
              onKeyPress={this.handleIdentKeyPress(1)}
              value={state.ident1}
              className="bold-label ident-soker-1"
              maxLength={11}
              feil={
                skalViseFeilmelding(punchState.ident1)
                    ? intlHelper(intl, 'ident.feil.ugyldigident')
                    : undefined
              }
              bredde={"M"}
          />
          <Input
              label={intlHelper(intl, 'ident.identifikasjon.barn')}
              onChange={this.handleIdent2Change}
              onBlur={this.handleIdent2Blur}
              onKeyPress={this.handleIdentKeyPress(2)}
              value={state.ident2}
              className="bold-label ident-soker-2"
              disabled={this.state.barnetHarIkkeFnr}
              maxLength={11}
              feil={
                skalViseFeilmelding(punchState.ident2)
                    ? intlHelper(intl, 'ident.feil.ugyldigident')
                    : undefined
              }
              bredde={"M"}
          />
          <VerticalSpacer sixteenPx={true} />
          <Checkbox
              label={intlHelper(intl, 'ident.identifikasjon.barnHarIkkeFnr')}
              onChange={(e) => this.handleClick(e)}
          />
          {punchState.step === PunchStep.IDENT &&
          antallIdenter > 0 &&
          journalpostident &&
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
    );
  };

  private underFnr() {
    const commonProps = {
      journalpostid: this.props.journalpostid || '',
      getPunchPath: this.getPath,
    };
    switch (this.props.step) {
      case PunchStep.IDENT:
        return (
          <Ident
            identInput={this.identInput2(this.state)}
            identInputValues={this.state}
            findSoknader={this.findSoknader}
            getPunchPath={this.getPath}
            barnetHarIkkeFnr={this.state.barnetHarIkkeFnr}
          />
        );
      case PunchStep.CHOOSE_SOKNAD:
        return <RegistreringsValg {...commonProps} {...this.extractIdents()} harTidligereSoknader={false} />;
      case PunchStep.FILL_FORM:
        return <PunchForm {...commonProps} id={this.props.match.params.id} />;
      case PunchStep.COMPLETED:
        return (
          <AlertStripeSuksess className="fullfortmelding">
            Søknaden er sendt til behandling.
          </AlertStripeSuksess>
        );
    }
  }

  private extractIdents(): Pick<
    IEksisterendeSoknaderComponentProps,
    'ident1' | 'ident2'
  > {
    const ident = this.props.punchState.ident1;
    return /^\d+&\d+$/.test(ident)
      ? { ident1: /^\d+/.exec(ident)![0], ident2: /\d+$/.exec(ident)![0] }
      : { ident1: ident, ident2: null };
  }

  private redirectToNextStep(ident1: string, ident2: string | null) {
    if (IdentRules.areIdentsValid(ident1, ident2)) {
      setHash(this.getPath(PunchStep.CHOOSE_SOKNAD));
    }
  }

  private findSoknader = () => {
    this.redirectToNextStep(
      this.props.punchState.ident1,
      this.props.punchState.ident2
    );
  };

  private handleIdent1Change = (event: any) =>
    this.setState({ ident1: event.target.value.replace(/\D+/, '') });
  private handleIdent2Change = (event: any) =>
    this.setState({ ident2: event.target.value.replace(/\D+/, '') });

  private handleIdent1Blur = (event: any) =>
    this.props.setIdentAction(event.target.value, this.props.punchState.ident2);
  private handleIdent2Blur = (event: any) =>
    this.props.setIdentAction(this.props.punchState.ident1, event.target.value);

  private handleIdentKeyPress(sokernr: 1 | 2) {
    return (event: any) => {
      if (event.key === 'Enter') {
        let { ident1, ident2 } = this.props.punchState;
        if (sokernr === 1) {
          this.handleIdent1Blur(event);
          ident1 = event.target.value;
        } else {
          this.handleIdent2Blur(event);
          ident2 = event.target.value;
        }
        this.redirectToNextStep(ident1, ident2);
      }
    };
  }
}

const mapStateToProps = (state: RootStateType) => ({
  punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
  journalpost: state.felles.journalpost,
});

const mapDispatchToProps = (dispatch: any) => ({
  setIdentAction: (ident1: string, ident2: string | null) =>
    dispatch(setIdentAction(ident1, ident2)),
  setStepAction: (step: number) => dispatch(setStepAction(step)),
});

const PunchPageComponentWithQuery: React.FunctionComponent<IPunchPageProps> = (
  props: IPunchPageProps
) => {
  const dok = useQuery().get('dok');
  return <PunchPageComponent {...props} dok={dok} />;
};

export const PunchPage = withRouter(
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(PunchPageComponentWithQuery)
  )
);
