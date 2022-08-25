import { AddCircle } from '@navikt/ds-icons';
import { Button, Heading } from '@navikt/ds-react';
import { IArbeidstidPeriodeMedTimer, Periodeinfo } from 'app/models/types';
import React, { useState } from 'react';
import ArbeidstidPeriode from './ArbeidstidPeriode';

export default function ArbeidstidPeriodeListe({
    arbeidstidPerioder,
    lagre,
    heading,
    avbryt,
}: {
    arbeidstidPerioder: Periodeinfo<IArbeidstidPeriodeMedTimer>[];
    heading: string;
    lagre: (arbeidstidInfo: Periodeinfo<IArbeidstidPeriodeMedTimer>[]) => void;
    avbryt: () => void;
}) {
    const [perioder, setPerioder] = useState(arbeidstidPerioder || []);

    const update = (periode, index, periodeArray) => {
        const p = [...periodeArray];

        p[index] = periode;
        setPerioder(p);
    };

    const add = () => {
        setPerioder([
            ...perioder,
            { periode: { fom: '', tom: '' }, faktiskArbeidTimerPerDag: '', jobberNormaltTimerPerDag: '' },
        ]);
    };

    const remove = (index: number) => {
        setPerioder(perioder.filter((_, i) => index !== i));
    };

    return (
        <>
            {heading && <Heading size="small">{heading}</Heading>}
            {perioder.map((initialPeriode, index, periodeArray) => (
                <ArbeidstidPeriode
                    // eslint-disable-next-line react/no-array-index-key
                    key={index}
                    initialPeriode={initialPeriode}
                    onChange={(periode) => update(periode, index, periodeArray)}
                    remove={() => remove(index)}
                />
            ))}

            <Button variant="tertiary" onClick={add}>
                <AddCircle /> Legg til periode
            </Button>
            <div style={{ display: 'flex' }}>
                <Button style={{ flexGrow: 1, marginRight: '0.9375' }} onClick={() => lagre(perioder)}>
                    Lagre
                </Button>

                <Button style={{ flexGrow: 1 }} variant="tertiary" onClick={avbryt}>
                    Avbryt
                </Button>
            </div>
        </>
    );
}
