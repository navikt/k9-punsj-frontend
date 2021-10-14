import React from 'react';
import { Route, Switch } from 'react-router-dom';
import { connect } from 'react-redux';
import { useIntl } from 'react-intl';
import useRedirect from '../hooks/useRedirect';
import { ISakstypePunch, ISakstypeStep } from '../models/Sakstype';
import Page from '../components/page/Page';
import intlHelper from '../utils/intlUtils';
import PdfVisning from '../components/pdf/PdfVisning';
import { RootStateType } from '../state/RootState';
import { IDokument } from '../models/types';
import SkjemaHeader from '../components/skjema/SkjemaHeader';
import { getPathForValues, setHash } from '../utils';
import FormPanel from '../components/FormPanel';

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
