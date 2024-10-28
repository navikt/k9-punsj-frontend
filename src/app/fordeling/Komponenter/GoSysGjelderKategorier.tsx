import React from 'react';

import { IntlShape } from 'react-intl';
import { Select } from '@navikt/ds-react';

import intlHelper from 'app/utils/intlUtils';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { IGosysGjelderKategorier } from 'app/models/types/FordelingState';
import { setValgtGosysKategoriAction } from 'app/state/actions/FordelingActions';

interface Props {
    intl: IntlShape;
    valgtGosysKategori: string;
    gosysGjelderKategorier: IGosysGjelderKategorier;
    setValgtGosysKategori: typeof setValgtGosysKategoriAction;
}

const GosysGjelderKategorier: React.FC<Props> = ({
    intl,
    valgtGosysKategori,
    gosysGjelderKategorier,
    setValgtGosysKategori,
}: Props) => {
    return (
        <div>
            <VerticalSpacer sixteenPx />

            <Select
                value={valgtGosysKategori}
                className="w-64"
                label={intlHelper(intl, 'fordeling.kategoriGosys')}
                onChange={(e) => setValgtGosysKategori(e.target.value)}
                data-test-id="gosysKategoriSelect"
            >
                <option disabled value="" label=" " aria-label="Tomt valg" />

                {Object.keys(gosysGjelderKategorier!).map((kategori) => (
                    <option key={kategori} value={kategori}>
                        {gosysGjelderKategorier![kategori]}
                    </option>
                ))}
            </Select>

            <VerticalSpacer eightPx />
        </div>
    );
};

export default GosysGjelderKategorier;
