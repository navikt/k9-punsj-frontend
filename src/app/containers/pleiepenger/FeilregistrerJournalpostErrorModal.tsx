import { Knapp } from 'nav-frontend-knapper';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import FeilCircleSvg from '../../assets/SVG/FeilCircleSVG';
import intlHelper from '../../utils/intlUtils';
import './okGaaTilLosModal.less';

export interface IFeilregistrerJournalpostErrorModalProps {
    close: () => void;
}

const FeilregistrerJournalpostErrorModal = (
    props: WrappedComponentProps & IFeilregistrerJournalpostErrorModalProps
) => {
    const { intl, close } = props;

    return (
        <div>
            <FeilCircleSvg title="check" />
            <div className="infoFeil">{intlHelper(intl, 'modal.feilregistrerjournalpost.feil')}</div>
            <Knapp mini onClick={() => close()}>
                {intlHelper(intl, 'modal.feilregistrerjournalpost.ok')}
            </Knapp>
        </div>
    );
};

export default injectIntl(FeilregistrerJournalpostErrorModal);
