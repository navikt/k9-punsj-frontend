import Panel from 'nav-frontend-paneler';
import FlexRow from '../flexgrid/FlexRow';
import LabelValue from '../skjema/LabelValue';
import React from 'react';
import './journalpostPanel.less';
import intlHelper from '../../utils/intlUtils';
import { WrappedComponentProps, injectIntl} from 'react-intl';
import {IIdentState} from "../../models/types/IdentState";
import {RootStateType} from "../../state/RootState";
import {connect} from "react-redux";
import {IJournalpost} from "../../models/types";

export interface IJournalpostPanelStateProps {
    journalpost?: IJournalpost;
    identState: IIdentState;
}

class JournalpostPanelComponent extends React.Component<WrappedComponentProps & IJournalpostPanelStateProps> {
    render() {

        const { intl, journalpost } = this.props;
        const { ident1, ident2 } = this.props.identState;

        return (
            <Panel border={true} className={'journalpostpanel'}>
                <FlexRow childrenMargin={'medium'}>
                    <LabelValue
                        labelTextId="journalpost.id"
                        value={journalpost?.journalpostId}
                        retning="horisontal"
                    />
                    <LabelValue
                        labelTextId="journalpost.norskIdent"
                        value={ ident1 ? ident1 : journalpost?.norskIdent ||
                            intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')
                        }
                        retning="horisontal"
                    />
                    {!!ident2 &&
                    <LabelValue
                        labelTextId="journalpost.ident2"
                        value={
                            ident2 ||
                            intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')
                        }
                        retning="horisontal"
                    />}
                </FlexRow>
            </Panel>
        );
    }
};

const mapStateToProps = (state: RootStateType): IJournalpostPanelStateProps => ({
    identState: state.identState,
    journalpost: state.felles.journalpost
});

const JournalpostPanel =  injectIntl(
    connect(mapStateToProps)(JournalpostPanelComponent));

export { JournalpostPanel, JournalpostPanelComponent };
