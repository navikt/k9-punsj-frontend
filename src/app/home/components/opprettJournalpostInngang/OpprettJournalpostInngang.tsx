import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { BodyLong } from '@navikt/ds-react';

import './opprettJournalpostInngang.less';

const OpprettJournalpostInngang = () => {
    const intl = useIntl();
    return (
        <div className="opprettJournalpostInngang">
            <div className="content">
                <h1 className="heading">Opprett journalpost</h1>
                <BodyLong>{intl.formatMessage({ id: 'OpprettJournalpostInngang.ingress' })}</BodyLong>
                <Link
                    className="linkButton navds-button navds-button--primary navds-button--medium"
                    to="/opprett-journalpost"
                    data-testid="opprett-journalpost-inngang"
                >
                    {intl.formatMessage({ id: 'OpprettJournalpostInngang.link' })}
                </Link>
            </div>
        </div>
    );
};
export default OpprettJournalpostInngang;
