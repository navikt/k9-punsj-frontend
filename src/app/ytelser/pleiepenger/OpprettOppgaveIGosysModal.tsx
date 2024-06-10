import React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';

import { Button } from '@navikt/ds-react';

import intlHelper from '../../utils/intlUtils';
import './settPaaVentModal.less';

interface OpprettOppgaveIGosysModalProps {
    submit: () => void;
    avbryt: () => void;
    children?: React.ReactNode;
}

const OpprettOppgaveIGosysModal: React.FC<WrappedComponentProps & OpprettOppgaveIGosysModalProps> = (props) => {
    const { intl, submit, avbryt, children } = props;

    return (
        <div className="ferdigstillJournalpost">
            <h2>{intlHelper(intl, 'fordeling.sakstype.ANNET')}</h2>
            {children}
            <div className="knapper">
                <Button variant="secondary" onClick={() => submit()} size="small">
                    {intlHelper(intl, 'fordeling.sakstype.ANNET')}
                </Button>
                <Button variant="secondary" onClick={() => avbryt()} size="small">
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Button>
            </div>
        </div>
    );
};

export default injectIntl(OpprettOppgaveIGosysModal);
