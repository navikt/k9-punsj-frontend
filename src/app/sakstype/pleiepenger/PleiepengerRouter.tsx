import * as React                from 'react';
import {Route, Switch}           from 'react-router-dom';
import {PunchPage}               from '../../containers/punch-page/PunchPage';
import useRedirect               from '../../hooks/useRedirect';
import {PunchStep}               from '../../models/enums';
import {ISakstypeComponentProps} from '../../models/Sakstype';
import {IPath}                   from '../../models/types';
import {getPath}                 from '../../utils';
import {Pleiepenger}             from '../SakstypeImpls';

const PleiepengerRouter: React.FunctionComponent<ISakstypeComponentProps> = ({ journalpostid }) => {
    const pleiepengerRootPath = Pleiepenger.punchPath;

    const paths: IPath[] = [
        {step: PunchStep.IDENT,         path: `${pleiepengerRootPath}/ident`},
        {step: PunchStep.CHOOSE_SOKNAD, path: `${pleiepengerRootPath}/hentsoknader/{ident}`},
        {step: PunchStep.FILL_FORM,     path: `${pleiepengerRootPath}/skjema/{id}`},
        {step: PunchStep.COMPLETED,     path: `${pleiepengerRootPath}/fullfort`}
    ];
    const identPath = getPath(paths, PunchStep.IDENT);

    useRedirect(pleiepengerRootPath, identPath);

    return (
        <Switch>
            {Object.keys(PunchStep)
                .map(Number)
                .filter(step => !isNaN(step))
                .map(step => (
                        <Route
                            exact={true}
                            key={`hashroute_${step}`}
                            path={getPath(paths, step)}
                            children={<PunchPage {...{journalpostid, step, paths}}/>}
                        />
                    )
                )}
        </Switch>
    )
};

export default PleiepengerRouter;
