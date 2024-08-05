import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Checkbox, Label, Select, TextField } from '@navikt/ds-react';

import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from '../../../../components/VerticalSpacer';
import { IIdentState } from '../../../../models/types/IdentState';
import { setIdentFellesAction } from '../../../../state/actions/IdentActions';
import { IFellesState } from '../../../../state/reducers/FellesReducer';
import { hentBarn } from '../../../../state/reducers/HentBarn';
import { Person } from 'app/models/types/Person';
import { getPersonInfo } from 'app/api/api';

import './pleietrengende.less';
import FnrTextField from 'app/components/fnr-text-field/FnrTextField';

export interface IPleietrengendeStateProps {
    identState: IIdentState;
    fellesState: IFellesState;
}

export interface IPleietrengendeDispatchProps {
    setIdentAction: typeof setIdentFellesAction;
    henteBarn: typeof hentBarn;
}

export interface IPleietrengende {
    sokersIdent: string;
    toSokereIJournalpost: boolean;
    pleietrengendeHarIkkeFnrFn?: (harPleietrengendeFnr: boolean) => void;
    visPleietrengende?: boolean;
    jpErFerdigstiltOgUtenPleietrengende?: boolean;
    skalHenteBarn?: boolean;
}

type IPleietrengendeProps = IPleietrengendeStateProps & IPleietrengendeDispatchProps & IPleietrengende;

