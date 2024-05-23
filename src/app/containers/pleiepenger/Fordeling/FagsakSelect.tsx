import React from 'react';

import { BodyShort, Checkbox, Select } from '@navikt/ds-react';

import VerticalSpacer from 'app/components/VerticalSpacer';
import { IIdentState } from 'app/models/types/IdentState';
import Fagsak from 'app/types/Fagsak';
import Period from 'app/utils/Period';

interface Props {
    fagsaker: Fagsak[];
    brukEksisterendeFagsak: boolean;
    setValgtFagsak: (fagsak: string) => void;
    finnVisningsnavnForSakstype: (sakstype: string) => string;
    valgtFagsak: Fagsak | undefined;
    setBrukEksisterendeFagsak: (brukEksisterendeFagsak: boolean) => void;
    setIdentAction: (søkerId: string, pleietrengendeId: string, annenSokerIdent: string | null) => void;
    identState: IIdentState;
    setBehandlingsAar: (behandlingsAar: string | undefined) => void;
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
    setBehandlingsAar,
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
                                valgtFagsak.gyldigPeriode.tom,
                            ).prettifyPeriodYears()}
                        </BodyShort>
                    )}
                </div>
            )}
        </div>
        <Checkbox
            onChange={() => {
                setBrukEksisterendeFagsak(!brukEksisterendeFagsak);
                setValgtFagsak('');
                setIdentAction(identState.søkerId, '', identState.annenSokerIdent);
                setBehandlingsAar(undefined);
            }}
        >
            Har ikke tilhørende fagsak
        </Checkbox>
        <VerticalSpacer twentyPx />
    </>
);

export default FagsakSelect;
