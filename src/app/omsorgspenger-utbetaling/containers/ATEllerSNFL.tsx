import React from 'react';
import ArbeidstakerContainer from '../components/ArbeidstakerContainer';
import { skjematyperOmsorgspengeutbetaling } from '../konstanter';

const ATEllerSNFL = ({ skjematype }: { skjematype: string }) => {
    if (skjematype === skjematyperOmsorgspengeutbetaling.AT) {
        return <ArbeidstakerContainer />;
    }

    return null;
};

export default ATEllerSNFL;
