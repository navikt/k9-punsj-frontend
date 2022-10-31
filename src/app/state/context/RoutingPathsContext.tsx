import { createContext } from 'react';

const RoutingPathsContext = createContext({
    soeknader: '',
    skjema: '',
    kvittering: '',
});

export default RoutingPathsContext;
