import React, { useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { useNavigate } from 'react-router';
import { Alert, Button, Heading, Table } from '@navikt/ds-react';

import { TimeFormat } from 'app/models/enums';
import { ROUTES } from 'app/constants/routes';
import { datetime, dokumenterPreviewUtils } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { IJournalpostInfo } from 'app/models/types/Journalpost/Journalpost';
import DokumentIdList from 'app/components/dokumentId-list/DokumentIdList';
import { generateDateString } from '../../../components/skjema/skjemaUtils';
import ErDuSikkerModal from 'app/components/ErDuSikkerModal';
import { IPLSSoknad, PLSSoknad } from '../types/PLSSoknad';

interface Props {
    søknader: IPLSSoknad[];
    journalposter: IJournalpostInfo[];
    søkerId: string;
    pleietrengendeId: string;
    kanStarteNyRegistrering?: boolean;
    fagsakId?: string;
}

export const EksisterendePLSSoknader: React.FC<Props> = ({
    søknader,
    journalposter,
    søkerId,
    pleietrengendeId,
    kanStarteNyRegistrering,
    fagsakId,
}: Props) => {
    const intl = useIntl();
    const navigate = useNavigate();

    // Lokalt tilstand for modal vindu
    const [chosenSoknad, setChosenSoknad] = useState<IPLSSoknad | null>(null);

    if (!søkerId || søkerId === '') {
        return null;
    }

    const chooseSoknad = (soknad: IPLSSoknad) => {
        if (soknad.soeknadId) {
            setChosenSoknad(null); // Lukker modal vindu
            navigate(`../${ROUTES.PUNCH.replace(':id', soknad.soeknadId)}`);
        } else {
            throw new Error('Søknad mangler søknadid');
        }
    };

    const openSoknad = (soknad: IPLSSoknad) => {
        setChosenSoknad(soknad);
    };

    const closeSoknad = () => {
        setChosenSoknad(null);
    };

    const showSoknader = () => {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        søknader?.forEach((soknadInfo, index) => {
            const søknad = new PLSSoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const k9saksnummer = søknad?.k9saksnummer;

            const dokUrlParametre = dokumenterPreviewUtils.getDokUrlParametreFraJournalposter(
                Array.from(søknad.journalposter),
                journalposter,
            );

            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.pleietrengende.norskIdent ? søknad.pleietrengende.norskIdent : '',
                <DokumentIdList key={`dok-${index}`} dokUrlParametre={dokUrlParametre} />,
                Array.from(søknad.journalposter).join(', '),
                k9saksnummer,
                generateDateString(søknad.soeknadsperiode),
                <Button
                    variant="secondary"
                    key={soknadId}
                    size="small"
                    disabled={
                        (søknad.pleietrengende.norskIdent &&
                            pleietrengendeId !== søknad.pleietrengende.norskIdent &&
                            !!pleietrengendeId &&
                            pleietrengendeId !== null) ||
                        (!!k9saksnummer && fagsakId !== k9saksnummer)
                    }
                    onClick={() => openSoknad(soknadInfo)}
                >
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
                    open={!!chosenSoknad && soknadId === chosenSoknad.soeknadId}
                    submitKnappText="mappe.lesemodus.knapp.velg"
                    onSubmit={() => chooseSoknad(soknadInfo)}
                    onClose={closeSoknad}
                />,
            );
        });

        return (
            <>
                <Heading size="medium" level="2">
                    <FormattedMessage id="tabell.overskrift" />
                </Heading>

                <Alert size="small" variant="info" className="mt-4 mb-10 max-w-max">
                    <FormattedMessage
                        id={`tabell.info${kanStarteNyRegistrering ? '' : '.kanIkkeStarteNyRegistrering'}`}
                    />
                </Alert>

                <Table className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>
                                <FormattedMessage id="tabell.mottakelsesdato" />
                            </Table.HeaderCell>

                            <Table.HeaderCell>
                                <FormattedMessage id="tabell.pleietrengendesfnrellerfdato" />
                            </Table.HeaderCell>

                            <Table.HeaderCell>
                                <FormattedMessage id="tabell.dokumenter" />
                            </Table.HeaderCell>

                            <Table.HeaderCell>
                                <FormattedMessage id="tabell.journalpostid" />
                            </Table.HeaderCell>

                            <Table.HeaderCell>
                                <FormattedMessage id="tabell.fagsakId" />
                            </Table.HeaderCell>

                            <Table.HeaderCell>
                                <FormattedMessage id="skjema.periode" />
                            </Table.HeaderCell>

                            <Table.HeaderCell aria-label={intlHelper(intl, 'mappe.lesemodus.knapp.velg')} />
                        </Table.Row>
                    </Table.Header>

                    <Table.Body>{rows}</Table.Body>
                </Table>
                {modaler}
            </>
        );
    };

    if (søknader && søknader.length) {
        return showSoknader();
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
