import { Field, FieldProps } from 'formik';
import * as React from 'react';
import { useIntl } from 'react-intl';

import { CountrySelect } from 'app/components/country-select/CountrySelect';
import { IPeriodeinfo } from 'app/models/types';
import intlHelper from 'app/utils/intlUtils';

interface Props {
    periodeinfo: IPeriodeinfo;
}

const CountrySelectWrapper = ({ periodeinfo }: Props) => {
    const { land } = periodeinfo;
    const intl = useIntl();
    return (
        <div className="countryselect">
            <Field name="land">
                {({ field, meta }: FieldProps<string>) => (
                    <CountrySelect
                        label={intlHelper(intl, 'skjema.utenlandsopphold.land')}
                        unselectedoption="Velg land"
                        selectedcountry={land || ''}
                        onChange={field.onChange}
                        onBlur={field.onBlur}
                        feil={meta.touched && meta.error}
                    />
                )}
            </Field>
        </div>
    );
};

export default CountrySelectWrapper;
