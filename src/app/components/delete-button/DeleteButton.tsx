import FilledVersionBin1SVG        from 'app/components/delete-button/FilledVersionBin1SVG';
import {Flatknapp, KnappBaseProps} from 'nav-frontend-knapper';
import * as React                  from 'react';
import './delete-button.less';

const classNames = require('classnames');

const DeleteButton: React.FunctionComponent<KnappBaseProps> = (props: KnappBaseProps) => {
    const className = classNames(!!props.className, 'delete-button');
    return <Flatknapp {...{...props, className}}><FilledVersionBin1SVG/></Flatknapp>;
};

export default DeleteButton;