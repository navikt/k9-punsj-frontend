import { Ingress } from 'nav-frontend-typografi';
import React from 'react';
import { Link } from 'react-router-dom';
import './sendBrevIAvsluttetSakInngang.less';
import { useIntl } from 'react-intl';

const SendBrevIAvsluttetSakInngang = () => {
    const intl = useIntl();
    return (
        <div className="sendBrevIAvsluttetSakInngang">
            <div className="content">
                <h1 className="heading">{intl.formatMessage({ id: 'SendBrevIAvsluttetSakInngang.heading' })}</h1>
                <Ingress>{intl.formatMessage({ id: 'SendBrevIAvsluttetSakInngang.ingress' })}</Ingress>
                <Link
                    className="linkButton knapp knapp--hoved"
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
