import FilledVersionBin1SVG from 'app/components/delete-button/FilledVersionBin1SVG';
import classNames from 'classnames';
import { Flatknapp, KnappBaseProps } from 'nav-frontend-knapper';
import * as React from 'react';
import './delete-button.less';

const DeleteButton: React.FunctionComponent<KnappBaseProps> = (props: KnappBaseProps) => {
    const {className: baseClassName} = props;
    const className = classNames(baseClassName, 'delete-button');
    return (
        // eslint-disable-next-line react/jsx-props-no-spreading
        <Flatknapp {...{ ...props, className }}>
            <FilledVersionBin1SVG />
        </Flatknapp>
    );
};

export default DeleteButton;
