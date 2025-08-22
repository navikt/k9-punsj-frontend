import * as React from 'react';

interface Props {
    children: React.ReactNode;
}

const AppContainer: React.FC<Props> = ({ children }) => (
    <div className="min-h-[100px] ml-4 h-full">{children}</div>
);

export default AppContainer;
