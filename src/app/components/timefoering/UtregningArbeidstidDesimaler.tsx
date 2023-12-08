import React from 'react';
import { useIntl } from 'react-intl';

import intlHelper from 'app/utils/intlUtils';

interface IUtregningArbeidstidProps {
    arbeidstid: string;
    normalArbeidstid?: string;
}

const UtregningArbeidstidDesimaler = ({
    arbeidstid,
    normalArbeidstid,
}: IUtregningArbeidstidProps): JSX.Element | null => {
    const intl = useIntl();
    const convert = (tid: string) => Number(tid.replace(',', '.'));
    const regnUt = (tid: string, tidTilDeling: string) => (convert(tid) / convert(tidTilDeling)) * 100;
    const tallTilString = (tall?: number) =>
        tall &&
        tall.toLocaleString(undefined, {
            maximumFractionDigits: 3,
            minimumFractionDigits: 0,
        });

    if (!arbeidstid || !Number.isFinite(convert(arbeidstid))) {
        return null;
    }
    const prosentArbeid = normalArbeidstid && regnUt(arbeidstid, normalArbeidstid);
    const skalViseProsent = Number.isFinite(prosentArbeid);

    return (
        <div>
            <div>{`= ${(convert(arbeidstid) * 5).toLocaleString(undefined, {
                maximumFractionDigits: 3,
                minimumFractionDigits: 0,
            })} ${intlHelper(intl, 'skjema.arbeid.arbeidstaker.timerperuke')}`}</div>
            {skalViseProsent && (
                <div>{`(${intlHelper(intl, 'skjema.arbeid.arbeidstaker.tilsvarer')} ${tallTilString(
                    Number(prosentArbeid),
                )}% ${intlHelper(intl, 'skjema.arbeid.arbeidstaker.arbeid')})`}</div>
            )}
        </div>
    );
};

export default UtregningArbeidstidDesimaler;
