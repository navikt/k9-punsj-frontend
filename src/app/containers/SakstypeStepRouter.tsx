import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import useRedirect from '../hooks/useRedirect';
import { ISakstypePunch, ISakstypeStep } from '../models/Sakstype';
import { connect } from 'react-redux';
import {
  getJournalpost,
  setIdentAction,
  setStepAction,
} from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import Panel from 'nav-frontend-paneler';

import intlHelper from 'app/utils/intlUtils';
import { RouteComponentProps, withRouter } from 'react-router';
import Page from 'app/components/page/Page';
import { IPath, IPleiepengerPunchState } from 'app/models/types';
import PdfVisning from '../components/pdf/PdfVisning';

interface ISakstypePunchProps {
  sakstypeConfig: ISakstypePunch;
  journalpostid: string;
  intl: any;
}

export interface IPunchPageStateProps {
  punchState: IPleiepengerPunchState;
}

export interface IPunchPageDispatchProps {
  setIdentAction: typeof setIdentAction;
  setStepAction: typeof setStepAction;
  getJournalpost: typeof getJournalpost;
}

export interface IPunchPageQueryProps {
  dok?: string | null;
}

export interface IPunchPageComponentState {
  ident1: string;
  ident2: string;
}

type IPunchPageProps = WrappedComponentProps &
  RouteComponentProps &
  ISakstypePunchProps &
  IPunchPageStateProps &
  IPunchPageDispatchProps &
  IPunchPageQueryProps;

const SakstypeStepRouterImpl: React.FunctionComponent<IPunchPageProps> = ({
  sakstypeConfig,
  journalpostid,
  intl,
}) => {
  const { steps, punchPath, navn } = sakstypeConfig;

  // todo lage action
  const dokumenter = {};

  const firstStep: ISakstypeStep = steps.reduce((a, b) => {
    if (a.stepOrder < b.stepOrder) {
      return a;
    }
    return b;
  });

  useRedirect(punchPath, `${punchPath}${firstStep.path}`);

  return (
    <Page title={intlHelper(intl, 'startPage.tittel')} className="punch">
      <div className="panels-wrapper" id="panels-wrapper">
        <Panel className="punch_form" border={true}>
          <Switch>
            {steps.map(({ path, getComponent, stepName }) => (
              <Route
                exact={true}
                key={`${navn}-${stepName}`}
                path={`${punchPath}${path}`}
                children={getComponent(journalpostid)}
              />
            ))}
          </Switch>
        </Panel>

        <PdfVisning dokumenter={dokumenter} journalpostId={journalpostid} />
      </div>
    </Page>
  );
};

const mapStateToProps = (state: RootStateType) => ({
  punchState: state.punchState,
});

const mapDispatchToProps = (dispatch: any) => ({
  setIdentAction: (ident1: string, ident2: string | null) =>
    dispatch(setIdentAction(ident1, ident2)),
  setStepAction: (step: number) => dispatch(setStepAction(step)),
  getJournalpost: (id: string) => dispatch(getJournalpost(id)),
});

export const SakstypeStepRouter = withRouter(
  injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(SakstypeStepRouterImpl)
  )
);

export default SakstypeStepRouter;
