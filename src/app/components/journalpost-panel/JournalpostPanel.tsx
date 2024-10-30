import React from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useSelector } from 'react-redux';
import { ExternalLink } from '@navikt/ds-icons';
import { Box, HStack, Link } from '@navikt/ds-react';

import { DokumenttypeForkortelse, dokumenttyperMedBehandlingsårValg, FordelingDokumenttype } from 'app/models/enums';
import { finnVisningsnavnForSakstype, getModiaPath } from 'app/utils';
import { RootStateType } from '../../state/RootState';
import intlHelper from '../../utils/intlUtils';
import LabelValue from '../skjema/LabelValue';

import './journalpostPanel.css';

interface Props {
    journalposter?: string[];
}

export const JournalpostPanel: React.FC<Props> = ({ journalposter }: Props) => {
    const intl = useIntl();

    const journalpost = useSelector((state: RootStateType) => state.felles.journalpost);
    const fordelingState = useSelector((state: RootStateType) => state.fordelingState);
    const { søkerId, pleietrengendeId, annenPart } = useSelector((state: RootStateType) => state.identState);

    const ident = søkerId || journalpost?.norskIdent;
    const modiaPath = getModiaPath(ident);

    const visSakstype = !!fordelingState.fagsak?.sakstype || !!journalpost?.sak?.sakstype;
    const visPleietrengendeId = pleietrengendeId || journalpost?.sak?.pleietrengendeIdent;
    const visFagsakId = fordelingState.fagsak?.fagsakId || journalpost?.sak?.fagsakId;
    const visAnnenPart = !!annenPart;
    const visBehandlingsår =
        journalpost?.sak?.behandlingsår && dokumenttyperMedBehandlingsårValg.includes(fordelingState.dokumenttype!);

    return (
        <Box padding="4" borderWidth="1" borderRadius="small" className="journalpostpanel">
            <div>
                <LabelValue
                    labelTextId="journalpost.id"
                    value={journalposter?.join(', ') || journalpost?.journalpostId}
                />
            </div>

            <HStack gap="5">
                <LabelValue
                    labelTextId="journalpost.norskIdent"
                    value={søkerId || journalpost?.norskIdent || intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')}
                    visKopier
                />

                {modiaPath && (
                    <div className="flex-auto">
                        <Link className="modia-lenke" href={modiaPath}>
                            <FormattedMessage id="modia.lenke" />
                            <ExternalLink />
                        </Link>
                    </div>
                )}
            </HStack>

            {visSakstype && (
                <div>
                    <LabelValue
                        labelTextId="journalpost.sakstype"
                        value={finnVisningsnavnForSakstype(
                            fordelingState.fagsak?.sakstype || journalpost?.sak?.sakstype || '',
                        )}
                    />
                </div>
            )}

            {visPleietrengendeId && (
                <div>
                    <LabelValue
                        labelTextId={
                            fordelingState.dokumenttype === FordelingDokumenttype.PLEIEPENGER_I_LIVETS_SLUTTFASE ||
                            journalpost?.sak?.sakstype === DokumenttypeForkortelse.PPN
                                ? 'journalpost.pleietrengendeId'
                                : 'journalpost.barnetsId'
                        }
                        value={
                            pleietrengendeId ||
                            journalpost?.sak?.pleietrengendeIdent ||
                            intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')
                        }
                    />
                </div>
            )}

            {visAnnenPart && (
                <div>
                    <LabelValue labelTextId="journalpost.annenPart" value={annenPart} />
                </div>
            )}

            {visFagsakId && (
                <div>
                    <LabelValue
                        labelTextId="journalpost.saksnummer"
                        value={
                            fordelingState.fagsak?.reservertSaksnummer || journalpost?.sak?.reservertSaksnummer
                                ? `${fordelingState.fagsak?.fagsakId || journalpost?.sak?.fagsakId} (reservert)`
                                : fordelingState.fagsak?.fagsakId || journalpost?.sak?.fagsakId
                        }
                    />
                </div>
            )}

            {visBehandlingsår && (
                <div>
                    <LabelValue labelTextId="journalpost.behandlingsÅr" value={journalpost?.sak?.behandlingsår} />
                </div>
            )}
        </Box>
    );
};
