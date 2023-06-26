import React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';

import { ExternalLink } from '@navikt/ds-icons';
import { Link, Panel } from '@navikt/ds-react';

import { getModiaPath } from 'app/utils';

import { IFordelingState, IJournalpost } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import intlHelper from '../../utils/intlUtils';
import LabelValue from '../skjema/LabelValue';
import './journalpostPanel.less';

export interface IJournalpostPanelStateProps {
    journalpost?: IJournalpost;
    identState: IIdentState;
    fordelingState: IFordelingState;
}

interface IJournalpostComponentStateProps {
    journalposter?: string[];
}

export const JournalpostPanelComponent: React.FunctionComponent<
    WrappedComponentProps & IJournalpostPanelStateProps & IJournalpostComponentStateProps
> = (props) => {
    const {
        intl,
        journalpost,
        fordelingState,
        identState: { søkerId, pleietrengendeId },
        journalposter,
    } = props;

    const ident = søkerId || journalpost?.norskIdent;
    const modiaPath = getModiaPath(ident);

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
                {fordelingState.erSøkerIdBekreftet && (
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
                {!!pleietrengendeId && (
                    <LabelValue
                        labelTextId="journalpost.pleietrengendeId"
                        value={pleietrengendeId || intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')}
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

export const JournalpostPanel = injectIntl(connect(mapStateToProps)(JournalpostPanelComponent));
