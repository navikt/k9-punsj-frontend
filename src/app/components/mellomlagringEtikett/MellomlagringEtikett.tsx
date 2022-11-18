import { Tag, Button } from '@navikt/ds-react';
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
        return (
            <Tag variant="success" {...{ className }}>
                Lagret
            </Tag>
        );
    }
    if (lagrer) {
        return (
            <Tag variant="warning" {...{ className }}>
                Lagrer …
            </Tag>
        );
    }
    if (error) {
        return (
            <Tag variant="error" {...{ className }}>
                Lagring feilet
            </Tag>
        );
    }
    return null;
}
