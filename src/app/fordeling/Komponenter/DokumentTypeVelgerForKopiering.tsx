import React from 'react';

import { Heading } from '@navikt/ds-react';
import { FormattedMessage, useIntl } from 'react-intl';

import { LegacyRadioGroup } from 'app/components/legacy-form-compat/radio';
import { FordelingDokumenttype, FordelingOmsorgspengerSubMenyValg } from 'app/models/enums';
import { getEnvironmentVariable } from 'app/utils/envUtils';
import intlHelper from 'app/utils/intlUtils';

interface Props {
    valgtDokumentType: string;
    visComponent?: boolean;

    handleDokumenttype: (type: FordelingDokumenttype) => void;
}

const DokumentTypeVelgerForKopiering: React.FC<Props> = ({
    valgtDokumentType,
    visComponent = true,
    handleDokumenttype,
}: Props) => {
    // Kompatibilitetslag for migrering fra eldre skjemakomponenter.
    // Beholder eksisterende visuelt uttrykk og oppførsel i kopiflyten, men bruker Aksel under panseret.
    const intl = useIntl();

    const omsorgspengerSubRadioPaneler = Object.values(FordelingOmsorgspengerSubMenyValg).map((type) => ({
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

    const radios = [
        {
            label: intlHelper(intl, FordelingDokumenttype.PLEIEPENGER),
            value: FordelingDokumenttype.PLEIEPENGER,
        },
        {
            label: intlHelper(intl, FordelingDokumenttype.OMSORGSPENGER),
            value: FordelingDokumenttype.OMSORGSPENGER,
        },
        ...(erDokumenttypeOmsorgspenger
            ? omsorgspengerSubRadioPaneler.map((option) => ({
                  label: option.label,
                  value: option.value,
                  className: 'ml-16 pb-2',
              }))
            : []),
        {
            label: intlHelper(intl, FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE),
            value: FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE,
        },
        ...(getEnvironmentVariable('OLP_ENABLED') === 'true'
            ? [
                  {
                      label: intlHelper(intl, FordelingDokumenttype.OPPLAERINGSPENGER),
                      value: FordelingDokumenttype.OPPLAERINGSPENGER,
                  },
              ]
            : []),
    ];

    return (
        <div className="space-y-2 mt-6">
            <Heading size="xsmall" level="3">
                <FormattedMessage id="fordeling.detteGjelder" />
            </Heading>
            <LegacyRadioGroup
                name="fordeling-dokumenttype-velger-for-kopiering"
                legend=""
                hideLegend
                checked={valgtDokumentType}
                radios={radios}
                onChange={(_, value) => handleDokumenttype(value as FordelingDokumenttype)}
            />
        </div>
    );
};

export default DokumentTypeVelgerForKopiering;
