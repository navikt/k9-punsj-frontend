import * as React from 'react';
import './personBox.less';
import PersonMSVG from './PersonMSVG';
import PersonWSVG from './PersonWSVG';

interface IPersonBoxProps {
    ident: string;
    header: string;
}

export const PersonBox: React.FunctionComponent<IPersonBoxProps> = (props: IPersonBoxProps) => {
    const { ident } = props;
    return (
        <div className="personBox alertstripe alertstripe--info">
            <div className="personBoxIcon">
                {ident && Number(ident.charAt(8)) % 2 ? <PersonMSVG /> : <PersonWSVG />}
            </div>
            <div className="personBoxInfo">
                <p>{props.header}</p>
                <p>{ident}</p>
            </div>
        </div>
    );
};
