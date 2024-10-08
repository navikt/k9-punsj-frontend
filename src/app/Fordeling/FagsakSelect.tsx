import React from 'react';

import { BodyShort, Checkbox, Label, Link, Select, VStack } from '@navikt/ds-react';

import { IIdentState } from 'app/models/types/IdentState';
import Fagsak, { FagsakForSelect } from 'app/types/Fagsak';

import { DokumenttypeForkortelse } from 'app/models/enums';
import { FormattedMessage } from 'react-intl';
import { finnVisningsnavnForSakstype, getEnvironmentVariable } from 'app/utils';
import { ExternalLink } from '@navikt/ds-icons';

interface Props {
    fagsaker: FagsakForSelect[];
    reserverSaksnummerTilNyFagsak: boolean;
    identState: IIdentState;
    ingenInfoOmBarnIDokument?: boolean;
    valgtFagsak?: FagsakForSelect;
    setValgtFagsak: (fagsak: string) => void;
    setReserverSaksnummerTilNyFagsak: (reserverSaksnummerTilNyFagsak: boolean) => void;
    setIdentAction: (søkerId: string, pleietrengendeId: string, annenSokerIdent: string | null) => void;
    setBehandlingsAar: (behandlingsAar: string | undefined) => void;
    setAnnenPart: (annenPart: string) => void;
    setFosterbarn: (fosterbarn?: string[]) => void;
}

const getFagsakInfo = (valgtFagsak: FagsakForSelect) => {
    const { sakstype, behandlingsår, pleietrengende, relatertPerson } = valgtFagsak;

    if (sakstype === DokumenttypeForkortelse.PPN) {
        return (
            <>
                <Label>
                    <FormattedMessage id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.pils.tittel" />
                </Label>

                {pleietrengende ? (
                    <>
                        <span className="block mt-1">
                            <FormattedMessage
                                id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.pils.navn"
                                values={{ navn: pleietrengende?.navn || 'ikke satt' }}
                            />
                        </span>

                        <span className="block">
                            <FormattedMessage
                                id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.pils.fnr"
                                values={{ pleietrengendeIdent: pleietrengende?.identitetsnummer || 'ikke satt' }}
                            />
                        </span>
                    </>
                ) : (
                    <span className="block mt-1">
                        <FormattedMessage id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.pils.utenPleietrengende" />
                    </span>
                )}
            </>
        );
    }

    if (sakstype === DokumenttypeForkortelse.OMP || sakstype === DokumenttypeForkortelse.OMP_UT) {
        if (behandlingsår) {
            return (
                <div className="mt-8">
                    <FormattedMessage
                        id="fordeling.fagsakSelect.fagsakSelectedInfo.behandlingsÅr"
                        values={{ behandlingsår }}
                    />
                </div>
            );
        }

        return null;
    }

    if (sakstype === DokumenttypeForkortelse.OMP_MA) {
        return (
            <>
                <Label>
                    <FormattedMessage id="fordeling.fagsakSelect.fagsakSelectedInfo.relatertPerson.ompMa.tittel" />
                </Label>

                {relatertPerson ? (
                    <>
                        <span className="block mt-1">
                            <FormattedMessage
                                id={`fordeling.fagsakSelect.fagsakSelectedInfo.relatertPerson.ompMa.navn`}
                                values={{ navn: relatertPerson.navn || 'ikke satt' }}
                            />
                        </span>

                        <span className="block">
                            <FormattedMessage
                                id={`fordeling.fagsakSelect.fagsakSelectedInfo.relatertPerson.ompMa.fnr`}
                                values={{ relatertPersonIdent: relatertPerson.identitetsnummer || 'ikke satt' }}
                            />
                        </span>
                    </>
                ) : (
                    <span className="block mt-1">
                        <FormattedMessage id="fordeling.fagsakSelect.fagsakSelectedInfo.relatertPerson.ompMa.ikkeSatt" />
                    </span>
                )}
            </>
        );
    }

    return (
        <>
            <Label>
                <FormattedMessage id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.barn.tittel" />
            </Label>

            {pleietrengende ? (
                <>
                    <span className="block mt-1">
                        <FormattedMessage
                            id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.barn.navn"
                            values={{ navn: pleietrengende.navn || 'ikke satt' }}
                        />
                    </span>

                    <span className="block">
                        <FormattedMessage
                            id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.barn.fnr"
                            values={{ pleietrengendeIdent: pleietrengende?.identitetsnummer || 'ikke satt' }}
                        />
                    </span>
                </>
            ) : (
                <span className="block mt-1">
                    <FormattedMessage id="fordeling.fagsakSelect.fagsakSelectedInfo.pleietrengendeInfo.barn.ikkeSatt" />
                </span>
            )}
        </>
    );
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
    setValgtFagsak,
    setReserverSaksnummerTilNyFagsak,
    setIdentAction,
    setBehandlingsAar,
    setAnnenPart,
    setFosterbarn,
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
                    <BodyShort as="p">{getFagsakInfo(valgtFagsak)}</BodyShort>
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
                setFosterbarn(undefined);
            }}
            disabled={ingenInfoOmBarnIDokument}
            checked={reserverSaksnummerTilNyFagsak}
        >
            <FormattedMessage id="fordeling.fagsakSelect.checkbox.reserverSaksnummer" />
        </Checkbox>
    </>
);

export default FagsakSelect;
