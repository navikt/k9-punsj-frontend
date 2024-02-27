import React from 'react';

import { WrappedComponentProps, injectIntl } from 'react-intl';
import { connect } from 'react-redux';
import { useNavigate } from 'react-router';

import { Alert, Button, Loader, Modal, Table } from '@navikt/ds-react';

import { TimeFormat } from 'app/models/enums';
import { IEksisterendeSoknaderState } from 'app/models/types';

import { RootStateType } from 'app/state/RootState';
import { ROUTES } from 'app/constants/routes';
import {
    chooseEksisterendeSoknadAction,
    closeEksisterendeSoknadAction,
    openEksisterendeSoknadAction,
    resetSoknadidAction,
} from 'app/state/actions';
import { datetime } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { resetAllStateAction } from 'app/state/actions/GlobalActions';

import { generateDateString } from '../../components/skjema/skjemaUtils';
import { IPSBSoknad, PSBSoknad } from '../../models/types/PSBSoknad';
import ErDuSikkerModal from './ErDuSikkerModal';

export interface IEksisterendeSoknaderStateProps {
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
}

export interface IEksisterendeSoknaderDispatchProps {
    openEksisterendeSoknadAction: typeof openEksisterendeSoknadAction;
    closeEksisterendeSoknadAction: typeof closeEksisterendeSoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendeSoknadAction;
    resetSoknadidAction: typeof resetSoknadidAction;
}

export interface IEksisterendeSoknaderComponentProps {
    pleietrengendeId: string | null;
}

type IEksisterendeSoknaderProps = WrappedComponentProps &
    IEksisterendeSoknaderComponentProps &
    IEksisterendeSoknaderStateProps &
    IEksisterendeSoknaderDispatchProps;

export const EksisterendeSoknaderComponent: React.FC<IEksisterendeSoknaderProps> = (
    props: IEksisterendeSoknaderProps,
) => {
    const navigate = useNavigate();
    const { intl, eksisterendeSoknaderState, pleietrengendeId } = props;
    const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;

    if (eksisterendeSoknaderState.eksisterendeSoknaderRequestError) {
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil i henting av mapper.
            </Alert>
        );
    }

    if (eksisterendeSoknaderState.isEksisterendeSoknaderLoading || eksisterendeSoknaderState.isAwaitingSoknadCreation) {
        return (
            <div>
                <Loader size="large" />
            </div>
        );
    }

    if (eksisterendeSoknaderState.createSoknadRequestError) {
        return (
            <Alert size="small" variant="error">
                Det oppsto en feil under opprettelse av søknad.
            </Alert>
        );
    }

    const technicalError =
        eksisterendeSoknaderState.isSoknadCreated && !eksisterendeSoknaderState.soknadid ? (
            <Alert size="small" variant="error">
                Teknisk feil.
            </Alert>
        ) : null;

    const chooseSoknad = (soknad: IPSBSoknad) => {
        if (soknad.soeknadId) {
            props.chooseEksisterendeSoknadAction(soknad);
            props.resetSoknadidAction();
            navigate(`../${ROUTES.PUNCH.replace(':id', soknad.soeknadId)}`);
        } else {
            throw new Error('Søknad mangler søknadid');
        }
    };

    const showSoknader = () => {
        const modaler: Array<JSX.Element> = [];
        const rows: Array<JSX.Element> = [];

        soknader?.forEach((soknadInfo) => {
            const søknad = new PSBSoknad(soknadInfo);
            const soknadId = søknad.soeknadId;
            const { chosenSoknad } = props.eksisterendeSoknaderState;
            const rowContent = [
                søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                (søknad.barn.norskIdent
                    ? søknad.barn.norskIdent
                    : søknad.barn.foedselsdato && datetime(intl, TimeFormat.DATE_SHORT, søknad.barn.foedselsdato)) ||
                    '',
                Array.from(søknad.journalposter).join(', '),
                generateDateString(søknad.soeknadsperiode),
                <Button
                    variant="secondary"
                    key={soknadId}
                    size="small"
                    onClick={() => props.openEksisterendeSoknadAction(soknadInfo)}
                >
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
                    onBeforeClose={() => {
                        props.closeEksisterendeSoknadAction();
                    }}
                    aria-label={soknadId}
                    open={!!chosenSoknad && soknadId === chosenSoknad.soeknadId}
                >
                    <ErDuSikkerModal
                        melding="modal.erdusikker.info"
                        onSubmit={() => chooseSoknad(soknadInfo)}
                        onClose={() => props.closeEksisterendeSoknadAction()}
                        submitKnappText="mappe.lesemodus.knapp.velg"
                    />
                </Modal>,
            );
        });

        return (
            <>
                <Table zebraStripes className="punch_mappetabell">
                    <Table.Header>
                        <Table.Row>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.mottakelsesdato')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.barnetsfnrellerfdato')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'tabell.journalpostid')}</Table.HeaderCell>
                            <Table.HeaderCell>{intlHelper(intl, 'skjema.periode')}</Table.HeaderCell>
                            <Table.HeaderCell aria-label={intlHelper(intl, 'mappe.lesemodus.knapp.velg')} />
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>{rows}</Table.Body>
                </Table>
                {modaler}
            </>
        );
    };

    if (soknader && soknader.length) {
        return (
            <>
                {technicalError}
                {showSoknader()}
            </>
        );
    }

    return (
        <>
            {technicalError}
            <Alert size="small" variant="info">
                {intlHelper(intl, 'mapper.infoboks.ingensoknader', {
                    antallSokere: pleietrengendeId ? '2' : '1',
                })}
            </Alert>
        </>
    );
};

const mapStateToProps = (state: RootStateType): IEksisterendeSoknaderStateProps => ({
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
});

const mapDispatchToProps = (dispatch: any) => ({
    openEksisterendeSoknadAction: (info: IPSBSoknad) => dispatch(openEksisterendeSoknadAction(info)),
    closeEksisterendeSoknadAction: () => dispatch(closeEksisterendeSoknadAction()),
    chooseEksisterendeSoknadAction: (info: IPSBSoknad) => dispatch(chooseEksisterendeSoknadAction(info)),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    resetAllAction: () => dispatch(resetAllStateAction()),
});

export const EksisterendeSoknader = injectIntl(
    connect(mapStateToProps, mapDispatchToProps)(EksisterendeSoknaderComponent),
);
