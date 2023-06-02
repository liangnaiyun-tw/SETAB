import { createAsyncThunk, createSlice } from '@reduxjs/toolkit'
import axios from 'axios';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, getRedirectResult, signInWithRedirect } from "firebase/auth";

/*global chrome*/

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
        chrome.identity.getAccounts((account) => {
            console.log(account);
        })
        if (user) {
            let accessToken;
            chrome.identity.getAuthToken({ interactive: true }, function (token) {
                console.log(token);
                accessToken = token;
                console.log(user);
                console.log(accessToken);
                thunkAPI.dispatch(setAuth({ user, accessToken }));
                thunkAPI.dispatch(setLoginStatus(true));
            });
            axios.get('https://people.googleapis.com/v1/people/me', {
                headers: {
                    "Authorization": "Bearer " + accessToken,
                    "Content-Type": "application/json"
                }
            }).then((response) => {
                console.log(response.data);
            }).catch((err) => {
                console.error(err);
            });
            // signInWithPopup(auth, provider)
            //     .then((result) => {
            //         const credential = GoogleAuthProvider.credentialFromResult(result);
            //         const accessToken = credential?.accessToken;
            //         const user = result.user;
            //         console.log(user);
            //         console.log(accessToken);
            //         thunkAPI.dispatch(setAuth({ user, accessToken }));
            //         thunkAPI.dispatch(setLoginStatus(true));

            //     })
            //     .catch((error) => {
            //         console.error(error);
            //         const errorCode = error.code;
            //         const errorMessage = error.message;
            //         const email = error.email;
            //         thunkAPI.dispatch(setLoginStatus(false));
            //         const credential = GoogleAuthProvider.credentialFromError(error);
            //     })
        } else {
            let accessToken;
            chrome.identity.getAuthToken({ interactive: true }, function (token) {
                console.log(token);
                accessToken = token;
                console.log(user);
                console.log(accessToken);
                axios.get('https://people.googleapis.com/v1/people/me?personFields=names,emailAddresses,metadata,photos', {
                    headers: {
                        "Authorization": "Bearer " + accessToken,
                    }
                }).then((response) => {
                    console.log(response.data);
                }).catch((err) => {
                    console.error(err);
                });
                thunkAPI.dispatch(setAuth({ user, accessToken }));
                thunkAPI.dispatch(setLoginStatus(true));
                thunkAPI.dispatch(setLoginStatus(false))
                thunkAPI.dispatch(setAuth({ user: undefined, accessToken: undefined }))
            });
            // signInWithPopup(auth, provider)
            //     .then((result) => {
            //         const credential = GoogleAuthProvider.credentialFromResult(result);
            //         const accessToken = credential?.accessToken;
            //         const user = result.user;
            //         console.log(user);
            //         console.log(accessToken);
            //         thunkAPI.dispatch(setAuth({ user, accessToken }));
            //         thunkAPI.dispatch(setLoginStatus(true));

            //     })
            //     .catch((error) => {
            //         console.error(error);
            //         const errorCode = error.code;
            //         const errorMessage = error.message;
            //         const email = error.email;
            //         thunkAPI.dispatch(setLoginStatus(false));
            //         const credential = GoogleAuthProvider.credentialFromError(error);
            //     })
            // thunkAPI.dispatch(setLoginStatus(false))
            // thunkAPI.dispatch(setAuth({ user: undefined, accessToken: undefined }))
        }
    });
})

export const login = createAsyncThunk('auth/login', async (_, thunkAPI) => {

    const auth = getAuth();
    thunkAPI.dispatch(setLoadingStatus(true));

    if (!thunkAPI.getState().auth.isLogin) {
        await signInWithPopup(auth, provider)
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