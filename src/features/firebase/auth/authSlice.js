import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, getRedirectResult } from "firebase/auth";

const initialState = {
    isLoading: false,
    isLogin: false,
    user: undefined,
    accessToken: undefined
}

const AUTH_SCOPES = [
    'email',
    'profile',
    'https://www.googleapis.com/auth/drive',
]

let provider = new GoogleAuthProvider();
AUTH_SCOPES.forEach(SCOPE => provider.addScope(SCOPE));

export const initLogin = createAsyncThunk('auth/initLogin', async (_, thunkAPI) => {
    const auth = getAuth();

    onAuthStateChanged(auth, (user) => {
        if (user) {
            signInWithPopup(auth, provider)
                .then((result) => {
                    const credential = GoogleAuthProvider.credentialFromResult(result);
                    const accessToken = credential?.accessToken;
                    const user = result.user;
                    console.log(user);
                    console.log(accessToken);
                    thunkAPI.dispatch(setAuth({ user, accessToken }));
                    thunkAPI.dispatch(setLoginStatus(true));

                })
                .catch((error) => {
                    const errorCode = error.code;
                    const errorMessage = error.message;
                    const email = error.email;
                    thunkAPI.dispatch(setLoginStatus(false));
                    const credential = GoogleAuthProvider.credentialFromError(error);
                })
                .finally(() => {
                    thunkAPI.dispatch(setLoadingStatus(false));
                })
        } else {
            thunkAPI.dispatch(setLoginStatus(false))
            thunkAPI.dispatch(setAuth({ user: undefined, accessToken: undefined }))
        }
    });
})

export const login = createAsyncThunk('auth/login', async (_, thunkAPI) => {

    const auth = getAuth();
    thunkAPI.dispatch(setLoadingStatus(true));

    if (!thunkAPI.getState().auth.isLogin) {
        signInWithPopup(auth, provider)
            .then((result) => {
                const credential = GoogleAuthProvider.credentialFromResult(result);
                const accessToken = credential?.accessToken;
                const user = result.user;
                console.log(user);
                console.log(accessToken);
                thunkAPI.dispatch(setAuth({ user, accessToken }));
                thunkAPI.dispatch(setLoginStatus(true));

            })
            .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.email;
                thunkAPI.dispatch(setLoginStatus(false));
                const credential = GoogleAuthProvider.credentialFromError(error);
            })
            .finally(() => {
                thunkAPI.dispatch(setLoadingStatus(false));
            });
    } else {
        thunkAPI.dispatch(setAuth({ user: undefined, accessToken: undefined }))
        thunkAPI.dispatch(setLoadingStatus(false));
        thunkAPI.dispatch(setLoginStatus(false));

        signOut(auth);
    }
})

const authSlice = createSlice({
    name: 'auth',
    initialState,
    reducers: {
        setLoginStatus: (state, action) => {
            state.isLogin = action.payload;
        },
        setLoadingStatus: (state, action) => {
            state.isLoading = action.payload;
        },
        setAuth: (state, action) => {
            state.user = action.payload.user;
            state.accessToken = action.payload.accessToken;
        },
        iframeFinishLoading: (state) => {
            state.isIframeLoading = false;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(login.rejected, (state, action) => {
                console.log(action);
            })
            .addCase(login.fulfilled, (state, action) => {
                console.log(action);
            })
            .addCase(initLogin.rejected, (state, action) => {
                console.log(action);
            })
            .addCase(initLogin.fulfilled, (state, action) => {
                console.log(action);
            })
    }
})

export const { setLoginStatus, setLoadingStatus, setAuth, iframeFinishLoading } = authSlice.actions
export default authSlice.reducer