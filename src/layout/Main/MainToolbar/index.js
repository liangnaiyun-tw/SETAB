import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import MainTab from '../MainTab';

export default function MainToolbar() {
    return (
        <>
            <Box sx={{ flexGrow: 1 }}>
                <AppBar position="static" color='transparent'>
                    <Toolbar>
                        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                            Group1
                        </Typography>
                    </Toolbar>

                </AppBar>
            </Box>
            <Box sx={{ flexGrow: 1 }}>
                <MainTab />
            </Box>
        </>
    );
}