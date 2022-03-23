import { RootStateType } from 'app/state/RootState';
import intlHelper from 'app/utils/intlUtils';
import { AlertStripeInfo } from 'nav-frontend-alertstriper';
import { Checkbox, Input, Select } from 'nav-frontend-skjema';
import React, { useEffect, useState } from 'react';
import { injectIntl, WrappedComponentProps } from 'react-intl';
import { connect } from 'react-redux';
import WarningCircle from '../../../../assets/SVG/WarningCircle';
import VerticalSpacer from '../../../../components/VerticalSpacer';
import { IIdentState } from '../../../../models/types/IdentState';
import { setIdentFellesAction } from '../../../../state/actions/IdentActions';
import { IFellesState } from '../../../../state/reducers/FellesReducer';
import { hentBarn } from '../../../../state/reducers/HentBarn';
import { erUgyldigIdent } from '../FordelingFeilmeldinger';

export interface IPleietrengendeStateProps {
    identState: IIdentState;
    fellesState: IFellesState;
    dedupkey: string;
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

type IPleietrengendeProps = WrappedComponentProps & IPleietrengendeStateProps & IPleietrengendeDispatchProps & IPleietrengende;

const PleietrengendeComponent: React.FunctionComponent<IPleietrengendeProps> = (props) => {
    const { intl, pleietrengendeHarIkkeFnrFn, identState, sokersIdent, fellesState, setIdentAction, henteBarn, visPleietrengende, skalHenteBarn } =
        props;

    const [pleietrengendeIdent, setPleietrengendeIdent] = useState<string>('');
    const [pleietrengendeHarIkkeFnr, setPleietrengendeHarIkkeFnr] = useState<boolean>(false);
    const [gjelderAnnetPleietrengende, setGjelderAnnetPleietrengende] = useState<boolean>(false);

    useEffect(() => {
        if (sokersIdent.length > 0/* && skalHenteBarn */) {
            henteBarn(sokersIdent);
        }
    }, [sokersIdent]);

    const pleietrengendeIdentInputFieldOnChange = (event: any) => {
        setPleietrengendeIdent(event.target.value.replace(/\D+/, ''));
    };

    const oppdaterStateMedPleietrengendeFnr = (event: any) => {
        setIdentAction(identState.ident1, event.target.value, identState.annenSokerIdent);
    };

    const nullUtPleietrengendeIdent = () => {
        setPleietrengendeIdent('');
        setIdentAction(identState.ident1, '', identState.annenSokerIdent);
    };

    const pleietrengendeHarIkkeFnrCheckboks = (checked: boolean) => {
        setPleietrengendeHarIkkeFnr(checked);
        if (pleietrengendeHarIkkeFnrFn) pleietrengendeHarIkkeFnrFn(checked);
        if (checked) {
            setPleietrengendeIdent('');
            setIdentAction(identState.ident1, null);
        }
    };

    if (!visPleietrengende) {
        return null;
    }

    return (
        <div className="sokersBarn">
            {!!fellesState.hentBarnSuccess && !!fellesState.barn && fellesState.barn.length > 0 && (
                <>
                    <Select
                        value={pleietrengendeIdent}
                        bredde="l"
                        label={intlHelper(intl, 'ident.identifikasjon.velgPleietrengende')}
                        onChange={(e) => {
                            pleietrengendeIdentInputFieldOnChange(e);
                            oppdaterStateMedPleietrengendeFnr(e);
                        }}
                        disabled={gjelderAnnetPleietrengende}
                        aria-hidden={skalHenteBarn}
                    >
                        <option key="default" value="" label=" " />)
                        {fellesState.barn.map((b) => (
                            <option key={b.identitetsnummer} value={b.identitetsnummer}>
                                {`${b.fornavn} ${b.etternavn} - ${b.identitetsnummer}`}
                            </option>
                        ))}
                    </Select>
                    <VerticalSpacer eightPx />
                    <Checkbox
                        label={intlHelper(intl, 'ident.identifikasjon.annetPleietrengende')}
                        onChange={(e) => {
                            setGjelderAnnetPleietrengende(e.target.checked);
                            nullUtPleietrengendeIdent();
                        }}
                    />
                </>
            )}
            <VerticalSpacer sixteenPx />
            {(gjelderAnnetPleietrengende ||
                !!fellesState.hentBarnError ||
                !!fellesState.hentBarnForbidden ||
                (!!fellesState.barn && fellesState.barn.length === 0)) && (
                <>
                    <div className="fyllUtIdentAnnetBarnContainer">
                        <Input
                            label={intlHelper(intl, 'ident.identifikasjon.pleietrengende')}
                            onChange={pleietrengendeIdentInputFieldOnChange}
                            onBlur={oppdaterStateMedPleietrengendeFnr}
                            value={pleietrengendeIdent}
                            className="bold-label ident-soker-2"
                            maxLength={11}
                            feil={
                                identState.ident2 && erUgyldigIdent(identState.ident2)
                                    ? intlHelper(intl, 'ident.feil.ugyldigident')
                                    : undefined
                            }
                            bredde="M"
                            disabled={pleietrengendeHarIkkeFnr}
                        />
                        {pleietrengendeIdent.length === 11 && !erUgyldigIdent(identState.ident2) && (
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
                            <Checkbox
                                label={intlHelper(intl, 'ident.identifikasjon.pleietrengendeHarIkkeFnr')}
                                onChange={(e) => pleietrengendeHarIkkeFnrCheckboks(e.target.checked)}
                            />
                            {pleietrengendeHarIkkeFnr && (
                                <AlertStripeInfo className="infotrygd_info">
                                    {' '}
                                    {intlHelper(intl, 'ident.identifikasjon.pleietrengendeHarIkkeFnrInformasjon')}
                                </AlertStripeInfo>
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
    setIdentAction: (ident1: string, ident2: string | null, annenSokerIdent: string | null) =>
        dispatch(setIdentFellesAction(ident1, ident2, annenSokerIdent)),
    henteBarn: (ident1: string) => dispatch(hentBarn(ident1)),
});

const Pleietrengende = injectIntl(connect(mapStateToProps, mapDispatchToProps)(PleietrengendeComponent));

export { Pleietrengende, PleietrengendeComponent };
