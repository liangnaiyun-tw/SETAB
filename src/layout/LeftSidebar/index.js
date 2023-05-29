import React from "react";
import GroupModal from "../Component/GroupModal/GroupModal";
import Login from "../Component/Login/Login";
import "./index.css";
import { useSelector } from "react-redux";




const LeftSidebar = ({ cssLeftSidebar, styleLeftSidebar }) => {

    const { user } = useSelector((store) => store.auth)

    return (
        <div className={cssLeftSidebar} style={styleLeftSidebar}>
            LeftSidebar
            <GroupModal cssGroupModal={cssLeftSidebar} styleGroupModal={styleLeftSidebar} />
            <div className="loginBlock">
                {user === undefined || user === null ?
                    <>
                        <Login />
                    </> :
                    <>
                        <img className="userImage" src={user?.photoURL} alt="" />
                        <span className="userDisplayName">&nbsp; {user?.displayName}</span>
                    </>
                }
            </div>
        </div>
    );
};


export default LeftSidebar;