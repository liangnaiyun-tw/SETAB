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
import axios from 'axios';


const db = getFirestore(app());

const UNSAVED_WORKSPACE = "Unsaved";
const unSaveWorkSpace = {
    googleDriveFolderId: "",     // unused
    groups: [],                  // unused
    id: "",
    name: UNSAVED_WORKSPACE,
    note: [],                    // unused
    uid: ""                     // unused
}

const initialState = {
    workspaces: [unSaveWorkSpace],
    groups: [],
    tabs: [],
    historys: [],
    rootDirectory: "",
    currentWorkspace: "",
    currentGroup: [],
}

export const loadStructureByUser = createAsyncThunk('firestore/loadStructureByUser', async (_, thunkAPI) => {

    const user = thunkAPI.getState().auth.user;
    const accessToken = thunkAPI.getState().auth.accessToken;



    // user
    const userQuery = query(
        collection(db, "users"),
        where("uid", "==", user.uid)
    );
    const userQuerySnapshot = await getDocs(userQuery);
    let userInDB = null;
    // set new user
    if (userQuerySnapshot.docs.length === 0) {
        console.log("create new user")

        const rootFolderData = {
            "name": "SETab-Root",
            "mimeType": "application/vnd.google-apps.folder",
        }

        const response = await axios.post("https://www.googleapis.com/drive/v3/files", {
            ...rootFolderData
        }, {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        })
        const folder = response.data;


        const newUser = {
            displayName: user.displayName,
            photoUrl: user.photoURL,
            googleDriveRootFolderID: folder.id,
            uid: user.uid,
            workspaces: []
        }

        await addDoc(collection(db, "users"), {
            ...newUser,
        });

        userInDB = newUser;
    } else {
        userInDB = userQuerySnapshot.docs[0].data();
    }

    thunkAPI.dispatch(setRootDirectory(userInDB.googleDriveRootFolderID));

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

    thunkAPI.dispatch(addAllStructure({ workspaces, groups, tabs, userInDB }));

})
export const createWorkSpace = createAsyncThunk('firestore/createWorkSpace', async (workspace, thunkAPI) => {

    try {
        const user = thunkAPI.getState().auth.user;
        const accessToken = thunkAPI.getState().auth.accessToken;



        // create directory
        const workspaceFolderData = {
            "name": workspace.name,
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [thunkAPI.getState().firestore.rootDirectory]
        }
        const response = await axios.post("https://www.googleapis.com/drive/v3/files", {
            ...workspaceFolderData
        }, {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        })
        const folder = response.data;


        // add workspace to firebase
        const newWorkSpace = {
            ...workspace, id: uuidv4(), googleDriveFolderId: folder.id, uid: user.uid
        }
        await addDoc(collection(db, "workspaces"), {
            ...newWorkSpace,
        });

        // update user
        const userQuery = query(collection(db, "users"), where("uid", "==", user.uid))
        const userQuerySnapshot = await getDocs(userQuery);
        const data = userQuerySnapshot.docs[0].data();
        await updateDoc(userQuerySnapshot.docs[0].ref, {
            ...data,
            workspaces: [...data.workspaces, newWorkSpace.id],
        });

        // set current workspace to created workspace
        thunkAPI.dispatch(setCurrentWorkspace(newWorkSpace.id));
        await thunkAPI.dispatch(loadStructureByUser());

        return "create workspace sucessfully";
    } catch (e) {
        return e.response;
    }


})
export const createGroup = createAsyncThunk('firestore/createGroup', async (group, thunkAPI) => {

    const user = thunkAPI.getState().auth.user;
    const accessToken = thunkAPI.getState().auth.accessToken;
    const { workspaces, groups, currentGroup, currentWorkspace } = thunkAPI.getState().firestore;

    try {



        // create google drive folder
        let parentIsWorkspace;
        let parent;
        const parentFolderId = currentGroup.length !== 0 ?
            (() => {
                parent = groups.filter(group =>
                    group.id === currentGroup[currentGroup.length - 1]
                )[0]
                parentIsWorkspace = false;
                return parent.googleDriveFolderId;
            })()
            :
            (() => {
                parent = workspaces.filter(workspace =>
                    workspace.id == currentWorkspace
                )[0]
                parentIsWorkspace = true;
                return parent.googleDriveFolderId;
            })()

        const groupFolderData = {
            "name": group.name,
            "mimeType": "application/vnd.google-apps.folder",
            "parents": [parentFolderId]
        }
        const response = await axios.post("https://www.googleapis.com/drive/v3/files", {
            ...groupFolderData
        }, {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        })
        const folder = response.data;


        // add group to firebase
        const newGroup = {
            ...group,
            id: uuidv4(),
            googleDriveFolderId: folder.id,
            uid: user.uid,
            workspace: currentWorkspace
        }
        await addDoc(collection(db, "groups"), {
            ...newGroup,
        });

        // add group id to parent
        let q;
        if (parentIsWorkspace) {
            q = query(collection(db, "workspaces"), where("id", "==", parent.id));
        } else {
            q = query(collection(db, "groups"), where("id", "==", parent.id));
        }
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs[0].data();
        await updateDoc(querySnapshot.docs[0].ref, {
            ...data,
            groups: [...data.groups, newGroup.id],
        });

        // setCurrentGroup and reload all structure
        await thunkAPI.dispatch(loadStructureByUser());
        thunkAPI.dispatch(setCurrentGroup([...currentGroup, newGroup.id]));

        return "create group succuess"
    } catch (e) {
        return e.response;
    }
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
            const { workspaces, groups, tabs, userInDB } = action.payload;
            state.workspaces = workspaces;
            state.groups = groups;
            state.tabs = tabs;
            state.user = userInDB;
        },
        setCurrentWorkspace: (state, action) => {
            state.currentWorkspace = action.payload;
        },
        setRootDirectory: (state, action) => {
            state.rootDirectory = action.payload;
        },
        setCurrentGroup: (state, action) => {
            state.currentGroup = action.payload;
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

export const { addAllStructure, setCurrentWorkspace, setRootDirectory, setCurrentGroup } = firestoreSlice.actions
export default firestoreSlice.reducer