import * as React from 'react';

import DocumentTitle from 'app/components/document-title/DocumentTitle';

interface IPageProps {
    className?: string;
    title: string;
    topContentRenderer?: () => React.ReactElement<any>;
    children: React.ReactNode;
}

const Page = ({ className, title, topContentRenderer, children }: IPageProps) => {
    React.useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <>
            <DocumentTitle title={title} />
            {topContentRenderer && topContentRenderer()}
            <div className={className}>{children}</div>
        </>
    );
};

export default Page;
