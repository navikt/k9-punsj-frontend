import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Button } from '@navikt/ds-react';

import './ferdigstillJournalpostModal.less';

interface Props {
    submit: () => void;
    avbryt: () => void;
    children?: React.ReactNode;
}

const OpprettOppgaveIGosysModal: React.FC<Props> = ({ submit, avbryt, children }: Props) => {
    return (
        <div className="ferdigstillJournalpost">
            <h2>
                <FormattedMessage id={'fordeling.sakstype.ANNET'} />
            </h2>
            {children}
            <div className="knapper">
                <Button variant="secondary" onClick={() => submit()} size="small">
                    <FormattedMessage id={'fordeling.sakstype.ANNET'} />
                </Button>
                <Button variant="secondary" onClick={() => avbryt()} size="small">
                    <FormattedMessage id={'skjema.knapp.avbryt'} />
                </Button>
            </div>
        </div>
    );
};

export default OpprettOppgaveIGosysModal;
