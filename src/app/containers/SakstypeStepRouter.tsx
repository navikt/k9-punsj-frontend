import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Route, Switch } from 'react-router-dom';

import FormPanel from '../components/FormPanel';
import Page from '../components/page/Page';
import PdfVisning from '../components/pdf/PdfVisning';
import SkjemaHeader from '../components/skjema/SkjemaHeader';
import useRedirect from '../hooks/useRedirect';
import { ISakstypePunch, ISakstypeStep } from '../models/Sakstype';
import { IDokument } from '../models/types';
import { RootStateType } from '../state/RootState';
import { getPathForValues, setHash } from '../utils';
import intlHelper from '../utils/intlUtils';

interface ISakstypePunchProps {
    sakstypeConfig: ISakstypePunch;
    journalpostid?: string;
}

export interface IDokumenterProps {
    dokumenter: IDokument[];
    sakstypeState?: any;
}

type IStepRouterProps = ISakstypePunchProps & IDokumenterProps;

export const SakstypeStepRouterImpl: React.FunctionComponent<IStepRouterProps> = ({
    sakstypeConfig,
    journalpostid,
    dokumenter,
    sakstypeState = {},
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
                <FormPanel>
                    <SkjemaHeader headerTextId={`${navn}.header`} />
                    <Switch>
                        {steps.map(({ path, getComponent, stepName, stepOrder }) => {
                            const gåTilNesteSteg = (stegParams?: any) => {
                                const nesteStegPath = steps.find((steg) => steg.stepOrder === stepOrder + 1)?.path;
                                if (nesteStegPath) {
                                    const nextPath = `${punchPath}${getPathForValues(nesteStegPath, stegParams)}`;
                                    setHash(nextPath);
                                }
                            };

                            const gåTilForrigeSteg = (stegParams?: any) => {
                                const forrigeStegPath = steps.find((steg) => steg.stepOrder === stepOrder - 1)?.path;
                                if (forrigeStegPath) {
                                    const nextPath = `${punchPath}${getPathForValues(forrigeStegPath, stegParams)}`;
                                    setHash(nextPath);
                                }
                            };

                            const initialValues = sakstypeState[stepName]?.skjema;

                            return (
                                <Route exact key={`${navn}-${stepName}`} path={`${punchPath}${getPathForValues(path)}`}>
                                    {getComponent({
                                        gåTilNesteSteg,
                                        gåTilForrigeSteg,
                                        initialValues,
                                    })}
                                </Route>
                            );
                        })}
                    </Switch>
                </FormPanel>
                {journalpostid && <PdfVisning journalpostDokumenter={[{ journalpostid, dokumenter }]} />}
            </div>
        </Page>
    );
};

const mapStateToProps = (state: RootStateType, ownProps: IStepRouterProps) => ({
    dokumenter: state.felles.journalpost?.dokumenter,
    sakstypeState: state[ownProps.sakstypeConfig.navn],
});

const SakstypeStepRouter: React.FunctionComponent<ISakstypePunchProps> =
    connect(mapStateToProps)(SakstypeStepRouterImpl);

export default SakstypeStepRouter;
