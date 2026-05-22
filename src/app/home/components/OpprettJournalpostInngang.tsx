import React from 'react';

import { BodyLong, Button, Heading } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

const OpprettJournalpostInngang = () => {
    return (
        <div className="flex flex-col items-center p-[2.875rem_5.25rem] bg-[#e6f0ff] max-w-[37.5rem]">
            <Heading size="xlarge" level="1" className="pt-6 pb-6">
                <FormattedMessage id="opprettJournalpostInngang.header" />
            </Heading>

            <BodyLong>
                <FormattedMessage id="opprettJournalpostInngang.ingress" />
            </BodyLong>

            <div className="mt-12">
                <Button as={Link} to="/opprett-journalpost" data-testid="opprett-journalpost-inngang">
                    <FormattedMessage id="opprettJournalpostInngang.link" />
                </Button>
            </div>
        </div>
    );
};
export default OpprettJournalpostInngang;
