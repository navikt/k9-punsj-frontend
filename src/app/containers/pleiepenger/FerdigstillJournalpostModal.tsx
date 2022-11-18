import { Button } from '@navikt/ds-react';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import intlHelper from '../../utils/intlUtils';
import './okGaaTilLosModal.less';

interface IFerdigstillJournalpostModalProps {
    submit: () => void;
    avbryt: () => void;
}

const FerdigstillJournalpostModal: React.FC<WrappedComponentProps & IFerdigstillJournalpostModalProps> = (props) => {
    const { intl, submit, avbryt, children } = props;

    return (
        <div className="ferdigstillJournalpost">
            <h2>{intlHelper(intl, 'skjema.knapp.ferdigstillJournalpost')}</h2>
            {children}
            <div className="knapper">
                <Button variant="secondary" onClick={() => submit()} size="small">
                    {intlHelper(intl, 'skjema.knapp.ferdigstillJournalpost')}
                </Button>
                <Button variant="secondary" onClick={() => avbryt()} size="small">
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Button>
            </div>
        </div>
    );
};

export default injectIntl(FerdigstillJournalpostModal);
