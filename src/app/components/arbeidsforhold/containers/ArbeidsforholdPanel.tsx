import React from 'react';
import { set } from 'lodash';
import { EkspanderbartpanelBase } from 'nav-frontend-ekspanderbartpanel';
import { CheckboksPanel, CheckboksPanelGruppe, RadioPanelGruppe } from 'nav-frontend-skjema';

import { useIntl } from 'react-intl';

import { Alert, Panel, TextField, Textarea } from '@navikt/ds-react';

import ArbeidstidKalender from 'app/components/arbeidstid/ArbeidstidKalender';
import DateInput from 'app/components/skjema/DateInput';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { periodeSpenn } from 'app/components/skjema/skjemaUtils';
import { Arbeidsforhold, JaNei } from 'app/models/enums';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import { Virksomhetstyper } from 'app/models/enums/Virksomhetstyper';
import intlHelper from 'app/utils/intlUtils';

import VerticalSpacer from 'app/components/vertical-spacer/VerticalSpacer';
import { CountrySelect } from 'app/components/country-select/CountrySelect';
import { arbeidstidInformasjon } from 'app/ytelser/pleiepenger/ArbeidstidInfo';
import { Arbeidstaker, IPeriode } from 'app/models/types';
import { IPLSSoknad } from 'app/ytelser/pleiepenger-livets-sluttfase/types/PLSSoknad';
import Arbeidstakerperioder from './Arbeidstakerperioder';

const erYngreEnn4år = (dato: string) => {
    const fireAarSiden = new Date();
    fireAarSiden.setFullYear(fireAarSiden.getFullYear() - 4);
    return new Date(dato) > fireAarSiden;
};

const erEldreEnn4år = (dato: string) => {
    const fireAarSiden = new Date();
    fireAarSiden.setFullYear(fireAarSiden.getFullYear() - 4);
    return new Date(dato) < fireAarSiden;
};

interface ArbeidsforholdPanelProps {
    isOpen: boolean;
    onPanelClick: () => void;
    handleArbeidsforholdChange: (af: Arbeidsforhold, checked: boolean) => void;
    getCheckedValueArbeid: (af: Arbeidsforhold) => boolean;
    soknad: IPLSSoknad;
    eksisterendePerioder: IPeriode[];
    initialArbeidstaker: Arbeidstaker;
    updateSoknad: (soknad: Partial<IPLSSoknad>) => (dispatch: any) => Promise<Response>;
    updateSoknadState: (soknad: Partial<IPLSSoknad>, showStatus?: boolean) => void;
    getErrorMessage: (attribute: string, indeks?: number) => string | undefined;
    getUhaandterteFeil: (kode: string) => (string | undefined)[];
    handleFrilanserChange: (jaNei: JaNei) => void;
    updateVirksomhetstyper: (v: Virksomhetstyper, checked: boolean) => void;
}