const PleietrengendeComponent: React.FunctionComponent<IPleietrengendeProps> = (props) => {
    const {
        pleietrengendeHarIkkeFnrFn,
        identState,
        sokersIdent,
        toSokereIJournalpost,
        fellesState,
        setIdentAction,
        henteBarn,
        visPleietrengende,
        skalHenteBarn,
        jpErFerdigstiltOgUtenPleietrengende,
    } = props;
    const intl = useIntl();

    const [pleietrengendeIdent, setPleietrengendeIdent] = useState<string>('');
    const [pleietrengendeHarIkkeFnr, setPleietrengendeHarIkkeFnr] = useState<boolean>(false);
    const [gjelderAnnenPleietrengende, setGjelderAnnenPleietrengende] = useState<boolean>(false);
    const [pleietrengendeInfo, setPleietrengendeInfo] = useState<Person | undefined>(undefined);
    const [pleietrengendeInfoLoading, setPleietrengendeInfoLoading] = useState<boolean>(false);
    const [pleietrengendeInfoError, setPleietrengendeInfoError] = useState<boolean>(false);

    useEffect(() => {
        if (sokersIdent.length > 0 && skalHenteBarn && visPleietrengende) {
            henteBarn(sokersIdent);
        }
    }, [sokersIdent, visPleietrengende, skalHenteBarn]);

    const hentPleietrengendeInfo = (søkersFødselsnummer: string) => {
        setPleietrengendeInfoError(false);
        setPleietrengendeInfoLoading(true);

        getPersonInfo(søkersFødselsnummer, (response, data: Person) => {
            setPleietrengendeInfoLoading(false);
            if (response.status === 200) {
                setPleietrengendeInfo(data);
            } else {
                setPleietrengendeInfoError(true);
            }
        });
    };

    const pleietrengendeIdentInputFieldOnChange = (event: any) => {
        const identFromInput = event.target.value.replace(/\D+/, '');

        if (identState.pleietrengendeId.length > 0 && identFromInput.length < pleietrengendeIdent.length) {
            setPleietrengendeInfo(undefined);
            setIdentAction(identState.søkerId, '', identState.annenSokerIdent);
        }

        if (identFromInput.length === 11) {
            if (!IdentRules.erUgyldigIdent(identFromInput)) {
                hentPleietrengendeInfo(identFromInput);
            }

            setIdentAction(identState.søkerId, identFromInput, identState.annenSokerIdent);
        }

        setPleietrengendeIdent(identFromInput);
    };

    const oppdaterStateMedPleietrengendeFnr = (event: any) => {
        setIdentAction(identState.søkerId, event.target.value, identState.annenSokerIdent);
    };

    const nullUtPleietrengendeIdent = () => {
        setPleietrengendeIdent('');
        setPleietrengendeInfo(undefined);
        setIdentAction(identState.søkerId, '', identState.annenSokerIdent);
    };

    const pleietrengendeHarIkkeFnrCheckboks = (checked: boolean) => {
        setPleietrengendeHarIkkeFnr(checked);
        setPleietrengendeInfo(undefined);
        if (pleietrengendeHarIkkeFnrFn) pleietrengendeHarIkkeFnrFn(checked);
        if (checked) {
            setPleietrengendeIdent('');
            setIdentAction(identState.søkerId, null, identState.annenSokerIdent);
        }
    };

    const isPleitrengendeFnrErSammeSomSøker = identState.søkerId === identState.pleietrengendeId;

    if (!visPleietrengende) {
        return null;
    }

    return (
        <div>
            {!!fellesState.hentBarnSuccess && !!fellesState.barn && fellesState.barn.length > 0 && (
                <>
                    <VerticalSpacer eightPx />
                    <Select
                        className="pleietrengendeSelect"
                        label={intlHelper(intl, 'ident.identifikasjon.velgBarn')}
                        onChange={(e) => {
                            setPleietrengendeIdent(e.target.value);
                            oppdaterStateMedPleietrengendeFnr(e);
                        }}
                        disabled={gjelderAnnenPleietrengende}
                    >
                        <option key="default" value="" label="Velg barn" aria-label="Tomt valg" />
                        {!gjelderAnnenPleietrengende &&
                            fellesState.barn.map((b) => (
                                <option key={b.identitetsnummer} value={b.identitetsnummer}>
                                    {`${b.fornavn} ${b.etternavn} - ${b.identitetsnummer}`}
                                </option>
                            ))}
                    </Select>
                    <VerticalSpacer eightPx />
                    <Checkbox
                        onChange={(e) => {
                            setGjelderAnnenPleietrengende(e.target.checked);
                            nullUtPleietrengendeIdent();
                        }}
                        checked={gjelderAnnenPleietrengende}
                    >
                        {intlHelper(intl, 'ident.identifikasjon.annetBarn')}
                    </Checkbox>
                </>
            )}

            {(gjelderAnnenPleietrengende ||
                !skalHenteBarn ||
                !!fellesState.hentBarnError ||
                !!fellesState.hentBarnForbidden ||
                (!!fellesState.barn && fellesState.barn.length === 0)) && (
                <>
                    <FnrTextField
                        labelId="ident.identifikasjon.pleietrengende"
                        value={pleietrengendeIdent}
                        loadingPersonsInfo={pleietrengendeInfoLoading}
                        errorPersonsInfo={pleietrengendeInfoError}
                        person={pleietrengendeInfo}
                        errorValidationMessage={
                            isPleitrengendeFnrErSammeSomSøker ||
                            (identState.pleietrengendeId && IdentRules.erUgyldigIdent(identState.pleietrengendeId))
                                ? intlHelper(intl, 'ident.feil.ugyldigident')
                                : undefined
                        }
                        disabled={pleietrengendeHarIkkeFnr}
                        onChange={pleietrengendeIdentInputFieldOnChange}
                    />

                    <VerticalSpacer eightPx />
                    {pleietrengendeHarIkkeFnrFn && (
                        <>
                            <Checkbox onChange={(e) => pleietrengendeHarIkkeFnrCheckboks(e.target.checked)}>
                                {intlHelper(intl, 'ident.identifikasjon.pleietrengendeHarIkkeFnr')}
                            </Checkbox>
                            {!toSokereIJournalpost &&
                                pleietrengendeHarIkkeFnr &&
                                !jpErFerdigstiltOgUtenPleietrengende && (
                                    <Alert
                                        size="small"
                                        variant="info"
                                        className="infotrygd_info"
                                        data-test-id="pleietrengendeHarIkkeFnrInformasjon"
                                    >
                                        {intlHelper(intl, 'ident.identifikasjon.pleietrengendeHarIkkeFnrInformasjon')}
                                    </Alert>
                                )}
                            {pleietrengendeHarIkkeFnr && jpErFerdigstiltOgUtenPleietrengende && (
                                <Alert size="small" variant="info" className="infotrygd_info">
                                    {intlHelper(
                                        intl,
                                        'ident.identifikasjon.pleietrengendeHarIkkeFnrInformasjon.ferdistilt',
                                    )}
                                </Alert>
                            )}
                        </>
                    )}
                    <VerticalSpacer sixteenPx />
                </>
            )}
        </div>
    );
};

const mapStateToProps = (state: RootStateType) => ({
    identState: state.identState,
    fellesState: state.felles,
    dedupkey: state.felles.dedupKey,
});

const mapDispatchToProps = (dispatch: any) => ({
    setIdentAction: (søkerId: string, pleietrengendeId: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(søkerId, pleietrengendeId, annenSokerIdent)),
    henteBarn: (søkerId: string) => dispatch(hentBarn(søkerId)),
});

const Pleietrengende = connect(mapStateToProps, mapDispatchToProps)(PleietrengendeComponent);

export { Pleietrengende, PleietrengendeComponent };
