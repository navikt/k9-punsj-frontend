import { Knapp } from 'nav-frontend-knapper';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import intlHelper from '../../utils/intlUtils';
import './okGaaTilLosModal.less';

interface IFeilregistrerJournalpostModalProps {
    submit: () => void;
    avbryt: () => void;
}

const FeilregistrerJournalpostModal = (props: WrappedComponentProps & IFeilregistrerJournalpostModalProps) => {
    const { intl, submit, avbryt } = props;

    return (
        <div className="feilregistrerJournalpost">
            <h2>{intlHelper(intl, 'skjema.knapp.feilregistrerJournalpost')}</h2>
            <div className="knapper">
                <Knapp onClick={() => submit()} mini>
                    {intlHelper(intl, 'skjema.knapp.feilregistrerJournalpost')}
                </Knapp>
                <Knapp onClick={() => avbryt()} mini>
                    {intlHelper(intl, 'skjema.knapp.avbryt')}
                </Knapp>
            </div>
        </div>
    );
};

export default injectIntl(FeilregistrerJournalpostModal);
