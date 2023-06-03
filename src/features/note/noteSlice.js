import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'
import {
    getFirestore,
    collection,
    query,
    updateDoc,
    where,
    getDocs,
} from "firebase/firestore";
import { loadStructureByUser } from '../firebase/firestore/firestoreSlice';
import app from "../../shared/Firebase"


const db = getFirestore(app());

const initialState = {
    fileList: [],
    isEditing: false,
    editingUrl: "",
    isIframeLoading: true,
    isLoadingNote: false
}

const MIME_TYPE = ["application/vnd.google-apps.document",
    "application/vnd.google-apps.presentation",
    "application/vnd.google-apps.spreadsheet"]


export const getNotes = createAsyncThunk('note/getNotes', async (token, thunkAPI) => {
    thunkAPI.dispatch(setNoteLoadingStatus(true));

    const { workspaces, groups, currentWorkspace, currentGroup } = thunkAPI.getState().firestore;
    try {
        let currentFolderId = currentGroup.length === 0 ?
            workspaces.filter(workspace => workspace.id === currentWorkspace)[0].googleDriveFolderId :
            groups.filter(workspace => workspace.id === currentGroup[currentGroup.length - 1])[0].googleDriveFolderId

        const response = await axios.get(`https://www.googleapis.com/drive/v2/files/${currentFolderId}/children?access_token=${token}&orderBy=folder,modifiedDate desc,title`)
        let fileList = response.data.items;
        let fileDetailList = []
        for (let i = 0; i < fileList.length; i++) {
            const fileDetail = await axios.get(`https://www.googleapis.com/drive/v2/files/${fileList[i].id}?access_token=${token}`);
            if (fileDetail.data.mimeType === "application/vnd.google-apps.folder") continue;
            fileDetailList.push(fileDetail.data);
        }
        thunkAPI.dispatch(setNoteLoadingStatus(false));
        return fileDetailList;
    } catch (error) {
        thunkAPI.dispatch(setNoteLoadingStatus(false));
        return thunkAPI.rejectWithValue(error.message);
    }

})

export const createNewNote = createAsyncThunk('note/createNewNote', async ({ type, newNoteName }, thunkAPI) => {

    const { workspaces, groups, currentWorkspace, currentGroup } = thunkAPI.getState().firestore;
    const { accessToken } = thunkAPI.getState().auth;

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
                    workspace.id === currentWorkspace
                )[0]
                parentIsWorkspace = true;
                return parent.googleDriveFolderId;
            })()

        const noteData = {
            "name": newNoteName,
            "mimeType": MIME_TYPE[type],
            "parents": [parentFolderId]
        }
        console.log(noteData);
        const response = await axios.post("https://www.googleapis.com/drive/v3/files", {
            ...noteData
        }, {
            headers: {
                Authorization: "Bearer " + accessToken
            }
        })
        const file = response.data;

        // add note file id to parent
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
            notes: [...data.notes, file.id],
        });

        // setCurrentGroup and reload all structure
        await thunkAPI.dispatch(getNotes(accessToken));
        await thunkAPI.dispatch(loadStructureByUser());
        return "create note succuess"
    } catch (e) {
        return e.response;
    }
})

export const pickNewNote = createAsyncThunk('note/pickNewNote', async ({ newNoteDetail, token }, thunkAPI) => {

    try {
        const newFile = await axios.get(`https://www.googleapis.com/drive/v2/files/${newNoteDetail.docs[0].id}?access_token=${token}`)
        return newFile.data;
    } catch (error) {
        return thunkAPI.rejectWithValue(error.message)
    }

})

const noteSlice = createSlice({
    name: 'note',
    initialState,
    reducers: {
        setNoteLoadingStatus: (state, action) => {
            state.isLoadingNote = action.payload
        },
        handleEdit: (state, action) => {
            state.isEditing = true;
            state.editingUrl = action.payload;
        },
        finishEdit: (state) => {
            state.isEditing = false;
            state.editingUrl = "";
            state.isIframeLoading = true;
        },
        iframeFinishLoading: (state) => {
            state.isIframeLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getNotes.rejected, (state, action) => {
                console.log(action)
            }).addCase(getNotes.fulfilled, (state, action) => {
                state.fileList = action.payload;
            }).addCase(pickNewNote.rejected, (state, action) => {
                console.log(action);
            }).addCase(pickNewNote.fulfilled, (state, action) => {
                state.fileList = [action.payload, ...state.fileList];
            })
    }
})

export const { handleEdit, finishEdit, iframeFinishLoading, setNoteLoadingStatus } = noteSlice.actions
export default noteSlice.reducer