import { createContext } from 'react';

import { IOMPAOSoknadKvittering } from 'app/omsorgspenger-alene-om-omsorgen/types/OMPAOSoknadKvittering';

export interface IKvitteringContext {
    kvittering: IOMPAOSoknadKvittering | undefined;
    setKvittering: React.Dispatch<React.SetStateAction<IOMPAOSoknadKvittering | undefined>>;
}
// eslint-disable-next-line import/prefer-default-export
export const KvitteringContext = createContext<Partial<IKvitteringContext>>({
    kvittering: undefined,
    setKvittering: undefined,
});
