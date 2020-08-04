import * as React                      from 'react';
import {Route, Switch}                 from 'react-router-dom';
import useRedirect                     from '../hooks/useRedirect';
import {ISakstypePunch, ISakstypeStep} from '../models/Sakstype';

interface ISakstypePunchProps {
    sakstypeConfig: ISakstypePunch;
    journalpostid: string;
}

const SakstypeStepRouter: React.FunctionComponent<ISakstypePunchProps> = ({ sakstypeConfig, journalpostid }) => {
    const { steps, punchPath, navn } = sakstypeConfig;

    const firstStep: ISakstypeStep = steps.reduce((a, b) => {
        if (a.stepOrder < b.stepOrder) {
            return a;
        }
        return b;
    });

    useRedirect(punchPath, `${punchPath}${firstStep.path}`);

    return (
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
    );
};

export default React.memo(SakstypeStepRouter);
