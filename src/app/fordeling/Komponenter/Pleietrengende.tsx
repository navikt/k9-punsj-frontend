import React, { useEffect, useState } from 'react';

import { FormattedMessage, useIntl } from 'react-intl';
import { Alert, Checkbox, Select } from '@navikt/ds-react';

import { IdentRules } from 'app/rules';
import intlHelper from 'app/utils/intlUtils';
import VerticalSpacer from 'app/components/VerticalSpacer';
import { Person } from 'app/models/types/Person';
import { getPersonInfo } from 'app/api/api';
import FnrTextField from 'app/components/fnr-text-field/FnrTextField';
import { IIdentState } from 'app/models/types/IdentState';
import { IFellesState } from 'app/state/reducers/FellesReducer';

import './pleietrengende.less';

export interface Props {
    identState: IIdentState;
    fellesState: IFellesState;
    toSokereIJournalpost: boolean;
    skalHenteBarn?: boolean;
    visPleietrengende?: boolean;
    jpErFerdigstiltOgUtenPleietrengende?: boolean;

    setIdentAction: (søkerId: string, pleietrengendeId?: string | null, annenSokerIdent?: string | null) => void;
    henteBarn: (søkerId: string) => void;
    setBarnetHarIkkeFnr?: (harPleietrengendeFnr: boolean) => void;
}

