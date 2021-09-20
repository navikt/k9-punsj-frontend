import {IFordelingState} from 'app/models/types';
import {
    hentGjelderKategorierFraGosys
} from 'app/state/actions';
import {v4 as uuidv4} from 'uuid';
import {RootStateType} from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import {Select} from 'nav-frontend-skjema';
import React, {useEffect, useState} from 'react';
import {injectIntl, WrappedComponentProps,} from 'react-intl';
import {connect} from 'react-redux';
import VerticalSpacer from "../../../../components/VerticalSpacer";

export interface IOwnProps {
    fordelingState: IFordelingState;
    hentGjelderKategorier: typeof hentGjelderKategorierFraGosys;
    setGosysKategoriJournalforing: (gosysKategori: string) => void;
}

type IGosysGjelderKategorierProps = WrappedComponentProps & IOwnProps;

const GosysGjelderKategorierComponent: React.FunctionComponent<IGosysGjelderKategorierProps> = (
    props: IGosysGjelderKategorierProps
) => {
    const {
        intl,
        fordelingState,
        hentGjelderKategorier,
        setGosysKategoriJournalforing
    } = props;

    const [valgtKategori, setValgtKategori] = useState<string>('');

    useEffect(() => {
        hentGjelderKategorier();
    }, [])

    const harKategorierBlivitHentet = typeof fordelingState.isAwaitingGosysGjelderResponse !== 'undefined'
        && !fordelingState.isAwaitingGosysGjelderResponse
        && typeof fordelingState.isAwaitingGosysGjelderResponse !== 'undefined'
        && typeof fordelingState.gosysGjelderKategorier !== 'undefined'
        && Object.keys(fordelingState.gosysGjelderKategorier).length > 0;

    return (<>
            {harKategorierBlivitHentet && <div>
              <VerticalSpacer sixteenPx={true}/>
              <Select
                value={valgtKategori}
                bredde="l"
                label={intlHelper(intl, 'fordeling.kategoriGosys')}
                onChange={(e) => setValgtKategori(e.target.value)}
                onBlur={(e) => setGosysKategoriJournalforing(e.target.value)}
              >
                <option key={uuidv4()} value={"Annet"}>
                    { }
                </option>
                )

                  {Object.keys(fordelingState.gosysGjelderKategorier!).map(kategori =>
                      <option key={uuidv4()} value={kategori}>
                          {fordelingState.gosysGjelderKategorier![kategori]}
                      </option>)
                  }
              </Select>
              <VerticalSpacer eightPx={true}/>
            </div>
            }
        </>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    fordelingState: state.fordelingState,
});

const mapDispatchToProps = (dispatch: any) => ({
    hentGjelderKategorier: () => dispatch(hentGjelderKategorierFraGosys()),
});

const GosysGjelderKategorier = injectIntl(connect(mapStateToProps, mapDispatchToProps)(GosysGjelderKategorierComponent));

export {GosysGjelderKategorier, GosysGjelderKategorierComponent};
