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
    writeBatch,
    getDoc
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

/*The first workspace should be always "Unsaved"*/
const initialState = {
    workspaces: [unSaveWorkSpace],
    groups: [],
    tabs: [],
    historys: [],
    currentWorkspace: unSaveWorkSpace.id,
    currentGroup: [],
    rootDirectory: "",
    user: {}
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
            photoUrl: user.photoUrl,
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
        await thunkAPI.dispatch(loadStructureByUser());
        await thunkAPI.dispatch(setCurrentWorkspace(newWorkSpace.id));

        return "create workspace sucessfully";
    } catch (e) {
        console.error(e.message);
        return e.response;
    }


})
export const deleteWorkspace = createAsyncThunk('firestore/deleteWorkspace', async (workspaceId, thunkAPI) => {
    const user = thunkAPI.getState().auth.user;
    let q = query(collection(db, "workspaces"), where("id", "==", workspaceId), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    await deleteDoc(querySnapshot.docs[0].ref);

    q = query(collection(db, "groups"), where("uid", "==", user.uid), where("workspace", "==", workspaceId));
    const deleteQuerySnapshot = await getDocs(q);
    const batch = writeBatch(db)
    deleteQuerySnapshot.forEach(doc => batch.delete(doc.ref));
    batch.commit()

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

        console.log("WORKSPACES");
        console.log(group.workspace, currentWorkspace);
        console.log("PARENT FOLDERID");
        console.log(parentFolderId);
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

        return newGroup;
    } catch (e) {
        return e.response;
    }
})
export const updateGroup = createAsyncThunk('firestore/updateGroup', async (group, thunkAPI) => {
    const user = thunkAPI.getState().auth.user;

    let q = query(collection(db, "groups"), where("id", "==", group.id), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);
    const data = querySnapshot.docs[0].data();
    await updateDoc(querySnapshot.docs[0].ref, {
        name: group.name,
        group: [...data.groups.concat(group.groups)]
    })

    await thunkAPI.dispatch(loadStructureByUser());

    return 'update group successfully'

})
export const deleteGroup = createAsyncThunk('firestroe/deleteGroup', async (groupId, thunkAPI) => {
    const user = thunkAPI.getState().auth.user;
    let q = query(collection(db, "groups"), where("id", "==", groupId), where("uid", "==", user.uid));
    let querySnapshot = await getDocs(q);
    let data = querySnapshot.docs[0].data();
    let groupsToDelete = data.groups;

    await deleteDoc(querySnapshot.docs[0].ref);

    while (groupsToDelete.length > 0) {
        groupId = groupsToDelete.pop();
        q = query(collection(db, "groups"), where("id", "==", groupId), where("uid", "==", user.uid));
        querySnapshot = await getDocs(q);
        data = querySnapshot.docs[0].data();
        groupsToDelete = groupsToDelete.concat(data.groups);
        await deleteDoc(querySnapshot.docs[0].ref);
    }

    await thunkAPI.dispatch(loadStructureByUser());

    return 'delete group successfully'
})
export const createTab = createAsyncThunk('firestore/createTab', async (tab, thunkAPI) => {

    const user = thunkAPI.getState().auth.user;

    const newTab = {
        ...tab,
        group: thunkAPI.getState().firestore.currentGroup[thunkAPI.getState().firestore.currentGroup.length - 1],
        id: uuidv4(),
        uid: user.uid,
        status: "complete"
    }

    return await addDoc(collection(db, "tabs"), {
        ...newTab,
    });
})

