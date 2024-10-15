import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Button } from '@navikt/ds-react';
import FeilCircleSvg from '../../assets/SVG/FeilCircleSVG';

import './ferdigstillJournalpostModal.less';

interface Props {
    close: () => void;
}

const FerdigstillJournalpostErrorModal: React.FC<Props> = ({ close }: Props) => {
    return (
        <div>
            <FeilCircleSvg title="check" />
            <div className="infoFeil">
                <FormattedMessage id={'modal.ferdigstilljournalpost.feil'} />
            </div>
            <Button variant="secondary" size="small" onClick={() => close()}>
                <FormattedMessage id={'modal.ferdigstilljournalpost.ok'} />
            </Button>
        </div>
    );
};

export default FerdigstillJournalpostErrorModal;
