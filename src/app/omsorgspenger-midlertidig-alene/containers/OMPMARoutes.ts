import { PunchStep } from '../../models/enums';
import { IPath } from '../../models/types';

// eslint-disable-next-line import/prefer-default-export
export const OMPMAPaths: IPath[] = [
    {
        step: PunchStep.CHOOSE_SOKNAD,
        path: '/omsorgspenger-midlertidig-alene/hentsoknader',
    },
    { step: PunchStep.FILL_FORM, path: '/omsorgspenger-midlertidig-alene/skjema/{id}' },
    { step: PunchStep.COMPLETED, path: '/omsorgspenger-midlertidig-alene/fullfort' },
];
