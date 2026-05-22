import React from 'react';

import { BodyLong, Button, Heading } from '@navikt/ds-react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

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
                <Button as={Link} to="/brev-avsluttet-sak" data-testid="brev-avsluttet-sak-inngang">
                    <FormattedMessage id="sendBrevIAvsluttetSakInngang.link" />
                </Button>
            </div>
        </div>
    );
};

export default SendBrevIAvsluttetSakInngang;
