// tslint:disable:no-console
export const logger = (rootState: any) => (next: any) => (action: any) => {
    if (action.type) {
        console.log(action.type);
    }
    return next(action);
};
