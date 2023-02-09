import React from 'react';
import LabelValue from 'app/components/skjema/LabelValue';
import './klassifiseringInfo.css';
import { finnForkortelseForDokumenttype, finnVisningsnavnForSakstype } from 'app/utils';
import { Period } from '@navikt/k9-period-utils';
import { RootStateType } from 'app/state/RootState';
import { useSelector } from 'react-redux';
import { FordelingDokumenttype } from 'app/models/enums';

const KlassifiseringInfo = () => {
    const fagsak = useSelector((state: RootStateType) => state.fordelingState.fagsak);
    const identState = useSelector((state: RootStateType) => state.identState);
    const dokumenttype = useSelector(
        (state: RootStateType) => state.fordelingState.dokumenttype as FordelingDokumenttype
    );
    return (
        <div className="fagsakContainer">
            {identState.ident1 && (
                <div>
                    <LabelValue text="Søker" value={identState.ident1} />
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
                (identState.ident2 && (
                    <div>
                        <LabelValue text="Pleietrengende" value={fagsak?.pleietrengendeIdent || identState.ident2} />
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
