import * as React from 'react';

import { set } from 'lodash';
import { FormattedMessage, useIntl } from 'react-intl';
import { Accordion, Alert, Box, TextField, Textarea } from '@navikt/ds-react';
import { LegacyCheckbox, LegacyCheckboxGroup } from 'app/components/legacy-form-compat/checkbox';
import { LegacyJaNeiRadioGroup } from 'app/components/legacy-form-compat/radio';
import ArbeidstidKalender from 'app/components/arbeidstid/ArbeidstidKalender';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { periodeSpenn } from 'app/components/skjema/skjemaUtils';
import { Arbeidsforhold, JaNei } from 'app/models/enums';
import { PunchFormPaneler } from 'app/models/enums/PunchFormPaneler';
import { Virksomhetstyper } from 'app/models/enums/Virksomhetstyper';
import intlHelper from 'app/utils/intlUtils';
import VerticalSpacer from '../../VerticalSpacer';
import { CountrySelect } from '../../country-select/CountrySelect';
import { arbeidstidInformasjon } from 'app/components/ArbeidstidInfo';
import { Arbeidstaker } from '../../../models/types';
import { IPeriode } from '../../../models/types/Periode';
import { IPLSSoknad } from '../../../søknader/pleiepenger-livets-sluttfase/types/PLSSoknad';
import Arbeidstakerperioder from './Arbeidstakerperioder';
import NewDateInput from 'app/components/skjema/NewDateInput/NewDateInput';

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
    søknadsperioder: IPeriode[];
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
    søknadsperioder,
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

    const limitFromDate = new Date();
    limitFromDate.setFullYear(limitFromDate.getFullYear() - 60);

    const frilanserperioder = () => {
        const arbeid = soknad.arbeidstid;
        const opptjening = soknad.opptjeningAktivitet;

        return (
            <>
                <NewDateInput
                    id="frilanser-startdato"
                    value={soknad.opptjeningAktivitet.frilanser?.startdato || ''}
                    className="frilanser-startdato"
                    label={intlHelper(intl, 'skjema.frilanserdato')}
                    errorMessage={getErrorMessage('ytelse.opptjeningAktivitet.frilanser.startdato')}
                    fromDate={limitFromDate}
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
                <LegacyJaNeiRadioGroup
                    className="horizontalRadios"
                    name="fortsattFrilanser"
                    legend={intlHelper(intl, 'skjema.fortsattfrilanser')}
                    checked={
                        opptjening.frilanser && opptjening.frilanser.jobberFortsattSomFrilans ? JaNei.JA : JaNei.NEI
                    }
                    onChange={(_, value) => {
                        handleFrilanserChange(value);
                    }}
                />

                <VerticalSpacer eightPx />

                {!opptjening.frilanser?.jobberFortsattSomFrilans && (
                    <NewDateInput
                        id="frilanser-sluttdato"
                        value={soknad.opptjeningAktivitet.frilanser?.sluttdato || ''}
                        className="frilanser-sluttdato"
                        label={intlHelper(intl, 'skjema.frilanserdato.slutt')}
                        fromDate={limitFromDate}
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
                        {arbeidstidInformasjon()}

                        <VerticalSpacer eightPx />

                        <ArbeidstidKalender
                            søknadsperioder={søknadsperioder}
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

                        <div data-testid="frilanser-arbeidstid-validation-errors">
                            <UhaanderteFeilmeldinger
                                getFeilmeldinger={() =>
                                    (getUhaandterteFeil &&
                                        getUhaandterteFeil('ytelse.arbeidstid.frilanserArbeidstidInfo')) ||
                                    []
                                }
                            />
                        </div>
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
                <div id="sn-virksomhetstyper">
                    <LegacyCheckboxGroup
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
                    />
                </div>
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
                <LegacyJaNeiRadioGroup
                    className="horizontalRadios"
                    name="virksomhetRegistrertINorge"
                    legend={intlHelper(intl, 'skjema.sn.registrertINorge')}
                    checked={opptjening.selvstendigNaeringsdrivende?.info?.registrertIUtlandet ? JaNei.NEI : JaNei.JA}
                    onChange={(_, value) => {
                        updateSoknad({
                            opptjeningAktivitet: {
                                ...opptjening,
                                selvstendigNaeringsdrivende: {
                                    ...opptjening.selvstendigNaeringsdrivende,
                                    info: {
                                        ...opptjening.selvstendigNaeringsdrivende?.info,
                                        registrertIUtlandet: value !== JaNei.JA,
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
                                        registrertIUtlandet: value !== JaNei.JA,
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
                <LegacyJaNeiRadioGroup
                    className="horizontalRadios"
                    name="harRegnskapsfører"
                    legend={intlHelper(intl, 'skjema.arbeid.sn.regnskapsfører')}
                    checked={
                        !!harRegnskapsfører ||
                        opptjening.selvstendigNaeringsdrivende?.info?.regnskapsførerNavn ||
                        opptjening.selvstendigNaeringsdrivende?.info?.regnskapsførerNavn
                            ? JaNei.JA
                            : JaNei.NEI
                    }
                    onChange={(_, value) => {
                        handleRegnskapsførerChange(value);
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
                    <NewDateInput
                        className="fom"
                        value={opptjening.selvstendigNaeringsdrivende?.info?.periode?.fom || ''}
                        label={intlHelper(intl, 'skjema.arbeid.sn.startdato')}
                        errorMessage={getErrorMessage(
                            'ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].perioder',
                        )}
                        fromDate={limitFromDate}
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
                    <NewDateInput
                        className="tom"
                        value={opptjening.selvstendigNaeringsdrivende?.info?.periode?.tom || ''}
                        label={intlHelper(intl, 'skjema.arbeid.sn.sluttdato')}
                        noValidateTomtFelt={true}
                        fromDate={limitFromDate}
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
                            id="sn-bruttoinntekt"
                            label={intlHelper(intl, 'skjema.sn.bruttoinntekt')}
                            type="number"
                            className="bruttoinntekt"
                            value={opptjening.selvstendigNaeringsdrivende?.info?.bruttoInntekt || ''}
                            error={getErrorMessage(
                                `ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0].perioder[${periodeSpenn(
                                    opptjening?.selvstendigNaeringsdrivende?.info?.periode,
                                )}].bruttoInntekt`,
                            )}
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
                        <LegacyJaNeiRadioGroup
                            className="horizontalRadios"
                            name="varigEndringradios"
                            legend={intlHelper(intl, 'skjema.sn.varigendring')}
                            checked={opptjening.selvstendigNaeringsdrivende?.info.erVarigEndring ? JaNei.JA : JaNei.NEI}
                            onChange={(_, value) => {
                                updateSoknad({
                                    opptjeningAktivitet: {
                                        ...opptjening,
                                        selvstendigNaeringsdrivende: {
                                            ...opptjening.selvstendigNaeringsdrivende,
                                            info: {
                                                ...opptjening.selvstendigNaeringsdrivende?.info,
                                                erVarigEndring: value === JaNei.JA,
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
                                                erVarigEndring: value === JaNei.JA,
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
                            <NewDateInput
                                className="endringdato"
                                value={opptjening.selvstendigNaeringsdrivende?.info?.endringDato || ''}
                                label={intlHelper(intl, 'skjema.sn.varigendringdato')}
                                fromDate={limitFromDate}
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
                {arbeidstidInformasjon()}
                <VerticalSpacer eightPx />
                <ArbeidstidKalender
                    søknadsperioder={søknadsperioder}
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
                <div data-testid="selvstendig-arbeidstid-validation-errors">
                    <UhaanderteFeilmeldinger
                        getFeilmeldinger={() =>
                            (getUhaandterteFeil &&
                                getUhaandterteFeil('ytelse.arbeidstid.selvstendigNæringsdrivendeArbeidstidInfo')) ||
                            []
                        }
                    />
                </div>
                <UhaanderteFeilmeldinger
                    getFeilmeldinger={() =>
                        getUhaandterteFeil('ytelse.opptjeningAktivitet.selvstendigNæringsdrivende[0]') || []
                    }
                />
            </div>
        );
    };

    return (
        <Accordion.Item
            open={isOpen}
            defaultOpen={isOpen}
            onOpenChange={() => onPanelClick()}
            data-test-id="accordionItem-arbeidsforholdPanel"
        >
            <Accordion.Header>
                <FormattedMessage id={PunchFormPaneler.ARBEID} />
            </Accordion.Header>

            <Accordion.Content>
                <LegacyCheckbox
                    label={intlHelper(intl, Arbeidsforhold.ARBEIDSTAKER)}
                    value={Arbeidsforhold.ARBEIDSTAKER}
                    onChange={(e) => handleArbeidsforholdChange(Arbeidsforhold.ARBEIDSTAKER, e.target.checked)}
                    checked={getCheckedValueArbeid(Arbeidsforhold.ARBEIDSTAKER)}
                />

                <VerticalSpacer eightPx />

                {!!soknad.arbeidstid?.arbeidstakerList?.length && (
                    <Arbeidstakerperioder
                        soknad={soknad}
                        søknadsperioder={søknadsperioder}
                        initialArbeidstaker={initialArbeidstaker}
                        updateSoknad={updateSoknad}
                        updateSoknadState={updateSoknadState}
                        getErrorMessage={getErrorMessage}
                        getUhaandterteFeil={getUhaandterteFeil}
                    />
                )}

                <LegacyCheckbox
                    label={intlHelper(intl, Arbeidsforhold.FRILANSER)}
                    value={Arbeidsforhold.FRILANSER}
                    onChange={(e) => handleArbeidsforholdChange(Arbeidsforhold.FRILANSER, e.target.checked)}
                    checked={getCheckedValueArbeid(Arbeidsforhold.FRILANSER)}
                />
                <VerticalSpacer eightPx />

                {!!soknad.opptjeningAktivitet.frilanser && (
                    <Box padding="4" borderRadius="small" className="frilanserpanel">
                        {frilanserperioder()}
                    </Box>
                )}

                <LegacyCheckbox
                    label={intlHelper(intl, Arbeidsforhold.SELVSTENDIG)}
                    value={Arbeidsforhold.SELVSTENDIG}
                    onChange={(e) => handleArbeidsforholdChange(Arbeidsforhold.SELVSTENDIG, e.target.checked)}
                    checked={getCheckedValueArbeid(Arbeidsforhold.SELVSTENDIG)}
                />

                {!!soknad.opptjeningAktivitet.selvstendigNaeringsdrivende && (
                    <>
                        <Alert size="small" variant="info" className="sn-alertstripe">
                            <FormattedMessage id="skjema.sn.info" />
                        </Alert>

                        <Box padding="4" borderRadius="small" className="selvstendigpanel">
                            {selvstendigperioder()}
                        </Box>
                    </>
                )}

                <UhaanderteFeilmeldinger
                    getFeilmeldinger={() => (getUhaandterteFeil && getUhaandterteFeil('ytelse.arbeidstid')) || []}
                />
            </Accordion.Content>
        </Accordion.Item>
    );
};
export default ArbeidsforholdPanel;
