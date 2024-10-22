import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@navikt/ds-react';

import './ferdigstillJournalpostModal.less';

interface Props {
    submit: () => void;
    avbryt: () => void;
    children?: React.ReactNode;
}

const FerdigstillJournalpostModal: React.FC<Props> = ({ submit, avbryt, children }: Props) => {
    return (
        <div className="ferdigstillJournalpost">
            <h2>
                <FormattedMessage id={'skjema.knapp.ferdigstillJournalpost'} />
            </h2>
            {children}
            <div className="knapper">
                <Button variant="secondary" onClick={() => submit()} size="small">
                    <FormattedMessage id={'skjema.knapp.ferdigstillJournalpost'} />
                </Button>
                <Button variant="secondary" onClick={() => avbryt()} size="small">
                    <FormattedMessage id={'skjema.knapp.avbryt'} />
                </Button>
            </div>
        </div>
    );
};

export default FerdigstillJournalpostModal;
