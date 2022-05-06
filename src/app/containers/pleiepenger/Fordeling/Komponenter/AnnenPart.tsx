import { TextField } from '@navikt/ds-react';
import { IIdentState } from 'app/models/types/IdentState';
import { setAnnenPartAction } from 'app/state/actions/IdentActions';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import React, { useEffect, useState } from 'react';
import { IntlShape } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

type ownProps = {
    vis: boolean;
    intl: IntlShape;
    identState: IIdentState;
    setAnnenPart: (annenPart: string) => void;
};
const AnnenPart = ({ vis, intl, identState, setAnnenPart }: ownProps): JSX.Element | null => {
    if (!vis) {
        return null;
    }

    useEffect(() => setAnnenPart(''), []);

    const [visFeil, setVisFeil] = useState<boolean>(false);
    const onChangeHandler = (e) => {
        const identifikator = e.target.value.replace(/\D+/, '');
        if (identifikator.length < 12) {
            setAnnenPart(identifikator);
        }
    };

    const handleIdentAnnenSokerBlur = () => setVisFeil(true);

    return (
        <TextField
            label={intlHelper(intl, 'ident.identifikasjon.annenPart')}
            onChange={onChangeHandler}
            onBlur={handleIdentAnnenSokerBlur}
            value={identState.annenPart}
            className="bold-label"
            maxLength={11}
            size="small"
            type="number"
        />
    );
};

const mapStateToProps = (state: RootStateType) => ({
    identState: state.identState,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAnnenPart: (annenPart: string) => dispatch(setAnnenPartAction(annenPart)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnnenPart);
