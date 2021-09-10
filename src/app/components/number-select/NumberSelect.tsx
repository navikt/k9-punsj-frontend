import { Select, SelectProps } from 'nav-frontend-skjema';
import * as React from 'react';

export interface INumberSelectProps extends Omit<SelectProps, 'children'> {
    from?: number;
    to: number;
}

export const NumberSelect: React.FunctionComponent<INumberSelectProps> = (props: INumberSelectProps) => {
    const from: number = props.from || 0;
    const length: number = props.to - from + 1;

    if (length < 1) {
        return null;
    }

    return (
        <Select {...props}>
            {Array.from(Array(length).keys()).map((int) => {
                const value = int + from;
                return (
                    <option {...{ value }} key={value}>
                        {value}
                    </option>
                );
            })}
        </Select>
    );
};
