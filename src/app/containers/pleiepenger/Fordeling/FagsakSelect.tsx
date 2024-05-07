import React from 'react';

import { BodyShort, Checkbox, Link, Select } from '@navikt/ds-react';

import { IIdentState } from 'app/models/types/IdentState';
import Fagsak from 'app/types/Fagsak';

import { DokumenttypeForkortelse } from 'app/models/enums';
import { IBarn } from 'app/models/types/Barn';
import { FormattedMessage } from 'react-intl';
import { finnVisningsnavnForSakstype, getEnvironmentVariable } from 'app/utils';
import { ExternalLink } from '@navikt/ds-icons';

interface Props {
    fagsaker: Fagsak[];
    reserverSaksnummerTilNyFagsak: boolean;
    identState: IIdentState;
    ingenInfoOmBarnIDokument?: boolean;
    valgtFagsak?: Fagsak;
    barn?: IBarn[];
    setValgtFagsak: (fagsak: string) => void;
    setReserverSaksnummerTilNyFagsak: (reserverSaksnummerTilNyFagsak: boolean) => void;
    setIdentAction: (søkerId: string, pleietrengendeId: string, annenSokerIdent: string | null) => void;
    setBehandlingsAar: (behandlingsAar: string | undefined) => void;
    setAnnenPart: (annenPart: string) => void;
}

const getFagsakInfo = (valgtFagsak: Fagsak, barn?: IBarn[]) => {
    const { sakstype, pleietrengendeIdent, behandlingsÅr, relatertPersonIdent } = valgtFagsak;

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

    if (sakstype === DokumenttypeForkortelse.OMP || sakstype === DokumenttypeForkortelse.OMP_UT) {
        if (behandlingsÅr) {
            return (
                <FormattedMessage
                    id="fordeling.fagsakSelect.fagsakSelectedInfo.behandlingsÅr"
                    values={{ behandlingsÅr }}
                />
            );
        }

        return null;
    }
    if (sakstype === DokumenttypeForkortelse.OMP_MA) {
        return (
            <FormattedMessage
                id="fordeling.fagsakSelect.fagsakSelectedInfo.relatertPerson.ompMa"
                values={{ relatertPersonIdent: relatertPersonIdent || 'ikke satt' }}
            />
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

const getLenkeTilK9Sak = (fagsakId: string) => {
    const k9sakUrl = getEnvironmentVariable('APP_K9SAK_FAGSAK_FRONTEND_URL');
    return `${k9sakUrl}${fagsakId}`;
};

const FagsakSelect = ({
    fagsaker,
    reserverSaksnummerTilNyFagsak,
    identState,
    ingenInfoOmBarnIDokument,
    valgtFagsak,
    barn,
    setValgtFagsak,
    setReserverSaksnummerTilNyFagsak,
    setIdentAction,
    setBehandlingsAar,
    setAnnenPart,
}: Props) => (
    <>
        <div className="fagsakSelectContainer">
            <Select
                className="fagsakSelect"
                label="Velg fagsak"
                disabled={fagsaker.length === 0 || reserverSaksnummerTilNyFagsak || ingenInfoOmBarnIDokument}
                onChange={(event) => setValgtFagsak(event.target.value)}
            >
                <option value="">Velg</option>
                {!ingenInfoOmBarnIDokument &&
                    !reserverSaksnummerTilNyFagsak &&
                    fagsaker.map(({ fagsakId, sakstype, reservert }) => (
                        <option key={fagsakId} value={fagsakId}>
                            {`${fagsakId} (K9 ${finnVisningsnavnForSakstype(sakstype)}) ${reservert ? '(reservert)' : ''}`}
                        </option>
                    ))}
            </Select>
            {valgtFagsak && (
                <div className="fagsakSelectedInfo">
                    <BodyShort as="p">{getFagsakInfo(valgtFagsak, barn)}</BodyShort>
                    {!valgtFagsak.reservert && (
                        <Link href={getLenkeTilK9Sak(valgtFagsak.fagsakId)} target="_blank">
                            <BodyShort as="p">
                                <FormattedMessage id="fordeling.fagsakSelect.lenke.seFagsak" />
                            </BodyShort>
                            <ExternalLink />
                        </Link>
                    )}
                </div>
            )}
        </div>
        <Checkbox
            onChange={() => {
                setReserverSaksnummerTilNyFagsak(!reserverSaksnummerTilNyFagsak);
                setValgtFagsak('');
                setIdentAction(identState.søkerId, '', identState.annenSokerIdent);
                setBehandlingsAar(undefined);
                setAnnenPart('');
            }}
            disabled={ingenInfoOmBarnIDokument}
            checked={reserverSaksnummerTilNyFagsak}
        >
            <FormattedMessage id="fordeling.fagsakSelect.checkbox.reserverSaksnummer" />
        </Checkbox>
    </>
);

export default FagsakSelect;
