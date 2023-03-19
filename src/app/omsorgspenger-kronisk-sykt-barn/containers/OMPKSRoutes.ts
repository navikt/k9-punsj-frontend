import { PunchStep } from '../../models/enums';
import { IPath } from '../../models/types';

// eslint-disable-next-line import/prefer-default-export
export const ompKSPaths: IPath[] = [
    {
        step: PunchStep.CHOOSE_SOKNAD,
        path: '/omsorgspenger-kronisk-sykt-barn/hentsoknader',
    },
    { step: PunchStep.FILL_FORM, path: '/omsorgspenger-kronisk-sykt-barn/skjema/{id}' },
    { step: PunchStep.COMPLETED, path: '/omsorgspenger-kronisk-sykt-barn/fullfort' },
];
