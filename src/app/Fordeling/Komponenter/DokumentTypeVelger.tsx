import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { RadioPanel } from 'nav-frontend-skjema';
import { Heading } from '@navikt/ds-react';

import { FordelingDokumenttype, FordelingOmsorgspengerSubMenyValg } from 'app/models/enums';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import './DokumentTypeVelger.less';

interface Props {
    valgtDokumentType: string;
    disableRadios?: boolean;

    handleDokumenttype: (type: FordelingDokumenttype) => void;
}

const DokumentTypeVelger: React.FC<Props> = ({ valgtDokumentType, disableRadios, handleDokumenttype }: Props) => {
    const intl = useIntl();

    const toggleFordelingDokumentType = (type: string): boolean => {
        switch (type) {
            case FordelingDokumenttype.OMSORGSPENGER_KS:
                return getEnvironmentVariable('OMP_KS_ENABLED') === 'true';

            case FordelingDokumenttype.OMSORGSPENGER_AO:
                return getEnvironmentVariable('OMP_AO_ENABLED') === 'true';

            case FordelingDokumenttype.OMSORGSPENGER_MA:
                return getEnvironmentVariable('OMP_MA_FEATURE_TOGGLE') === 'true';

            case FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE:
                return getEnvironmentVariable('PLS_ENABLED') === 'true';

            case FordelingDokumenttype.OMSORGSPENGER_UT:
                return getEnvironmentVariable('OMP_UT_FEATURE_TOGGLE') === 'true';

            case FordelingDokumenttype.OPPLAERINGSPENGER:
                return getEnvironmentVariable('OLP_ENABLED') === 'true';

            default:
                return true;
        }
    };

    const OmsorgspengerSubRadioPaneler = Object.values(FordelingOmsorgspengerSubMenyValg)
        .filter((type) => toggleFordelingDokumentType(type))
        .map((type) => ({
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

    const disableOMPVedFerdistiltJp = (value: FordelingOmsorgspengerSubMenyValg) => {
        if (disableRadios) {
            if (
                valgtDokumentType === FordelingDokumenttype.OMSORGSPENGER ||
                valgtDokumentType === FordelingOmsorgspengerSubMenyValg.OMSORGSPENGER_UT ||
                valgtDokumentType === FordelingOmsorgspengerSubMenyValg.KORRIGERING_IM
            ) {
                return (
                    value === FordelingOmsorgspengerSubMenyValg.OMSORGSPENGER_AO ||
                    value === FordelingOmsorgspengerSubMenyValg.OMSORGSPENGER_MA ||
                    value === FordelingOmsorgspengerSubMenyValg.OMSORGSPENGER_KS
                );
            }

            return valgtDokumentType !== value;
        }

        return disableRadios;
    };

    return (
        <div className="dokumentTypeVelgerContainer">
            <div className="mb-4">
                <Heading size="xsmall" level="3">
                    <FormattedMessage id="fordeling.detteGjelder" />
                </Heading>
            </div>

            <RadioPanel
                label={intlHelper(intl, FordelingDokumenttype.PLEIEPENGER)}
                value={FordelingDokumenttype.PLEIEPENGER}
                checked={valgtDokumentType === FordelingDokumenttype.PLEIEPENGER}
                onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                disabled={valgtDokumentType !== FordelingDokumenttype.PLEIEPENGER && disableRadios}
                data-test-id="dokumenttypeRadioPanelPleiepenger"
            />

            <RadioPanel
                label={intlHelper(intl, FordelingDokumenttype.OMSORGSPENGER)}
                value={FordelingDokumenttype.OMSORGSPENGER}
                checked={valgtDokumentType === FordelingDokumenttype.OMSORGSPENGER}
                onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                disabled={disableRadios}
                data-test-id="dokumenttypeRadioPanelOmsorgspenger"
            />

            {erDokumenttypeOmsorgspenger &&
                OmsorgspengerSubRadioPaneler.map((a) => (
                    <div key={a.value} className="dokumentTypeVelgerSubkategori">
                        <RadioPanel
                            label={a.label}
                            value={a.value}
                            checked={valgtDokumentType === a.value}
                            onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                            disabled={disableOMPVedFerdistiltJp(a.value)}
                        />
                    </div>
                ))}

            {toggleFordelingDokumentType(FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE) && (
                <RadioPanel
                    label={intlHelper(intl, FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE)}
                    value={FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE}
                    checked={valgtDokumentType === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE}
                    onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                    disabled={
                        valgtDokumentType !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE && disableRadios
                    }
                    data-test-id="dokumenttypeRadioPanelPleiepengerILivetsSluttfase"
                />
            )}

            {toggleFordelingDokumentType(FordelingDokumenttype.OPPLAERINGSPENGER) && (
                <RadioPanel
                    label={intlHelper(intl, FordelingDokumenttype.OPPLAERINGSPENGER)}
                    value={FordelingDokumenttype.OPPLAERINGSPENGER}
                    checked={valgtDokumentType === FordelingDokumenttype.OPPLAERINGSPENGER}
                    onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                    disabled={valgtDokumentType !== FordelingDokumenttype.OPPLAERINGSPENGER && disableRadios}
                    data-test-id="dokumenttypeRadioPanelOpplæringspenger"
                />
            )}

            <RadioPanel
                label={intlHelper(intl, FordelingDokumenttype.ANNET)}
                value={FordelingDokumenttype.ANNET}
                checked={valgtDokumentType === FordelingDokumenttype.ANNET}
                onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                disabled={valgtDokumentType !== FordelingDokumenttype.ANNET && disableRadios}
                data-test-id="dokumenttypeRadioPanelAnnet"
            />
        </div>
    );
};

export default DokumentTypeVelger;
