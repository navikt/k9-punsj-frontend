import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import useRedirect from '../../hooks/useRedirect';
import { PunchStep } from '../../models/enums';
import { ISakstypeComponentProps } from '../../models/Sakstype';
import { IPath } from '../../models/types';
import { getPath } from '../../utils';
import { PunchPLSPage } from './PunchPLSPage';

const PLSRouter: React.FunctionComponent<ISakstypeComponentProps> = ({ journalpostid, punchPath }) => {
    const plsRootPath = punchPath;

    const paths: IPath[] = [
        {
            step: PunchStep.CHOOSE_SOKNAD,
            path: `${plsRootPath}/hentsoknader`,
        },
        { step: PunchStep.FILL_FORM, path: `${plsRootPath}/skjema/{id}` },
        { step: PunchStep.COMPLETED, path: `${plsRootPath}/fullfort` },
    ];
    const chooseSoknadPath = getPath(paths, PunchStep.CHOOSE_SOKNAD);

    useRedirect(plsRootPath, chooseSoknadPath);

    return (
        <Switch>
            {Object.keys(PunchStep)
                .map(Number)
                .filter((step) => !Number.isNaN(step))
                .map((step) => (
                    <Route exact key={`hashroute_${step}`} path={getPath(paths, step)}>
                        <PunchPLSPage {...{ journalpostid, step, paths }} />
                    </Route>
                ))}
        </Switch>
    );
};

export default PLSRouter;
