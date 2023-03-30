import { createContext } from 'react';

import { IOMPUTSoknadKvittering } from 'app/omsorgspenger-utbetaling/types/OMPUTSoknadKvittering';

export interface IKvitteringContext {
    kvittering: IOMPUTSoknadKvittering | undefined;
    setKvittering: React.Dispatch<React.SetStateAction<IOMPUTSoknadKvittering | undefined>>;
}
// eslint-disable-next-line import/prefer-default-export
export const KvitteringContext = createContext<Partial<IKvitteringContext>>({
    kvittering: undefined,
    setKvittering: undefined,
});
