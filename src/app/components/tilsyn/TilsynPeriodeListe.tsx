import React from 'react';

import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';
import { FieldArray, Formik } from 'formik';
import { FormattedMessage } from 'react-intl';
import * as yup from 'yup';

import { IOmsorgstid, IPeriode, PeriodeMedTimerMinutter, Periodeinfo } from 'app/models/types';
import { periodeMedTimerOgMinutter as periodeMedTimerOgMinutterSchema } from 'app/rules/yup';

import VerticalSpacer from '../VerticalSpacer';
import TilsynPeriode from './TilsynPeriode';
import { Tidsformat } from 'app/utils';

const validationSchema = yup.object({
    perioder: yup.array().of(periodeMedTimerOgMinutterSchema),
});

interface Props {
    perioder: Periodeinfo<IOmsorgstid>[];
    soknadsperioder: IPeriode[];
    nyeSoknadsperioder: IPeriode[];

    lagre: (tilsynstidInfo: Periodeinfo<IOmsorgstid>[]) => void;
    avbryt: () => void;
}

const TilsynPeriodeListe = (props: Props) => {
    const { perioder, soknadsperioder, nyeSoknadsperioder } = props;
    const { lagre, avbryt } = props;

    const initialValues: { perioder: Periodeinfo<IOmsorgstid>[] } = {
        perioder: perioder.length
            ? perioder
            : nyeSoknadsperioder.map(
                  (periode) =>
                      new PeriodeMedTimerMinutter({
                          periode,
                          timer: '0',
                          minutter: '0',
                          perDagString: '',
                          tidsformat: Tidsformat.TimerOgMin,
                      }),
              ),
    };

    return (
        <Formik
            initialValues={initialValues}
            onSubmit={(values) => lagre(values.perioder)}
            validationSchema={validationSchema}
        >
            {({ handleSubmit, values }) => (
                <>
                    <FieldArray
                        name="perioder"
                        render={(arrayHelpers) => (
                            <div>
                                <Heading level="1" size="medium">
                                    <FormattedMessage id="tilsyn.kalender.tilsynPeriodeListe.modal.tittel" />
                                </Heading>

                                {values.perioder.map((_, index) => (
                                    <div className="mb-8" key={index}>
                                        <TilsynPeriode
                                            name={`perioder.${index}`}
                                            soknadsperioder={soknadsperioder}
                                            remove={() => arrayHelpers.remove(index)}
                                        />
                                    </div>
                                ))}

                                <Button
                                    variant="tertiary"
                                    onClick={() =>
                                        arrayHelpers.push(
                                            new PeriodeMedTimerMinutter({
                                                periode: {},
                                                timer: '0',
                                                minutter: '0',
                                                perDagString: '',
                                                tidsformat: Tidsformat.TimerOgMin,
                                            }),
                                        )
                                    }
                                    icon={<AddCircle />}
                                >
                                    <FormattedMessage id="tilsyn.kalender.tilsynPeriodeListe.modal.leggTil.btn" />
                                </Button>

                                <VerticalSpacer sixteenPx />

                                <div className="flex">
                                    <Button type="submit" className="flex-grow mr-4" onClick={() => handleSubmit()}>
                                        <FormattedMessage id="tilsyn.kalender.tilsynPeriodeListe.modal.lagre.btn" />
                                    </Button>

                                    <Button variant="tertiary" onClick={avbryt} className="flex-grow">
                                        <FormattedMessage id="tilsyn.kalender.tilsynPeriodeListe.modal.avbryt.btn" />
                                    </Button>
                                </div>
                            </div>
                        )}
                    />
                </>
            )}
        </Formik>
    );
};

export default TilsynPeriodeListe;
