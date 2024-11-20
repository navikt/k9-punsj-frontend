const getLocation = () => window.location.href;

export const setHash = (hash: string) => {
    window.location.hash = hash;
};

export const getHash = () => window.location.hash;

export const setDokQuery = (query: { [key: string]: string }) => {
    // change the dok query
    const params = new URLSearchParams(query);
    const newUrl = `${getLocation().replace(/\?.*/, '')}?${params.toString()}`;
    window.history.replaceState(null, '', newUrl);
};
