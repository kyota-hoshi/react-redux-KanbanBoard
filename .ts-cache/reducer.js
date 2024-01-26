import produce from 'immer';
const initialState = {
    filterValue: '',
};
export const reducer = produce((draft, action) => {
    switch (action.type) {
        case 'Filter.setFilter': {
            const { value } = action.payload;
            draft.filterValue = value;
            return;
        }
    }
}, initialState);
