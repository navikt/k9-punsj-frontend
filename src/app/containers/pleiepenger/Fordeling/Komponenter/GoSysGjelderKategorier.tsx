import { IFordelingState } from 'app/models/types';
import { hentGjelderKategorierFraGosys, setValgtGosysKategoriAction } from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import { Select } from 'nav-frontend-skjema';
import React, { useEffect } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import VerticalSpacer from '../../../../components/VerticalSpacer';

export interface IOwnProps {
    fordelingState: IFordelingState;
    hentGjelderKategorier: typeof hentGjelderKategorierFraGosys;
    setValgtGosysKategori: typeof setValgtGosysKategoriAction;
}

type IGosysGjelderKategorierProps = WrappedComponentProps & IOwnProps;

const GosysGjelderKategorierComponent: React.FunctionComponent<IGosysGjelderKategorierProps> = (
    props: IGosysGjelderKategorierProps
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
                bredde="l"
                label={intlHelper(intl, 'fordeling.kategoriGosys')}
                onChange={(e) => setValgtGosysKategori(e.target.value)}
            >
                <option disabled value="" label=" " />

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
    connect(mapStateToProps, mapDispatchToProps)(GosysGjelderKategorierComponent)
);

export { GosysGjelderKategorier, GosysGjelderKategorierComponent };
