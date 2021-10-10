/* eslint-disable react/jsx-props-no-spreading */
import React, { useEffect, useState } from 'react';
import { Hovedknapp } from 'nav-frontend-knapper';
import Page from 'app/components/page/Page';
import 'app/containers/pleiepenger/punchPage.less';
import useQuery from 'app/hooks/useQuery';
import { PunchStep } from 'app/models/enums';
import { IJournalpost, IPath, IPleiepengerPunchState, IPunchFormState } from 'app/models/types';
import { setIdentAction, setStepAction } from 'app/state/actions';
import { RootStateType } from 'app/state/RootState';
import { getEnvironmentVariable, getPath } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { AlertStripeAdvarsel, AlertStripeInfo } from 'nav-frontend-alertstriper';
import Panel from 'nav-frontend-paneler';
// eslint-disable-next-line import/no-extraneous-dependencies
import 'nav-frontend-tabell-style';
import { FormattedMessage, injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';
import PdfVisning from '../../components/pdf/PdfVisning';
import { peiepengerPaths } from './PeiepengerRoutes';
import { RegistreringsValg } from './RegistreringsValg';
import { IIdentState } from '../../models/types/IdentState';
import { JournalpostPanel } from '../../components/journalpost-panel/JournalpostPanel';
import { PSBPunchForm } from './PSBPunchForm';
import SoknadKvittering from './SoknadKvittering/SoknadKvittering';

export interface IPunchPageStateProps {
    punchState: IPleiepengerPunchState;
    journalpost?: IJournalpost;
    identState: IIdentState;
    forbidden: boolean | undefined;
    punchFormState: IPunchFormState;
}

export interface IPunchPageDispatchProps {
    setIdentAction: typeof setIdentAction;
    setStepAction: typeof setStepAction;
}

export interface IPunchPageQueryProps {
    dok?: string | null;
}

export interface IPunchPageComponentProps {
    match?: any;
    step: PunchStep;
    journalpostid?: string;
    paths: IPath[];
}

export interface IPunchPageComponentState {
    ident1: string;
    ident2: string;
}

type IPunchPageProps = WrappedComponentProps &
    RouteComponentProps &
    IPunchPageComponentProps &
    IPunchPageStateProps &
    IPunchPageDispatchProps &
    IPunchPageQueryProps;

export const PunchPageComponent: React.FunctionComponent<IPunchPageProps> = (props) => {
    const { intl, dok, journalpostid, journalpost, forbidden, step, match, punchFormState } = props;
    const getPunchPath = (punchStep: PunchStep, values?: any) =>
        getPath(peiepengerPaths, punchStep, values, dok ? { dok } : undefined);

    // eslint-disable-next-line consistent-return
    const underFnr = () => {
        const commonProps = {
            journalpostid: journalpostid || '',
            getPunchPath,
        };

        // eslint-disable-next-line default-case
        switch (step) {
            case PunchStep.CHOOSE_SOKNAD:
                return <RegistreringsValg {...commonProps} />;
            case PunchStep.FILL_FORM:
                return <PSBPunchForm {...commonProps} id={match.params.id} />;
            case PunchStep.COMPLETED:
                return (
                    <>
                        <AlertStripeInfo className="fullfortmelding">
                            <FormattedMessage id="skjema.sentInn" />
                        </AlertStripeInfo>
                        <div className="punchPage__knapper">
                            <Hovedknapp
                                onClick={() => {
                                    window.location.href = getEnvironmentVariable('K9_LOS_URL');
                                }}
                            >
                                {intlHelper(intl, 'tilbaketilLOS')}
                            </Hovedknapp>
                            {!!punchFormState.linkTilBehandlingIK9 && (
                                <Hovedknapp
                                    onClick={() => {
                                        window.location.href = punchFormState.linkTilBehandlingIK9!;
                                    }}
                                >
                                    {intlHelper(intl, 'tilBehandlingIK9')}
                                </Hovedknapp>
                            )}
                        </div>
                        {!!punchFormState.innsentSoknad && (
                            <SoknadKvittering response={punchFormState.innsentSoknad} intl={intl} />
                        )}
                    </>
                );
        }
    };

    const content = () => {
        const dokumenter = journalpost?.dokumenter || [];
        if (forbidden) {
            return (
                <AlertStripeAdvarsel>
                    <FormattedMessage id="søk.jp.forbidden" values={{ jpid: journalpostid }} />
                </AlertStripeAdvarsel>
            );
        }

        const journalpostDokumenter = [{ journalpostid, dokumenter }];
        return (
            <div className="panels-wrapper" id="panels-wrapper">
                <Panel className="pleiepenger_punch_form" border>
                    <JournalpostPanel />
                    {underFnr()}
                </Panel>
                {journalpostid && <PdfVisning journalpostDokumenter={journalpostDokumenter} />}
            </div>
        );
    };

    // eslint-disable-next-line consistent-return

    return (
        <Page title={intlHelper(intl, 'startPage.tittel')} className="punch">
            {content()}
        </Page>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    punchState: state.PLEIEPENGER_SYKT_BARN.punchState,
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
    punchFormState: state.PLEIEPENGER_SYKT_BARN.punchFormState,
    journalposterIAktivPunchForm: state.PLEIEPENGER_SYKT_BARN.punchFormState.soknad?.journalposter,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (ident1: string, ident2: string | null) => dispatch(setIdentAction(ident1, ident2)),
    setStepAction: (step: number) => dispatch(setStepAction(step)),
});

const PunchPageComponentWithQuery: React.FunctionComponent<IPunchPageProps> = (props: IPunchPageProps) => {
    const dok = useQuery().get('dok');
    return <PunchPageComponent {...props} dok={dok} />;
};

export const PunchPage = withRouter(
    injectIntl(connect(mapStateToProps, mapDispatchToProps)(PunchPageComponentWithQuery))
);
