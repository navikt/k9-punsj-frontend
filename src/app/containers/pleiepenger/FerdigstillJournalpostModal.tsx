import { Knapp } from 'nav-frontend-knapper';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import intlHelper from '../../utils/intlUtils';
import './okGaaTilLosModal.less';

interface IFerdigstillJournalpostModalProps {
    submit: () => void;
    avbryt: () => void;
}

const FerdigstillJournalpostModal = (props: WrappedComponentProps & IFerdigstillJournalpostModalProps) => {
    const { intl, submit, avbryt } = props;

    return (
        <div className="ferdigstillJournalpost">
            <h2>{intlHelper(intl, 'skjema.knapp.ferdigstillJournalpost')}</h2>
            <div className="knapper">
                <Knapp onClick={() => submit()} mini>
                    {intlHelper(intl, 'skjema.knapp.ferdigstillJournalpost')}
                </Knapp>
                <Knapp onClick={() => avbryt()} mini>
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Knapp>
            </div>
        </div>
    );
};

export default injectIntl(FerdigstillJournalpostModal);
