import { Delete } from '@navikt/ds-icons';
import { Button, ButtonProps } from '@navikt/ds-react';
import React from 'react';
import './buttons.less';

interface OwnProps extends Partial<ButtonProps> {
    onClick: () => void;
}

export default function Slett(props: OwnProps) {
    const { onClick, children } = props;
    return (
        <Button icon={<Delete />} size="small" variant="tertiary" className="slett" {...props} onClick={onClick}>
            {children}
        </Button>
    );
}
