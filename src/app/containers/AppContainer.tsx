import * as React from 'react';
import './appContainer.less';

const AppContainer: React.FunctionComponent = ({ children }) => (
    <div className="app-container">
        {children}
    </div>
);

export default AppContainer;
