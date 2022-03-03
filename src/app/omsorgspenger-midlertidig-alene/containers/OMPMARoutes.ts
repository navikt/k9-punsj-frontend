import { IPath } from '../../models/types';
import { PunchStep } from '../../models/enums';

// eslint-disable-next-line import/prefer-default-export
export const OMPMAPaths: IPath[] = [
    {
        step: PunchStep.CHOOSE_SOKNAD,
        path: '/omsorgspenger-kronisk-sykt-barn/hentsoknader',
    },
    { step: PunchStep.FILL_FORM, path: '/omsorgspenger-kronisk-sykt-barn/skjema/{id}' },
    { step: PunchStep.COMPLETED, path: '/omsorgspenger-kronisk-sykt-barn/fullfort' },
];
