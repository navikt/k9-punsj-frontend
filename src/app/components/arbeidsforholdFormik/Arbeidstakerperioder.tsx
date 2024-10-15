import classNames from 'classnames';
import { FieldArray, useFormikContext } from 'formik';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

import { Fieldset, Panel } from '@navikt/ds-react';

import { finnArbeidsgivere } from 'app/api/api';
import AddCircleSvg from 'app/assets/SVG/AddCircleSVG';
import BinSvg from 'app/assets/SVG/BinSVG';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { IPeriode } from 'app/models/types';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import { Arbeidstaker } from 'app/models/types/Arbeidstaker';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import Organisasjon from 'app/models/types/Organisasjon';
import intlHelper from 'app/utils/intlUtils';

import ArbeidstakerComponent from './Arbeidstaker/Arbeidstaker';

interface ArbeidstakerperioderProps {
    eksisterendePerioder: IPeriode[];
    initialArbeidstaker: Arbeidstaker;

    getUhaandterteFeil: (kode: string) => (string | undefined)[];
}

const Arbeidstakerperioder = ({
    initialArbeidstaker,
    eksisterendePerioder,
    getUhaandterteFeil,
}: ArbeidstakerperioderProps): JSX.Element => {
    const intl = useIntl();
    const [arbeidsgivere, setArbeidsgivere] = useState<Organisasjon[]>([]);
    const { values } = useFormikContext<OLPSoknad>();
    const { arbeidstid, soekerId, soeknadsperiode } = values;

    useEffect(() => {
        if (soekerId) {
            finnArbeidsgivere(soekerId, (response, data: ArbeidsgivereResponse) => {
                setArbeidsgivere(data?.organisasjoner || []);
            });
        }
    }, []);

    const items = arbeidstid?.arbeidstakerList || [];
    const itemsWithInitialItem = items.length > 0 ? items : [initialArbeidstaker];

    return (
        <FieldArray
            name="arbeidstid.arbeidstakerList"
            render={(arrayHelpers) => (
                <Fieldset className="listepaneler">
                    {items?.map((currentItem, currentItemIndex) => {
                        const panelid = `arbeidstakerpanel_${currentItemIndex}`;
                        const getHarDuplikatOrgnr = () =>
                            items.filter(
                                (item) =>
                                    item.organisasjonsnummer &&
                                    item.organisasjonsnummer === currentItem.organisasjonsnummer,
                            ).length > 1;
                        return (
                            <Panel
                                className={classNames('listepanel', 'arbeidstakerpanel')}
                                border={false}
                                id={panelid}
                                key={panelid}
                            >
                                <Fieldset>
                                    {itemsWithInitialItem.length > 1 && (
                                        <h2>
                                            <FormattedMessage
                                                id="skjema.arbeidsforhold.teller"
                                                values={{ indeks: currentItemIndex + 1 }}
                                            />
                                        </h2>
                                    )}
                                    {itemsWithInitialItem.length > 1 && (
                                        <div className="listepanelbunn">
                                            <button
                                                id="slett"
                                                className="fjernlisteelementknapp"
                                                type="button"
                                                onClick={() => arrayHelpers.remove(currentItemIndex)}
                                                tabIndex={0}
                                            >
                                                <div className="slettIcon">
                                                    <BinSvg title="fjern" />
                                                </div>
                                                {intlHelper(intl, 'skjema.arbeid.arbeidstaker.fjernarbeidsgiver')}
                                            </button>
                                        </div>
                                    )}
                                    <ArbeidstakerComponent
                                        søkerId={soekerId}
                                        arbeidstaker={currentItem as Arbeidstaker}
                                        listeelementindex={currentItemIndex}
                                        feilkodeprefiks={`ytelse.arbeidstid.arbeidstakerList[${currentItemIndex}]`}
                                        getUhaandterteFeil={getUhaandterteFeil}
                                        intl={intl}
                                        arbeidsgivere={arbeidsgivere}
                                        harDuplikatOrgnr={getHarDuplikatOrgnr()}
                                        nyeSoknadsperioder={soeknadsperiode}
                                        eksisterendeSoknadsperioder={eksisterendePerioder}
                                        name={`${arrayHelpers.name}.${currentItemIndex}`}
                                    />
                                    <UhaanderteFeilmeldinger
                                        getFeilmeldinger={() =>
                                            (getUhaandterteFeil &&
                                                getUhaandterteFeil(
                                                    `ytelse.arbeidstid.arbeidstakerList[${currentItemIndex}]`,
                                                )) ||
                                            []
                                        }
                                    />
                                </Fieldset>
                            </Panel>
                        );
                    })}
                    <button
                        id="leggtillisteelementknapp"
                        className="leggtillisteelementknapp"
                        type="button"
                        onClick={() => arrayHelpers.push(initialArbeidstaker)}
                    >
                        <div className="leggtilperiodeIcon">
                            <AddCircleSvg title="leggtil" />
                        </div>
                        {intlHelper(intl, 'skjema.arbeid.arbeidstaker.leggtilperiode')}
                    </button>
                </Fieldset>
            )}
        />
    );
};
export default Arbeidstakerperioder;
