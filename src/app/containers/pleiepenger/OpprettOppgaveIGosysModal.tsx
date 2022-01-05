import { Knapp } from 'nav-frontend-knapper';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import intlHelper from '../../utils/intlUtils';
import './okGaaTilLosModal.less';

interface OpprettOppgaveIGosysModal {
    submit: () => void;
    avbryt: () => void;
}

const OpprettOppgaveIGosysModal: React.FC<WrappedComponentProps & OpprettOppgaveIGosysModal> = (props) => {
    const { intl, submit, avbryt, children } = props;

    return (
        <div className="ferdigstillJournalpost">
            <h2>{intlHelper(intl, 'fordeling.sakstype.ANNET')}</h2>
            {children}
            <div className="knapper">
                <Knapp onClick={() => submit()} mini>
                    {intlHelper(intl, 'fordeling.sakstype.ANNET')}
                </Knapp>
                <Knapp onClick={() => avbryt()} mini>
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Knapp>
            </div>
        </div>
    );
};

export default injectIntl(OpprettOppgaveIGosysModal);
