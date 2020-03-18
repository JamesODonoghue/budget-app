import React from 'react';
import './UserInfo.css';
export const UserInfo = ({ photo = '', displayName = '' }) => {
    return (
        <div className="user-info">
            <div className="user-info_name">{displayName}</div>
            <img className="user-info_photo" src={photo}></img>
        </div>
    );
};