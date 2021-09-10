import React, { ReactNode, FunctionComponent } from 'react';
import classNames from 'classnames';

import './flexRow.less';

interface IOwnProps {
    children: ReactNode | ReactNode[];
    spaceBetween?: boolean;
    alignItemsToBaseline?: boolean;
    alignItemsToCenter?: boolean;
    alignItemsToFlexEnd?: boolean;
    wrap?: boolean;
    className?: string;
    justifyCenter?: boolean;
    childrenMargin?: 'small' | 'medium' | 'big';
    autoFlex?: boolean;
}

const FlexRow: FunctionComponent<IOwnProps> = ({
    children,
    spaceBetween = false,
    alignItemsToBaseline = false,
    alignItemsToCenter = false,
    alignItemsToFlexEnd = false,
    wrap = false,
    className,
    justifyCenter = false,
    childrenMargin,
    autoFlex = false,
}) => (
    <div
        className={classNames(
            'flexRow',
            { spaceBetween },
            { alignItemsToBaseline },
            { alignItemsToCenter },
            { alignItemsToFlexEnd },
            { wrap },
            { justifyCenter },
            { childrenMarginSmall: childrenMargin === 'small' },
            { childrenMarginMedium: childrenMargin === 'medium' },
            { childrenMarginBig: childrenMargin === 'big' },
            { autoFlex },
            className
        )}
    >
        {children}
    </div>
);

export default FlexRow;
