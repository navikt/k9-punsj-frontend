import React from 'react';
import intlHelper from '../../../utils/intlUtils';
import { Innsendingsstatus } from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import { Undertittel } from 'nav-frontend-typografi';
import { FormattedMessage, useIntl } from 'react-intl';
import VerticalSpacer from '../../../components/VerticalSpacer';
import FlexRow from '../../../components/flexgrid/FlexRow';
import NavFrontendSpinner from 'nav-frontend-spinner';
import CheckSvg from '../../../assets/SVG/CheckSVG';
import { NavLink } from 'react-router-dom';
import ModalWrapper from 'nav-frontend-modal';
import { IError } from '../../../models/types';

interface IInnsendingModalProps {
  innsendingsstatus: Innsendingsstatus;
  vis: boolean;
  onRequestClose: () => void;
  innsendingsfeil?: IError;
}

const InnsendingModal: React.FunctionComponent<IInnsendingModalProps> = ({
  innsendingsstatus,
  vis,
  onRequestClose,
  innsendingsfeil,
}) => {
  const intl = useIntl();
  return (
    <ModalWrapper
      onRequestClose={onRequestClose}
      contentLabel={intlHelper(
        intl,
        'omsorgsdager.overføring.punch.modal.beskrivelse'
      )}
      isOpen={vis}
      className="innsendingsmodal"
      closeButton={innsendingsstatus === Innsendingsstatus.Innsendingsfeil}
      shouldCloseOnOverlayClick={true}
    >
      <>
        <Undertittel tag="h2">
          <FormattedMessage id="omsorgsdager.overføring.punch.modal.tittel" />
        </Undertittel>
        <VerticalSpacer sixteenPx={true} />
        {innsendingsstatus === Innsendingsstatus.SenderInn && (
          <FlexRow childrenMargin="small" alignItemsToCenter={true}>
            <NavFrontendSpinner />
            <span>
              <FormattedMessage id="omsorgsdager.overføring.punch.modal.senderInn" />
            </span>
          </FlexRow>
        )}
        {innsendingsstatus === Innsendingsstatus.SendtInn && (
          <>
            <FlexRow childrenMargin="small" alignItemsToCenter={true}>
              <CheckSvg title={<FormattedMessage id="check.svg.title" />} />
              <span>
                <FormattedMessage id="omsorgsdager.overføring.punch.modal.sendtInn" />
              </span>
            </FlexRow>
            <VerticalSpacer sixteenPx={true} />
            <NavLink to={'#'}>
              <FormattedMessage id="omsorgsdager.overføring.punch.modal.success.gåTilLos" />
            </NavLink>
          </>
        )}
        {innsendingsstatus === Innsendingsstatus.Innsendingsfeil && (
          <>
            <FormattedMessage id="omsorgsdager.overføring.punch.modal.feil" />
            <VerticalSpacer sixteenPx={true} />
            {JSON.stringify(innsendingsfeil)}
          </>
        )}
      </>
    </ModalWrapper>
  );
};

export default InnsendingModal;
