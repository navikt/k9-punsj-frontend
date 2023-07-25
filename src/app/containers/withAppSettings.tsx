import React, { useEffect, useState } from 'react';

import setEnvVariables from 'app/env';

interface Props {
    [key: string]: any;
}

function withEnvVariables<T extends Props>(WrappedComponent: React.ComponentType<T>): React.ComponentType<T> {
    return function EnvVariablesWrapper(props: T) {
        const [envVariablesLoaded, setEnvVariablesLoaded] = useState<boolean>(false);

        useEffect(() => {
            setEnvVariables().then(() => setEnvVariablesLoaded(true));
        }, []);

        if (!envVariablesLoaded) {
            return <div>Loading...</div>; // or any other loading indicator you prefer
        }

        return <WrappedComponent {...props} />;
    };
}

export default withEnvVariables;
