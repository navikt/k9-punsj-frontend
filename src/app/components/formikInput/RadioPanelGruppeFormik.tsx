import classNames from 'classnames';
import { useField } from 'formik';
import React from 'react';
import { LegacyRadioGroup, LegacyRadioGroupOption, LegacyRadioGroupProps } from 'app/components/legacy-form-compat/radio';

import './radioPanelGruppeFormik.css';

interface OwnProps extends Partial<LegacyRadioGroupProps> {
    name: string;
    options: LegacyRadioGroupOption[];
    retning?: 'horisontal' | 'vertikal';
}

const RadioPanelGruppeFormik = ({ name, options, legend, retning = 'horisontal', ...props }: OwnProps) => {
    const [field, meta] = useField(name);
    return (
        <div
            className={classNames('radioinput--container', {
                'radioinput--horisontal': retning === 'horisontal',
                'radioinput--vertikal': retning === 'vertikal',
            })}
        >
            <LegacyRadioGroup
                legend={legend}
                feil={meta.touched && meta.error}
                radios={options}
                checked={field.value}
                retning={retning}
                {...field}
                {...props}
            />
        </div>
    );
};

export default RadioPanelGruppeFormik;
