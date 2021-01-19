import React, {FunctionComponent} from "react";
import {Undertittel} from "nav-frontend-typografi";
import Panel from "nav-frontend-paneler";
import {FormattedMessage} from "react-intl";

export interface IFeilmeldingPanel {
    messageId: string
}

const FeilmeldingPanel:FunctionComponent<IFeilmeldingPanel> = ({messageId}) => (
    <Panel className="container">
        <Undertittel>
            <FormattedMessage id={messageId} />
        </Undertittel>
    </Panel>
);

export default FeilmeldingPanel;
