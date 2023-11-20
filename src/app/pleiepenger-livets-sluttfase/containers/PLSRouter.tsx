import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { PunchPLSPage } from './PunchPLSPage';

const PLS_ROOT_PATH = '/pleiepenger-i-livets-sluttfase';

export const PLS_PATHS = {
    CHOOSE_SOKNAD: `${PLS_ROOT_PATH}/hentsoknader`,
    FILL_FORM: `${PLS_ROOT_PATH}/skjema/:id`,
    COMPLETED: `${PLS_ROOT_PATH}/fullfort`,
};

const PLSRouter: React.FunctionComponent<{ journalpostid: string }> = ({ journalpostid }) => (
    <Switch>
        <Route path={PLS_PATHS.CHOOSE_SOKNAD}>
            <PunchPLSPage {...{ journalpostid, step: 0 }} />
        </Route>
        <Route path={PLS_PATHS.FILL_FORM}>
            <PunchPLSPage {...{ journalpostid, step: 1 }} />
        </Route>
        <Route path={PLS_PATHS.COMPLETED}>
            <PunchPLSPage {...{ journalpostid, step: 2 }} />
        </Route>
    </Switch>
);

export default PLSRouter;
