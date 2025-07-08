import React from 'react';

import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import { BodyLong, Heading } from '@navikt/ds-react';

const SendBrevIAvsluttetSakInngang = () => {
    return (
        <div className="flex flex-col items-center p-[2.875rem_5.25rem] bg-[#fff9f0] max-w-[37.5rem]">
            <Heading size="xlarge" level="1" className="pt-6 pb-6">
                <FormattedMessage id="sendBrevIAvsluttetSakInngang.header" />
            </Heading>

            <BodyLong>
                <FormattedMessage id="sendBrevIAvsluttetSakInngang.ingress" />
            </BodyLong>

            <div className="mt-12">
                <Link
                    className="navds-button navds-button--primary navds-button--medium"
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
