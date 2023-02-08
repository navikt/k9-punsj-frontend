import React from 'react';
import LabelValue from 'app/components/skjema/LabelValue';
import './fagsakVisning.css';
import Fagsak from 'app/types/Fagsak';
import { finnVisningsnavnForSakstype } from 'app/utils';
import { Period } from '@navikt/k9-period-utils';

interface OwnProps {
    fagsak: Fagsak;
}

const FagsakVisning = ({ fagsak }: OwnProps) => (
    <div className="fagsakContainer">
        {fagsak.sakstype && (
            <div>
                <LabelValue text="Sakstype" value={finnVisningsnavnForSakstype(fagsak.sakstype)} />
            </div>
        )}
        {fagsak.fagsakId && (
            <div>
                <LabelValue text="Saksnummer" value={fagsak.fagsakId} />
            </div>
        )}
        {fagsak.pleietrengendeIdent && (
            <div>
                <LabelValue text="Pleietrengende" value={fagsak.pleietrengendeIdent} />
            </div>
        )}
        {fagsak.gyldigPeriode && (
            <div>
                <LabelValue
                    text="Periode"
                    value={new Period(fagsak.gyldigPeriode.fom, fagsak.gyldigPeriode.tom).prettifyPeriod()}
                />
            </div>
        )}
    </div>
);

export default FagsakVisning;
