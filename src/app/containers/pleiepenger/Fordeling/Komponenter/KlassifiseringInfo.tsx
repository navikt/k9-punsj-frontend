import React from 'react';
import { useSelector } from 'react-redux';

import LabelValue from 'app/components/skjema/LabelValue';
import { FordelingDokumenttype } from 'app/models/enums';
import { RootStateType } from 'app/state/RootState';
import { finnForkortelseForDokumenttype, finnVisningsnavnForSakstype } from 'app/utils';

import './klassifiseringInfo.css';
import Period from 'app/utils/Period';

const KlassifiseringInfo = () => {
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const identState = useSelector((state: RootStateType) => state.identState);
    const dokumenttype = useSelector(
        (state: RootStateType) => state.fordelingState.dokumenttype as FordelingDokumenttype,
    );
    return (
        <div className="fagsakContainer">
            {identState.søkerId && (
                <div>
                    <LabelValue text="Søker" value={identState.søkerId} />
                </div>
            )}
            <div>
                <LabelValue
                    text="Sakstype"
                    value={
                        fagsak?.sakstype
                            ? finnVisningsnavnForSakstype(fagsak?.sakstype)
                            : finnVisningsnavnForSakstype(finnForkortelseForDokumenttype(dokumenttype) as string)
                    }
                />
            </div>
            {identState.annenPart && (
                <div>
                    <LabelValue text="Annen søker" value={identState?.annenPart} />
                </div>
            )}
            {fagsak?.pleietrengendeIdent ||
                (identState.pleietrengendeId && (
                    <div>
                        <LabelValue
                            text="Pleietrengende"
                            value={fagsak?.pleietrengendeIdent || identState.pleietrengendeId}
                        />
                    </div>
                ))}

            {fagsak?.fagsakId && (
                <div>
                    <LabelValue text="Saksnummer" value={fagsak?.fagsakId} />
                </div>
            )}
            {fagsak?.gyldigPeriode && (
                <div>
                    <LabelValue
                        text="Periode"
                        value={new Period(fagsak?.gyldigPeriode.fom, fagsak?.gyldigPeriode.tom).prettifyPeriod()}
                    />
                </div>
            )}
        </div>
    );
};

export default KlassifiseringInfo;
