import React from 'react';
import { Heading, Panel } from '@navikt/ds-react';
import Periodevisning from 'app/components/periodevisning/Periodevisning';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { Periode } from 'app/models/types';

interface OwnProps {
    eksisterendePerioder: Periode[];
}

export default function EksisterendePerioder({ eksisterendePerioder }: OwnProps) {
    if (eksisterendePerioder.length) {
        return (
            <>
                <VerticalSpacer sixteenPx />
                <Panel border>
                    <Heading size="small">Eksisterende perioder</Heading>
                    {eksisterendePerioder.map((periode) => (
                        <Periodevisning periode={periode} />
                    ))}
                </Panel>
            </>
        );
    }
    return null;
}
