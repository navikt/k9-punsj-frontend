import React, { useEffect, useState } from 'react';
import { useIntl } from 'react-intl';
import { connect } from 'react-redux';

import { Alert, Checkbox, Select, TextField } from '@navikt/ds-react';

import { IdentRules } from 'app/rules';
import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';

import WarningCircle from '../../../../assets/SVG/WarningCircle';
import VerticalSpacer from '../../../../components/VerticalSpacer';
import { IIdentState } from '../../../../models/types/IdentState';
import { setIdentFellesAction } from '../../../../state/actions/IdentActions';
import { IFellesState } from '../../../../state/reducers/FellesReducer';
import { hentBarn } from '../../../../state/reducers/HentBarn';
import './pleietrengende.less';

export interface IPleietrengendeStateProps {
    identState: IIdentState;
    fellesState: IFellesState;
    jpErFerdigstiltOgUtenPleietrengende?: boolean;
}

export interface IPleietrengendeDispatchProps {
    setIdentAction: typeof setIdentFellesAction;
    henteBarn: typeof hentBarn;
}

export interface IPleietrengende {
    sokersIdent: string;
    pleietrengendeHarIkkeFnrFn?: (harPleietrengendeFnr: boolean) => void;
    visPleietrengende?: boolean;
    skalHenteBarn?: boolean;
}

type IPleietrengendeProps = IPleietrengendeStateProps & IPleietrengendeDispatchProps & IPleietrengende;

const PleietrengendeComponent: React.FunctionComponent<IPleietrengendeProps> = (props) => {
    const {
        pleietrengendeHarIkkeFnrFn,
        identState,
        sokersIdent,
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
    const [ingenInfoOmBarn, setingenInfoOmBarn] = useState<boolean>(false);

    useEffect(() => {
        if (sokersIdent.length > 0 && skalHenteBarn && visPleietrengende) {
            henteBarn(sokersIdent);
        }
    }, [sokersIdent, visPleietrengende, skalHenteBarn]);

    if (!visPleietrengende) {
        return null;
    }
    const pleietrengendeIdentInputFieldOnChange = (event: any) => {
        setPleietrengendeIdent(event.target.value.replace(/\D+/, ''));
    };

    const oppdaterStateMedPleietrengendeFnr = (event: any) => {
        setIdentAction(identState.søkerId, event.target.value, identState.annenSokerIdent);
    };

    const nullUtPleietrengendeIdent = () => {
        setPleietrengendeIdent('');
        setIdentAction(identState.søkerId, '', identState.annenSokerIdent);
    };

    const pleietrengendeHarIkkeFnrCheckboks = (checked: boolean) => {
        setPleietrengendeHarIkkeFnr(checked);
        if (pleietrengendeHarIkkeFnrFn) pleietrengendeHarIkkeFnrFn(checked);
        if (checked) {
            setPleietrengendeIdent('');
            setIdentAction(identState.søkerId, null);
        }
    };

    const ingenInfoOmBarnCheckboks = (checked: boolean) => {
        setingenInfoOmBarn(checked);
        if (pleietrengendeHarIkkeFnrFn) pleietrengendeHarIkkeFnrFn(checked);
        if (checked) {
            setPleietrengendeIdent('');
            setIdentAction(identState.søkerId, null);
        }
    };

    if (!visPleietrengende) {
        return null;
    }
    return (
        <div>
            {!jpErFerdigstiltOgUtenPleietrengende && skalHenteBarn && (
                <>
                    <Checkbox onChange={(e) => ingenInfoOmBarnCheckboks(e.target.checked)}>
                        Dokument har ikke informasjon om barn
                    </Checkbox>
                    {ingenInfoOmBarn && (
                        <Alert size="small" variant="info">
                            Du kan journalføre uten å koble til barn, men kan ikke registrere opplysninger til K9 før du
                            vet barnet. Ved journalføring vil det bli reservert ett saksnummer i K9.
                        </Alert>
                    )}
                </>
            )}

            {!ingenInfoOmBarn && (
                <>
                    {!!fellesState.hentBarnSuccess && !!fellesState.barn && fellesState.barn.length > 0 && (
                        <>
                            <VerticalSpacer eightPx />
                            <Select
                                className="pleietrengendeSelect"
                                label={intlHelper(intl, 'ident.identifikasjon.velgBarn')}
                                onChange={(e) => {
                                    pleietrengendeIdentInputFieldOnChange(e);
                                    oppdaterStateMedPleietrengendeFnr(e);
                                }}
                                disabled={gjelderAnnenPleietrengende}
                            >
                                <option key="default" value="" label=" " aria-label="Tomt valg" />
                                {fellesState.barn.map((b) => (
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
                    <VerticalSpacer sixteenPx />
                    {(gjelderAnnenPleietrengende ||
                        !skalHenteBarn ||
                        !!fellesState.hentBarnError ||
                        !!fellesState.hentBarnForbidden ||
                        (!!fellesState.barn && fellesState.barn.length === 0)) && (
                        <>
                            <div className="fyllUtIdentAnnetBarnContainer">
                                <TextField
                                    label={intlHelper(intl, 'ident.identifikasjon.pleietrengende')}
                                    onChange={pleietrengendeIdentInputFieldOnChange}
                                    onBlur={oppdaterStateMedPleietrengendeFnr}
                                    value={pleietrengendeIdent}
                                    className="bold-label ident-soker-2"
                                    maxLength={11}
                                    size="small"
                                    error={
                                        identState.pleietrengendeId &&
                                        IdentRules.erUgyldigIdent(identState.pleietrengendeId)
                                            ? intlHelper(intl, 'ident.feil.ugyldigident')
                                            : undefined
                                    }
                                    disabled={pleietrengendeHarIkkeFnr}
                                />
                                {pleietrengendeIdent.length === 11 &&
                                    !IdentRules.erUgyldigIdent(identState.pleietrengendeId) && (
                                        <div className="dobbelSjekkIdent">
                                            <div>
                                                <WarningCircle />
                                            </div>
                                            <p>
                                                <b>{intlHelper(intl, 'ident.identifikasjon.dobbelsjekkident')}</b>
                                            </p>
                                        </div>
                                    )}
                            </div>
                            <VerticalSpacer eightPx />
                            {pleietrengendeHarIkkeFnrFn && (
                                <>
                                    <Checkbox onChange={(e) => pleietrengendeHarIkkeFnrCheckboks(e.target.checked)}>
                                        {intlHelper(intl, 'ident.identifikasjon.pleietrengendeHarIkkeFnr')}
                                    </Checkbox>
                                    {pleietrengendeHarIkkeFnr && !jpErFerdigstiltOgUtenPleietrengende && (
                                        <Alert size="small" variant="info" className="infotrygd_info">
                                            {' '}
                                            {intlHelper(
                                                intl,
                                                'ident.identifikasjon.pleietrengendeHarIkkeFnrInformasjon',
                                            )}
                                        </Alert>
                                    )}
                                    {jpErFerdigstiltOgUtenPleietrengende && !pleietrengendeIdent && (
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
