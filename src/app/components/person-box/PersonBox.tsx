import * as React from 'react';
import './personBox.less';
import PersonMSVG from './PersonMSVG';
import PersonWSVG from './PersonWSVG';

interface IPersonBoxProps {
    ident: string;
    header: string;
}
const PersonBox: React.FunctionComponent<IPersonBoxProps> = (props: IPersonBoxProps) => {
    const { ident, header } = props;
    return (
        <div className="personBox alertstripe alertstripe--info">
            <div className="personBoxIcon">
                {ident && Number(ident.charAt(8)) % 2 ? <PersonMSVG /> : <PersonWSVG />}
            </div>
            <div className="personBoxInfo">
                <p>{header}</p>
                <p>{ident}</p>
            </div>
        </div>
    );
};

export default PersonBox;
