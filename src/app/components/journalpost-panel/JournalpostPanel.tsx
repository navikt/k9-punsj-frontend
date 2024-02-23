import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { ExternalLink } from '@navikt/ds-icons';
import { Link, Panel } from '@navikt/ds-react';

import { Sakstype } from 'app/models/enums';
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
            <LabelValue
                labelTextId="journalpost.id"
                value={journalposter?.join(', ') || journalpost?.journalpostId}
                retning="horisontal"
            />

            {(fordelingState.erSøkerIdBekreftet || journalpost?.erFerdigstilt) && (
                <>
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
                </>
            )}

            {(!!fordelingState.fagsak?.sakstype || !!journalpost?.sak?.sakstype) && (
                <LabelValue
                    labelTextId="journalpost.sakstype"
                    value={finnVisningsnavnForSakstype(
                        fordelingState.fagsak?.sakstype || journalpost?.sak?.sakstype || '',
                    )}
                    retning="horisontal"
                />
            )}

            {pleietrengendeId && (
                <LabelValue
                    labelTextId={
                        fordelingState.sakstype === Sakstype.PLEIEPENGER_I_LIVETS_SLUTTFASE
                            ? 'journalpost.pleietrengendeId'
                            : 'journalpost.barnetsId'
                    }
                    value={pleietrengendeId || intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')}
                    retning="horisontal"
                />
            )}

            {annenPart && <LabelValue labelTextId="journalpost.annenPart" value={annenPart} retning="horisontal" />}

            {(fordelingState.fagsak?.fagsakId || journalpost?.sak?.fagsakId) && (
                <LabelValue
                    labelTextId="journalpost.saksnummer"
                    value={
                        fordelingState.fagsak?.reservertSaksnummer || journalpost?.sak?.reservertSaksnummer
                            ? `${fordelingState.fagsak?.fagsakId || journalpost?.sak?.fagsakId} (reservert)`
                            : fordelingState.fagsak?.fagsakId || journalpost?.sak?.fagsakId
                    }
                    retning="horisontal"
                />
            )}
            {journalpost?.sak?.behandlingsÅr && (
                <LabelValue
                    labelTextId="journalpost.behandlingsÅr"
                    value={journalpost?.sak?.behandlingsÅr}
                    retning="horisontal"
                />
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
