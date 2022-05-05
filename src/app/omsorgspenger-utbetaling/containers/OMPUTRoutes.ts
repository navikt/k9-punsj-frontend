import { IPath } from '../../models/types';
import { PunchStep } from '../../models/enums';

// eslint-disable-next-line import/prefer-default-export
export const OMPUTPaths: IPath[] = [
    {
        step: PunchStep.CHOOSE_SOKNAD,
        path: '/omsorgspenger-utbetaling/hentsoknader',
    },
    { step: PunchStep.FILL_FORM, path: '/omsorgspenger-utbetaling/skjema/{id}' },
    { step: PunchStep.COMPLETED, path: '/omsorgspenger-utbetaling/fullfort' },
];
