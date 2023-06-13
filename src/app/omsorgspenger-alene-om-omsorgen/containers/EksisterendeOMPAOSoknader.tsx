import { useState } from 'react';
import * as React from 'react';
import { useIntl } from 'react-intl';
import { useQuery } from 'react-query';

import { Alert, Button, Loader, Modal } from '@navikt/ds-react';
import { Period } from '@navikt/k9-fe-period-utils';

import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import RoutingPathsContext from 'app/state/context/RoutingPathsContext';
import { datetime, setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import ErDuSikkerModal from '../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';
import { hentEksisterendeSoeknader } from '../api';
import { IOMPAOSoknad } from '../types/OMPAOSoknad';

export interface Props {
    søkerId: string;
    pleietrengendeId: string | null;
}

const EksisterendeOMPAOSoknader: React.FunctionComponent<Props> = (props) => {
    const { søkerId, pleietrengendeId } = props;

    const intl = useIntl();

    const [valgtSoeknad, setValgtSoeknad] = useState<IOMPAOSoknad | undefined>(undefined);
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
    } = useQuery('hentSoeknaderOMPAO', () => hentEksisterendeSoeknader(søkerId));

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

    const gaaVidereMedSoeknad = (soknad: IOMPAOSoknad) => {
        setHash(`${routingPaths.skjema}${soknad.soeknadId}`);
    };

    function showSoknader() {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        eksisterendeSoeknader?.søknader?.forEach((søknad: IOMPAOSoknad) => {
            const soknadId = søknad.soeknadId;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.soekerId,
                Array.from(søknad.journalposter).join(', '),
                søknad.soeknadsperiode && søknad.soeknadsperiode.fom && søknad.soeknadsperiode.tom
                    ? new Period(søknad.soeknadsperiode.fom, søknad.soeknadsperiode.tom).prettifyPeriod()
                    : '',
                <Button variant="secondary" key={soknadId} size="small" onClick={() => setValgtSoeknad(søknad)}>
                    {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                </Button>,
            ];
            rows.push(
                <tr key={soknadId}>
                    {rowContent.filter((v) => !!v).length ? (
                        // eslint-disable-next-line react/no-array-index-key
                        rowContent.map((v, i) => <td key={`${soknadId}_${i}`}>{v}</td>)
                    ) : (
                        <td colSpan={4} className="punch_mappetabell_tom_soknad">
                            Tom søknad
                        </td>
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
                <table className="tabell tabell--stripet punch_mappetabell">
                    <thead>
                        <tr>
                            <th>{intlHelper(intl, 'tabell.mottakelsesdato')}</th>
                            <th>{intlHelper(intl, 'tabell.soekersFoedselsnummer')}</th>
                            <th>{intlHelper(intl, 'tabell.journalpostid')}</th>
                            <th>{intlHelper(intl, 'skjema.periode')}</th>
                            <th aria-label={intlHelper(intl, 'mappe.lesemodus.knapp.velg')} />
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
                {modaler}
            </>
        );
    }

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

export default EksisterendeOMPAOSoknader;
