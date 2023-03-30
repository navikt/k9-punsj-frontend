import { useFormikContext } from 'formik';
import { CheckboksPanel } from 'nav-frontend-skjema';
import React from 'react';
import { useIntl } from 'react-intl';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import intlHelper from 'app/utils/intlUtils';

import { Periodepaneler } from './Periodepaneler';

const LovbestemtFerie = () => {
    const { values, setFieldValue } = useFormikContext<OLPSoknad>();
    const intl = useIntl();

    const updateSkalHaFerie = (checked: boolean) => {
        if (!!checked && values.lovbestemtFerie?.length === 0) {
            setFieldValue('lovbestemtFerie', [{ fom: '', tom: '' }]);
        } else {
            setFieldValue('lovbestemtFerie', []);
        }
    };

    return (
        <>
            <VerticalSpacer eightPx />
            <CheckboksPanel
                label={intlHelper(intl, 'skjema.ferie.leggtil')}
                onChange={(e) => updateSkalHaFerie(e.target.checked)}
                checked={!!values.lovbestemtFerie.length}
            />
            {!!values.lovbestemtFerie.length && (
                <Periodepaneler fieldName="lovbestemtFerie" periods={values.lovbestemtFerie} kanHaFlere />
            )}
            <VerticalSpacer eightPx />
        </>
    );
};

export default LovbestemtFerie;
