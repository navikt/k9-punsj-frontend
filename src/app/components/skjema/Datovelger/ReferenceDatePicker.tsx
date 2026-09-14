import React, { useState } from 'react';

import { DatePicker, type DatePickerProps, Popover } from '@navikt/ds-react';

interface ReferenceDatePickerProps {
    datepickerProps: DatePickerProps;
    onSelect: (date?: Date) => void;
    children: React.ReactElement;
}

const ReferenceDatePicker = ({ datepickerProps, onSelect, children }: ReferenceDatePickerProps) => {
    const [open, setOpen] = useState(false);
    const [anchorElement, setAnchorElement] = useState<HTMLDivElement | null>(null);
    const standaloneProps = { ...datepickerProps };
    delete standaloneProps.open;
    delete standaloneProps.onClose;
    delete standaloneProps.onOpenToggle;

    return (
        <>
            <div ref={setAnchorElement}>
                <DatePicker
                    {...datepickerProps}
                    open={false}
                    onClose={() => setOpen(false)}
                    onOpenToggle={() => setOpen((previousOpen) => !previousOpen)}
                >
                    {children}
                </DatePicker>
            </div>
            <Popover
                open={open && !!anchorElement}
                onClose={() => setOpen(false)}
                anchorEl={anchorElement}
                placement="bottom-start"
                strategy="fixed"
            >
                <DatePicker.Standalone
                    {...(standaloneProps as any)}
                    onSelect={(date) => {
                        onSelect(date);
                        setOpen(false);
                    }}
                />
            </Popover>
        </>
    );
};

export default ReferenceDatePicker;
