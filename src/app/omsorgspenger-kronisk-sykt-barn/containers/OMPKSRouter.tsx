import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import useRedirect from '../../hooks/useRedirect';
import { PunchStep } from '../../models/enums';
import { ISakstypeComponentProps } from '../../models/Sakstype';
import { IPath } from '../../models/types';
import { getPath } from '../../utils';
import {PunchOMPKSPage} from './PunchOMPKSPage';

const OMPKSRouter: React.FunctionComponent<ISakstypeComponentProps> = ({ journalpostid, punchPath }) => {
    const ompKSRootPath = punchPath;

    const paths: IPath[] = [
        {
            step: PunchStep.CHOOSE_SOKNAD,
            path: `${ompKSRootPath}/hentsoknader`,
        },
        { step: PunchStep.FILL_FORM, path: `${ompKSRootPath}/skjema/{id}` },
        { step: PunchStep.COMPLETED, path: `${ompKSRootPath}/fullfort` },
    ];
    const chooseSoknadPath = getPath(paths, PunchStep.CHOOSE_SOKNAD);

    useRedirect(ompKSRootPath, chooseSoknadPath);

    return (
        <Switch>
            {Object.keys(PunchStep)
                .map(Number)
                .filter((step) => !Number.isNaN(step))
                .map((step) => (
                    <Route exact key={`hashroute_${step}`} path={getPath(paths, step)}>
                        <PunchOMPKSPage {...{ journalpostid, step, paths }} />
                    </Route>
                ))}
        </Switch>
    );
};

export default OMPKSRouter;
