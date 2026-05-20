import React from 'react';

import { Box, Heading } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import Periodevisning from 'app/components/periodevisning/Periodevisning';
import { Periode } from 'app/models/types';
import { FormattedMessage } from 'react-intl';

interface Props {
    eksisterendePerioder: Periode[];
}

const EksisterendePerioder: React.FC<Props> = ({ eksisterendePerioder }: Props) => {
    if (eksisterendePerioder.length) {
        return (
            <>
                <VerticalSpacer sixteenPx />
                <Box padding="space-16" borderWidth="1" borderRadius="2">
                    <Heading size="small">
                        <FormattedMessage id={'omsorgspenger.utbetaling.eksisterendePerioder.tittel'} />
                    </Heading>

                    {eksisterendePerioder.map((periode) => (
                        <Periodevisning key={periode.fom} periode={periode} />
                    ))}
                </Box>
            </>
        );
    }
    return null;
};

export default EksisterendePerioder;