export const updateTab = createAsyncThunk('firestore/updateTab', async (tab, thunkAPI) => {
    const user = thunkAPI.getState().auth.user;

    let q = query(collection(db, "tabs"), where("id", "==", tab.id), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    await updateDoc(querySnapshot.docs[0].ref, {
        ...tab
    });

    await thunkAPI.dispatch(loadStructureByUser());

    return "Update tab successfully";
});

export const closeTab = createAsyncThunk('firestore/closeTab', async (tab, thunkAPI) => {
    const user = thunkAPI.getState().auth.user;

    let q = query(collection(db, "tabs"), where("id", "==", tab.id), where("uid", "==", user.uid));
    const querySnapshot = await getDocs(q);

    await updateDoc(querySnapshot.docs[0].ref, {
        ...tab,
        status: "complete",
        tabId: -1,
        windowId: -1,
        windowIndex: -1
    });

    await thunkAPI.dispatch(loadStructureByUser());

    return "Close tab successfully";
})

export const moveGroupToOtherGroup = createAsyncThunk('firestore/moveGroupToOtherGroup', async ({ draggedGroupId, droppedGroupId, originParentGroupId }, thunkAPI) => {
    try {
        const { groups, workspaces } = thunkAPI.getState().firestore;
        let draggedGroup = groups.filter(group => group.id === draggedGroupId)[0];
        let droppedGroup = groups.filter(group => group.id === droppedGroupId)[0];
        let droppedWorkspace = workspaces.filter(workspace => workspace.id === droppedGroupId)[0]
        let originParentGroup = groups.filter(group => group.id === originParentGroupId)[0];
        let workspace = workspaces.filter(workspace => workspace.id === originParentGroupId)[0];
        // let draggedGroupId = draggedGroup.id;
        // let droppedGroupId = droppedGroup.id;
        // let originParentGroupId = originParentGroup.id;

        // let draggedGroupQuery = query(collection(db, "groups"), where("id", "==", draggedGroupId));
        let droppedGroupQuery
        if (droppedWorkspace === undefined)
            droppedGroupQuery = query(collection(db, "groups"), where("id", "==", droppedGroupId));
        else
            droppedGroupQuery = query(collection(db, "workspaces"), where("id", "==", droppedWorkspace.id));

        let originParentGroupQuery;
        if (workspace === undefined)
            originParentGroupQuery = query(collection(db, "groups"), where("id", "==", originParentGroupId));
        else
            originParentGroupQuery = query(collection(db, "workspaces"), where("id", "==", workspace.id));

        // const draggedGroupQuerySnapshot = await getDocs(draggedGroupQuery);
        const droppedGroupQuerySnapshot = await getDocs(droppedGroupQuery);
        const originParentGroupQuerySnapshot = await getDocs(originParentGroupQuery);

        // await updateDoc(draggedGroupQuerySnapshot.docs[0].ref, {
        //     ...draggedGroup,
        //     group: newGroup.id
        // })
        if (workspace === undefined)
            await updateDoc(droppedGroupQuerySnapshot.docs[0].ref, {
                ...droppedGroup,
                groups: [draggedGroup.id, ...droppedGroup.groups]
            })
        else
            await updateDoc(originParentGroupQuerySnapshot.docs[0].ref, {
                ...workspace,
                groups: [draggedGroup.id, ...workspace.groups]
            })

        if (workspace === undefined)
            await updateDoc(originParentGroupQuerySnapshot.docs[0].ref, {
                ...originParentGroup,
                groups: originParentGroup.groups.filter(group => group !== draggedGroup.id)
            })
        else
            await updateDoc(originParentGroupQuerySnapshot.docs[0].ref, {
                ...workspace,
                groups: workspace.groups.filter(group => group !== draggedGroup.id)
            })

        await thunkAPI.dispatch(loadStructureByUser());


    } catch (e) {
        console.log(e.message)
    }
})

export const moveTabToOtherGroup = createAsyncThunk('firestore/moveTabToOtherGroup', async ({ tabId, newGroupId }, thunkAPI) => {
    try {

        const { groups, tabs } = thunkAPI.getState().firestore;


        const tab = tabs.filter(tab => tab.id === tabId)[0];
        const originGroup = groups.filter(group => group.id === tab.group)[0];
        const newGroup = groups.filter(group => group.id === newGroupId)[0];
        let originGroupId = originGroup.id;

        let tabQuery = query(collection(db, "tabs"), where("id", "==", tabId));
        let newGroupQuery = query(collection(db, "groups"), where("id", "==", newGroupId));
        let originGroupQuery = query(collection(db, "groups"), where("id", "==", originGroupId));


        const tabQuerySnapshot = await getDocs(tabQuery);
        const newGroupQuerySnapshot = await getDocs(newGroupQuery);
        const originGroupQuerySnapshot = await getDocs(originGroupQuery);

        await updateDoc(tabQuerySnapshot.docs[0].ref, {
            ...tab,
            group: newGroup.id
        })

        await updateDoc(originGroupQuerySnapshot.docs[0].ref, {
            ...originGroup,
            tabs: originGroup.tabs.filter(tab => tab !== tabId)
        })

        await updateDoc(newGroupQuerySnapshot.docs[0].ref, {
            ...newGroup,
            tabs: [tabId, ...newGroup.tabs]
        })


        await thunkAPI.dispatch(loadStructureByUser());

    } catch (e) {
        console.log(e.message);
        return e.response;
    }

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
            let newTabs = state.tabs;
            state.workspaces[0].tabs.forEach(removeTabId => {
                newTabs = newTabs.filter(tab => tab.id !== removeTabId);
            });
            state.tabs = newTabs.concat(action.payload.tabs);
            state.workspaces[0].tabs = action.payload.tabs.map(tab => tab.id);
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
                console.log(action.payload);
                return action.payload;

            })
            .addCase(createTab.rejected, (state, action) => {
                console.log(action);
            })
            .addCase(createTab.fulfilled, (state, action) => {
                console.log(action);
            })
            .addCase(updateTab.fulfilled, (state, action) => {
                console.log(action);
            })
            .addCase(updateTab.rejected, (state, action) => {
                console.log(action);
            })
            .addCase(closeTab.fulfilled, (state, action) => {
                console.log(action);
            })
            .addCase(closeTab.rejected, (state, action) => {
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
            .addCase(deleteGroup.fulfilled, (state, action) => {
                console.log(action)
            })
            .addCase(deleteGroup.rejected, (state, action) => {
                console.log(action)
            })
            .addCase(moveTabToOtherGroup.fulfilled, (state, action) => {
                console.log(action)
            })
            .addCase(moveTabToOtherGroup.rejected, (state, action) => {
                console.log(action)
            })
            .addCase(moveGroupToOtherGroup.fulfilled, (state, action) => {
                console.log(action)
            })
            .addCase(moveGroupToOtherGroup.rejected, (state, action) => {
                console.log(action)
            })
    }
})

export const { addAllStructure, setCurrentWorkspace, setRootDirectory, setCurrentGroup, updateUnsavedWorkspace } = firestoreSlice.actions
export default firestoreSlice.reducer