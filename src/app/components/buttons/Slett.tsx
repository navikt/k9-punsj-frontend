import { Delete } from '@navikt/ds-icons';
import { Button, ButtonProps, Button } from '@navikt/ds-react';
import React from 'react';
import './buttons.less';

interface OwnProps extends Partial<ButtonProps> {
    onClick: () => void;
}

export default function Slett(props: OwnProps) {
    const { onClick, children } = props;
    return (
        <Button size="small" variant="tertiary" className="slett" {...props} onClick={onClick}>
            <Delete />
            {children}
        </Button>
    );
}
