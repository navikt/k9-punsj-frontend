import React from 'react';
import ArbeidstakerContainer from '../components/ArbeidstakerContainer';
import SelvstendigNaeringsdrivende from '../components/SelvstendigNaeringsdrivende';
import { Arbeidsforhold } from '../types/OMPUTSoknad';
import Frilanser from './Frilanser';

interface OwnProps {
    arbeidsforhold: Arbeidsforhold;
}

const ArbeidsforholdContainer = ({
    arbeidsforhold: { arbeidstaker, frilanser, selvstendigNæringsdrivende },
}: OwnProps) => (
    <>
        {arbeidstaker && <ArbeidstakerContainer />}
        {selvstendigNæringsdrivende && <SelvstendigNaeringsdrivende />}
        {frilanser && <Frilanser />}
    </>
);

export default ArbeidsforholdContainer;
