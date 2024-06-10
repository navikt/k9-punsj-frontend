import * as React from 'react';

import './appContainer.less';

interface Props {
    children: React.ReactNode;
}

const AppContainer: React.FunctionComponent<Props> = ({ children }) => <div className="app-container">{children}</div>;

export default AppContainer;
