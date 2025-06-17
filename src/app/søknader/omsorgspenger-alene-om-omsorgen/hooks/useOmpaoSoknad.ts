import { useQuery } from '@tanstack/react-query';
import { hentSoeknad } from '../api';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';

export const useOmpaoSoknad = (soknadId: string, soekerId: string) => {
    const {
        data: soeknadRespons,
        isPending,
        error,
    } = useQuery<IOMPAOSoknad, Error>({
        queryKey: ['ompao-soknad', soknadId, soekerId],
        queryFn: () => hentSoeknad(soekerId, soknadId),
    });

    return { soeknadRespons, isPending, error };
};
