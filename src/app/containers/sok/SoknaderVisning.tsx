import { PunchStep, TimeFormat } from 'app/models/enums';
import { IEksisterendeSoknaderState, IPath } from 'app/models/types';
import {
    chooseEksisterendeSoknadAction,
    findEksisterendeSoknader,
    openEksisterendeSoknadAction,
    resetPunchAction,
    setIdentAction,
    undoSearchForSoknaderAction,
} from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import { datetime, getPath, setHash } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeFeil, AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Knapp } from 'nav-frontend-knapper';
import NavFrontendSpinner from 'nav-frontend-spinner';
import * as React from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { SoknaderVisningStep } from '../../models/enums/SoknaderVisningStep';
import { SoknadType } from '../../models/enums/SoknadType';
import { IPSBSoknad, PSBSoknad } from '../../models/types/PSBSoknad';
import { ISoknaderVisningState } from '../../models/types/SoknaderVisningState';
import { setIdentSokAction, setStepSokAction } from '../../state/actions/SoknaderSokActions';
import { closeSoknadAction, openSoknadAction, resetSoknadidAction } from '../../state/actions/SoknaderVisningActions';

export interface ISoknaderSokStateProps {
    visningState: ISoknaderVisningState;
    eksisterendeSoknaderState: IEksisterendeSoknaderState;
}

export interface ISoknaderSokDispatchProps {
    setIdentAction: typeof setIdentSokAction;
    setStepAction: typeof setStepSokAction;
    findSoknader: typeof findEksisterendeSoknader;
    undoSearchForSoknaderAction: typeof undoSearchForSoknaderAction;
    openSoknadAction: typeof openSoknadAction;
    closeSoknadAction: typeof closeSoknadAction;
    resetSoknadidAction: typeof resetSoknadidAction;
    resetPunchAction: typeof resetPunchAction;
    openEksisterendeSoknadAction: typeof openEksisterendeSoknadAction;
    chooseEksisterendeSoknadAction: typeof chooseEksisterendeSoknadAction;
}

export interface ISoknaderVisningComponentProps {
    ident: string;
}

type ISoknaderSokProps = WrappedComponentProps &
    ISoknaderVisningComponentProps &
    ISoknaderSokStateProps &
    ISoknaderSokDispatchProps;

