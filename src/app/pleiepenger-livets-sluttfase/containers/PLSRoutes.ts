import { PunchStep } from '../../models/enums';
import { IPath } from '../../models/types';

// eslint-disable-next-line import/prefer-default-export
export const plsPaths: IPath[] = [
    {
        step: PunchStep.CHOOSE_SOKNAD,
        path: '/pleiepenger-i-livets-sluttfase/hentsoknader',
    },
    { step: PunchStep.FILL_FORM, path: '/pleiepenger-i-livets-sluttfase/skjema/{id}' },
    { step: PunchStep.COMPLETED, path: '/pleiepenger-i-livets-sluttfase/fullfort' },
];
