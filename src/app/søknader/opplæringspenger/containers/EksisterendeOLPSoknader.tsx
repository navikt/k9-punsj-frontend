import * as React from 'react';

import { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { useQuery } from 'react-query';
import { useNavigate } from 'react-router';
import { useDispatch } from 'react-redux';
import { Alert, Button, Heading, Loader, Table } from '@navikt/ds-react';

import { resetAllStateAction } from 'app/state/actions/GlobalActions';
import { ROUTES } from 'app/constants/routes';
import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import { datetime } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import { IOLPSoknadBackend } from '../../../models/types/OLPSoknad';
import { hentEksisterendeSoeknader } from '../api';

interface Props {
    søkerId: string;
    pleietrengendeId: string | null;
}

export const EksisterendeOLPSoknader: React.FC<Props> = ({ søkerId, pleietrengendeId }: Props) => {
    const intl = useIntl();

    const navigate = useNavigate();
    const dispatch = useDispatch();

    const [valgtSoeknad, setValgtSoeknad] = useState<IOLPSoknadBackend | undefined>(undefined);

    useEffect(() => {
        if (!IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            dispatch(resetAllStateAction());
            navigate(ROUTES.HOME);
        }
    }, [søkerId, pleietrengendeId]);

    const {
        data: eksisterendeSoeknader,
        isLoading: lasterSoeknader,
        error: eksisterendeSoeknaderError,
    } = useQuery('hentSoeknaderOLP', () => hentEksisterendeSoeknader(søkerId));

    if (lasterSoeknader) {
        return <Loader />;
    }

    if (eksisterendeSoeknaderError instanceof Error) {
        return (
            <Alert size="small" variant="error">
                {eksisterendeSoeknaderError.message}
            </Alert>
        );
    }

    const gaaVidereMedSoeknad = (soknad: IOLPSoknadBackend) => {
        navigate(`../${ROUTES.PUNCH.replace(':id', soknad.soeknadId)}`);
    };

    const showSoknader = () => {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        eksisterendeSoeknader?.søknader?.forEach((søknad: IOLPSoknadBackend) => {
            const soknadId = søknad.soeknadId;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.soekerId,
                Array.from(søknad.journalposter).join(', '),

                <Button variant="secondary" key={soknadId} size="small" onClick={() => setValgtSoeknad(søknad)}>
                    <FormattedMessage id="mappe.lesemodus.knapp.velg" />
                </Button>,
            ];
            rows.push(
                <tr key={soknadId}>
                    {rowContent.filter((v) => !!v).length ? (
                        rowContent.map((v, i) => <Table.DataCell key={`${soknadId}_${i}`}>{v}</Table.DataCell>)
                    ) : (
                        <Table.DataCell colSpan={4} className="punch_mappetabell_tom_soknad">
                            <FormattedMessage id="tabell.tomSøknad" />
                        </Table.DataCell>
                    )}
                </tr>,
            );
            modaler.push(
                <ErDuSikkerModal
                    melding="modal.erdusikker.info"
                    modalKey={soknadId}
                    open={!!valgtSoeknad && soknadId === valgtSoeknad.soeknadId}
                    submitKnappText="mappe.lesemodus.knapp.velg"
                    onSubmit={() => valgtSoeknad && gaaVidereMedSoeknad(valgtSoeknad)}
                    onClose={() => setValgtSoeknad(undefined)}
                />,
            );
        });

        return (
            <>
                <Heading size="medium" level="2">
                    <FormattedMessage id="tabell.overskrift" />
                </Heading>

                <Table className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>
                                <FormattedMessage id="tabell.mottakelsesdato" />
                            </Table.HeaderCell>

                            <Table.HeaderCell>
                                <FormattedMessage id="tabell.soekersFoedselsnummer" />
                            </Table.HeaderCell>

                            <Table.HeaderCell>
                                <FormattedMessage id="tabell.journalpostid" />
                            </Table.HeaderCell>

                            <Table.HeaderCell>
                                <FormattedMessage id="skjema.periode" />
                            </Table.HeaderCell>

                            <Table.HeaderCell aria-label={intlHelper(intl, 'mappe.lesemodus.knapp.velg')} />
                        </Table.Row>
                    </Table.Header>
                    <tbody>{rows}</tbody>
                </Table>
                {modaler}
            </>
        );
    };

    if (eksisterendeSoeknader?.søknader && eksisterendeSoeknader.søknader.length) {
        return <>{showSoknader()}</>;
    }

    return (
        <Alert size="small" variant="info">
            <FormattedMessage
                id="mapper.infoboks.ingensoknader"
                values={{ antallSokere: pleietrengendeId ? '2' : '1' }}
            />
        </Alert>
    );
};
