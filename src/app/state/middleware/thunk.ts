 import/prefer-default-export
export const thunk = (store: any) => (next: any) => (action: any) =>
    typeof action === 'function' ? action(store.dispatch, store.getState) : next(action);
