import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    getFirestore,
    collection,
    addDoc,
    query,
    updateDoc,
    deleteDoc,
    where,
    getDocs,
} from "firebase/firestore";
import app from "../../../shared/Firebase"

import { v4 as uuidv4 } from "uuid";


const db = getFirestore(app());

const UNSAVED_WORKSPACE = "Unsaved";
const unSaveWorkSpace = {
    googleDriveFolderId: "",     // unused
    groups: [],                  // unused
    id: "",
    name: UNSAVED_WORKSPACE,
    note: [],                    // unused
    user: ""                     // unused
}

const initialState = {
    workspaces: [unSaveWorkSpace],
    groups: [],
    tabs: [],
    historys: [],
    currentWorkspace: "",
    currentGroup: "",
}

export const loadStructureByUser = createAsyncThunk('firestore/loadStructureByUser', async (_, thunkAPI) => {

    const user = thunkAPI.getState().auth.user;
    const accessToken = thunkAPI.getState().auth.accessToken;

    // TODO: create root directory

    const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
    );
    const userQuerySnapshot = await getDocs(userQuery);
    if (userQuerySnapshot.docs.length === 0) {

        const newUser = {
            displayName: user.displayName,
            photoUrl: user.photoURL,
            googleDriveRootFolderID: "",
            uid: user.uid,
            workspaces: []
        }

        await addDoc(collection(db, "users"), {
            ...newUser,
        });
    }

    // workspace
    const workspaceQuery = query(
        collection(db, "workspaces"),
        where("uid", "==", user.uid)
    );
    const workspaceQuerySnapshot = await getDocs(workspaceQuery);
    let workspaces = [unSaveWorkSpace];
    workspaceQuerySnapshot.docs.forEach((doc) => {
        workspaces.push(doc.data());
    });

    // group
    const groupQuery = query(
        collection(db, "groups"),
        where("uid", "==", user.uid)
    );
    const groupQuerySnapshot = await getDocs(groupQuery);
    let groups = [];
    groupQuerySnapshot.docs.forEach((doc) => {
        groups.push(doc.data());
    });

    // tabs
    const tabQuery = query(
        collection(db, "tabs"),
        where("uid", "==", user.uid)
    );
    const tabQuerySnapshot = await getDocs(tabQuery);
    let tabs = [];
    tabQuerySnapshot.docs.forEach((doc) => {
        tabs.push(doc.data());
    })

    thunkAPI.dispatch(addAllStructure({ workspaces, groups, tabs }));

})
export const createWorkSpace = createAsyncThunk('firestore/createWorkSpace', async (workspace, thunkAPI) => {

    const user = thunkAPI.getState().auth.user;
    const accessToken = thunkAPI.getState().auth.accessToken;

    // TODO: create directory

    const newWorkSpace = {
        ...workspace, id: uuidv4(), googleDriveFolderId: "", uid: user.uid
    }

    return await addDoc(collection(db, "workspaces"), {
        ...newWorkSpace,
    });

})
export const createGroup = createAsyncThunk('firestore/createGroup', async (group, thunkAPI) => {

    const user = thunkAPI.getState().auth.user;
    const accessToken = thunkAPI.getState().auth.accessToken;

    // TODO: create google drive folder

    const newGroup = {
        ...group,
        id: uuidv4(),
        googleDriveFolderId: "",
        uid: user.uid,
        workspace: thunkAPI.getState.firestore.currentWorkspace
    }

    return await addDoc(collection(db, "groups"), {
        ...newGroup,
    });

})
export const createTab = createAsyncThunk('firestore/createTab', async (tab, thunkAPI) => {

    const user = thunkAPI.getState().auth.user;

    const newTab = {
        ...tab,
        group: thunkAPI.getState().firestore.currentGroup,
        id: uuidv4(),
        uid: user.uid,
        status: "complete"
    }

    return await addDoc(collection(db, "tabs"), {
        ...newTab,
    });
})


const firestoreSlice = createSlice({
    name: 'firestore',
    initialState,
    reducers: {
        addAllStructure: (state, action) => {
            console.log(action.payload);
            state.workspaces = action.payload.workspaces;
            state.groups = action.payload.groups;
            state.tabs = action.payload.tabs;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(loadStructureByUser.rejected, (state, action) => {
                console.log(action);
            })
            .addCase(loadStructureByUser.fulfilled, (state, action) => {
                console.log(action);
            })
            .addCase(createWorkSpace.rejected, (state, action) => {
                console.log(action);
            })
            .addCase(createWorkSpace.fulfilled, (state, action) => {
                console.log(action);
            })
            .addCase(createGroup.rejected, (state, action) => {
                console.log(action);
            })
            .addCase(createGroup.fulfilled, (state, action) => {
                console.log(action);
            })
            .addCase(createTab.rejected, (state, action) => {
                console.log(action);
            })
            .addCase(createTab.fulfilled, (state, action) => {
                console.log(action);
            })
    }
})

export const { addAllStructure } = firestoreSlice.actions
export default firestoreSlice.reducer