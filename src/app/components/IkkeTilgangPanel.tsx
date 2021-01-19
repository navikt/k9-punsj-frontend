import React from "react";
import {Undertittel} from "nav-frontend-typografi";
import Panel from "nav-frontend-paneler";
import {FormattedMessage} from "react-intl";


const IkkeTilgangPanel = () => (
    <Panel className="container">
        <Undertittel>
            <FormattedMessage id="journalpost.ikketilgang" />
        </Undertittel>
    </Panel>
);

export default IkkeTilgangPanel;
