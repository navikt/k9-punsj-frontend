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
    brukEksisterendeFagsak: boolean;
    identState: IIdentState;
    ingenInfoOmBarnIDokument?: boolean;
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

const getLenkeTilK9Sak = (fagsakId: string) => {
    const k9sakUrl = getEnvironmentVariable('APP_K9SAK_FAGSAK_FRONTEND_URL');
    return `${k9sakUrl}${fagsakId}`;
};

const FagsakSelect = ({
    fagsaker,
    brukEksisterendeFagsak,
    identState,
    ingenInfoOmBarnIDokument,
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
                disabled={fagsaker.length === 0 || !brukEksisterendeFagsak || ingenInfoOmBarnIDokument}
                onChange={(event) => setValgtFagsak(event.target.value)}
            >
                <option value="">Velg</option>
                {!ingenInfoOmBarnIDokument &&
                    brukEksisterendeFagsak &&
                    fagsaker.map(({ fagsakId, sakstype, reservert }) => (
                        <option key={fagsakId} value={fagsakId}>
                            {`${fagsakId} (K9 ${finnVisningsnavnForSakstype(sakstype)}) ${reservert ? '(reservert)' : ''}`}
                        </option>
                    ))}
            </Select>
            {valgtFagsak && (
                <div className="fagsakSelectedInfo">
                    <BodyShort as="p">{getPleietrengendeInfo(valgtFagsak, barn)}</BodyShort>
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
                setBrukEksisterendeFagsak(!brukEksisterendeFagsak);
                setValgtFagsak('');
                setIdentAction(identState.søkerId, '', identState.annenSokerIdent);
                setBehandlingsAar(undefined);
            }}
            disabled={ingenInfoOmBarnIDokument}
        >
            <FormattedMessage id="fordeling.fagsakSelect.checkbox.reserverSaksnummer" />
        </Checkbox>
    </>
);

export default FagsakSelect;
