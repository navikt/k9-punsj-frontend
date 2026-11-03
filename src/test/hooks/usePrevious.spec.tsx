import React, { StrictMode, useRef } from 'react';
import { render, renderHook, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import usePrevious from '../../app/hooks/usePrevious';
import useFocus from '../../app/hooks/useFocus';

const strictMode = ({ children }: React.PropsWithChildren) => <StrictMode>{children}</StrictMode>;

describe('usePrevious', () => {
    it('returnerer undefined før første endring og husker verdien før siste endring', () => {
        const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: 1 },
            wrapper: strictMode,
        });
        expect(result.current).toBeUndefined();

        rerender({ value: 1 });
        expect(result.current).toBeUndefined();

        rerender({ value: 2 });
        expect(result.current).toBe(1);

        rerender({ value: 2 });
        expect(result.current).toBe(1);

        rerender({ value: 3 });
        expect(result.current).toBe(2);

        rerender({ value: 1 });
        expect(result.current).toBe(3);
    });

    it('behandler undefined som en verdi og sammenligner objekter etter identitet', () => {
        const first = { navn: 'Ola' };
        const second = { navn: 'Ola' };
        const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: undefined as typeof first | undefined },
        });

        rerender({ value: first });
        expect(result.current).toBeUndefined();

        rerender({ value: second });
        expect(result.current).toBe(first);

        rerender({ value: second });
        expect(result.current).toBe(first);

        rerender({ value: undefined });
        expect(result.current).toBe(second);
    });

    it('behandler gjentatte NaN-verdier som uendret', () => {
        const { result, rerender } = renderHook(({ value }) => usePrevious(value), {
            initialProps: { value: 1 },
        });
        rerender({ value: NaN });
        expect(result.current).toBe(1);

        rerender({ value: NaN });
        expect(result.current).toBe(1);
    });
});

function PeriodInputs({ count }: { count: number }) {
    const inputRef = useRef<HTMLInputElement>(null);
    const previousCount = usePrevious(count);
    useFocus(count, previousCount, inputRef);

    return (
        <>
            <button type="button">Annet felt</button>
            {Array.from({ length: count }, (_, index) => (
                <input
                    key={index}
                    aria-label={`Periode ${index + 1}`}
                    ref={index === count - 1 ? inputRef : undefined}
                />
            ))}
        </>
    );
}

describe('usePrevious sammen med useFocus', () => {
    it('flytter fokus ved ny periode og beholder brukerens fokus når antallet er uendret', async () => {
        const user = userEvent.setup();
        const { rerender } = render(<PeriodInputs count={1} />, { wrapper: strictMode });
        expect(screen.getByLabelText('Periode 1')).not.toHaveFocus();

        rerender(<PeriodInputs count={2} />);
        expect(screen.getByLabelText('Periode 2')).toHaveFocus();

        await user.click(screen.getByRole('button', { name: 'Annet felt' }));
        rerender(<PeriodInputs count={2} />);
        expect(screen.getByRole('button', { name: 'Annet felt' })).toHaveFocus();

        rerender(<PeriodInputs count={1} />);
        expect(screen.getByRole('button', { name: 'Annet felt' })).toHaveFocus();

        rerender(<PeriodInputs count={2} />);
        expect(screen.getByLabelText('Periode 2')).toHaveFocus();
    });
});
