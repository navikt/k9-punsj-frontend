import React, { useCallback } from 'react';
import { Route, Switch } from 'react-router-dom';
import useRedirect from '../hooks/useRedirect';
import { ISakstypePunch, ISakstypeStep } from '../models/Sakstype';
import Page from '../components/page/Page';
import intlHelper from '../utils/intlUtils';
import Panel from 'nav-frontend-paneler';
import PdfVisning from '../components/pdf/PdfVisning';
import { RootStateType } from '../state/RootState';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import { IDokument } from '../models/types';
import SkjemaHeader from '../components/skjema/SkjemaHeader';
import { getPathForValues, setHash } from '../utils';
import './sakstypeStepRouter.less';

interface ISakstypePunchProps {
  sakstypeConfig: ISakstypePunch;
  journalpostid: string;
}

export interface IDokumenterProps {
  dokumenter: IDokument[];
}

type IStepRouterProps = ISakstypePunchProps & IDokumenterProps;

export const SakstypeStepRouterImpl: React.FunctionComponent<IStepRouterProps> = ({
  sakstypeConfig,
  journalpostid,
  dokumenter,
}) => {
  const { steps, punchPath, navn } = sakstypeConfig;
  const intl = useIntl();

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
        <Panel className="sakstype_punch_form" border={true}>
          <SkjemaHeader headerTextId={`${navn}.header`} />
          <Switch>
            {steps.map(({ path, getComponent, stepName, stepOrder }) => {
              const gåTilNesteSteg = (stegParams?: any) => {
                const nesteStegPath = steps.find(
                  (steg) => steg.stepOrder === stepOrder + 1
                )?.path;
                if (nesteStegPath) {
                  const nextPath = `${punchPath}${getPathForValues(
                    nesteStegPath,
                    stegParams
                  )}`;
                  setHash(nextPath);
                }
              };

              return (
                <Route
                  exact={true}
                  key={`${navn}-${stepName}`}
                  path={`${punchPath}${getPathForValues(path)}`}
                  children={getComponent(gåTilNesteSteg)}
                />
              );
            })}
          </Switch>
        </Panel>

        <PdfVisning dokumenter={dokumenter} journalpostId={journalpostid} />
      </div>
    </Page>
  );
};

const mapStateToProps = (state: RootStateType) => ({
  dokumenter: state.punchState?.journalpost?.dokumenter,
});

export default connect(mapStateToProps)(SakstypeStepRouterImpl);
