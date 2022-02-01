import { Knapp } from 'nav-frontend-knapper';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import FeilCircleSvg from '../../assets/SVG/FeilCircleSVG';
import intlHelper from '../../utils/intlUtils';
import './okGaaTilLosModal.less';

export interface IFerdigstillJournalpostErrorModalProps {
    close: () => void;
}

const FerdigstillJournalpostErrorModal = (props: WrappedComponentProps & IFerdigstillJournalpostErrorModalProps) => {
    const { intl, close } = props;

    return (
        <div>
            <FeilCircleSvg title="check" />
            <div className="infoFeil">{intlHelper(intl, 'modal.ferdigstilljournalpost.feil')}</div>
            <Knapp mini onClick={() => close()}>
                {intlHelper(intl, 'modal.ferdigstilljournalpost.ok')}
            </Knapp>
        </div>
    );
};

export default injectIntl(FerdigstillJournalpostErrorModal);
