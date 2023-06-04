import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'

const initialState = {
    structure: {
        gid: "",
        name: "",
        groups: [],
        tabs: [],
        childs: []
    },
}


const dndSlice = createSlice({
    name: 'dnd',
    initialState,
    reducers: {
        setStructure: (state, action) => {
            state.structure = {
                ...action.payload
            }
        },
    }
})

export const { setStructure  } = dndSlice.actions
export default dndSlice.reducer