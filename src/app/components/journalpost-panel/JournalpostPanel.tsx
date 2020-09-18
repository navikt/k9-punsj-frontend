import { IJournalpost } from '../../models/types';
import Panel from 'nav-frontend-paneler';
import FlexRow from '../flexgrid/FlexRow';
import LabelValue from '../skjema/LabelValue';
import React from 'react';
import './journalpostPanel.less';

export interface IJournalpostPanelProps {
  journalpost: IJournalpost;
}

const JournalpostPanel: React.FunctionComponent<IJournalpostPanelProps> = ({
  journalpost,
}) => {
  return (
    <Panel border={true} className={'journalpostpanel'}>
      <FlexRow childrenMargin={'medium'}>
        <LabelValue
          labelTextId="journalpost.id"
          value={journalpost.journalpostId}
          retning="horisontal"
        />
        <LabelValue
          labelTextId="journalpost.norskIdent"
          value={journalpost.norskIdent}
          retning="horisontal"
        />
      </FlexRow>
    </Panel>
  );
};

export default JournalpostPanel;
