// tslint:disable:no-console
export const logger = (rootState: any) => (next: any) => (action: any) => {
    if (action.type) {
        console.groupCollapsed(action.type);
        console.info('Dispatching', action);
    }
    const result = next(action);
    if (action.type) {
        console.log('Next state', rootState.getState());
        console.groupEnd();
    }
    return result;
};