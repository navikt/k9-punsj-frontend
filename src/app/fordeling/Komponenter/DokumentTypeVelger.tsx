import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { Heading } from '@navikt/ds-react';

import { LegacyRadioGroup } from 'app/components/legacy-form-compat/radio';
import { FordelingDokumenttype, FordelingOmsorgspengerSubMenyValg } from 'app/models/enums';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

interface Props {
    valgtDokumentType: string;
    disableRadios?: boolean;

    handleDokumenttype: (type: FordelingDokumenttype) => void;
}

const DokumentTypeVelger: React.FC<Props> = ({ valgtDokumentType, disableRadios, handleDokumenttype }: Props) => {
    const intl = useIntl();

    // Deprecated: legacy utrullingsbryter.
    // Beholdes for bakoverkompatibilitet så lenge gamle feature toggles finnes.
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

    const radios = [
        {
            label: intlHelper(intl, FordelingDokumenttype.PLEIEPENGER),
            value: FordelingDokumenttype.PLEIEPENGER,
            disabled: valgtDokumentType !== FordelingDokumenttype.PLEIEPENGER && disableRadios,
            'data-test-id': 'dokumenttypeRadioPanelPleiepenger',
        },
        {
            label: intlHelper(intl, FordelingDokumenttype.OMSORGSPENGER),
            value: FordelingDokumenttype.OMSORGSPENGER,
            disabled: disableRadios,
            'data-test-id': 'dokumenttypeRadioPanelOmsorgspenger',
        },
        ...(erDokumenttypeOmsorgspenger
            ? OmsorgspengerSubRadioPaneler.map((option) => ({
                  label: option.label,
                  value: option.value,
                  disabled: disableOMPVedFerdistiltJp(option.value),
                  className: 'ml-16 pb-2',
              }))
            : []),
        ...(toggleFordelingDokumentType(FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE)
            ? [
                  {
                      label: intlHelper(intl, FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE),
                      value: FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
                      disabled:
                          valgtDokumentType !== FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE && disableRadios,
                      'data-test-id': 'dokumenttypeRadioPanelPleiepengerILivetsSluttfase',
                  },
              ]
            : []),
        ...(toggleFordelingDokumentType(FordelingDokumenttype.OPPLAERINGSPENGER)
            ? [
                  {
                      label: intlHelper(intl, FordelingDokumenttype.OPPLAERINGSPENGER),
                      value: FordelingDokumenttype.OPPLAERINGSPENGER,
                      disabled: valgtDokumentType !== FordelingDokumenttype.OPPLAERINGSPENGER && disableRadios,
                      'data-test-id': 'dokumenttypeRadioPanelOpplæringspenger',
                  },
              ]
            : []),
        {
            label: intlHelper(intl, FordelingDokumenttype.ANNET),
            value: FordelingDokumenttype.ANNET,
            disabled: valgtDokumentType !== FordelingDokumenttype.ANNET && disableRadios,
            'data-test-id': 'dokumenttypeRadioPanelAnnet',
        },
    ];

    return (
        <div>
            <div className="mb-4">
                <Heading size="xsmall" level="3">
                    <FormattedMessage id="fordeling.detteGjelder" />
                </Heading>
            </div>
            <LegacyRadioGroup
                name="fordeling-dokumenttype-velger"
                legend=""
                hideLegend
                checked={valgtDokumentType}
                radios={radios}
                onChange={(_, value) => handleDokumenttype(value as FordelingDokumenttype)}
            />
        </div>
    );
};

export default DokumentTypeVelger;
