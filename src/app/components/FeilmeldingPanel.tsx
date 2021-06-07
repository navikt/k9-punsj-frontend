import React  from "react";
import {Undertittel} from "nav-frontend-typografi";
import Panel from "nav-frontend-paneler";
import {FormattedMessage} from "react-intl";

import './feilmeldingPanel.less'

export interface IFeilmeldingPanel {
    messageId: string
}

const FeilmeldingPanel: React.FunctionComponent<IFeilmeldingPanel> = ({messageId}) => (
    <Panel className="container">
        <Undertittel>
            <FormattedMessage id={messageId} />
        </Undertittel>
    </Panel>
);

export default FeilmeldingPanel;
