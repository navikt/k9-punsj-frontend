import React, { useEffect } from 'react';

const AuthCallback = () => {
    useEffect(() => {
        if (window.opener) {
            window.opener.postMessage('authComplete');
            window.close();
        }
    }, []);

    return <div>Autentisering pågår...</div>;
};

export default AuthCallback;
