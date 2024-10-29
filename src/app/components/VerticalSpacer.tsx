import classNames from 'classnames';
import React, { FunctionComponent } from 'react';

import './verticalSpacer.less';

interface IOwnProps {
    fourPx?: boolean;
    eightPx?: boolean;
    sixteenPx?: boolean;
    twentyPx?: boolean;
    thirtyTwoPx?: boolean;
    fourtyPx?: boolean;
    hr?: boolean;
    dashed?: boolean;
}

/**
 * VerticalSpacer
 *
 * Presentasjonskomponent. Legg inn vertikalt tomrom.
 */
const VerticalSpacer: FunctionComponent<IOwnProps> = ({
    fourPx = false,
    eightPx = false,
    sixteenPx = false,
    twentyPx = false,
    thirtyTwoPx = false,
    fourtyPx = false,
    hr = false,
    dashed = false,
}) => (
    <div
        className={classNames({
            fourPx,
            eightPx,
            sixteenPx,
            twentyPx,
            thirtyTwoPx,
            fourtyPx,
            hr,
            dashed,
        })}
    />
);

export default VerticalSpacer;
