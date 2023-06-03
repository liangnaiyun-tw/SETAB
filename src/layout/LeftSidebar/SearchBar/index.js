import React from "react";
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Input from '@mui/material/Input';

export default function SearchBar() {

    return (
        <>
            <div style={{ textAlign: 'center' }}>
                <Input placeholder="Search" style={{ color: 'white' }} />
                <IconButton type="button" sx={{ p: '10px' }} aria-label="search" style={{ color: 'white' }}>
                    <SearchIcon />
                </IconButton>
            </div>
        </>
    );
}