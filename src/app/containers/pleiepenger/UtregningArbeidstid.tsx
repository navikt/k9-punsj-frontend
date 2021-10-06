import React from 'react';
import { useIntl } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';

interface IUtregningArbeidstidProps {
    arbeidstid?: string;
    normalArbeidstid?: string;
}

const UtregningArbeidstid = ({ arbeidstid, normalArbeidstid }: IUtregningArbeidstidProps): JSX.Element | null => {
    const convert = (tid: string) => Number(tid.replace(',', '.'));
    const regnUt = (tid: string, tidTilDeling: string) =>
        ((convert(tid) / convert(tidTilDeling)) * 100).toLocaleString(undefined, {
            maximumFractionDigits: 3,
            minimumFractionDigits: 0,
        });

    const skalRegneProsent = normalArbeidstid && !Number.isNaN(Number(normalArbeidstid));
    const intl = useIntl();
    

    if (!arbeidstid || Number.isNaN(convert(arbeidstid))) {
        return null;
    }

    return (
        <div>
            <div>{`= ${convert(arbeidstid) * 5} ${intlHelper(intl, 'skjema.arbeid.arbeidstaker.timerperuke')}`}</div>
            {skalRegneProsent && (
                <div>{`(${intlHelper(intl, 'skjema.arbeid.arbeidstaker.tilsvarer')} ${regnUt(
                    arbeidstid,
                    normalArbeidstid
                )}% ${intlHelper(intl, 'skjema.arbeid.arbeidstaker.arbeid')})`}</div>
            )}
        </div>
    );
};

export default UtregningArbeidstid;
