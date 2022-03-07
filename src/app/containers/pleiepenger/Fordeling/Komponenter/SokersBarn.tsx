import Personvelger from 'app/components/person-velger/Personvelger';
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

export interface ISokersBarnStateProps {
    identState: IIdentState;
    fellesState: IFellesState;
    dedupkey: string;
}

export interface ISokersBarnDispatchProps {
    setIdentAction: typeof setIdentFellesAction;
    henteBarn: typeof hentBarn;
}

export interface ISokersBarn {
    sokersIdent: string;
    barnetHarInteFnrFn?: (harBarnetFnr: boolean) => void;
    flervalg: boolean;
    visSokersBarn?: boolean;
}

type ISokersBarnProps = WrappedComponentProps & ISokersBarnStateProps & ISokersBarnDispatchProps & ISokersBarn;

const SokersBarnComponent: React.FunctionComponent<ISokersBarnProps> = (props) => {
    const {
        intl,
        barnetHarInteFnrFn,
        identState,
        sokersIdent,
        fellesState,
        setIdentAction,
        henteBarn,
        visSokersBarn,
        flervalg,
    } = props;

    const [barnetsIdent, setBarnetsIdent] = useState<string>('');
    const [barnetHarIkkeFnr, setBarnetHarIkkeFnr] = useState<boolean>(false);
    const [gjelderAnnetBarn, setGjelderAnnetBarn] = useState<boolean>(false);

    useEffect(() => {
        if (sokersIdent.length > 0) {
            henteBarn(sokersIdent);
        }
    }, [sokersIdent]);

    const barnetsIdentInputFieldOnChange = (event: any) => {
        setBarnetsIdent(event.target.value.replace(/\D+/, ''));
    };

    const oppdaterStateMedBarnetsFnr = (event: any) => {
        setIdentAction(identState.ident1, event.target.value, identState.annenSokerIdent);
    };

    const nullUtBarnetsIdent = () => {
        setBarnetsIdent('');
        setIdentAction(identState.ident1, '', identState.annenSokerIdent);
    };

    const barnHarIkkeFnrCheckboks = (checked: boolean) => {
        setBarnetHarIkkeFnr(checked);
        if (barnetHarInteFnrFn) barnetHarInteFnrFn(checked);
        if (checked) {
            setBarnetsIdent('');
            setIdentAction(identState.ident1, null);
        }
    };

    if (!visSokersBarn) {
        return null;
    }

    if (flervalg) {
        return (
            <div>
                <Personvelger />
            </div>
        );
    }

    return (
        <div className="sokersBarn">
            {!!fellesState.hentBarnSuccess && !!fellesState.barn && fellesState.barn.length > 0 && (
                <>
                    <Select
                        value={barnetsIdent}
                        bredde="l"
                        label={intlHelper(intl, 'ident.identifikasjon.velgBarn')}
                        onChange={(e) => {
                            barnetsIdentInputFieldOnChange(e);
                            oppdaterStateMedBarnetsFnr(e);
                        }}
                        disabled={gjelderAnnetBarn}
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
                        label={intlHelper(intl, 'ident.identifikasjon.annetBarn')}
                        onChange={(e) => {
                            setGjelderAnnetBarn(e.target.checked);
                            nullUtBarnetsIdent();
                        }}
                    />
                </>
            )}
            <VerticalSpacer sixteenPx />
            {(gjelderAnnetBarn ||
                !!fellesState.hentBarnError ||
                !!fellesState.hentBarnForbidden ||
                (!!fellesState.barn && fellesState.barn.length === 0)) && (
                <>
                    <div className="fyllUtIdentAnnetBarnContainer">
                        <Input
                            label={intlHelper(intl, 'ident.identifikasjon.barn')}
                            onChange={barnetsIdentInputFieldOnChange}
                            onBlur={oppdaterStateMedBarnetsFnr}
                            value={barnetsIdent}
                            className="bold-label ident-soker-2"
                            maxLength={11}
                            feil={
                                identState.ident2 && erUgyldigIdent(identState.ident2)
                                    ? intlHelper(intl, 'ident.feil.ugyldigident')
                                    : undefined
                            }
                            bredde="M"
                            disabled={barnetHarIkkeFnr}
                        />
                        {barnetsIdent.length === 11 && !erUgyldigIdent(identState.ident2) && (
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
                    {barnetHarInteFnrFn && (
                        <>
                            <Checkbox
                                label={intlHelper(intl, 'ident.identifikasjon.barnHarIkkeFnr')}
                                onChange={(e) => barnHarIkkeFnrCheckboks(e.target.checked)}
                            />
                            {barnetHarIkkeFnr && (
                                <AlertStripeInfo className="infotrygd_info">
                                    {' '}
                                    {intlHelper(intl, 'ident.identifikasjon.barnHarIkkeFnrInformasjon')}
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

const SokersBarn = injectIntl(connect(mapStateToProps, mapDispatchToProps)(SokersBarnComponent));

export { SokersBarn, SokersBarnComponent };
