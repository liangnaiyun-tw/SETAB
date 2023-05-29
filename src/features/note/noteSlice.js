import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios'

const initialState = {
    fileList: [],
    isEditing: false,
    editingUrl: "",
    isIframeLoading: true,
    isLoadingNote: false
}

export const getNotes = createAsyncThunk('note/getNotes', async (token, thunkAPI) => {
    thunkAPI.dispatch(setNoteLoadingStatus(true));
    try {
        const response = await axios.get(`https://www.googleapis.com/drive/v3/files?pageSize=10&access_token=${token}`)
        let fileList = response.data.files;
        let fileDetailList = []
        for (let i = 0; i < fileList.length; i++) {
            const fileDetail = await axios.get(`https://www.googleapis.com/drive/v2/files/${fileList[i].id}?access_token=${token}`);
            fileDetailList.push(fileDetail.data);
        }
        thunkAPI.dispatch(setNoteLoadingStatus(false));
        return fileDetailList;
    } catch (error) {
        thunkAPI.dispatch(setNoteLoadingStatus(false));
        return thunkAPI.rejectWithValue(error.message);
    }

})

export const pickNewNote = createAsyncThunk('note/pickNewNote', async ({newNoteDetail, token}, thunkAPI) => {

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