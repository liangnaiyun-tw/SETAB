import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import {
    getFirestore,
    collection,
    addDoc,
    query,
    where,
    getDocs,
    updateDoc,
    deleteDoc,
} from "firebase/firestore";
import app from "../../../shared/Firebase"

import { v4 as uuidv4 } from "uuid";
import axios from 'axios';


const db = getFirestore(app());

const UNSAVED_WORKSPACE = "Unsaved";
const unSaveWorkSpace = {
    googleDriveFolderId: "",     // unused
    groups: [],                  // unused
    id: uuidv4(),
    name: UNSAVED_WORKSPACE,
    tabs: [],
    note: [],                    // unused
    uid: ""                     // unused
}

const initialState = {
    workspaces: [unSaveWorkSpace],
    groups: [],
    tabs: [],
    historys: [],
    currentWorkspace: unSaveWorkSpace.id,
    currentGroup: ""
}

/*Fake Data*/
// const initialState = {
//     workspaces: [unSaveWorkSpace,
//         {
//             id: "cd363797-b823-4714-aebc-606c1b27f434",
//             name: "Test Workspace",
//             googleDriveFolderId: "",
//             groups: [
//                 "d35c907e-7757-4185-90ec-695680557414"
//             ],
//             notes: [],
//             uid: ""
//         }
//     ],
//     groups: [
//         {
//             id: "d35c907e-7757-4185-90ec-695680557414",
//             name: "Test Group",
//             googleDriveFolderId: "",
//             groups: [
//                 "2aec38cd-c8f9-49c5-8aa9-88331f5076bb"
//             ],
//             histories: [],
//             notes: [],
//             tabs: [
//                 "72c7b6b7-2706-419c-9e09-ab33ac092942",
//             ],
//             uid: "",
//             workspace: "cd363797-b823-4714-aebc-606c1b27f434"
//         },
//         {
//             id: "2aec38cd-c8f9-49c5-8aa9-88331f5076bb",
//             name: "Dependency Injection",
//             groups: [],
//             histories: [],
//             notes: [],
//             tabs: [
//                 "1e72e6a4-7a98-4444-9681-bdd48f2e2197"
//             ],
//             uid: "",
//             workspace: "cd363797-b823-4714-aebc-606c1b27f434"
//         }
//     ],
//     tabs: [
//         {
//             id: "72c7b6b7-2706-419c-9e09-ab33ac092942",
//             title: "SETab - Cloud Firestore - Firebase 控制台",
//             alias: "SETab - Cloud Firestore - Firebase 控制台",
//             group: "d35c907e-7757-4185-90ec-695680557414",
//             status: "complete",
//             tabIconUrl: "https://www.gstatic.com/mobilesdk/160503_mobilesdk/logo/favicon.ico",
//             tabUrl: "https://console.firebase.google.com/project/setab-388009/firestore/data/~2Fgroups~2FNfeSrDFueAczGQpFuvqX",
//             uid: "",
//             windowId: [
//                 424340572
//             ],
//             tabId: [
//                 424340932
//             ]
//         },
//         {
//             id: "1e72e6a4-7a98-4444-9681-bdd48f2e2197",
//             title: "API reference - Chrome Developers",
//             alias: "API reference - Chrome Developers",
//             group: "2aec38cd-c8f9-49c5-8aa9-88331f5076bb",
//             status: "complete",
//             tabIconUrl: "https://developer.chrome.com/images/meta/favicon-32x32.png",
//             tabUrl: "https://developer.chrome.com/docs/extensions/reference/",
//             uid: "",
//             windowId: [
//                 424340572
//             ],
//             tabId: [
//                 424343144
//             ]
//         }
//     ],
//     historys: [],
//     rootDirectory: "",
//     currentWorkspace: "",
//     currentGroup: [],
// }

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

    // To sort the workspaces according to user workspaces
    let workspacesInDB = workspaceQuerySnapshot.docs;
    if (userInDB && userInDB.workspaces.length > 0) {
        workspacesInDB.sort((a, b) => {
            const indexA = userInDB.workspaces.indexOf(a.data().id);
            const indexB = userInDB.workspaces.indexOf(b.data().id);
            if (indexA < indexB) {
                return -1;
            } else if (indexA > indexB) {
                return 1;
            } else {
                return 0;
            }
        })
    }

    workspacesInDB.forEach((doc) => {
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
export const updateUserWorkspaces = createAsyncThunk('firestore/updateUserWorkspaces', async (workspaces, thunkAPI) => {
    const user = thunkAPI.getState().auth.user;
    const userQuery = query(collection(db, "users"), where("uid", "==", user.uid))
    const userQuerySnapshot = await getDocs(userQuery);
    const data = userQuerySnapshot.docs[0].data();
    await updateDoc(userQuerySnapshot.docs[0].ref, {
        ...data,
        workspaces: [...workspaces],
    });
    await thunkAPI.dispatch(loadStructureByUser());

    return "update User Workspaces sucessfully";
})
export const updateWorkspaceGroups = createAsyncThunk('firestore/updateWorkspaceGroups', async ({ groups, workspaceId }, thunkAPI) => {
    const user = thunkAPI.getState().auth.user;

    let q = query(collection(db, "workspaces"), where("id", "==", workspaceId), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    await updateDoc(querySnapshot.docs[0].ref, {
        groups: [...groups]
    })

    await thunkAPI.dispatch(loadStructureByUser());
    return 'update Workspace groups successfully';
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
export const deleteWorkspace = createAsyncThunk('firestore/deleteWorkspace', async (workspaceId, thunkAPI) => {
    const user = thunkAPI.getState().auth.user;
    let q = query(collection(db, "workspaces"), where("id", "==", workspaceId), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    await deleteDoc(querySnapshot.docs[0].ref);
    await thunkAPI.dispatch(loadStructureByUser());
    return 'delete workspace successfully';
})
export const updateWorkspace = createAsyncThunk('firestore/updateWorkspace', async (workspace, thunkAPI) => {
    const user = thunkAPI.getState().auth.user;

    let q = query(collection(db, "workspaces"), where("id", "==", workspace.id), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    await updateDoc(querySnapshot.docs[0].ref, {
        name: workspace.name,
        groups: workspace.groups
    })

    await thunkAPI.dispatch(loadStructureByUser());
    return 'update workspace successfully';
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
                    workspace.id === (group.workspace ? group.workspace : currentWorkspace)
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
            workspace: group.workspace ? group.workspace : currentWorkspace
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
export const updateGroup = createAsyncThunk('firestore/updateGroup', async (group, thunkAPI) => {
    const user = thunkAPI.getState().auth.user;

    let q = query(collection(db, "groups"), where("id", "==", group.id), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    await updateDoc(querySnapshot.docs[0].ref, {
        name: group.name
    })

    await thunkAPI.dispatch(loadStructureByUser());

    return 'update group successfully'

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
        },
        updateUnsavedWorkspace: (state, action) => {
            /*The first workspace should be always "Unsaved"*/
            state.workspaces[0].tabs = action.payload.tabs;
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
            .addCase(updateWorkspace.fulfilled, (state, action) => {
                console.log(action);
            })
            .addCase(updateWorkspace.rejected, (state, action) => {
                console.log(action);
            })
            .addCase(createGroup.rejected, (state, action) => {
                console.log(action);
            })
            .addCase(updateGroup.fulfilled, (state, action) => {
                console.log(action);
            })
            .addCase(updateGroup.rejected, (state, action) => {
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
            .addCase(updateUserWorkspaces.fulfilled, (state, action) => {
                console.log(action)
            })
            .addCase(updateUserWorkspaces.rejected, (state, action) => {
                console.log(action)
            })
            .addCase(updateWorkspaceGroups.fulfilled, (state, action) => {
                console.log(action)
            })
            .addCase(updateWorkspaceGroups.rejected, (state, action) => {
                console.log(action)
            })
            .addCase(deleteWorkspace.fulfilled, (state, action) => {
                console.log(action)
            })
            .addCase(deleteWorkspace.rejected, (state, action) => {
                console.log(action)
            })
    }
})

export const { addAllStructure, setCurrentWorkspace, setRootDirectory, setCurrentGroup, updateUnsavedWorkspace } = firestoreSlice.actions
export default firestoreSlice.reducer