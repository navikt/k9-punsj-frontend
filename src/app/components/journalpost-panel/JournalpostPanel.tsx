import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { ExternalLink } from '@navikt/ds-icons';
import { Link, Panel } from '@navikt/ds-react';

import { DokumenttypeForkortelse, FordelingDokumenttype } from 'app/models/enums';
import { finnVisningsnavnForSakstype, getModiaPath } from 'app/utils';

import { IFordelingState, IJournalpost } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import intlHelper from '../../utils/intlUtils';
import LabelValue from '../skjema/LabelValue';
import './journalpostPanel.css';

export interface IJournalpostPanelStateProps {
    journalpost?: IJournalpost;
    identState: IIdentState;
    fordelingState: IFordelingState;
}

interface IJournalpostComponentStateProps {
    journalposter?: string[];
}

export const JournalpostPanelComponent: React.FunctionComponent<
    IJournalpostPanelStateProps & IJournalpostComponentStateProps
> = (props) => {
    const {
        journalpost,
        fordelingState,
        identState: { søkerId, pleietrengendeId, annenPart },
        journalposter,
    } = props;

    const ident = søkerId || journalpost?.norskIdent;
    const modiaPath = getModiaPath(ident);
    const intl = useIntl();

    return (
        <Panel border className="journalpostpanel">
            <div>
                <LabelValue
                    labelTextId="journalpost.id"
                    value={journalposter?.join(', ') || journalpost?.journalpostId}
                    retning="horisontal"
                />
            </div>

            {(fordelingState.erSøkerIdBekreftet || journalpost?.erFerdigstilt) && (
                <div>
                    <LabelValue
                        labelTextId="journalpost.norskIdent"
                        value={
                            søkerId || journalpost?.norskIdent || intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')
                        }
                        retning="horisontal"
                        visKopier
                    />
                    {modiaPath && (
                        <Link className="modia-lenke" href={modiaPath}>
                            {intlHelper(intl, 'modia.lenke')}
                            <ExternalLink />
                        </Link>
                    )}
                </div>
            )}

            {(!!fordelingState.fagsak?.sakstype || !!journalpost?.sak?.sakstype) && (
                <div>
                    <LabelValue
                        labelTextId="journalpost.sakstype"
                        value={finnVisningsnavnForSakstype(
                            fordelingState.fagsak?.sakstype || journalpost?.sak?.sakstype || '',
                        )}
                        retning="horisontal"
                    />
                </div>
            )}

            {(pleietrengendeId || journalpost?.sak?.pleietrengendeIdent) && (
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
                        retning="horisontal"
                    />
                </div>
            )}

            {annenPart && (
                <div>
                    <LabelValue labelTextId="journalpost.annenPart" value={annenPart} retning="horisontal" />
                </div>
            )}

            {(fordelingState.fagsak?.fagsakId || journalpost?.sak?.fagsakId) && (
                <div>
                    <LabelValue
                        labelTextId="journalpost.saksnummer"
                        value={
                            fordelingState.fagsak?.reservertSaksnummer || journalpost?.sak?.reservertSaksnummer
                                ? `${fordelingState.fagsak?.fagsakId || journalpost?.sak?.fagsakId} (reservert)`
                                : fordelingState.fagsak?.fagsakId || journalpost?.sak?.fagsakId
                        }
                        retning="horisontal"
                    />
                </div>
            )}
            {journalpost?.sak?.behandlingsÅr && (
                <div>
                    <LabelValue
                        labelTextId="journalpost.behandlingsÅr"
                        value={journalpost?.sak?.behandlingsÅr}
                        retning="horisontal"
                    />
                </div>
            )}
        </Panel>
    );
};

const mapStateToProps = (state: RootStateType): IJournalpostPanelStateProps => ({
    identState: state.identState,
    journalpost: state.felles.journalpost,
    fordelingState: state.fordelingState,
});

export const JournalpostPanel = connect(mapStateToProps)(JournalpostPanelComponent);
