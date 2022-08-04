import { useState } from 'react';
import { TimeFormat } from 'app/models/enums';
import { IdentRules } from 'app/rules';
import RoutingPathsContext from 'app/state/context/RoutingPathsContext';
import { setIdentAction } from 'app/state/actions';
import { datetime, setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeFeil, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import ModalWrapper from 'nav-frontend-modal';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { useQuery } from 'react-query';
import { Loader } from '@navikt/ds-react';
import { IOMPUTSoknad } from '../types/OMPUTSoknad';
import ErDuSikkerModal from '../../containers/omsorgspenger/korrigeringAvInntektsmelding/ErDuSikkerModal';
import { hentEksisterendeSoeknader } from '../api';

export interface IEksisterendeOMPUTSoknaderComponentProps {
    journalpostid: string;
    ident1: string;
    ident2: string | null;
}

type IEksisterendeOMPUTSoknaderProps = WrappedComponentProps & IEksisterendeOMPUTSoknaderComponentProps;

export const EksisterendeOMPUTSoknaderComponent: React.FunctionComponent<IEksisterendeOMPUTSoknaderProps> = (
    props: IEksisterendeOMPUTSoknaderProps
) => {
    const { intl, ident1, ident2 } = props;

    const [valgtSoeknad, setValgtSoeknad] = useState<IOMPUTSoknad | undefined>(undefined);
    const routingPaths = React.useContext(RoutingPathsContext);

    React.useEffect(() => {
        if (!IdentRules.erAlleIdenterGyldige(ident1, ident2)) {
            setHash('/');
        }
    }, [ident1, ident2]);

    const {
        data: eksisterendeSoeknader,
        isLoading: lasterSoeknader,
        error: eksisterendeSoeknaderError,
    } = useQuery('hentSoeknaderOMPUT', () => hentEksisterendeSoeknader(ident1));

    if (!ident1) {
        return null;
    }

    if (lasterSoeknader) {
        return <Loader />;
    }

    if (eksisterendeSoeknaderError instanceof Error) {
        return <AlertStripeFeil>{eksisterendeSoeknaderError.message}</AlertStripeFeil>;
    }

    const gaaVidereMedSoeknad = (soknad: IOMPUTSoknad) => {
        setHash(`${routingPaths.skjema}${soknad.soeknadId}`);
    };

    function showSoknader() {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        eksisterendeSoeknader?.søknader?.forEach((søknad: IOMPUTSoknad) => {
            const soknadId = søknad.soeknadId;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                søknad.barn?.map((barn) => barn.norskIdent).join(', '),
                Array.from(søknad.journalposter).join(', '),

                <Knapp key={soknadId} mini onClick={() => setValgtSoeknad(søknad)}>
                    {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                </Knapp>,
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
                </tr>
            );
            modaler.push(
                <ModalWrapper
                    key={soknadId}
                    onRequestClose={() => setValgtSoeknad(undefined)}
                    contentLabel={soknadId}
                    isOpen={!!valgtSoeknad && soknadId === valgtSoeknad.soeknadId}
                    closeButton={false}
                >
                    <ErDuSikkerModal
                        melding="modal.erdusikker.info"
                        onSubmit={() => gaaVidereMedSoeknad(valgtSoeknad)}
                        onClose={() => setValgtSoeknad(undefined)}
                        submitKnappText="mappe.lesemodus.knapp.velg"
                    />
                </ModalWrapper>
            );
        });

        return (
            <>
                <h2>{intlHelper(intl, 'tabell.overskrift')}</h2>
                <table className="tabell tabell--stripet punch_mappetabell">
                    <thead>
                        <tr>
                            <th>{intlHelper(intl, 'tabell.mottakelsesdato')}</th>
                            <th>{intlHelper(intl, 'tabell.barnetsfnrellerfdato')}</th>
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
        <AlertStripeInfo>
            {intlHelper(intl, 'mapper.infoboks.ingensoknader', {
                antallSokere: ident2 ? '2' : '1',
            })}
        </AlertStripeInfo>
    );
};

export const EksisterendeOMPUTSoknader = injectIntl(EksisterendeOMPUTSoknaderComponent);
