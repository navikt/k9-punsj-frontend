import React from 'react';

import { RadioPanel } from 'nav-frontend-skjema';
import { FormattedMessage, useIntl } from 'react-intl';
import { FordelingDokumenttype } from '../../../../models/enums';
import { Heading } from '@navikt/ds-react';

import intlHelper from '../../../../utils/intlUtils';

import './DokumentTypeVelger.less';

interface Props {
    valgtDokumentType: string;
    visComponent: boolean;

    handleDokumenttype: (type: FordelingDokumenttype) => void;
}

const DokumentTypeVelgerForKopiering: React.FC<Props> = ({
    valgtDokumentType,
    visComponent,
    handleDokumenttype,
}: Props) => {
    const intl = useIntl();

    if (!visComponent) {
        return null;
    }

    return (
        <div className="dokumentTypeVelgerContainer mt-6">
            <Heading size="xsmall" level="3">
                <FormattedMessage id="fordeling.detteGjelder" />
            </Heading>

            <div className="mt-4">
                <RadioPanel
                    label={intlHelper(intl, FordelingDokumenttype.PLEIEPENGER)}
                    value={FordelingDokumenttype.PLEIEPENGER}
                    checked={valgtDokumentType === FordelingDokumenttype.PLEIEPENGER}
                    onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                />

                <RadioPanel
                    label={intlHelper(intl, FordelingDokumenttype.OMSORGSPENGER_KS)}
                    value={FordelingDokumenttype.OMSORGSPENGER_KS}
                    checked={valgtDokumentType === FordelingDokumenttype.OMSORGSPENGER_KS}
                    onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                />

                <RadioPanel
                    label={intlHelper(intl, FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE)}
                    value={FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE}
                    checked={valgtDokumentType === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE}
                    onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                />
            </div>
        </div>
    );
};

export default DokumentTypeVelgerForKopiering;