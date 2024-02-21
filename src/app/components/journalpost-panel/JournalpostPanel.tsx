import React from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { ExternalLink } from '@navikt/ds-icons';
import { Link, Panel } from '@navikt/ds-react';

import { Sakstype } from 'app/models/enums';
import { getModiaPath } from 'app/utils';

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
            <div>
                {(fordelingState.erSøkerIdBekreftet || journalpost?.erFerdigstilt) && (
                    <div>
                        <LabelValue
                            labelTextId="journalpost.norskIdent"
                            value={
                                søkerId ||
                                journalpost?.norskIdent ||
                                intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')
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
            </div>
            <div>
                {fordelingState.fagsak?.sakstype && (
                    <LabelValue
                        labelTextId="journalpost.sakstype"
                        value={fordelingState.fagsak?.sakstype}
                        retning="horisontal"
                    />
                )}
            </div>

            <div>
                {pleietrengendeId && (
                    <LabelValue
                        labelTextId={
                            fordelingState.sakstype !== Sakstype.OMSORGSPENGER_ALENE_OM_OMSORGEN
                                ? 'journalpost.pleietrengendeId'
                                : 'journalpost.barnetsId'
                        }
                        value={pleietrengendeId || intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')}
                        retning="horisontal"
                    />
                )}
            </div>
            <div>
                {annenPart && <LabelValue labelTextId="journalpost.annenPart" value={annenPart} retning="horisontal" />}
            </div>
            <div>
                {fordelingState.fagsak?.fagsakId && (
                    <LabelValue
                        labelTextId="journalpost.saksnummer"
                        value={fordelingState.fagsak?.fagsakId}
                        retning="horisontal"
                    />
                )}
            </div>
        </Panel>
    );
};

const mapStateToProps = (state: RootStateType): IJournalpostPanelStateProps => ({
    identState: state.identState,
    journalpost: state.felles.journalpost,
    fordelingState: state.fordelingState,
});

export const JournalpostPanel = connect(mapStateToProps)(JournalpostPanelComponent);
