import React, { useEffect } from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Select } from '@navikt/ds-react';

import { IFordelingState } from 'app/models/types';
import { RootStateType } from 'app/state/RootState';
import { hentGjelderKategorierFraGosys, setValgtGosysKategoriAction } from 'app/state/actions';
import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from '../../components/VerticalSpacer';

export interface IOwnProps {
    fordelingState: IFordelingState;
    hentGjelderKategorier: typeof hentGjelderKategorierFraGosys;
    setValgtGosysKategori: typeof setValgtGosysKategoriAction;
}

type IGosysGjelderKategorierProps = WrappedComponentProps & IOwnProps;

const GosysGjelderKategorierComponent: React.FunctionComponent<IGosysGjelderKategorierProps> = (
    props: IGosysGjelderKategorierProps,
) => {
    const { intl, fordelingState, hentGjelderKategorier, setValgtGosysKategori } = props;

    useEffect(() => {
        hentGjelderKategorier();
    }, []);

    const harKategorierBlivitHentet =
        fordelingState.isAwaitingGosysGjelderResponse === false &&
        !!fordelingState.gosysGjelderKategorier &&
        Object.keys(fordelingState.gosysGjelderKategorier).length > 0;

    if (!harKategorierBlivitHentet) {
        return null;
    }

    return (
        <div>
            <VerticalSpacer sixteenPx />
            <Select
                value={fordelingState.valgtGosysKategori}
                className="w-64"
                label={intlHelper(intl, 'fordeling.kategoriGosys')}
                onChange={(e) => setValgtGosysKategori(e.target.value)}
                data-test-id="gosysKategoriSelect"
            >
                <option disabled value="" label=" " aria-label="Tomt valg" />

                {Object.keys(fordelingState.gosysGjelderKategorier!).map((kategori) => (
                    <option key={kategori} value={kategori}>
                        {fordelingState.gosysGjelderKategorier![kategori]}
                    </option>
                ))}
            </Select>
            <VerticalSpacer eightPx />
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    fordelingState: state.fordelingState,
});

const mapDispatchToProps = (dispatch: any) => ({
    hentGjelderKategorier: () => dispatch(hentGjelderKategorierFraGosys()),
    setValgtGosysKategori: (valgtKategori: string) => dispatch(setValgtGosysKategoriAction(valgtKategori)),
});

const GosysGjelderKategorier = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(GosysGjelderKategorierComponent),
);

export { GosysGjelderKategorier, GosysGjelderKategorierComponent };
