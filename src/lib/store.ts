import { configureStore } from '@reduxjs/toolkit';
import presentationReducer from './slices/presentationSlice';

export const store = configureStore({
    reducer: {
        presentation: presentationReducer,
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch; 