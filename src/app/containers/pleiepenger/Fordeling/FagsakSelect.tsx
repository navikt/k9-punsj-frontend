import { BodyShort } from '@navikt/ds-react';
import VerticalSpacer from 'app/components/VerticalSpacer';
import Fagsak from 'app/types/Fagsak';
import React from 'react';
import { Period } from '@navikt/k9-period-utils';
import { Checkbox, Select } from 'nav-frontend-skjema';
import { IIdentState } from 'app/models/types/IdentState';

interface Props {
    fagsaker: Fagsak[];
    brukEksisterendeFagsak: boolean;
    setValgtFagsak: (fagsak: string) => void;
    finnVisningsnavnForSakstype: (sakstype: string) => string;
    valgtFagsak: Fagsak | undefined;
    setBrukEksisterendeFagsak: (brukEksisterendeFagsak: boolean) => void;
    setIdentAction: (ident1: string, ident2: string, annenSokerIdent: string | null) => void;
    identState: IIdentState;
}

const FagsakSelect = ({
    fagsaker,
    brukEksisterendeFagsak,
    setValgtFagsak,
    finnVisningsnavnForSakstype,
    valgtFagsak,
    setBrukEksisterendeFagsak,
    setIdentAction,
    identState,
}: Props) => (
    <>
        <div className="fagsakSelectContainer">
            <Select
                className="fagsakSelect"
                label="Velg fagsak"
                disabled={fagsaker.length === 0 || !brukEksisterendeFagsak}
                onChange={(event) => setValgtFagsak(event.target.value)}
            >
                <option value="">Velg</option>
                {brukEksisterendeFagsak &&
                    fagsaker.map(({ fagsakId, sakstype: stype }) => (
                        <option key={fagsakId} value={fagsakId}>
                            {`${fagsakId} (K9 ${finnVisningsnavnForSakstype(stype)})`}
                        </option>
                    ))}
            </Select>
            {valgtFagsak && (
                <div className="fagsakSelectedInfo">
                    <BodyShort as="p">Fødselsnummer: {valgtFagsak.pleietrengendeIdent}</BodyShort>
                    {valgtFagsak.gyldigPeriode?.fom && (
                        <BodyShort as="p">
                            Periode:{' '}
                            {new Period(
                                valgtFagsak.gyldigPeriode.fom,
                                valgtFagsak.gyldigPeriode.tom
                            ).prettifyPeriodYears()}
                        </BodyShort>
                    )}
                </div>
            )}
        </div>
        <Checkbox
            label="Har ikke tilhørende fagsak"
            onChange={() => {
                setBrukEksisterendeFagsak(!brukEksisterendeFagsak);
                setValgtFagsak('');
                setIdentAction(identState.ident1, '', identState.annenSokerIdent);
            }}
        />
        <VerticalSpacer twentyPx />
    </>
);

export default FagsakSelect;
