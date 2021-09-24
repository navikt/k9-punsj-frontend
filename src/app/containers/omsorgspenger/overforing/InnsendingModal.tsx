import React from 'react';
import classNames from 'classnames';
import { Element, Undertittel } from 'nav-frontend-typografi';
import { FormattedMessage, useIntl } from 'react-intl';
import NavFrontendSpinner from 'nav-frontend-spinner';
import Lenke from 'nav-frontend-lenker';
import ModalWrapper from 'nav-frontend-modal';
import intlHelper from '../../../utils/intlUtils';
import { Innsendingsstatus } from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import VerticalSpacer from '../../../components/VerticalSpacer';
import CheckSvg from '../../../assets/SVG/CheckSVG';
import { IError } from '../../../models/types';
import './innsendingModal.less';
import KryssSVG from '../../../assets/SVG/KryssSVG';
import { getEnvironmentVariable } from '../../../utils';

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
            contentLabel={intlHelper(intl, 'omsorgsdager.overføring.punch.modal.beskrivelse')}
            isOpen={vis}
            className={classNames('innsendingsmodal', {
                'innsendingsmodal--success': innsendingsstatus === Innsendingsstatus.SendtInn,
                'innsendingsmodal--sender': innsendingsstatus === Innsendingsstatus.SenderInn,
                'innsendingsmodal--feil': innsendingsstatus === Innsendingsstatus.Innsendingsfeil,
            })}
            closeButton={innsendingsstatus === Innsendingsstatus.Innsendingsfeil}
            shouldCloseOnOverlayClick
        >
            <>
                {innsendingsstatus === Innsendingsstatus.SenderInn && (
                    <>
                        <VerticalSpacer sixteenPx />
                        <div role="status">
                            <NavFrontendSpinner className="innsendingsmodal_ikon" />
                        </div>
                        <VerticalSpacer sixteenPx />
                        <Undertittel tag="h1">
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.senderInn" />
                        </Undertittel>
                    </>
                )}
                {innsendingsstatus === Innsendingsstatus.SendtInn && (
                    <>
                        <VerticalSpacer sixteenPx />
                        <CheckSvg title={<FormattedMessage id="check.svg.title" />} className="innsendingsmodal_ikon" />
                        <VerticalSpacer sixteenPx />
                        <Undertittel tag="h1">
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.sendtInn" />
                        </Undertittel>
                        <VerticalSpacer sixteenPx />
                        <Lenke href={getEnvironmentVariable('K9_LOS_URL')}>
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.success.gåTilLos" />
                        </Lenke>
                    </>
                )}
                {innsendingsstatus === Innsendingsstatus.Innsendingsfeil && (
                    <>
                        <VerticalSpacer sixteenPx />
                        <KryssSVG type="filled" farge="#A13A28" className="innsendingsmodal_ikon" />
                        <VerticalSpacer sixteenPx />
                        <Undertittel tag="h1">
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.feil.overskrift" />
                        </Undertittel>
                        <VerticalSpacer eightPx />
                        <div>
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.feil.prøvigjen" />
                        </div>
                        <VerticalSpacer sixteenPx />
                        <Lenke href={getEnvironmentVariable('K9_LOS_URL')}>
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.success.gåTilLos" />
                        </Lenke>
                        <VerticalSpacer twentyPx />
                        <Element>
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.feil.detaljer" />
                        </Element>
                        <Element>{innsendingsfeil?.exceptionId || JSON.stringify(innsendingsfeil)}</Element>
                    </>
                )}
            </>
        </ModalWrapper>
    );
};

export default InnsendingModal;
