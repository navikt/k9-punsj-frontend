import React from 'react';
import ArbeidstakerContainer from '../components/ArbeidstakerContainer';
import SelvstendigNaeringsdrivende from '../components/SelvstendigNaeringsdrivende';
import { skjematyperOmsorgspengeutbetaling } from '../konstanter';
import { Arbeidsforhold } from '../types/OMPUTSoknad';

interface OwnProps {
    arbeidsforhold: Arbeidsforhold;
}

const ArbeidsforholdContainer = ({
    arbeidsforhold: { arbeidstaker, frilanser, selvstendigNæringsdrivende },
}: OwnProps) => (
    <>
        {arbeidstaker && <ArbeidstakerContainer />}
        {selvstendigNæringsdrivende && <SelvstendigNaeringsdrivende />}
    </>
);

export default ArbeidsforholdContainer;
