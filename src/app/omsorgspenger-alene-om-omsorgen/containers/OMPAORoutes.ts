import { PunchStep } from '../../models/enums';
import { IPath } from '../../models/types';

// eslint-disable-next-line import/prefer-default-export
export const OMPAOPaths: IPath[] = [
    {
        step: PunchStep.CHOOSE_SOKNAD,
        path: '/omsorgspenger-alene-om-omsorgen/hentsoknader',
    },
    { step: PunchStep.FILL_FORM, path: '/omsorgspenger-alene-om-omsorgen/skjema/{id}' },
    { step: PunchStep.COMPLETED, path: '/omsorgspenger-alene-om-omsorgen/fullfort' },
];
