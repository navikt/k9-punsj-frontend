import React, { useEffect, useState } from 'react';

import classNames from 'classnames';
import { FieldArray, useFormikContext } from 'formik';
import { FormattedMessage } from 'react-intl';
import { Fieldset, Heading, Box, Button } from '@navikt/ds-react';
import { PlusCircleIcon, TrashIcon } from '@navikt/aksel-icons';

import { finnArbeidsgivere } from 'app/api/api';
import UhaanderteFeilmeldinger from 'app/components/skjema/UhaanderteFeilmeldinger';
import { IPeriode } from 'app/models/types';
import { ArbeidsgivereResponse } from 'app/models/types/ArbeidsgivereResponse';
import { Arbeidstaker } from 'app/models/types/Arbeidstaker';
import { OLPSoknad } from 'app/models/types/OLPSoknad';
import Organisasjon from 'app/models/types/Organisasjon';
import ArbeidstakerComponent from './Arbeidstaker/Arbeidstaker';

interface Props {
    eksisterendePerioder: IPeriode[];
    initialArbeidstaker: Arbeidstaker;

    getUhaandterteFeil: (kode: string) => (string | undefined)[];
}

const Arbeidstakerperioder = ({
    initialArbeidstaker,
    eksisterendePerioder,
    getUhaandterteFeil,
}: Props): JSX.Element => {
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
                <Fieldset className="listepaneler" legend="" hideLegend>
                    {items?.map((currentItem, currentItemIndex) => {
                        const panelid = `arbeidstakerpanel_${currentItemIndex}`;

                        const getHarDuplikatOrgnr = () =>
                            items.filter(
                                (item) =>
                                    item.organisasjonsnummer &&
                                    item.organisasjonsnummer === currentItem.organisasjonsnummer,
                            ).length > 1;

                        return (
                            <Box
                                padding="4"
                                className={classNames('listepanel', 'arbeidstakerpanel')}
                                id={panelid}
                                key={panelid}
                            >
                                <Fieldset legend="" hideLegend>
                                    {itemsWithInitialItem.length > 1 && (
                                        <Heading size="medium" level="2">
                                            <FormattedMessage
                                                id="skjema.arbeidsforhold.teller"
                                                values={{ indeks: currentItemIndex + 1 }}
                                            />
                                        </Heading>
                                    )}

                                    {itemsWithInitialItem.length > 1 && (
                                        <div className="listepanelbunn">
                                            <Button
                                                id="slett"
                                                className="fjernlisteelementknapp"
                                                type="button"
                                                onClick={() => arrayHelpers.remove(currentItemIndex)}
                                                tabIndex={0}
                                                icon={<TrashIcon fontSize="2rem" color="#C30000" title="slett" />}
                                            >
                                                <FormattedMessage id="skjema.arbeid.arbeidstaker.fjernarbeidsgiver" />
                                            </Button>
                                        </div>
                                    )}

                                    <ArbeidstakerComponent
                                        søkerId={soekerId}
                                        arbeidstaker={currentItem as Arbeidstaker}
                                        listeelementindex={currentItemIndex}
                                        arbeidsgivere={arbeidsgivere}
                                        harDuplikatOrgnr={getHarDuplikatOrgnr()}
                                        nyeSoknadsperioder={soeknadsperiode || []}
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
                            </Box>
                        );
                    })}

                    <Button
                        id="leggtillisteelementknapp"
                        className="leggtillisteelementknapp"
                        type="button"
                        onClick={() => arrayHelpers.push(initialArbeidstaker)}
                        icon={<PlusCircleIcon title="leggTill" fontSize="2rem" color="#0067C5" />}
                    >
                        <FormattedMessage id="skjema.arbeid.arbeidstaker.leggtilperiode" />
                    </Button>
                </Fieldset>
            )}
        />
    );
};
export default Arbeidstakerperioder;
