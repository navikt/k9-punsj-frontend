import { ExternalLink } from '@navikt/ds-icons';
import { Button, Link } from '@navikt/ds-react';
import { getModiaPath } from 'app/utils';
import Panel from 'nav-frontend-paneler';
import React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
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
        identState: { ident1, ident2 },
        journalposter,
    } = props;

    const ident = ident1 || journalpost?.norskIdent;
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
                {fordelingState.erIdent1Bekreftet && (
                    <div>
                        <LabelValue
                            labelTextId="journalpost.norskIdent"
                            value={
                                ident1 ||
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
                {!!ident2 && (
                    <LabelValue
                        labelTextId="journalpost.ident2"
                        value={ident2 || intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')}
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
