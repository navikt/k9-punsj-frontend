import { IPunchPageComponentState } from '../../pleiepenger/PunchPage';
import { JaNei, PunchStep } from 'app/models/enums';
import { IPleiepengerPunchState, ISignaturState } from 'app/models/types';
import { IdentRules } from 'app/rules';
import {
  setSignaturAction,
  setStepAction,
  usignert,
  usignertResetAction,
  getJournalpost,
  setIdentAction,
} from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import { setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import React, { useState } from 'react';
import { Col, Container, Row } from 'react-bootstrap';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import {
  Input,
  RadioPanelGruppe,
  Select,
  SkjemaGruppe,
} from 'nav-frontend-skjema';
import {
  AlertStripeAdvarsel,
  AlertStripeFeil,
  AlertStripeSuksess,
} from 'nav-frontend-alertstriper';

export interface IIdentStateProps {
  punchState: IPleiepengerPunchState;
  signaturState: ISignaturState;
}

export interface IIdentDispatchProps {
  setStepAction: typeof setStepAction;
  setSignaturAction: typeof setSignaturAction;
  usignert: typeof usignert;
  usignertResetAction: typeof usignertResetAction;
}

export interface IIdentComponentProps {
  identInput: (disabled: boolean) => React.ReactElement;
  identInputValues: Pick<IPunchPageComponentState, 'ident1' | 'ident2'>;
  findSoknader: () => void;
  getPunchPath: (step: PunchStep) => string;
}

type IIdentProps = IIdentStateProps &
  IIdentDispatchProps &
  IIdentComponentProps &
  WrappedComponentProps;

function redirectToNextStep(ident1: string, ident2: string | null) {
  if (IdentRules.areIdentsValid(ident1, ident2)) {
    const ident = ident1 && ident2 ? `${ident1}&${ident2}` : ident1;
    setHash('');
  }
}

export const IdentComponent: React.FunctionComponent<IIdentProps> = (
  props: IIdentProps
) => {
  const {
    intl,
    signaturState,
    punchState,
    identInputValues,
  } = props;
  const { signert } = signaturState;

  const [ident1, setIdent1] = useState('');
  const [ident2, setIdent2] = useState('');

  React.useEffect(() => {
    props.setStepAction(PunchStep.IDENT);
    setIdent1(punchState.ident1);
  }, []);

  // todo gjør om disse til dynamiske funskjoner. kanskje egne skjemakomponenter
  const handleIdent1Change = (event: any) =>
    setIdent1(event.target.value.replace(/\D+/, ''));
  const handleIdent2Change = (event: any) =>
    setIdent2(event.target.value.replace(/\D+/, ''));

  const handleIdent1Blur = (event: any) =>
    setIdentAction(event.target.value, punchState.ident2);
  const handleIdent2Blur = (event: any) =>
    setIdentAction(punchState.ident1, event.target.value);

  // tslint:disable-next-line:no-console
  const getPath = (lol: any, hei: any) => lol + hei;

  function handleIdentKeyPress(sokernr: 1 | 2) {
    return (event: any) => {
      if (event.key === 'Enter') {
        // tslint:disable-next-line:no-shadowed-variable
        let { ident1, ident2 } = punchState;
        if (sokernr === 1) {
          handleIdent1Blur(event);
          ident1 = event.target.value;
        } else {
          handleIdent2Blur(event);
          ident2 = event.target.value;
        }
        redirectToNextStep(ident1, ident2);
      }
    };
  }

  const identInput = (disabled: boolean) => {
    const skalViseToFelter =
      punchState.step === PunchStep.IDENT || punchState.ident2;
    const skalViseFeilmelding = (ident: string | null) =>
      ident && ident.length && !disabled && !IdentRules.isIdentValid(ident);
    const identer = [punchState.ident1, punchState.ident2];
    const antallIdenter = identer.filter((id) => id && id.length).length;
    const journalpostident = punchState.journalpost?.norskIdent || '';
    return (
      <div>
        <Input
          label={intlHelper(
            intl,
            skalViseToFelter
              ? 'ident.identifikasjon.felt1'
              : 'ident.identifikasjon.felt'
          )}
          onChange={(event) => handleIdent1Change(event)}
          onBlur={(event) => handleIdent1Blur(event)}
          onKeyPress={() => handleIdentKeyPress(1)}
          value={ident1}
          {...{ disabled }}
          className="bold-label ident-soker-1"
          maxLength={11}
          feil={
            skalViseFeilmelding(punchState.ident1)
              ? intlHelper(intl, 'ident.feil.ugyldigident')
              : undefined
          }
        />
        {skalViseToFelter && (
          <Input
            label={intlHelper(intl, 'ident.identifikasjon.felt2')}
            onChange={(event) => handleIdent2Change(event)}
            onBlur={(event) => handleIdent2Blur(event)}
            onKeyPress={() => handleIdentKeyPress(2)}
            value={ident2}
            {...{ disabled }}
            className="bold-label ident-soker-2"
            maxLength={11}
            feil={
              skalViseFeilmelding(punchState.ident2)
                ? intlHelper(intl, 'ident.feil.ugyldigident')
                : undefined
            }
          />
        )}
        {punchState.step === PunchStep.IDENT &&
          antallIdenter > 0 &&
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

  if (signaturState.usignertRequestError) {
    return (
      <div className="ident-page">
        <AlertStripeFeil>
          {intlHelper(intl, 'ident.usignert.feil.melding')}
        </AlertStripeFeil>
        <Knapp className="knapp-tilbake" onClick={props.usignertResetAction}>
          {intlHelper(intl, 'ident.usignert.feil.tilbake')}
        </Knapp>
      </div>
    );
  }

  if (signaturState.isAwaitingUsignertRequestResponse) {
    return (
      <Container style={{ height: '100%' }} className="ident-page">
        <Row
          className="justify-content-center align-items-center"
          style={{ height: '100%' }}
        >
          <Col xs={'auto'}>
            <NavFrontendSpinner />
          </Col>
        </Row>
      </Container>
    );
  }

  if (signaturState.usignertRequestSuccess) {
    return (
      <div className="ident-page">
        <AlertStripeSuksess>
          {intlHelper(intl, 'ident.usignert.sendt')}
        </AlertStripeSuksess>
      </div>
    );
  }

  return (
    <div className="ident-page">
      <h2>{intlHelper(intl, 'ident.signatur.overskrift')}</h2>
      <RadioPanelGruppe
        className="horizontalRadios"
        radios={Object.values(JaNei).map((jn) => ({
          label: intlHelper(intl, jn),
          value: jn,
        }))}
        name="signatur"
        legend={intlHelper(intl, 'ident.signatur.etikett')}
        checked={signert || undefined}
        onChange={(event) =>
          props.setSignaturAction(
            ((event.target as HTMLInputElement).value as JaNei) || null
          )
        }
      />
      {signert === JaNei.NEI && (
        <Knapp
          className="knapp-usignert"
          onClick={() => props.usignert(punchState.journalpost!.journalpostId)}
        >
          {intlHelper(intl, 'ident.knapp.usignert')}
        </Knapp>
      )}
      <h2>{intlHelper(intl, 'ident.identifikasjon.overskrift')}</h2>
      {identInput(signert !== JaNei.JA)}
      <div className="knapperad">
        <Knapp onClick={() => setHash('/')} className="knapp knapp1">
          {intlHelper(intl, 'ident.knapp.forrigesteg')}
        </Knapp>
        <Knapp
          onClick={props.findSoknader}
          className="knapp knapp2"
          disabled={
            signert !== JaNei.JA || !IdentRules.areIdentsValid(ident1, ident2)
          }
        >
          {intlHelper(intl, 'ident.knapp.nestesteg')}
        </Knapp>
      </div>
    </div>
  );
};

const mapStateToProps = (state: RootStateType) => ({
  punchState: state.punchState,
  signaturState: state.signaturState,
});

const mapDispatchToProps = (dispatch: any) => ({
  setIdentAction: (ident1: string, ident2: string | null) =>
    dispatch(setIdentAction(ident1, ident2)),
  setStepAction: (step: number) => dispatch(setStepAction(step)),
  setSignaturAction: (signert: JaNei | null) =>
    dispatch(setSignaturAction(signert)),
  usignert: (journalpostid: string) => dispatch(usignert(journalpostid)),
  usignertResetAction: () => dispatch(usignertResetAction()),
});

const OmsorgspengerOverføringIdent = injectIntl(
  connect(mapStateToProps, mapDispatchToProps)(IdentComponent)
);

export default OmsorgspengerOverføringIdent;
