import Panel from 'nav-frontend-paneler';
import React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { IFordelingState, IJournalpost } from '../../models/types';
import { IIdentState } from '../../models/types/IdentState';
import { RootStateType } from '../../state/RootState';
import intlHelper from '../../utils/intlUtils';
import FlexRow from '../flexgrid/FlexRow';
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
        identState: { ident1, ident2, barn },
        journalposter,
    } = props;

    return (
        <Panel border className="journalpostpanel">
            <FlexRow wrap childrenMargin="medium">
                <LabelValue
                    labelTextId="journalpost.id"
                    value={journalposter?.join(', ') || journalpost?.journalpostId}
                    retning="horisontal"
                />

                {fordelingState.erIdent1Bekreftet && (
                    <LabelValue
                        labelTextId="journalpost.norskIdent"
                        value={
                            ident1 || journalpost?.norskIdent || intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')
                        }
                        retning="horisontal"
                        visKopier
                    />
                )}
                {!!ident2 && (
                    <LabelValue
                        labelTextId="journalpost.ident2"
                        value={ident2 || intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')}
                        retning="horisontal"
                    />
                )}
                {!!barn.length && (
                    <LabelValue
                        labelTextId="journalpost.barn"
                        value={barn.map((personvalg) => personvalg.identitetsnummer).join(', ')}
                    />
                )}
            </FlexRow>
        </Panel>
    );
};

const mapStateToProps = (state: RootStateType): IJournalpostPanelStateProps => ({
    identState: state.identState,
    journalpost: state.felles.journalpost,
    fordelingState: state.fordelingState,
});

export const JournalpostPanel = injectIntl(connect(mapStateToProps)(JournalpostPanelComponent));