const ArbeidsforholdPanel = ({
    isOpen,
    onPanelClick,
    handleArbeidsforholdChange,
    getCheckedValueArbeid,
    soknad,
    eksisterendePerioder,
    updateSoknad,
    updateSoknadState,
    getErrorMessage,
    getUhaandterteFeil,
    handleFrilanserChange,
    updateVirksomhetstyper,
    initialArbeidstaker,
}: ArbeidsforholdPanelProps): JSX.Element => {
    const intl = useIntl();
    const [harRegnskapsfører, setHasRegnskapsfører] = React.useState(false);
    const soeknadsperiode = soknad?.soeknadsperiode || [];

    const frilanserperioder = () => {
        const arbeid = soknad.arbeidstid;
        const opptjening = soknad.opptjeningAktivitet;

        return (
            <>
                <DateInput
                    id="frilanser-startdato"
                    value={soknad.opptjeningAktivitet.frilanser?.startdato || ''}
                    className="frilanser-startdato"
                    label={intlHelper(intl, 'skjema.frilanserdato')}
                    errorMessage={getErrorMessage('ytelse.opptjeningAktivitet.frilanser.startdato')}
                    onChange={(selectedDate: any) => {
                        updateSoknadState(
                            {
                                opptjeningAktivitet: {
                                    ...opptjening,
                                    frilanser: {
                                        ...soknad.opptjeningAktivitet.frilanser,
                                        startdato: selectedDate,
                                    },
                                },
                            },
                            false,
                        );
                        updateSoknad({
                            opptjeningAktivitet: {
                                ...opptjening,
                                frilanser: {
                                    ...soknad.opptjeningAktivitet.frilanser,
                                    startdato: selectedDate,
                                },
                            },
                        });
                    }}
                />
                <RadioPanelGruppe
                    className="horizontalRadios"
                    name="fortsattFrilanser"
                    radios={Object.values(JaNei).map((jn) => ({
                        label: intlHelper(intl, jn),
                        value: jn,
                    }))}
                    legend={intlHelper(intl, 'skjema.fortsattfrilanser')}
                    checked={
                        opptjening.frilanser && opptjening.frilanser.jobberFortsattSomFrilans ? JaNei.JA : JaNei.NEI
                    }
                    onChange={(event) => {
                        handleFrilanserChange((event.target as HTMLInputElement).value as JaNei);
                    }}
                />
                <VerticalSpacer eightPx />
                {!opptjening.frilanser?.jobberFortsattSomFrilans && (
                    <DateInput
                        id="frilanser-sluttdato"
                        value={soknad.opptjeningAktivitet.frilanser?.sluttdato || ''}
                        className="frilanser-sluttdato"
                        label={intlHelper(intl, 'skjema.frilanserdato.slutt')}
                        onChange={(selectedDate: any) => {
                            updateSoknadState(
                                {
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        frilanser: {
                                            ...soknad.opptjeningAktivitet.frilanser,
                                            sluttdato: selectedDate,
                                        },
                                    },
                                },
                                false,
                            );
                            updateSoknad({
                                opptjeningAktivitet: {
                                    ...opptjening,
                                    frilanser: {
                                        ...soknad.opptjeningAktivitet.frilanser,
                                        sluttdato: selectedDate,
                                    },
                                },
                            });
                        }}
                    />
                )}
                {soknad.opptjeningAktivitet.frilanser?.jobberFortsattSomFrilans && (
                    <>
                        {arbeidstidInformasjon(intl)}
                        <VerticalSpacer eightPx />
                        <ArbeidstidKalender
                            nyeSoknadsperioder={soeknadsperiode}
                            eksisterendeSoknadsperioder={eksisterendePerioder}
                            updateSoknad={(perioder) => {
                                updateSoknad({ arbeidstid: set(arbeid, 'frilanserArbeidstidInfo.perioder', perioder) });
                            }}
                            updateSoknadState={(perioder) =>
                                updateSoknadState({
                                    arbeidstid: set(arbeid, 'frilanserArbeidstidInfo.perioder', perioder),
                                })
                            }
                            arbeidstidInfo={arbeid?.frilanserArbeidstidInfo}
                        />
                    </>
                )}
            </>
        );
    };

    const handleRegnskapsførerChange = (jn: JaNei) => {
        if (jn === JaNei.JA) {
            setHasRegnskapsfører(true);
        } else {
            setHasRegnskapsfører(false);
            updateSoknad({
                opptjeningAktivitet: {
                    ...soknad.opptjeningAktivitet,
                    selvstendigNaeringsdrivende: {
                        ...soknad.opptjeningAktivitet.selvstendigNaeringsdrivende,
                        info: {
                            ...soknad.opptjeningAktivitet.selvstendigNaeringsdrivende?.info,
                            regnskapsførerNavn: '',
                            regnskapsførerTlf: '',
                        },
                    },
                },
            });
            updateSoknadState({
                opptjeningAktivitet: {
                    ...soknad.opptjeningAktivitet,
                    selvstendigNaeringsdrivende: {
                        ...soknad.opptjeningAktivitet.selvstendigNaeringsdrivende,
                        info: {
                            ...soknad.opptjeningAktivitet.selvstendigNaeringsdrivende?.info,
                            regnskapsførerNavn: '',
                            regnskapsførerTlf: '',
                        },
                    },
                },
            });
        }
    };

    const selvstendigperioder = () => {
        const opptjening = soknad.opptjeningAktivitet;
        const arbeid = soknad.arbeidstid;
        return (
            <div className="infoContainer">
                <CheckboksPanelGruppe
                    className="virksomhetstypercheckbox"
                    legend={intlHelper(intl, 'skjema.arbeid.sn.type')}
                    feil={getErrorMessage(
                        `ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].perioder[${periodeSpenn(
                            opptjening?.selvstendigNaeringsdrivende?.info?.periode,
                        )}].virksomhetstyper`,
                    )}
                    checkboxes={Object.values(Virksomhetstyper).map((v) => ({
                        label: v,
                        value: v,
                        onChange: (e) => updateVirksomhetstyper(v, e.target.checked),
                        checked: opptjening.selvstendigNaeringsdrivende?.info?.virksomhetstyper?.some((vt) => vt === v),
                    }))}
                    onChange={() => undefined}
                />
                <div className="generelleopplysiniger">
                    <div className="flex flex-wrap">
                        <TextField
                            label={intlHelper(intl, 'skjema.arbeid.sn.virksomhetsnavn')}
                            value={soknad.opptjeningAktivitet.selvstendigNaeringsdrivende?.virksomhetNavn || ''}
                            className="virksomhetsNavn"
                            onChange={(event: any) =>
                                updateSoknadState(
                                    {
                                        opptjeningAktivitet: {
                                            ...opptjening,
                                            selvstendigNaeringsdrivende: {
                                                ...opptjening.selvstendigNaeringsdrivende,
                                                virksomhetNavn: event.target.value,
                                            },
                                        },
                                    },
                                    false,
                                )
                            }
                            onBlur={(event: any) =>
                                updateSoknad({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            virksomhetNavn: event.target.value,
                                        },
                                    },
                                })
                            }
                        />
                    </div>
                </div>
                <RadioPanelGruppe
                    className="horizontalRadios"
                    name="virksomhetRegistrertINorge"
                    radios={Object.values(JaNei).map((jn) => ({
                        label: intlHelper(intl, jn),
                        value: jn,
                    }))}
                    legend={intlHelper(intl, 'skjema.sn.registrertINorge')}
                    checked={opptjening.selvstendigNaeringsdrivende?.info?.registrertIUtlandet ? JaNei.NEI : JaNei.JA}
                    onChange={(event) => {
                        updateSoknad({
                            opptjeningAktivitet: {
                                ...opptjening,
                                selvstendigNaeringsdrivende: {
                                    ...opptjening.selvstendigNaeringsdrivende,
                                    info: {
                                        ...opptjening.selvstendigNaeringsdrivende?.info,
                                        registrertIUtlandet:
                                            ((event.target as HTMLInputElement).value as JaNei) !== JaNei.JA,
                                    },
                                },
                            },
                        });
                        updateSoknadState({
                            opptjeningAktivitet: {
                                ...opptjening,
                                selvstendigNaeringsdrivende: {
                                    ...opptjening.selvstendigNaeringsdrivende,
                                    info: {
                                        ...opptjening.selvstendigNaeringsdrivende?.info,
                                        registrertIUtlandet:
                                            ((event.target as HTMLInputElement).value as JaNei) !== JaNei.JA,
                                    },
                                },
                            },
                        });
                    }}
                />
                {!opptjening.selvstendigNaeringsdrivende?.info?.registrertIUtlandet && (
                    <div className="flex flex-wrap">
                        <TextField
                            label={intlHelper(intl, 'skjema.arbeid.arbeidstaker.orgnr')}
                            value={opptjening.selvstendigNaeringsdrivende?.organisasjonsnummer || ''}
                            className="sn-organisasjonsnummer"
                            error={getErrorMessage(
                                'ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].organisasjonsnummer.valid',
                            )}
                            onChange={(event: any) =>
                                updateSoknadState(
                                    {
                                        opptjeningAktivitet: {
                                            ...opptjening,
                                            selvstendigNaeringsdrivende: {
                                                ...opptjening.selvstendigNaeringsdrivende,
                                                organisasjonsnummer: event.target.value,
                                            },
                                        },
                                    },
                                    false,
                                )
                            }
                            onBlur={(event: any) =>
                                updateSoknad({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            organisasjonsnummer: event.target.value,
                                        },
                                    },
                                })
                            }
                        />
                    </div>
                )}
                {!!opptjening.selvstendigNaeringsdrivende?.info?.registrertIUtlandet && (
                    <CountrySelect
                        selectedcountry={opptjening.selvstendigNaeringsdrivende.info.landkode || ''}
                        label={intlHelper(intl, 'skjema.sn.registrertLand')}
                        onChange={(event) => {
                            updateSoknad({
                                opptjeningAktivitet: {
                                    ...opptjening,
                                    selvstendigNaeringsdrivende: {
                                        ...opptjening.selvstendigNaeringsdrivende,
                                        info: {
                                            ...opptjening.selvstendigNaeringsdrivende?.info,
                                            landkode: event.target.value,
                                        },
                                    },
                                },
                            });
                            updateSoknadState({
                                opptjeningAktivitet: {
                                    ...opptjening,
                                    selvstendigNaeringsdrivende: {
                                        ...opptjening.selvstendigNaeringsdrivende,
                                        info: {
                                            ...opptjening.selvstendigNaeringsdrivende?.info,
                                            landkode: event.target.value,
                                        },
                                    },
                                },
                            });
                        }}
                    />
                )}
                <RadioPanelGruppe
                    className="horizontalRadios"
                    name="harRegnskapsfører"
                    radios={Object.values(JaNei).map((jn) => ({
                        label: intlHelper(intl, jn),
                        value: jn,
                    }))}
                    legend={intlHelper(intl, 'skjema.arbeid.sn.regnskapsfører')}
                    checked={
                        !!harRegnskapsfører ||
                        opptjening.selvstendigNaeringsdrivende?.info?.regnskapsførerNavn ||
                        opptjening.selvstendigNaeringsdrivende?.info?.regnskapsførerNavn
                            ? JaNei.JA
                            : JaNei.NEI
                    }
                    onChange={(event) => {
                        handleRegnskapsførerChange((event.target as HTMLInputElement).value as JaNei);
                    }}
                />
                {harRegnskapsfører && (
                    <div className="generelleopplysiniger">
                        <div className="flex flex-wrap">
                            <TextField
                                label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførernavn')}
                                value={opptjening.selvstendigNaeringsdrivende?.info?.regnskapsførerNavn || ''}
                                className="regnskapsførerNavn"
                                onChange={(event: any) =>
                                    updateSoknadState(
                                        {
                                            opptjeningAktivitet: {
                                                ...opptjening,
                                                selvstendigNaeringsdrivende: {
                                                    ...opptjening.selvstendigNaeringsdrivende,
                                                    info: {
                                                        ...opptjening.selvstendigNaeringsdrivende?.info,
                                                        regnskapsførerNavn: event.target.value,
                                                    },
                                                },
                                            },
                                        },
                                        false,
                                    )
                                }
                                onBlur={(event: any) =>
                                    updateSoknad({
                                        opptjeningAktivitet: {
                                            ...opptjening,
                                            selvstendigNaeringsdrivende: {
                                                ...opptjening.selvstendigNaeringsdrivende,
                                                info: {
                                                    ...opptjening.selvstendigNaeringsdrivende?.info,
                                                    regnskapsførerNavn: event.target.value,
                                                },
                                            },
                                        },
                                    })
                                }
                            />
                        </div>
                        <div className="flex flex-wrap">
                            <TextField
                                label={intlHelper(intl, 'skjema.arbeid.sn.regnskapsførertlf')}
                                value={opptjening.selvstendigNaeringsdrivende?.info?.regnskapsførerTlf || ''}
                                className="sn-regskasførertlf"
                                type="number"
                                onChange={(event: any) =>
                                    updateSoknadState(
                                        {
                                            opptjeningAktivitet: {
                                                ...opptjening,
                                                selvstendigNaeringsdrivende: {
                                                    ...opptjening.selvstendigNaeringsdrivende,
                                                    info: {
                                                        ...opptjening.selvstendigNaeringsdrivende?.info,
                                                        regnskapsførerTlf: event.target.value,
                                                    },
                                                },
                                            },
                                        },
                                        false,
                                    )
                                }
                                onBlur={(event: any) =>
                                    updateSoknad({
                                        opptjeningAktivitet: {
                                            ...opptjening,
                                            selvstendigNaeringsdrivende: {
                                                ...opptjening.selvstendigNaeringsdrivende,
                                                info: {
                                                    ...opptjening.selvstendigNaeringsdrivende?.info,
                                                    regnskapsførerTlf: event.target.value,
                                                },
                                            },
                                        },
                                    })
                                }
                            />
                        </div>
                    </div>
                )}
                <h3>{intlHelper(intl, 'skjema.arbeid.sn.når')}</h3>
                <div className="sn-startdatocontainer">
                    <DateInput
                        className="fom"
                        value={opptjening.selvstendigNaeringsdrivende?.info?.periode?.fom || ''}
                        label={intlHelper(intl, 'skjema.arbeid.sn.startdato')}
                        errorMessage={getErrorMessage(
                            'ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].perioder',
                        )}
                        onChange={(selectedDate: any) => {
                            updateSoknadState(
                                {
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                periode: {
                                                    ...opptjening.selvstendigNaeringsdrivende?.info?.periode,
                                                    fom: selectedDate,
                                                },
                                            },
                                        },
                                    },
                                },
                                false,
                            );
                            updateSoknad({
                                opptjeningAktivitet: {
                                    ...opptjening,
                                    selvstendigNaeringsdrivende: {
                                        ...opptjening.selvstendigNaeringsdrivende,
                                        info: {
                                            ...opptjening.selvstendigNaeringsdrivende?.info,
                                            periode: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info?.periode,
                                                fom: selectedDate,
                                            },
                                        },
                                    },
                                },
                            });
                        }}
                    />
                    <DateInput
                        className="tom"
                        value={opptjening.selvstendigNaeringsdrivende?.info?.periode?.tom || ''}
                        label={intlHelper(intl, 'skjema.arbeid.sn.sluttdato')}
                        onChange={(selectedDate: any) => {
                            updateSoknadState(
                                {
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                periode: {
                                                    ...opptjening.selvstendigNaeringsdrivende?.info?.periode,
                                                    tom: selectedDate,
                                                },
                                            },
                                        },
                                    },
                                },
                                false,
                            );
                            updateSoknad({
                                opptjeningAktivitet: {
                                    ...opptjening,
                                    selvstendigNaeringsdrivende: {
                                        ...opptjening.selvstendigNaeringsdrivende,
                                        info: {
                                            ...opptjening.selvstendigNaeringsdrivende?.info,
                                            periode: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info?.periode,
                                                tom: selectedDate,
                                            },
                                        },
                                    },
                                },
                            });
                        }}
                    />
                </div>
                {!!opptjening.selvstendigNaeringsdrivende?.info?.periode?.fom &&
                    erYngreEnn4år(opptjening.selvstendigNaeringsdrivende?.info?.periode?.fom) && (
                        <TextField
                            label={intlHelper(intl, 'skjema.sn.bruttoinntekt')}
                            className="bruttoinntekt"
                            value={opptjening.selvstendigNaeringsdrivende?.info?.bruttoInntekt || ''}
                            onChange={(event: any) =>
                                updateSoknadState(
                                    {
                                        opptjeningAktivitet: {
                                            ...opptjening,
                                            selvstendigNaeringsdrivende: {
                                                ...opptjening.selvstendigNaeringsdrivende,
                                                info: {
                                                    ...opptjening.selvstendigNaeringsdrivende?.info,
                                                    bruttoInntekt: event.target.value,
                                                },
                                            },
                                        },
                                    },
                                    false,
                                )
                            }
                            onBlur={(event: any) =>
                                updateSoknad({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                bruttoInntekt: event.target.value,
                                            },
                                        },
                                    },
                                })
                            }
                        />
                    )}
                {!!opptjening.selvstendigNaeringsdrivende?.info?.periode?.fom &&
                    erEldreEnn4år(opptjening.selvstendigNaeringsdrivende?.info?.periode?.fom) && (
                        <RadioPanelGruppe
                            className="horizontalRadios"
                            name="varigEndringradios"
                            radios={Object.values(JaNei).map((jn) => ({
                                label: intlHelper(intl, jn),
                                value: jn,
                            }))}
                            legend={intlHelper(intl, 'skjema.sn.varigendring')}
                            checked={opptjening.selvstendigNaeringsdrivende?.info.erVarigEndring ? JaNei.JA : JaNei.NEI}
                            onChange={(event) => {
                                updateSoknad({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                erVarigEndring:
                                                    ((event.target as HTMLInputElement).value as JaNei) === JaNei.JA,
                                            },
                                        },
                                    },
                                });
                                updateSoknadState({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                erVarigEndring:
                                                    ((event.target as HTMLInputElement).value as JaNei) === JaNei.JA,
                                            },
                                        },
                                    },
                                });
                            }}
                        />
                    )}
                {!!opptjening.selvstendigNaeringsdrivende?.info?.erVarigEndring && (
                    <>
                        <div className="flex flex-wrap">
                            <DateInput
                                className="endringdato"
                                value={opptjening.selvstendigNaeringsdrivende?.info?.endringDato || ''}
                                label={intlHelper(intl, 'skjema.sn.varigendringdato')}
                                onChange={(selectedDate: any) => {
                                    updateSoknadState(
                                        {
                                            opptjeningAktivitet: {
                                                ...opptjening,
                                                selvstendigNaeringsdrivende: {
                                                    ...opptjening.selvstendigNaeringsdrivende,
                                                    info: {
                                                        ...opptjening.selvstendigNaeringsdrivende?.info,
                                                        endringDato: selectedDate,
                                                    },
                                                },
                                            },
                                        },
                                        false,
                                    );
                                    updateSoknad({
                                        opptjeningAktivitet: {
                                            ...opptjening,
                                            selvstendigNaeringsdrivende: {
                                                ...opptjening.selvstendigNaeringsdrivende,
                                                info: {
                                                    ...opptjening.selvstendigNaeringsdrivende?.info,
                                                    endringDato: selectedDate,
                                                },
                                            },
                                        },
                                    });
                                }}
                            />
                        </div>
                        <div className="flex flex-wrap">
                            <TextField
                                label={intlHelper(intl, 'skjema.sn.endringinntekt')}
                                type="number"
                                className="endringinntekt"
                                value={opptjening.selvstendigNaeringsdrivende?.info?.endringInntekt || ''}
                                onChange={(event: any) =>
                                    updateSoknadState(
                                        {
                                            opptjeningAktivitet: {
                                                ...opptjening,
                                                selvstendigNaeringsdrivende: {
                                                    ...opptjening.selvstendigNaeringsdrivende,
                                                    info: {
                                                        ...opptjening.selvstendigNaeringsdrivende?.info,
                                                        endringInntekt: event.target.value,
                                                    },
                                                },
                                            },
                                        },
                                        false,
                                    )
                                }
                                onBlur={(event: any) =>
                                    updateSoknad({
                                        opptjeningAktivitet: {
                                            ...opptjening,
                                            selvstendigNaeringsdrivende: {
                                                ...opptjening.selvstendigNaeringsdrivende,
                                                info: {
                                                    ...opptjening.selvstendigNaeringsdrivende?.info,
                                                    endringInntekt: event.target.value,
                                                },
                                            },
                                        },
                                    })
                                }
                            />
                        </div>

                        <Textarea
                            label={intlHelper(intl, 'skjema.sn.endringbegrunnelse')}
                            className="endringbegrunnelse"
                            value={opptjening.selvstendigNaeringsdrivende?.info?.endringBegrunnelse || ''}
                            onChange={(event: any) =>
                                updateSoknadState(
                                    {
                                        opptjeningAktivitet: {
                                            ...opptjening,
                                            selvstendigNaeringsdrivende: {
                                                ...opptjening.selvstendigNaeringsdrivende,
                                                info: {
                                                    ...opptjening.selvstendigNaeringsdrivende?.info,
                                                    endringBegrunnelse: event.target.value,
                                                },
                                            },
                                        },
                                    },
                                    false,
                                )
                            }
                            onBlur={(event: any) =>
                                updateSoknad({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                endringBegrunnelse: event.target.value,
                                            },
                                        },
                                    },
                                })
                            }
                        />
                    </>
                )}
                <VerticalSpacer eightPx />
                {arbeidstidInformasjon(intl)}
                <VerticalSpacer eightPx />
                <ArbeidstidKalender
                    nyeSoknadsperioder={soeknadsperiode}
                    eksisterendeSoknadsperioder={eksisterendePerioder}
                    updateSoknad={(perioder) => {
                        updateSoknad({
                            arbeidstid: set(arbeid, 'selvstendigNæringsdrivendeArbeidstidInfo.perioder', perioder),
                        });
                    }}
                    updateSoknadState={(perioder) =>
                        updateSoknadState({
                            arbeidstid: set(arbeid, 'selvstendigNæringsdrivendeArbeidstidInfo.perioder', perioder),
                        })
                    }
                    arbeidstidInfo={arbeid?.selvstendigNæringsdrivendeArbeidstidInfo}
                />
                <UhaanderteFeilmeldinger
                    getFeilmeldinger={() =>
                        getUhaandterteFeil('ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0]') || []
                    }
                />
            </div>
        );
    };

    return (
        <EkspanderbartpanelBase
            apen={isOpen}
            className="punchform__paneler"
            tittel={intlHelper(intl, PunchFormPaneler.ARBEID)}
            onClick={() => onPanelClick()}
        >
            <CheckboksPanel
                label={intlHelper(intl, Arbeidsforhold.ARBEIDSTAKER)}
                value={Arbeidsforhold.ARBEIDSTAKER}
                onChange={(e) => handleArbeidsforholdChange(Arbeidsforhold.ARBEIDSTAKER, e.target.checked)}
                checked={getCheckedValueArbeid(Arbeidsforhold.ARBEIDSTAKER)}
            />
            <VerticalSpacer eightPx />
            {!!soknad.arbeidstid?.arbeidstakerList?.length && (
                <Arbeidstakerperioder
                    soknad={soknad}
                    eksisterendeSoknadsperioder={eksisterendePerioder}
                    initialArbeidstaker={initialArbeidstaker}
                    updateSoknad={updateSoknad}
                    updateSoknadState={updateSoknadState}
                    getErrorMessage={getErrorMessage}
                    getUhaandterteFeil={getUhaandterteFeil}
                />
            )}
            <CheckboksPanel
                label={intlHelper(intl, Arbeidsforhold.FRILANSER)}
                value={Arbeidsforhold.FRILANSER}
                onChange={(e) => handleArbeidsforholdChange(Arbeidsforhold.FRILANSER, e.target.checked)}
                checked={getCheckedValueArbeid(Arbeidsforhold.FRILANSER)}
            />
            <VerticalSpacer eightPx />
            {!!soknad.opptjeningAktivitet.frilanser && <Panel className="frilanserpanel">{frilanserperioder()}</Panel>}
            <CheckboksPanel
                label={intlHelper(intl, Arbeidsforhold.SELVSTENDIG)}
                value={Arbeidsforhold.SELVSTENDIG}
                onChange={(e) => handleArbeidsforholdChange(Arbeidsforhold.SELVSTENDIG, e.target.checked)}
                checked={getCheckedValueArbeid(Arbeidsforhold.SELVSTENDIG)}
            />
            {!!soknad.opptjeningAktivitet.selvstendigNaeringsdrivende && (
                <>
                    <Alert size="small" variant="info" className="sn-alertstripe">
                        {intlHelper(intl, 'skjema.sn.info')}
                    </Alert>
                    <Panel className="selvstendigpanel">{selvstendigperioder()}</Panel>
                </>
            )}
            <UhaanderteFeilmeldinger
                getFeilmeldinger={() => (getUhaandterteFeil && getUhaandterteFeil('ytelse.arbeidstid')) || []}
            />
        </EkspanderbartpanelBase>
    );
};
export default ArbeidsforholdPanel;
