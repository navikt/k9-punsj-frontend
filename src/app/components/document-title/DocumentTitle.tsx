import useDocumentTitle from 'app/hooks/useDocumentTitle';
import React from 'react';

interface IDocumentTitleProps {
    title: string;
}

const DocumentTitle: React.FunctionComponent<IDocumentTitleProps> = ({ title, children }) => {
    useDocumentTitle(title);
    return <>{children}</>;
};

export default DocumentTitle;
