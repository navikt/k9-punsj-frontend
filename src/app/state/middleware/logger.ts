// tslint:disable:no-console
// eslint-disable-next-line import/prefer-default-export
export const logger = () => (next: any) => (action: any) => {
    if (action.type) {
        console.log(action.type);
    }
    return next(action);
};
