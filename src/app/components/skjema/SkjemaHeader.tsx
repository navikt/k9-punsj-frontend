import React from 'react';
import { Link } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import FlexRow from '../flexgrid/FlexRow';
import './skjemaHeader.less';
import VerticalSpacer from '../VerticalSpacer';
import KryssSVG from '../../assets/SVG/KryssSVG';

interface ISkjemaHeaderProps {
    headerTextId: string;
}

const SkjemaHeader: React.FunctionComponent<ISkjemaHeaderProps> = ({ headerTextId }) => {
    return (
        <>
            <FlexRow spaceBetween={true}>
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
            <VerticalSpacer sixteenPx={true} hr={true} />
            <VerticalSpacer thirtyTwoPx={true} />
        </>
    );
};

export default SkjemaHeader;
