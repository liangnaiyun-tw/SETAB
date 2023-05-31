import * as React from 'react';
import { useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import "./MainTab.css";
import Note from '../Note/Note';
import Structure from '../Structure/Structure'
import Board from '../../Main/dnd/board/Board'
import { generateQuoteMap } from "../../Main/dnd/mockData"
import styled from "@xstyled/styled-components";
import { useSelector } from 'react-redux';


function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`simple-tabpanel-${index}`}
            aria-labelledby={`simple-tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    <Typography>{children}</Typography>
                </Box>
            )}
        </div>
    );
}

TabPanel.propTypes = {
    children: PropTypes.node,
    index: PropTypes.number.isRequired,
    value: PropTypes.number.isRequired,
};

function a11yProps(index) {
    return {
        id: `simple-tab-${index}`,
        'aria-controls': `simple-tabpanel-${index}`,
    };
}

export default function BasicTabs({ token }) {
    const [value, setValue] = React.useState(0);
    const { workspaces, groups, currentWorkspace, currentGroup } = useSelector((store) => store.firestore);


    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const Container = styled.div`

    `;


    const data = {
        medium: generateQuoteMap(100),
        large: generateQuoteMap(500)
    };

    useEffect(() => {
        if(workspaces.filter(workspace => workspace.id === currentWorkspace)[0].name === "Unsaved"){
            setValue(0);
        }
    }, [currentWorkspace])

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example">
                    <Tab label="Info" {...a11yProps(0)} />
                    {
                        workspaces.filter(workspace => workspace.id === currentWorkspace)[0].name !== "Unsaved" &&
                        <Tab label="Structure" {...a11yProps(1)} />

                    }
                    {
                        workspaces.filter(workspace => workspace.id === currentWorkspace)[0].name !== "Unsaved" &&
                        <Tab label="Note" {...a11yProps(2)} />
                    }


                </Tabs>
            </Box>
            <TabPanel value={value} index={0}>
                <Container>
                    <Board initial={data.medium} withScrollableColumns />
                </Container>
            </TabPanel>
            {
                workspaces.filter(workspace => workspace.id === currentWorkspace)[0].name !== "Unsaved" &&

                <TabPanel value={value} index={1}>
                    <Structure />
                </TabPanel>
            }
            {
                workspaces.filter(workspace => workspace.id === currentWorkspace)[0].name !== "Unsaved" &&

                <TabPanel value={value} index={2}>
                    <Note token={token} />
                </TabPanel>

            }

        </Box>

    );
}