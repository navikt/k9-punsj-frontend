import { IPath } from '../../models/types';
import { PunchStep } from '../../models/enums';

// eslint-disable-next-line import/prefer-default-export
export const OMPMAPaths: IPath[] = [
    {
        step: PunchStep.CHOOSE_SOKNAD,
        path: '/omsorgspenger-midlertidig-alene/hentsoknader',
    },
    { step: PunchStep.FILL_FORM, path: '/omsorgspenger-midlertidig-alene/skjema/{id}' },
    { step: PunchStep.COMPLETED, path: '/omsorgspenger-midlertidig-alene/fullfort' },
];
