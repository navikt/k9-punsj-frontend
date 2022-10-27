import React from 'react';
import { IntlShape } from 'react-intl';
import classNames from 'classnames';

import { Hovedknapp, Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';

import intlHelper from 'app/utils/intlUtils';

type OwnProps = {
    children: JSX.Element | null;
    videre: () => void;
    avbryt: () => void;
    intl: IntlShape;
};

const ForhaandsvisSoeknadModal = ({ videre, avbryt, intl, children }: OwnProps) => (
    <ModalWrapper
        key="validertSoknadModal"
        className="validertSoknadModal"
        onRequestClose={avbryt}
        contentLabel="validertSoknadModal"
        closeButton={false}
        isOpen
    >
        <div className={classNames('validertSoknadOppsummeringContainer')}>{children}</div>
        <div className={classNames('validertSoknadOppsummeringContainerKnapper')}>
            <Hovedknapp mini className="validertSoknadOppsummeringContainer_knappVidere" onClick={videre}>
                {intlHelper(intl, 'fordeling.knapp.videre')}
            </Hovedknapp>
            <Knapp mini className="validertSoknadOppsummeringContainer_knappTilbake" onClick={avbryt}>
                {intlHelper(intl, 'skjema.knapp.avbryt')}
            </Knapp>
        </div>
    </ModalWrapper>
);

export default ForhaandsvisSoeknadModal;
