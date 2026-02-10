import { createContext, useContext, useReducer } from 'react';

const WizardContext = createContext();

const initialState = {
    step: 1,
    data: {},
    errors: {},
};

function wizardReducer(state, action) {
    switch (action.type) {
        case 'SET_STEP':
            return { ...state, step: action.payload };
        case 'UPDATE_DATA':
            return { ...state, data: { ...state.data, ...action.payload } };
        case 'SET_ERRORS':
            return { ...state, errors: action.payload };
        default:
            return state;
    }
}

export function WizardProvider({ children, initialData = {} }) {
    const [state, dispatch] = useReducer(wizardReducer, { ...initialState, data: initialData });

    return <WizardContext.Provider value={{ state, dispatch }}>{children}</WizardContext.Provider>;
}

export function useWizard() {
    return useContext(WizardContext);
}
