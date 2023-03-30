import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import useRedirect from '../../hooks/useRedirect';
import { ISakstypeComponentProps } from '../../models/Sakstype';
import { PunchStep } from '../../models/enums';
import { IPath } from '../../models/types';
import { getPath } from '../../utils';
import { PunchOMPMAPage } from './PunchOMPMAPage';

const OMPMARouter: React.FunctionComponent<ISakstypeComponentProps> = ({ journalpostid, punchPath }) => {
    const OMPMARootPath = punchPath;

    const paths: IPath[] = [
        {
            step: PunchStep.CHOOSE_SOKNAD,
            path: `${OMPMARootPath}/hentsoknader`,
        },
        { step: PunchStep.FILL_FORM, path: `${OMPMARootPath}/skjema/{id}` },
        { step: PunchStep.COMPLETED, path: `${OMPMARootPath}/fullfort` },
    ];
    const chooseSoknadPath = getPath(paths, PunchStep.CHOOSE_SOKNAD);

    useRedirect(OMPMARootPath, chooseSoknadPath);

    return (
        <Switch>
            {Object.keys(PunchStep)
                .map(Number)
                .filter((step) => !Number.isNaN(step))
                .map((step) => (
                    <Route exact key={`hashroute_${step}`} path={getPath(paths, step)}>
                        <PunchOMPMAPage {...{ journalpostid, step, paths }} />
                    </Route>
                ))}
        </Switch>
    );
};

export default OMPMARouter;
