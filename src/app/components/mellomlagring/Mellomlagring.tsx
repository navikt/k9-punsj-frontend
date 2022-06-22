import { useFormikContext } from 'formik';
import debounce from 'lodash/debounce';
import { EtikettAdvarsel, EtikettFokus, EtikettSuksess } from 'nav-frontend-etiketter';
import React, { useCallback, useEffect } from 'react';
import './mellomlagring.less';

type OwnProps = {
    lagret: boolean;
    lagrer: boolean;
    error: boolean;
    mellomlagre?: () => void;
};

export default function Mellomlagring({ lagret, lagrer, error, mellomlagre }: OwnProps) {
    const className = 'statusetikett';

    if (mellomlagre) {
        const { values } = useFormikContext();
        const debounced = useCallback(debounce(mellomlagre, 3000), []);
        useEffect(() => {
            debounced();
        }, [values]);
    }

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
