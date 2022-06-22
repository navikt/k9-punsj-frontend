import { ErrorMessage, Heading, Loader, Select, TextField } from '@navikt/ds-react';
import { finnFagsaker } from 'app/api/api';
import BrevComponent from 'app/components/brev/BrevComponent';
import Fagsak from 'app/types/Fagsak';
import { finnVisningsnavnForSakstype } from 'app/utils';
import React, { useState } from 'react';
import { useIntl } from 'react-intl';
import './sendBrevIAvsluttetSak.less';

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

    const sakstypeForValgtFagsak = () => {
        if (fagsaker?.length > 0 && valgtFagsak) {
            const fagsak = fagsaker.find((fsak) => fsak.fagsakId === valgtFagsak);
            return fagsak?.sakstype || '';
        }
        return '';
    };

    return (
        <div className="sendBrevIAvsluttetSak">
            <Heading size="small" level="1">
                Send brev i avsluttet sak
            </Heading>

            <TextField
                className="fnrInput"
                label={intl.formatMessage({ id: 'SendBrevIAvsluttetSak.søkersFødselsnummer' })}
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
                            {`${fagsakId} (K9 ${finnVisningsnavnForSakstype(sakstype)})`}
                        </option>
                    ))}
                </Select>
                {isFetchingFagsaker && <Loader variant="neutral" size="small" title="venter..." />}
            </div>
            {henteFagsakFeilet && (
                <ErrorMessage>
                    {intl.formatMessage({
                        id: 'SendBrevIAvsluttetSak.hentingAvFagsakFeilet',
                    })}
                </ErrorMessage>
            )}
            {valgtFagsak && (
                <BrevComponent søkerId={søkerId} fagsakId={valgtFagsak} sakstype={sakstypeForValgtFagsak()} />
            )}
        </div>
    );
};

export default SendBrevIAvsluttetSak;
