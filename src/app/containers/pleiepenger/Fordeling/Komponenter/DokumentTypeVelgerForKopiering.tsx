import React from 'react';

import { RadioPanel } from 'nav-frontend-skjema';
import { FormattedMessage, useIntl } from 'react-intl';
import { FordelingDokumenttype, FordelingOmsorgspengerSubMenyValg } from '../../../../models/enums';
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

    const OmsorgspengerSubRadioPaneler = Object.values(FordelingOmsorgspengerSubMenyValg).map((type) => ({
        label: intlHelper(intl, type),
        value: type,
    }));

    const erDokumenttypeOmsorgspenger =
        valgtDokumentType === FordelingDokumenttype.OMSORGSPENGER ||
        valgtDokumentType === FordelingOmsorgspengerSubMenyValg.OMSORGSPENGER_KS ||
        valgtDokumentType === FordelingOmsorgspengerSubMenyValg.OMSORGSPENGER_AO ||
        valgtDokumentType === FordelingOmsorgspengerSubMenyValg.OMSORGSPENGER_MA ||
        valgtDokumentType === FordelingOmsorgspengerSubMenyValg.OMSORGSPENGER_UT ||
        valgtDokumentType === FordelingOmsorgspengerSubMenyValg.KORRIGERING_IM;

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
                    label={intlHelper(intl, FordelingDokumenttype.OMSORGSPENGER)}
                    value={FordelingDokumenttype.OMSORGSPENGER}
                    checked={valgtDokumentType === FordelingDokumenttype.OMSORGSPENGER}
                    onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                />

                {erDokumenttypeOmsorgspenger &&
                    OmsorgspengerSubRadioPaneler.map((a) => (
                        <div key={a.value} className="dokumentTypeVelgerSubkategori">
                            <RadioPanel
                                label={a.label}
                                value={a.value}
                                checked={valgtDokumentType === a.value}
                                onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                            />
                        </div>
                    ))}

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
