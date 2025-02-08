import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { BodyLong, Heading } from '@navikt/ds-react';

import './sendBrevIAvsluttetSakInngang.less';

const SendBrevIAvsluttetSakInngang = () => {
    return (
        <div className="sendBrevIAvsluttetSakInngang">
            <div className="content">
                <Heading size="xlarge" level="1" className="heading">
                    <FormattedMessage id="sendBrevIAvsluttetSakInngang.header" />
                </Heading>

                <BodyLong>
                    <FormattedMessage id="sendBrevIAvsluttetSakInngang.ingress" />
                </BodyLong>

                <Link
                    className="linkButton navds-button navds-button--primary navds-button--medium"
                    to="/brev-avsluttet-sak"
                    data-testid="brev-avsluttet-sak-inngang"
                >
                    <FormattedMessage id="sendBrevIAvsluttetSakInngang.link" />
                </Link>
            </div>
        </div>
    );
};

export default SendBrevIAvsluttetSakInngang;
