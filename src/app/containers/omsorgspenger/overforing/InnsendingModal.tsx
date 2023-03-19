import classNames from 'classnames';
import Lenke from 'nav-frontend-lenker';
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Heading, Label, Loader, Modal } from '@navikt/ds-react';

import CheckSvg from '../../../assets/SVG/CheckSVG';
import KryssSVG from '../../../assets/SVG/KryssSVG';
import VerticalSpacer from '../../../components/VerticalSpacer';
import { Innsendingsstatus } from '../../../models/forms/omsorgspenger/overføring/PunchSkjema';
import { IError } from '../../../models/types';
import { getEnvironmentVariable } from '../../../utils';
import intlHelper from '../../../utils/intlUtils';
import './innsendingModal.less';

interface IInnsendingModalProps {
    innsendingsstatus: Innsendingsstatus;
    vis: boolean;
    onClose: () => void;
    innsendingsfeil?: IError;
}

const InnsendingModal: React.FunctionComponent<IInnsendingModalProps> = ({
    innsendingsstatus,
    vis,
    onClose,
    innsendingsfeil,
}) => {
    const intl = useIntl();
    return (
        <Modal
            onClose={onClose}
            aria-label={intlHelper(intl, 'omsorgsdager.overføring.punch.modal.beskrivelse')}
            open={vis}
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
                            <Loader className="innsendingsmodal_ikon" />
                        </div>
                        <VerticalSpacer sixteenPx />
                        <Heading size="small" level="1">
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.senderInn" />
                        </Heading>
                    </>
                )}
                {innsendingsstatus === Innsendingsstatus.SendtInn && (
                    <>
                        <VerticalSpacer sixteenPx />
                        <CheckSvg title={<FormattedMessage id="check.svg.title" />} className="innsendingsmodal_ikon" />
                        <VerticalSpacer sixteenPx />
                        <Heading size="small" level="1">
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.sendtInn" />
                        </Heading>
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
                        <Heading size="small" level="1">
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.feil.overskrift" />
                        </Heading>
                        <VerticalSpacer eightPx />
                        <div>
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.feil.prøvigjen" />
                        </div>
                        <VerticalSpacer sixteenPx />
                        <Lenke href={getEnvironmentVariable('K9_LOS_URL')}>
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.success.gåTilLos" />
                        </Lenke>
                        <VerticalSpacer twentyPx />
                        <Label size="small">
                            <FormattedMessage id="omsorgsdager.overføring.punch.modal.feil.detaljer" />
                        </Label>
                        <Label size="small">{innsendingsfeil?.exceptionId || JSON.stringify(innsendingsfeil)}</Label>
                    </>
                )}
            </>
        </Modal>
    );
};

export default InnsendingModal;
