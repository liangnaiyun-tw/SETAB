import { configureStore } from '@reduxjs/toolkit';
import noteReducer from '../features/note/noteSlice';
import authReducer from '../features/firebase/auth/authSlice';
import firestoreReducer from '../features/firebase/firestore/firestoreSlice';
import dndReducer from '../features/dnd/DndSlice';
import chromeTabReducer from '../features/chromeTabs/chromeTabSlice';

const store = configureStore({
  reducer: {
    chromeTabs: chromeTabReducer,
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