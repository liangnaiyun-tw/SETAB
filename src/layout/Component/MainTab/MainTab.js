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
import styled, { backgroundColor, height } from "@xstyled/styled-components";
import { useSelector } from 'react-redux';
import ReactDND from '../ReactDND/ReactDND';
import { DndProvider } from 'react-dnd';
import { HTML5Backend } from 'react-dnd-html5-backend';


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
    const [workspaceName, setWorkspaceName] = React.useState("")

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    const Container = styled.div`

    `;


    const data = {
        medium: generateQuoteMap(100),
        large: generateQuoteMap(500)
    };

    const SwitchStructure = () => {
        if (currentGroup.length > 0) {
            return (
                <Structure />
            )
        } else if (currentWorkspace.length > 0) {
            return (
                <Container>
                    <Board initial={data.medium} withScrollableColumns />
                </Container>
            )
        }
    }

    useEffect(() => {
        const workspace = workspaces.filter(workspace => workspace.id === currentWorkspace)[0];
        if (workspace && workspace.name === "Unsaved") {
            setValue(0);
        }
        if (workspace) {
            setWorkspaceName(workspace.name)
        }
    }, [currentWorkspace, workspaces])

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
                <Tabs value={value} onChange={handleChange} aria-label="basic tabs example" indicatorColor='#282828' >
                    <Tab label="ReactDND" style={{ color: 'whitesmoke', backgroundColor: `${value === 0 ? "#282828" : "#202020"}` }} {...a11yProps(0)} />
                    {
                        workspaceName !== "Unsaved" &&
                        <Tab label="Structure" style={{ color: 'whitesmoke', backgroundColor: `${value === 1 ? "#282828" : "#202020"}` }} {...a11yProps(1)} />

                    }
                    {
                        workspaceName !== "Unsaved" &&
                        <Tab label="Note" style={{ color: 'whitesmoke', backgroundColor: `${value === 2 ? "#282828" : "#202020"}` }} {...a11yProps(2)} />
                    }


                </Tabs>
            </Box>
            <TabPanel value={value} index={0} style={{ backgroundColor: `${value === 0 ? "#282828" : "#202020"}`, height: '87vh' }}>
                <DndProvider backend={HTML5Backend}>
                    <div id='trello'>
                        <ReactDND />
                    </div>
                </DndProvider>
            </TabPanel>
            {
                workspaceName !== "Unsaved" &&

                <TabPanel value={value} index={1} style={{ backgroundColor: `${value === 1 ? "#282828" : "#202020"}`, height: '87vh' }}>
                    <SwitchStructure />
                </TabPanel>
            }
            {
                workspaceName !== "Unsaved" &&

                <TabPanel value={value} index={2} style={{ backgroundColor: `${value === 2 ? "#282828" : "#202020"}`, height: '87vh' }}>
                    <Note token={token} />
                </TabPanel>

            }

        </Box>

    );
}