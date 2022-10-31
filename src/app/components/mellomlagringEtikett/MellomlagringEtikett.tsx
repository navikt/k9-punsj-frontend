import { EtikettAdvarsel, EtikettFokus, EtikettSuksess } from 'nav-frontend-etiketter';
import React from 'react';
import './mellomlagringEtikett.less';

type OwnProps = {
    lagret: boolean;
    lagrer: boolean;
    error: boolean;
};

export default function MellomlagringEtikett({ lagret, lagrer, error }: OwnProps) {
    const className = 'statusetikett';

    if (lagret) {
        return <EtikettSuksess {...{ className }}>Lagret</EtikettSuksess>;
    }
    if (lagrer) {
        return <EtikettFokus {...{ className }}>Lagrer …</EtikettFokus>;
    }
    if (error) {
        return <EtikettAdvarsel {...{ className }}>Lagring feilet</EtikettAdvarsel>;
    }
    return null;
}
