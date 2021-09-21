import { useEffect } from 'react';
import { useHistory } from 'react-router-dom';

function useRedirect(from: string, to: string): void {
    const { location, push } = useHistory();

    useEffect(() => {
        if (location.pathname === from) {
            push(to);
        }
    }, [location]);
}

export default useRedirect;
