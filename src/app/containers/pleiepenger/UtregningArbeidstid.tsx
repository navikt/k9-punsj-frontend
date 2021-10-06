import React from 'react';
import { IntlShape } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';

interface IUtregningArbeidstidProps {
    arbeidstid?: string;
    normalArbeidstid?: string;
    intl: IntlShape;
}

const UtregningArbeidstid = ({ arbeidstid, normalArbeidstid, intl }: IUtregningArbeidstidProps): JSX.Element | null => {
    const convert = (tid: string) => Number(tid.replace(',', '.'));

    if (!arbeidstid || Number.isNaN(convert(arbeidstid))) {
        return null;
    }

    return (
        <>
            <div>
                <div>{`= ${convert(arbeidstid) * 5} ${intlHelper(
                    intl,
                    'skjema.arbeid.arbeidstaker.timerperuke'
                )}`}</div>
                {normalArbeidstid && !Number.isNaN(Number(normalArbeidstid)) && (
                    <div>{`(${intlHelper(intl, 'skjema.arbeid.arbeidstaker.tilsvarer')} ${
                        ((convert(arbeidstid) / convert(normalArbeidstid)) * 100).toLocaleString(undefined, {maximumFractionDigits: 3, minimumFractionDigits: 0})
                    }% ${intlHelper(intl, 'skjema.arbeid.arbeidstaker.arbeid')})`}</div>
                )}
            </div>
        </>
    );
};

export default UtregningArbeidstid;
