import React from "react";
import "./NoteCard.css"

const NoteCard = ({ icon, name, preview, lastAccess, embedLink, onClick }) => {


    return (
        <div className="NoteCard" onClick={() => {onClick(embedLink)}}>
            <span className="Title">
                <img src={icon} alt="" />
                <span className="Name">&nbsp; {name}</span>
            </span>
            <p className="LastAccess">Last Modified: {lastAccess?.split("T")[0]}</p>
            <img className="Preview" src={preview} alt="" />
        </div>
    );
};

export default NoteCard;