import { IOMPUTSoknadKvittering } from 'app/omsorgspenger-utbetaling/types/OMPUTSoknadKvittering';
import { createContext } from 'react';

export interface IKvitteringContext {
    kvittering: IOMPUTSoknadKvittering | undefined;
    setKvittering: React.Dispatch<React.SetStateAction<IOMPUTSoknadKvittering | undefined>>;
}
// eslint-disable-next-line import/prefer-default-export
export const KvitteringContext = createContext<Partial<IKvitteringContext>>({
    kvittering: undefined,
    setKvittering: undefined,
});
