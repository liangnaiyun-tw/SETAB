import React, { useRef } from "react";
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Input from '@mui/material/Input';

export default function SearchBar({ handleSearch }) {
    const searchStr = useRef()
    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <Input placeholder="Search" style={{ color: 'white' }} inputRef={searchStr} />
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search" style={{ color: 'white' }} onClick={() => handleSearch(searchStr.current.value)} >
                    <SearchIcon />
                </IconButton>
            </div >
        </>
    );
}