const Pleietrengende: React.FC<Props> = ({
    identState,
    fellesState,
    toSokereIJournalpost,
    visPleietrengende,
    skalHenteBarn,
    jpErFerdigstiltOgUtenPleietrengende,

    setIdentAction,
    henteBarn,
    setBarnetHarIkkeFnr,
}: Props) => {
    const intl = useIntl();

    const [pleietrengendeIdent, setPleietrengendeIdent] = useState<string>('');
    const [pleietrengendeHarIkkeFnr, setPleietrengendeHarIkkeFnr] = useState<boolean>(false);
    const [gjelderAnnenPleietrengende, setGjelderAnnenPleietrengende] = useState<boolean>(false);
    const [pleietrengendeInfo, setPleietrengendeInfo] = useState<Person | undefined>(undefined);
    const [pleietrengendeInfoLoading, setPleietrengendeInfoLoading] = useState<boolean>(false);
    const [pleietrengendeInfoError, setPleietrengendeInfoError] = useState<boolean>(false);

    const { søkerId, pleietrengendeId, annenSokerIdent } = identState;
    const { barn, hentBarnSuccess, hentBarnError, hentBarnForbidden } = fellesState;

    useEffect(() => {
        setPleietrengendeIdent('');
        setPleietrengendeInfo(undefined);

        if (søkerId.length > 0 && skalHenteBarn && visPleietrengende) {
            henteBarn(søkerId);
        }
    }, [søkerId, visPleietrengende, skalHenteBarn]);

    if (!visPleietrengende) {
        return null;
    }

    const hentPleietrengendeInfo = (pleietrengendesFødselsnummer: string) => {
        setPleietrengendeInfoError(false);
        setPleietrengendeInfoLoading(true);

        getPersonInfo(pleietrengendesFødselsnummer, (response, data: Person) => {
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

        if (pleietrengendeId.length > 0 && identFromInput.length < pleietrengendeIdent.length) {
            setPleietrengendeInfo(undefined);
            setIdentAction(søkerId, '', annenSokerIdent);
        }

        if (identFromInput.length === 11) {
            if (!IdentRules.erUgyldigIdent(identFromInput)) {
                hentPleietrengendeInfo(identFromInput);
            }

            setIdentAction(søkerId, identFromInput, annenSokerIdent);
        }

        setPleietrengendeIdent(identFromInput);
    };

    const oppdaterStateMedPleietrengendeFnr = (event: any) => {
        setIdentAction(søkerId, event.target.value, annenSokerIdent);
    };

    const nullUtPleietrengendeIdent = () => {
        setPleietrengendeIdent('');
        setPleietrengendeInfo(undefined);
        setIdentAction(søkerId, '', annenSokerIdent);
    };

    const pleietrengendeHarIkkeFnrCheckboks = (checked: boolean) => {
        setPleietrengendeHarIkkeFnr(checked);
        setPleietrengendeInfo(undefined);
        if (setBarnetHarIkkeFnr) setBarnetHarIkkeFnr(checked);
        if (checked) {
            setPleietrengendeIdent('');
            setIdentAction(søkerId, '', annenSokerIdent);
        }
    };

    const isPleitrengendeFnrErSammeSomSøker = søkerId === pleietrengendeId;
    const visPleietrengendeSelect = !!hentBarnSuccess && !!barn && barn.length > 0;
    const visPleitrengendeTextInput =
        gjelderAnnenPleietrengende ||
        !skalHenteBarn ||
        !!hentBarnError ||
        !!hentBarnForbidden ||
        (!!barn && barn.length === 0);

    const visPleietrengendeHarIkkeFnrCheckbox = !!setBarnetHarIkkeFnr;
    const visPleietrengendeHarIkkeFnrInfo =
        !toSokereIJournalpost && pleietrengendeHarIkkeFnr && !jpErFerdigstiltOgUtenPleietrengende;
    const visPleietrengendeHarIkkeFnrInfoFerdistiltJp =
        pleietrengendeHarIkkeFnr && !!jpErFerdigstiltOgUtenPleietrengende;

    return (
        <div>
            {visPleietrengendeSelect && (
                <>
                    <VerticalSpacer eightPx />

                    <Select
                        className="pleietrengendeSelect"
                        label={intlHelper(intl, 'ident.identifikasjon.velgBarn')}
                        onChange={(e) => {
                            setPleietrengendeIdent(e.target.value);
                            oppdaterStateMedPleietrengendeFnr(e);
                        }}
                        value={pleietrengendeId}
                        disabled={gjelderAnnenPleietrengende}
                        defaultValue={pleietrengendeId}
                    >
                        <option key="default" value="" label="Velg barn" aria-label="Tomt valg" />

                        {!gjelderAnnenPleietrengende &&
                            barn?.map((b) => (
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
                        <FormattedMessage id="ident.identifikasjon.annetBarn" />
                    </Checkbox>
                </>
            )}

            {visPleitrengendeTextInput && (
                <>
                    <FnrTextField
                        label="ident.identifikasjon.pleietrengende"
                        labelId="ident.identifikasjon.pleietrengende"
                        value={pleietrengendeIdent}
                        loadingPersonsInfo={pleietrengendeInfoLoading}
                        errorPersonsInfo={pleietrengendeInfoError}
                        person={pleietrengendeInfo}
                        errorValidationMessage={
                            isPleitrengendeFnrErSammeSomSøker ||
                            (pleietrengendeId && IdentRules.erUgyldigIdent(pleietrengendeId))
                                ? intlHelper(intl, 'ident.feil.ugyldigident')
                                : undefined
                        }
                        disabled={pleietrengendeHarIkkeFnr}
                        onChange={pleietrengendeIdentInputFieldOnChange}
                    />

                    <VerticalSpacer eightPx />

                    {visPleietrengendeHarIkkeFnrCheckbox && (
                        <>
                            <Checkbox onChange={(e) => pleietrengendeHarIkkeFnrCheckboks(e.target.checked)}>
                                <FormattedMessage id="ident.identifikasjon.pleietrengendeHarIkkeFnr" />
                            </Checkbox>

                            {visPleietrengendeHarIkkeFnrInfo && (
                                <Alert
                                    size="small"
                                    variant="info"
                                    className="infotrygd_info"
                                    data-test-id="pleietrengendeHarIkkeFnrInformasjon"
                                >
                                    <FormattedMessage id="ident.identifikasjon.pleietrengendeHarIkkeFnrInformasjon" />
                                </Alert>
                            )}

                            {visPleietrengendeHarIkkeFnrInfoFerdistiltJp && (
                                <Alert size="small" variant="info" className="infotrygd_info">
                                    <FormattedMessage id="ident.identifikasjon.pleietrengendeHarIkkeFnrInformasjon.ferdistilt" />
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

export default Pleietrengende;
