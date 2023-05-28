import React from "react";
import InputBase from '@mui/material/InputBase';
import IconButton from '@mui/material/IconButton';
import SearchIcon from '@mui/icons-material/Search';
import Input from '@mui/material/Input';
import { alpha, styled } from '@mui/material/styles';

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