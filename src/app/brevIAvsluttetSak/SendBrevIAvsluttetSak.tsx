import { ErrorMessage, Heading, Loader, Select, TextField } from '@navikt/ds-react';
import { finnFagsaker } from 'app/api/api';
import BrevComponent from 'app/components/brev/BrevComponent';
import Fagsak from 'app/types/Fagsak';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import './sendBrevIAvsluttetSak.less';

const formatSakstype = (sakstype?: string) => {
    if (sakstype === 'Omsorgspenger') {
        return 'OMP';
    }
    if (sakstype === 'Pleiepenger sykt barn') {
        return 'PSB';
    }
    if (sakstype === 'Pleiepenger livets sluttfase') {
        return 'PPN';
    }
    return sakstype || '';
};

const SendBrevIAvsluttetSak = () => {
    const [søkerId, setSøkerId] = useState('');
    const [henteFagsakFeilet, setHenteFagsakFeilet] = useState(false);
    const [isFetchingFagsaker, setIsFetchingFagsaker] = useState(false);
    const [fagsaker, setFagsaker] = useState<Fagsak[]>([]);
    const [valgtFagsak, setValgtFagsak] = useState('');
    const intl = useIntl();

    const hentFagsaker = (søkersFødselsnummer: string) => {
        setHenteFagsakFeilet(false);
        setIsFetchingFagsaker(true);
        finnFagsaker(søkersFødselsnummer, (response, data: Fagsak[]) => {
            setIsFetchingFagsaker(false);
            if (response.status === 200) {
                setFagsaker(data);
            } else {
                setHenteFagsakFeilet(true);
            }
        });
    };

    const sakstypeForValgtFagsak = formatSakstype(
        fagsaker?.length > 0 && valgtFagsak ? fagsaker.find((fagsak) => fagsak.fagsakId === valgtFagsak)?.sakstype : ''
    );

    return (
        <div className="sendBrevIAvsluttetSak">
            <Heading size="small" level="1">
                Send brev i avsluttet sak
            </Heading>

            <TextField
                className="fnrInput"
                label={intl.formatMessage({ id: 'SendBrevIAvsluttetSak.søkersFødselsnummer' })}
                // error={meta.touched && meta.error && <ErrorMessage name={field.name} />}
                maxLength={11}
                onChange={(event) => {
                    const { value } = event.target;
                    if (value.length === 11) {
                        hentFagsaker(value);
                        setSøkerId(value);
                    }
                }}
                size="medium"
            />
            <div className="fagsagSelectContainer">
                <Select
                    className="fagsakSelect"
                    label={intl.formatMessage({ id: 'SendBrevIAvsluttetSak.velgFagsak' })}
                    disabled={fagsaker.length === 0}
                    onChange={(event) => setValgtFagsak(event.target.value)}
                >
                    <option value="">{intl.formatMessage({ id: 'SendBrevIAvsluttetSak.velg' })}</option>
                    {fagsaker.map(({ fagsakId, sakstype }) => (
                        <option key={fagsakId} value={fagsakId}>
                            {`${fagsakId} (K9 ${sakstype})`}
                        </option>
                    ))}
                </Select>
                {isFetchingFagsaker && <Loader variant="neutral" size="xsmall" title="venter..." />}
                {henteFagsakFeilet && (
                    <ErrorMessage>
                        {intl.formatMessage({
                            id: 'SendBrevIAvsluttetSak.hentingAvFagsakFeilet',
                        })}
                    </ErrorMessage>
                )}
            </div>
            {valgtFagsak && (
                <BrevComponent søkerId={søkerId} fagsakId={valgtFagsak} sakstype={sakstypeForValgtFagsak} />
            )}
        </div>
    );
};

export default SendBrevIAvsluttetSak;
