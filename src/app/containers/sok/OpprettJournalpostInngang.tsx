import { Ingress } from 'nav-frontend-typografi';
import React from 'react';
import { Link } from 'react-router-dom';
import './opprettJournalpostInngang.less';
import { useIntl } from 'react-intl';

const OpprettJournalpostInngang = () => {
    const intl = useIntl();
    return (
        <div className="opprettJournalpostInngang">
            <div className="content">
                <h1 className="heading">Opprett journalpost</h1>
                <Ingress>{intl.formatMessage({ id: 'OpprettJournalpostInngang.ingress' })}</Ingress>
                <Link
                    className="linkButton knapp knapp--hoved"
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
