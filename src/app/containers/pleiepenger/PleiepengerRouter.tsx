import * as React from 'react';
import { Route, Switch } from 'react-router-dom';
import useRedirect from '../../hooks/useRedirect';
import { PunchStep } from '../../models/enums';
import { ISakstypeComponentProps } from '../../models/Sakstype';
import { IPath } from '../../models/types';
import { getPath } from '../../utils';
import { PunchPage } from './PunchPage';

const PleiepengerRouter: React.FunctionComponent<ISakstypeComponentProps> = ({
  journalpostid,
  punchPath,
}) => {
  const pleiepengerRootPath = punchPath;

  const paths: IPath[] = [
    {
      step: PunchStep.CHOOSE_SOKNAD,
      path: `${pleiepengerRootPath}/hentsoknader`,
    },
    { step: PunchStep.FILL_FORM, path: `${pleiepengerRootPath}/skjema/{id}` },
    { step: PunchStep.COMPLETED, path: `${pleiepengerRootPath}/fullfort` },
  ];
  const chooseSoknadPath = getPath(paths, PunchStep.CHOOSE_SOKNAD);

  useRedirect(pleiepengerRootPath, chooseSoknadPath);

  return (
    <Switch>
      {Object.keys(PunchStep)
        .map(Number)
        .filter((step) => !isNaN(step))
        .map((step) => (
          <Route
            exact={true}
            key={`hashroute_${step}`}
            path={getPath(paths, step)}
            children={<PunchPage {...{ journalpostid, step, paths }} />}
          />
        ))}
    </Switch>
  );
};

export default PleiepengerRouter;