export const SoknaderVisningComponent: React.FunctionComponent<ISoknaderSokProps> = (props: ISoknaderSokProps) => {
    const { intl, eksisterendeSoknaderState, visningState, ident } = props;
    const soknader = eksisterendeSoknaderState.eksisterendeSoknaderSvar.søknader;

    const paths: IPath[] = [
        {
            step: PunchStep.CHOOSE_SOKNAD,
            path: `/pleiepenger/hentsoknader`,
        },
        { step: PunchStep.FILL_FORM, path: `/pleiepenger/skjema/{id}` },
        { step: PunchStep.COMPLETED, path: `$/pleiepenger/fullfort` },
    ];

    const getPunchPath = (step: PunchStep, values?: any) => getPath(paths, step, values, undefined);

    React.useEffect(() => {
        props.setIdentAction(ident);
        props.findSoknader(ident, null);
        props.setStepAction(SoknaderVisningStep.CHOOSE_SOKNAD);
    }, [ident]);

    if (!ident) {
        return null;
    }

    if (
        eksisterendeSoknaderState.eksisterendeSoknaderRequestError &&
        eksisterendeSoknaderState.eksisterendeSoknaderRequestError!.status === 403
    ) {
        return (
            <>
                <AlertStripeFeil>Du har ikke tilgang til å slå opp denne personen.</AlertStripeFeil>
            </>
        );
    }

    if (eksisterendeSoknaderState.eksisterendeSoknaderRequestError) {
        return (
            <>
                <AlertStripeFeil>Det oppsto en feil i henting av søknader.</AlertStripeFeil>
            </>
        );
    }

    if (
        visningState.step !== SoknaderVisningStep.CHOOSE_SOKNAD ||
        eksisterendeSoknaderState.isEksisterendeSoknaderLoading
    ) {
        return (
            <div>
                <NavFrontendSpinner />
            </div>
        );
    }

    const technicalError = eksisterendeSoknaderState.eksisterendeSoknaderRequestError ? (
        <AlertStripeFeil>Teknisk feil.</AlertStripeFeil>
    ) : null;

    const chooseSoknad = (soknad: IPSBSoknad) => {
        window.history.pushState('', '', '/rediger');
        props.chooseEksisterendeSoknadAction(soknad);
        setHash(getPunchPath(PunchStep.FILL_FORM, { id: soknad.soeknadId }));
    };

    function showSoknader() {
        const rows = [];

        if (soknader && soknader.length > 0) {
            for (let index = 0; index < soknader.length; index += 1) {
                const s = soknader[index];
                const søknad = new PSBSoknad(s);
                const soknadId = s.soeknadId as string;
                const fom = søknad.soeknadsperiode?.fom || '';
                const tom = søknad.soeknadsperiode?.tom || '';
                const rowContent = [
                    søknad.mottattDato ? datetime(intl, TimeFormat.DATE_SHORT, søknad.mottattDato) : '',
                    SoknadType.PSB,
                    (søknad.barn.norskIdent
                        ? søknad.barn.norskIdent
                        : søknad.barn.foedselsdato &&
                          datetime(intl, TimeFormat.DATE_SHORT, søknad.barn.foedselsdato)) || '',
                    fom ? datetime(intl, TimeFormat.DATE_SHORT, fom) : '', // Viser tidligste startdato
                    tom ? datetime(intl, TimeFormat.DATE_SHORT, tom) : '', // Viser seneste sluttdato
                    <Knapp key={soknadId} mini onClick={() => chooseSoknad(s)}>
                        {intlHelper(intl, 'mappe.lesemodus.knapp.velg')}
                    </Knapp>,
                ];
                rows.push(
                    <tr key={soknadId} onClick={() => props.openSoknadAction(s)}>
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
            }
        }

        return (
            <>
                <h2>{intlHelper(intl, 'tabell.overskrift')}</h2>
                <table className="tabell tabell--stripet punch_mappetabell">
                    <thead>
                        <tr>
                            <th>{intlHelper(intl, 'tabell.mottakelsesdato')}</th>
                            <th>{intlHelper(intl, 'tabell.søknadtype')}</th>
                            <th>{intlHelper(intl, 'tabell.fnrellerdato')}</th>
                            <th>{intlHelper(intl, 'tabell.fraogmed')}</th>
                            <th>{intlHelper(intl, 'tabell.tilogmed')}</th>
                            <th aria-label={intlHelper(intl, 'mappe.lesemodus.knapp.velg')} />
                        </tr>
                    </thead>
                    <tbody>{rows}</tbody>
                </table>
            </>
        );
    }

    if (soknader?.length) {
        return (
            <>
                {technicalError}
                <AlertStripeInfo>
                    {intlHelper(intl, 'mapper.visning.infoboks', {
                        antallSokere: '1',
                    })}
                </AlertStripeInfo>
                {showSoknader()}
            </>
        );
    }

    return (
        <>
            {technicalError}
            <AlertStripeInfo>
                {intlHelper(intl, 'mapper.infoboks.ingentreff', {
                    antallSokere: '1',
                })}
            </AlertStripeInfo>
        </>
    );
};

const mapStateToProps = (state: RootStateType): ISoknaderSokStateProps => ({
    visningState: state.SØK.visningState,
    eksisterendeSoknaderState: state.eksisterendeSoknaderState,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: SoknaderVisningStep) => dispatch(setStepSokAction(step)),
    findSoknader: (ident1: string) => dispatch(findEksisterendeSoknader(ident1, null)),
    undoSearchForSoknaderAction: () => dispatch(undoSearchForSoknaderAction()),
    openSoknadAction: (soknad: IPSBSoknad) => dispatch(openSoknadAction(soknad)),
    closeSoknadAction: () => dispatch(closeSoknadAction()),
    resetSoknadidAction: () => dispatch(resetSoknadidAction()),
    resetPunchAction: () => dispatch(resetPunchAction()),
    chooseEksisterendeSoknadAction: (info: IPSBSoknad) => dispatch(chooseEksisterendeSoknadAction(info)),
    openEksisterendeSoknadAction: (info: IPSBSoknad) => dispatch(openEksisterendeSoknadAction(info)),
});

export const SoknaderVisning = injectIntl(connect(mapStateToProps, mapDispatchToProps)(SoknaderVisningComponent));
