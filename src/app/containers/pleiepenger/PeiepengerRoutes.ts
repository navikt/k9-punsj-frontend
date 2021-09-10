import { IPath } from '../../models/types';
import { PunchStep } from '../../models/enums';

export const peiepengerPaths: IPath[] = [
    {
        step: PunchStep.CHOOSE_SOKNAD,
        path: '/pleiepenger/hentsoknader',
    },
    { step: PunchStep.FILL_FORM, path: '/pleiepenger/skjema/{id}' },
    { step: PunchStep.COMPLETED, path: '/pleiepenger/fullfort' },
];
