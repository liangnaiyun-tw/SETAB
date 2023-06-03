import { configureStore } from '@reduxjs/toolkit';
import noteReducer from '../features/note/noteSlice';
import authReducer from '../features/firebase/auth/authSlice';
import firestoreReducer from '../features/firebase/firestore/firestoreSlice';
import tabReducer from '../features/tabs/tabSlice';
import dndReducer from '../features/dnd/DndSlice';

const store = configureStore({
  reducer: {
    tab: tabReducer,
    note: noteReducer,
    auth: authReducer,
    firestore: firestoreReducer,
    dnd: dndReducer
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false,
  }),
})

export default store;