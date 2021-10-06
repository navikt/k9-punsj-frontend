import React from 'react';

interface IUtregningArbeidstidProps {
    arbeidstid?: string;
    normalArbeidstid?: string;
}

const UtregningArbeidstid = ({ arbeidstid, normalArbeidstid }: IUtregningArbeidstidProps): JSX.Element | null => {
    const convert = (tid: string) => Number(tid.replace(',', '.'));

    if (!arbeidstid || Number.isNaN(convert(arbeidstid))) {
        return null;
    }

    return (
        <>
            <div>
                <div>{`= ${convert(arbeidstid) * 5} timer per uke`}</div>
                {normalArbeidstid && !Number.isNaN(Number(normalArbeidstid)) && (
                    <div>{`(tilsvarer ${(convert(arbeidstid) / convert(normalArbeidstid)) * 100}% arbeid)`}</div>
                )}
            </div>
        </>
    );
};

export default UtregningArbeidstid;
