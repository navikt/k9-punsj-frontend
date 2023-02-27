import useDocumentTitle from 'app/hooks/useDocumentTitle';

interface IDocumentTitleProps {
    title: string;
}

const DocumentTitle = ({ title }: IDocumentTitleProps) => {
    useDocumentTitle(title);
    return null;
};

export default DocumentTitle;
