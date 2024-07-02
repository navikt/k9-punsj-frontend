import React from 'react';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

import KryssSVG from '../../assets/SVG/KryssSVG';
import VerticalSpacer from '../vertical-spacer/VerticalSpacer';
import FlexRow from '../flexgrid/FlexRow';
import './skjemaHeader.less';

interface ISkjemaHeaderProps {
    headerTextId: string;
}

const SkjemaHeader: React.FunctionComponent<ISkjemaHeaderProps> = ({ headerTextId }) => (
    <>
        <FlexRow spaceBetween>
            <h1 className="skjemaheader__overskrift">
                <FormattedMessage id={headerTextId} />
            </h1>
            <Link to="/" className="skjemaheader__avbryt">
                <span>
                    <FormattedMessage id="skjemaheader.avbryt" />
                </span>
                <KryssSVG />
            </Link>
        </FlexRow>
        <VerticalSpacer sixteenPx hr />
        <VerticalSpacer thirtyTwoPx />
    </>
);

export default SkjemaHeader;
