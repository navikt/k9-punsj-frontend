import { useState } from 'react';
import * as React from 'react';
import { WrappedComponentProps, injectIntl } from 'react-intl';
import { useQuery } from 'react-query';

import { Alert, Button, Loader, Modal, Table } from '@navikt/ds-react';

import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import RoutingPathsContext from 'app/state/context/RoutingPathsContext';
import { datetime, setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import ErDuSikkerModal from '../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';
import { IOLPSoknadBackend } from '../../models/types/OLPSoknad';
import { hentEksisterendeSoeknader } from '../api';

export interface IEksisterendeOLPSoknaderComponentProps {
    søkerId: string;
    pleietrengendeId: string | null;
}

type IEksisterendeOLPSoknaderProps = WrappedComponentProps & IEksisterendeOLPSoknaderComponentProps;

export const EksisterendeOLPSoknaderComponent: React.FunctionComponent<IEksisterendeOLPSoknaderProps> = (
    props: IEksisterendeOLPSoknaderProps,
) => {
    const { intl, søkerId, pleietrengendeId } = props;

    const [valgtSoeknad, setValgtSoeknad] = useState<IOLPSoknadBackend | undefined>(undefined);
    const routingPaths = React.useContext(RoutingPathsContext);

    React.useEffect(() => {
        if (!IdentRules.erAlleIdenterGyldige(søkerId, pleietrengendeId)) {
            setHash('/');
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
        setHash(`${routingPaths.skjema}${soknad.soeknadId}`);
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
                    {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                </Button>,
            ];
            rows.push(
                <tr key={soknadId}>
                    {rowContent.filter((v) => !!v).length ? (
                        // eslint-disable-next-line react/no-array-index-key
                        rowContent.map((v, i) => <Table.DataCell key={`${soknadId}_${i}`}>{v}</Table.DataCell>)
                    ) : (
                        <Table.DataCell colSpan={4} className="punch_mappetabell_tom_soknad">
                            Tom søknad
                        </Table.DataCell>
                    )}
                </tr>,
            );
            modaler.push(
                <Modal
                    key={soknadId}
                    onClose={() => setValgtSoeknad(undefined)}
                    aria-label={soknadId}
                    open={!!valgtSoeknad && soknadId === valgtSoeknad.soeknadId}
                    closeButton={false}
                >
                    <ErDuSikkerModal
                        melding="modal.erdusikker.info"
                        onSubmit={() => valgtSoeknad && gaaVidereMedSoeknad(valgtSoeknad)}
                        onClose={() => setValgtSoeknad(undefined)}
                        submitKnappText="mappe.lesemodus.knapp.velg"
                    />
                </Modal>,
            );
        });

        return (
            <>
                <h2>{intlHelper(intl, 'tabell.overskrift')}</h2>
                <Table className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.mottakelsesdato')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.soekersFoedselsnummer')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.journalpostid')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'skjema.periode')}</Table.HeaderCell>
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
            {intlHelper(intl, 'mapper.infoboks.ingensoknader', {
                antallSokere: pleietrengendeId ? '2' : '1',
            })}
        </Alert>
    );
};

export const EksisterendeOLPSoknader = injectIntl(EksisterendeOLPSoknaderComponent);
