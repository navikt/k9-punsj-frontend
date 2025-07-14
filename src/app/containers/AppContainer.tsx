import * as React from 'react';

interface Props {
    children: React.ReactNode;
}

const AppContainer: React.FC<Props> = ({ children }) => (
    <div className="pb-4 min-h-[100px] mx-4 h-full">{children}</div>
);

export default AppContainer;
