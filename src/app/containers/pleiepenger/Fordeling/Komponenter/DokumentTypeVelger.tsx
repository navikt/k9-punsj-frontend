import React from 'react';
import { useIntl } from 'react-intl';
import { RadioPanel } from 'nav-frontend-skjema';
import { FordelingDokumenttype, FordelingOmsorgspengerSubMenyValg } from '../../../../models/enums';
import intlHelper from '../../../../utils/intlUtils';
import { getEnvironmentVariable } from '../../../../utils';
import './DokumentTypeVelger.less';

interface OwnProps {
    handleDokumenttype: (type: FordelingDokumenttype) => void;
    valgtDokumentType: string;
}

const DokumentTypeVelger: React.FunctionComponent<OwnProps> = ({ handleDokumenttype, valgtDokumentType }) => {
    const intl = useIntl();
    const toggleFordelingDokumentType = (type: string): boolean => {
        switch (type) {
            case FordelingDokumenttype.OMSORGSPENGER_KS:
                return getEnvironmentVariable('OMP_KS_ENABLED') === 'true';

            case FordelingDokumenttype.OMSORGSPENGER_MA:
                return getEnvironmentVariable('OMP_MA_FEATURE_TOGGLE') === 'true';

            case FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE:
                return getEnvironmentVariable('PLS_ENABLED') === 'true';

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
        valgtDokumentType === FordelingOmsorgspengerSubMenyValg.OMSORGSPENGER_MA ||
        valgtDokumentType === FordelingOmsorgspengerSubMenyValg.KORRIGERING_IM;

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

            {toggleFordelingDokumentType(FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE) && (
                <RadioPanel
                    label={intlHelper(intl, FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE)}
                    value={FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE}
                    checked={valgtDokumentType === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE}
                    onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
                />
            )}

            <RadioPanel
                label={intlHelper(intl, FordelingDokumenttype.ANNET)}
                value={FordelingDokumenttype.ANNET}
                checked={valgtDokumentType === FordelingDokumenttype.ANNET}
                onChange={(e) => handleDokumenttype(e.target.value as FordelingDokumenttype)}
            />
        </div>
    );
};

export default DokumentTypeVelger;
