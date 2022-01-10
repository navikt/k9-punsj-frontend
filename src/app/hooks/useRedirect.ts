import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

function useRedirect(from: string, to: string): void {
    const navigate = useNavigate();
    const location = useLocation();

    useEffect(() => {
        if (location.pathname === from) {
            navigate(to);
        }
    }, [location]);
}

export default useRedirect;
