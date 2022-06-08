import React from 'react';
import ArbeidstakerContainer from '../components/ArbeidstakerContainer';
import { skjematyperOmsorgspengeutbetaling } from '../konstanter';
import { Arbeidsforhold } from '../types/OMPUTSoknad';

interface OwnProps {
    arbeidsforhold: Arbeidsforhold;
}

const ArbeidsforholdContainer = ({
    arbeidsforhold: { arbeidstaker, frilanser, selvstendigNæringsdrivende },
}: OwnProps) => arbeidstaker && <ArbeidstakerContainer />

export default ArbeidsforholdContainer;
