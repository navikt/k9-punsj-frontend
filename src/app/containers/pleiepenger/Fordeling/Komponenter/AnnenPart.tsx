import { TextField, Button } from '@navikt/ds-react';
import { getValidationErrors, identifikator } from 'app/rules/yup';
import { setAnnenPartAction } from 'app/state/actions/IdentActions';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { Dispatch } from 'redux';

type ownProps = {
    vis: boolean;
    annenPart: string;
    setAnnenPart: (annenPart: string) => void;
};
const AnnenPart = ({ vis, annenPart, setAnnenPart }: ownProps): JSX.Element | null => {
    if (!vis) {
        return null;
    }
    const intl = useIntl();

    useEffect(() => setAnnenPart(''), []);

    const [visFeil, setVisFeil] = useState<boolean>(false);
    const onChangeHandler = (e) => {
        const identifikatorUtenWhitespace = e.target.value.replace(/\D+/, '');
        if (identifikatorUtenWhitespace.length < 12) {
            setAnnenPart(identifikatorUtenWhitespace);
        }
    };
    const validators = [identifikator];
    const handleIdentAnnenSokerBlur = () => setVisFeil(true);
    return (
        <TextField
            label={intlHelper(intl, 'ident.identifikasjon.annenPart')}
            onChange={onChangeHandler}
            onBlur={handleIdentAnnenSokerBlur}
            value={annenPart}
            error={visFeil && getValidationErrors(validators, annenPart)}
            className="bold-label"
            maxLength={11}
            size="small"
        />
    );
};

const mapStateToProps = (state: RootStateType) => ({
    annenPart: state.identState.annenPart,
});

const mapDispatchToProps = (dispatch: Dispatch) => ({
    setAnnenPart: (annenPart: string) => dispatch(setAnnenPartAction(annenPart)),
});

export default connect(mapStateToProps, mapDispatchToProps)(AnnenPart);
