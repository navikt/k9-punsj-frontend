import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { BodyLong, Heading } from '@navikt/ds-react';

import './opprettJournalpostInngang.less';

const OpprettJournalpostInngang = () => {
    return (
        <div className="opprettJournalpostInngang">
            <div className="content">
                <Heading size="xlarge" level="1" className="heading">
                    <FormattedMessage id="opprettJournalpostInngang.header" />
                </Heading>

                <BodyLong>
                    <FormattedMessage id={'opprettJournalpostInngang.ingress'} />
                </BodyLong>

                <Link
                    className="linkButton navds-button navds-button--primary navds-button--medium"
                    to="/opprett-journalpost"
                    data-testid="opprett-journalpost-inngang"
                >
                    <FormattedMessage id="opprettJournalpostInngang.link" />
                </Link>
            </div>
        </div>
    );
};
export default OpprettJournalpostInngang;
