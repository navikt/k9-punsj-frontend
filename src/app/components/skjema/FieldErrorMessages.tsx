import React from 'react';
import { ErrorMessage } from '@navikt/ds-react';

export interface FieldErrorMessageItem {
    id: string;
    message?: React.ReactNode;
    label?: React.ReactNode;
    ariaDescribedBy?: string;
}

interface Props {
    items: FieldErrorMessageItem[];
    className?: string;
    reserveSpace?: boolean;
}

const normalizeLabel = (label: React.ReactNode) => {
    if (typeof label !== 'string') {
        return label;
    }

    return label.replace(/:\s*$/, '');
};

const FieldErrorMessages = ({ items, className = '', reserveSpace = true }: Props) => {
    const visibleItems = items.filter((item) => !!item.message);
    const containerClassName = [reserveSpace ? 'min-h-[1.5rem]' : '', className].filter(Boolean).join(' ');

    return (
        <div className={containerClassName} aria-live="polite">
            {visibleItems.map((item) => (
                <ErrorMessage key={item.id} id={item.id} aria-describedby={item.ariaDescribedBy} showIcon>
                    {item.label ? (
                        <>
                            {normalizeLabel(item.label)}: {item.message}
                        </>
                    ) : (
                        item.message
                    )}
                </ErrorMessage>
            ))}
        </div>
    );
};

export default FieldErrorMessages;
