import React from "react";
import "./Login.css";
import GoogleLogo from "../../../assets/images/google-logo.png";

import { useDispatch, useSelector } from "react-redux";
import { login } from "../../../features/firebase/auth/authSlice";


const Login = () => {

  const {isLoading, isLogin, user} = useSelector((store) => store.auth);

  const dispatch = useDispatch()

  let loginWithGoogleClickHandler = () => {      
    dispatch(login());
  };

  return (
    <div className="Login">
      {isLoading ? (
        <div className="spinner-container">
          <div className="loading_spinner"></div>
        </div>
      ) : isLogin ? (
        <button
          className= "LogginButton"
          onClick={loginWithGoogleClickHandler}
          disabled={isLoading}
        >
          Log out as {user.displayName}
        </button>
      ) : (
        <button
          className="LogginButton"
          onClick={loginWithGoogleClickHandler}
          disabled={isLoading}
        >
          <img src={GoogleLogo} alt="" />
          &nbsp; Log in with Google
        </button>
      )}
    </div>
  );
};

export default Login;
