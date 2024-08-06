import { createContext } from 'react';

import { IOLPSoknadKvittering } from '../../OLPSoknadKvittering';

export interface IKvitteringContext {
    kvittering: IOLPSoknadKvittering | undefined;
    setKvittering: React.Dispatch<React.SetStateAction<IOLPSoknadKvittering | undefined>>;
}
 import/prefer-default-export
export const KvitteringContext = createContext<Partial<IKvitteringContext>>({
    kvittering: undefined,
    setKvittering: undefined,
});
