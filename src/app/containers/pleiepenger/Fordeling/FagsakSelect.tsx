import React from 'react';

import { BodyShort, Checkbox, Select } from '@navikt/ds-react';

import { IIdentState } from 'app/models/types/IdentState';
import Fagsak from 'app/types/Fagsak';
import Period from 'app/utils/Period';

import { DokumenttypeForkortelse } from 'app/models/enums';
import { IBarn } from 'app/models/types/Barn';
import { FormattedMessage } from 'react-intl';
import { finnVisningsnavnForSakstype } from 'app/utils';

interface Props {
    fagsaker: Fagsak[];
    brukEksisterendeFagsak: boolean;
    identState: IIdentState;
    valgtFagsak?: Fagsak;
    barn?: IBarn[];
    setValgtFagsak: (fagsak: string) => void;
    setBrukEksisterendeFagsak: (brukEksisterendeFagsak: boolean) => void;
    setIdentAction: (søkerId: string, pleietrengendeId: string, annenSokerIdent: string | null) => void;
    setBehandlingsAar: (behandlingsAar: string | undefined) => void;
}

const getPleietrengendeInfo = (valgtFagsak: Fagsak, barn?: IBarn[]) => {
    const { sakstype, pleietrengendeIdent } = valgtFagsak;

    if (sakstype === DokumenttypeForkortelse.PPN) {
        if (pleietrengendeIdent) {
            return (
                <FormattedMessage
                    id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.pils"
                    values={{ pleietrengendeIdent }}
                />
            );
        }

        return (
            <FormattedMessage id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.pils.utenPleietrengende" />
        );
    }

    if (pleietrengendeIdent) {
        const barnet = barn?.find((b) => b.identitetsnummer === pleietrengendeIdent);
        if (barnet) {
            const navn = `${barnet.fornavn} ${barnet.etternavn}`;
            return (
                <FormattedMessage
                    id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.barnMedFnrOgNavn"
                    values={{ navn, pleietrengendeIdent }}
                />
            );
        }
        return (
            <FormattedMessage
                id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.barnKunMedFnr"
                values={{ pleietrengendeIdent }}
            />
        );
    }

    return <FormattedMessage id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.barnTomt" />;
};

const FagsakSelect = ({
    fagsaker,
    brukEksisterendeFagsak,
    identState,
    valgtFagsak,
    barn,
    setValgtFagsak,
    setBrukEksisterendeFagsak,
    setIdentAction,
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
                    fagsaker.map(({ fagsakId, sakstype, reservert }) => (
                        <option key={fagsakId} value={fagsakId}>
                            {`${fagsakId} (K9 ${finnVisningsnavnForSakstype(sakstype)}) ${reservert ? '(reservert)' : ''}`}
                        </option>
                    ))}
            </Select>
            {valgtFagsak && (
                <div className="fagsakSelectedInfo">
                    <BodyShort as="p">{getPleietrengendeInfo(valgtFagsak, barn)}</BodyShort>
                    {valgtFagsak.gyldigPeriode?.fom && (
                        <BodyShort as="p">
                            <FormattedMessage
                                id="fordeling.fagsakSelect.fagsakSelectedInfo.periode"
                                values={{
                                    periode: new Period(
                                        valgtFagsak.gyldigPeriode.fom,
                                        valgtFagsak.gyldigPeriode.tom,
                                    ).prettifyPeriodYears(),
                                }}
                            />
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
            <FormattedMessage id="fordeling.fagsakSelect.checkbox.reserverSaksnummer" />
        </Checkbox>
    </>
);

export default FagsakSelect;
