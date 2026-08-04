import React from 'react';
import { ErrorMessage } from '@navikt/ds-react';

interface IUhaandterteFeilmeldingerProps {
    getFeilmeldinger: () => (string | undefined)[];
}

export default function UhaanderteFeilmeldinger({
    getFeilmeldinger,
}: IUhaandterteFeilmeldingerProps): JSX.Element | null {
    const feilmeldinger = getFeilmeldinger();

    if (!feilmeldinger || feilmeldinger.length === 0) {
        return null;
    }

    return (
        <>
            {feilmeldinger.map((feilmelding, index) => {
                if (!feilmelding) {
                    return null;
                }
                return (
                    <ErrorMessage key={feilmelding + index} showIcon>
                        {feilmelding}
                    </ErrorMessage>
                );
            })}
        </>
    );
}
