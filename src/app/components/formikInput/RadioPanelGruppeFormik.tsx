import classNames from 'classnames';
import { useField } from 'formik';
import { RadioPanelGruppe, RadioPanelGruppeProps } from 'nav-frontend-skjema';
import React from 'react';

import './radioPanelGruppeFormik.less';

interface OwnProps extends Partial<RadioPanelGruppeProps> {
    name: string;
    options: { label: string; value: string }[];
    retning?: string;
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
            <RadioPanelGruppe
                legend={legend}
                feil={meta.touched && meta.error}
                radios={options}
                checked={field.value}
                {...field}
                {...props}
            />
        </div>
    );
};

export default RadioPanelGruppeFormik;
