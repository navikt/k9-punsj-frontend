import React from 'react';

import Feilmelding from '../Feilmelding';

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
                react / no - array - index - key;
                return <Feilmelding key={feilmelding + index} feil={feilmelding} />;
            })}
        </>
    );
}
