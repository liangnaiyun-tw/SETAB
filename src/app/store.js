import { configureStore } from '@reduxjs/toolkit';
import noteReducer from '../features/note/noteSlice';
import authReducer from '../features/firebase/auth/authSlice';
import firestoreReducer from '../features/firebase/firestore/firestoreSlice';

const store = configureStore({
  reducer: {
    note: noteReducer,
    auth: authReducer,
    firestore: firestoreReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
})

export default store;