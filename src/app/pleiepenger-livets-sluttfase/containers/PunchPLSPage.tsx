/* eslint-disable react/jsx-props-no-spreading */
// eslint-disable-next-line import/no-extraneous-dependencies
import React from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import { Alert, Button } from '@navikt/ds-react';

import Page from 'app/components/page/Page';
import { RootStateType } from 'app/state/RootState';
import { getEnvironmentVariable } from 'app/utils';
import intlHelper from 'app/utils/intlUtils';

import { IPunchPLSFormState } from '../types/PunchPLSFormState';
import { PLSPunchForm } from './PLSPunchForm';
import { PLSRegistreringsValg } from './PLSRegistreringsValg';
import { PLSSoknadKvittering } from './SoknadKvittering/PLSSoknadKvittering';

export interface IPunchPLSPageStateProps {
    forbidden: boolean | undefined;
    punchFormState: IPunchPLSFormState;
}

export interface IPunchPLSPageComponentProps {
    match?: any;
    step: number;
    journalpostid?: string;
}

export interface IPunchPLSPageComponentState {
    søkerId: string;
    pleietrengendeId: string;
}

type IPunchPLSPageProps = RouteComponentProps & IPunchPLSPageComponentProps & IPunchPLSPageStateProps;

export const PunchPLSPageComponent: React.FunctionComponent<IPunchPLSPageProps> = (props) => {
    const { journalpostid, forbidden, match, punchFormState, step } = props;
    const intl = useIntl();

    // eslint-disable-next-line consistent-return
    const underFnr = () => {
        // eslint-disable-next-line default-case
        switch (step) {
            case 0:
                return <PLSRegistreringsValg journalpostid={journalpostid || ''} />;
            case 1:
                return <PLSPunchForm journalpostid={journalpostid || ''} id={match.params.id} />;
            case 2:
                return (
                    <>
                        <Alert size="small" variant="info" className="fullfortmelding">
                            <FormattedMessage id="skjema.sentInn" />
                        </Alert>
                        <div className="punchPage__knapper mt-8">
                            <Button
                                onClick={() => {
                                    window.location.href = getEnvironmentVariable('K9_LOS_URL');
                                }}
                            >
                                {intlHelper(intl, 'tilbaketilLOS')}
                            </Button>
                        </div>
                        {!!punchFormState.innsentSoknad && (
                            <PLSSoknadKvittering response={punchFormState.innsentSoknad} intl={intl} />
                        )}
                    </>
                );
        }
    };

    const content = () => {
        if (forbidden) {
            return (
                <Alert size="small" variant="warning">
                    <FormattedMessage id="søk.jp.forbidden" values={{ jpid: journalpostid }} />
                </Alert>
            );
        }

        return (
            <div className="panels-wrapper" id="panels-wrapper">
                {underFnr()}
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
    journalpost: state.felles.journalpost,
    identState: state.identState,
    forbidden: state.felles.journalpostForbidden,
    punchFormState: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState,
    journalposterIAktivPunchForm: state.PLEIEPENGER_I_LIVETS_SLUTTFASE.punchFormState.soknad?.journalposter,
});

export const PunchPLSPage = withRouter(connect(mapStateToProps)(PunchPLSPageComponent));
