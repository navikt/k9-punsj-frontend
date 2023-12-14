// actions som er definert i denne filen bør treffe alle reducers

export const RESET_ALL = 'RESET_ALL';
export interface IResetStateAction {
    type: typeof RESET_ALL;
}
export const resetAllStateAction = () => ({
    type: RESET_ALL,
});
