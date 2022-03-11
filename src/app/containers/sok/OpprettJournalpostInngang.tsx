import { Ingress } from 'nav-frontend-typografi';
import React from 'react';
import { Link } from 'react-router-dom';
import './opprettJournalpostInngang.less';

const OpprettJournalpostInngang = () => (
    <div className="opprettJournalpostInngang">
        <div className="content">
            <h1 className="heading">Opprett journalpost</h1>
            <Ingress>
                Skal du punsje arbeidsforhold eller gjøre rettelser i punsj, kan du opprette ny journalpost her.
            </Ingress>
            <Link
                className="linkButton knapp knapp--hoved"
                to="/opprett-journalpost"
                data-testid="opprett-journalpost-inngang"
            >
                Opprett journalpost
            </Link>
        </div>
    </div>
);

export default OpprettJournalpostInngang;
