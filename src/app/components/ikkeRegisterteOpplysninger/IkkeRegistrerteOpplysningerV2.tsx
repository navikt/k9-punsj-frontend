import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Box, HelpText } from '@navikt/ds-react';

import VerticalSpacer from '../VerticalSpacer';
import { getTypedFormComponents } from '../form/getTypedFormComponents';
import { IOMPAOSoknad } from 'app/søknader/omsorgspenger-alene-om-omsorgen/types/OMPAOSoknad';

const { TypedFormCheckbox } = getTypedFormComponents<IOMPAOSoknad>();

const IkkeRegistrerteOpplysningerV2 = () => (
    <>
        <p className="ikkeregistrert">
            <FormattedMessage id="skjema.ikkeregistrert" />
        </p>
        <div className="flex-container items-center">
            <Box padding="2" background="surface-info-subtle" borderRadius="medium" className="flex-1">
                <div className="px-2">
                    <TypedFormCheckbox
                        name="harMedisinskeOpplysninger"
                        label={<FormattedMessage id="skjema.medisinskeopplysninger" />}
                    />
                </div>
            </Box>
            <HelpText className="hjelpetext" placement="top-end">
                <FormattedMessage id="skjema.medisinskeopplysninger.omsorgspenger-ks.hjelpetekst" />
            </HelpText>
        </div>
        <VerticalSpacer eightPx />
        <div className="flex-container items-center">
            <Box padding="2" background="surface-info-subtle" borderRadius="medium" className="flex-1">
                <div className="px-2">
                    <TypedFormCheckbox
                        name="harInfoSomIkkeKanPunsjes"
                        label={<FormattedMessage id="skjema.opplysningerikkepunsjet" />}
                    />
                </div>
            </Box>
            <HelpText className="hjelpetext" placement="top-end">
                <FormattedMessage id="skjema.opplysningerikkepunsjet.hjelpetekst" />
            </HelpText>
        </div>
    </>
);

export default IkkeRegistrerteOpplysningerV2;
