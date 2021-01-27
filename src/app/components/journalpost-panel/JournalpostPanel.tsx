import Panel from 'nav-frontend-paneler';
import FlexRow from '../flexgrid/FlexRow';
import LabelValue from '../skjema/LabelValue';
import React from 'react';
import './journalpostPanel.less';
import intlHelper from '../../utils/intlUtils';
import { useIntl } from 'react-intl';

export interface IJournalpostPanelProps {
  journalpostId: string;
  identitetsnummer?: string;
}

const JournalpostPanel: React.FunctionComponent<IJournalpostPanelProps> = ({
  journalpostId,
  identitetsnummer,
}) => {
  const intl = useIntl();
  return (
    <Panel border={true} className={'journalpostpanel'}>
      <FlexRow childrenMargin={'medium'}>
          {journalpostId !== 'rediger' &&
        <LabelValue
          labelTextId="journalpost.id"
          value={journalpostId}
          retning="horisontal"
        />}
        <LabelValue
          labelTextId="journalpost.norskIdent"
          value={
            identitetsnummer ||
            intlHelper(intl, 'journalpost.norskIdent.ikkeOppgitt')
          }
          retning="horisontal"
        />
      </FlexRow>
    </Panel>
  );
};

export default JournalpostPanel;
