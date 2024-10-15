export const logger = () => (next: any) => (action: any) => {
    if (action.type) {
        // eslint-disable-next-line no-console
        console.log(action.type);
    }
    return next(action);
};
