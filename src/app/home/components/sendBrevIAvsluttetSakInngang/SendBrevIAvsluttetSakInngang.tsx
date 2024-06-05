import React from 'react';
import { useIntl } from 'react-intl';
import { Link } from 'react-router-dom';

import { BodyLong } from '@navikt/ds-react';

import './sendBrevIAvsluttetSakInngang.less';

const SendBrevIAvsluttetSakInngang = () => {
    const intl = useIntl();
    return (
        <div className="sendBrevIAvsluttetSakInngang">
            <div className="content">
                <h1 className="heading">{intl.formatMessage({ id: 'SendBrevIAvsluttetSakInngang.heading' })}</h1>
                <BodyLong>{intl.formatMessage({ id: 'SendBrevIAvsluttetSakInngang.ingress' })}</BodyLong>
                <Link
                    className="linkButton navds-button navds-button--primary navds-button--medium"
                    to="/brev-avsluttet-sak"
                    data-testid="brev-avsluttet-sak-inngang"
                >
                    {intl.formatMessage({ id: 'SendBrevIAvsluttetSakInngang.link' })}
                </Link>
            </div>
        </div>
    );
};
export default SendBrevIAvsluttetSakInngang;
