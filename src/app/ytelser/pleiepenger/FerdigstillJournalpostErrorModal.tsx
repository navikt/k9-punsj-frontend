import * as React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';

import { Button } from '@navikt/ds-react';

import FeilCircleSvg from '../../assets/SVG/FeilCircleSVG';
import intlHelper from '../../utils/intlUtils';
import './settPaaVentModal.less';

export interface IFerdigstillJournalpostErrorModalProps {
    close: () => void;
}

const FerdigstillJournalpostErrorModal = (props: WrappedComponentProps & IFerdigstillJournalpostErrorModalProps) => {
    const { intl, close } = props;

    return (
        <div>
            <FeilCircleSvg title="check" />
            <div className="infoFeil">{intlHelper(intl, 'modal.ferdigstilljournalpost.feil')}</div>
            <Button variant="secondary" size="small" onClick={() => close()}>
                {intlHelper(intl, 'modal.ferdigstilljournalpost.ok')}
            </Button>
        </div>
    );
};

export default injectIntl(FerdigstillJournalpostErrorModal);
