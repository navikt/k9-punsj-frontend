import React from 'react';

import { Heading, Box } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import Periodevisning from 'app/components/periodevisning/Periodevisning';
import { Periode } from 'app/models/types';
import { FormattedMessage } from 'react-intl';

interface Props {
    eksisterendePerioder: Periode[];
}

const EksisterendePerioder = ({ eksisterendePerioder }: Props) => {
    if (eksisterendePerioder.length) {
        return (
            <>
                <VerticalSpacer sixteenPx />
                <Box padding="4" borderWidth="1" borderRadius="small">
                    <Heading size="small">
                        <FormattedMessage id="omsorgspenger.utbetaling.punchForm.eksisterendePerioder.header" />
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
