import { RadioPanel } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';

import { FordelingDokumenttype, FordelingOmsorgspengerSubMenyValg } from '../../../../models/enums';
import { getEnvironmentVariable } from '../../../../utils';
import intlHelper from '../../../../utils/intlUtils';
import './DokumentTypeVelger.less';

interface OwnProps {
    handleDokumenttype: (type: FordelingDokumenttype) => void;
    valgtDokumentType: string;
    disableRadios?: boolean;
    kopierValg?: boolean;
}

const DokumentTypeVelger: React.FunctionComponent<OwnProps> = ({
    handleDokumenttype,
    valgtDokumentType,
    disableRadios,
    kopierValg,
}) => {
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
            <legend>
                <b>{intlHelper(intl, 'fordeling.detteGjelder')}</b>
            </legend>
            <RadioPanel
                label={intlHelper(intl, FordelingDokumenttype.PLEIEPENGER)}
                value={FordelingDokumenttype.PLEIEPENGER}
                checked={valgtDokumentType === FordelingDokumenttype.PLEIEPENGER}
                onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                disabled={valgtDokumentType !== FordelingDokumenttype.PLEIEPENGER && disableRadios}
            />

            <RadioPanel
                label={intlHelper(intl, FordelingDokumenttype.OMSORGSPENGER)}
                value={FordelingDokumenttype.OMSORGSPENGER}
                checked={valgtDokumentType === FordelingDokumenttype.OMSORGSPENGER}
                onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                disabled={disableRadios}
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
                />
            )}
            {toggleFordelingDokumentType(FordelingDokumenttype.OPPLAERINGSPENGER) && (
                <RadioPanel
                    label={intlHelper(intl, FordelingDokumenttype.OPPLAERINGSPENGER)}
                    value={FordelingDokumenttype.OPPLAERINGSPENGER}
                    checked={valgtDokumentType === FordelingDokumenttype.OPPLAERINGSPENGER}
                    onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                    disabled={valgtDokumentType !== FordelingDokumenttype.OPPLAERINGSPENGER && disableRadios}
                />
            )}

            {!kopierValg && (
                <RadioPanel
                    label={intlHelper(intl, FordelingDokumenttype.ANNET)}
                    value={FordelingDokumenttype.ANNET}
                    checked={valgtDokumentType === FordelingDokumenttype.ANNET}
                    onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                    disabled={valgtDokumentType !== FordelingDokumenttype.ANNET && disableRadios}
                />
            )}
        </div>
    );
};

export default DokumentTypeVelger;
