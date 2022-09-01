import React from 'react';
import { useIntl } from 'react-intl';
import intlHelper from 'app/utils/intlUtils';
import { minutterTilSekunder, timerTilSekunder } from 'app/utils/numberUtils';
import { verdiOgTekstHvisVerdi } from 'app/utils';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';

interface IUtregningArbeidstidProps {
    arbeidstid: {
        timer: string;
        minutter: string;
    };
    normalArbeidstid?: {
        timer?: string;
        minutter: string;
    };
}

dayjs.extend(duration);

const UtregningArbeidstid = ({ arbeidstid, normalArbeidstid }: IUtregningArbeidstidProps): JSX.Element | null => {
    const intl = useIntl();
    const arbeidstidSekunder =
        timerTilSekunder(Number.parseInt(arbeidstid.timer, 10)) +
        minutterTilSekunder(Number.parseInt(arbeidstid.minutter, 10));
    const normalArbeidstidSekunder =
        timerTilSekunder(Number.parseInt(normalArbeidstid?.timer, 10)) +
        minutterTilSekunder(Number.parseInt(normalArbeidstid?.minutter, 10));
    const tallTilString = (tall?: number) =>
        tall &&
        tall.toLocaleString(undefined, {
            maximumFractionDigits: 3,
            minimumFractionDigits: 0,
        });

    if (!Number.isFinite(arbeidstidSekunder)) {
        return null;
    }
    const prosentArbeid = normalArbeidstid && (arbeidstidSekunder / normalArbeidstidSekunder) * 100;
    const skalViseProsent = Number.isFinite(prosentArbeid);

    const arbeidstidDuration = dayjs.duration(arbeidstidSekunder * 5, 'seconds');
    const timer = arbeidstidDuration.get('hours') + arbeidstidDuration.get('days') * 24;
    const minutter = arbeidstidDuration.get('minutes');

    const tekstForTimerOgMinutter = [verdiOgTekstHvisVerdi(timer, 'timer'), verdiOgTekstHvisVerdi(minutter, 'minutter')]
        .filter(Boolean)
        .join(' og ');
    return (
        <div>
            {(!!timer || !!minutter) && (
                <div>{`= ${tekstForTimerOgMinutter} ${intlHelper(intl, 'skjema.arbeid.arbeidstaker.peruke')}`}</div>
            )}
            {skalViseProsent && (
                <div>{`(${intlHelper(intl, 'skjema.arbeid.arbeidstaker.tilsvarer')} ${tallTilString(
                    Number(prosentArbeid)
                )}% ${intlHelper(intl, 'skjema.arbeid.arbeidstaker.arbeid')})`}</div>
            )}
        </div>
    );
};

export default UtregningArbeidstid;
