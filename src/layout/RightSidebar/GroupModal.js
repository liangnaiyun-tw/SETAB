import { Pie } from 'react-chartjs-2';
import { interpolateColorByIndex } from '../../utils/interpolateColor';
import { getGroupIdChain, getGroupNameChain } from '../../utils/tabs';
import './GroupModal.css';
import { Box, IconButton, Modal, Typography } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import EnergySavingsLeafOutlinedIcon from '@mui/icons-material/EnergySavingsLeafOutlined';
import PauseOutlinedIcon from '@mui/icons-material/PauseOutlined';
import Breadcrumb from '@mui/material/Breadcrumbs';
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { v4 as uuidv4 } from 'uuid';
import { deleteTab, freezeTab } from '../../features/chromeTabs/chromeTabSlice';

/*global chrome*/


function GroupModal(props) {
  const dispatch = useDispatch();
  const fetchTabs = useSelector(state => state.chromeTabs).fetchTabs;
  const firestore = useSelector(state => state.firestore);

  const modalOpen = props.modalOpen;
  const selectedItem = props.selectedItem;
  const [items, setItems] = useState([]);
  const [tabsInGroup, setTabsInGroup] = useState([]);

  useEffect(() => {
    const newItems = [];
    const newTabs = [];
    if (firestore.workspaces.find(workspace => workspace.id === selectedItem)
      || firestore.groups.find(group => group.id === selectedItem)) {

      fetchTabs.forEach((tab) => {
        let groupIdChain = getGroupIdChain(tab.group);
        let groupNameChain = getGroupNameChain(tab.group);
        if (groupIdChain.length >= props.chartLevel && groupIdChain[props.chartLevel - 1] === selectedItem) {
          if (groupIdChain.length === props.chartLevel) {
            newItems.push({
              ...tab,
              totalMemory: tab.privateMemory
            });
          } else {
            if (!newItems.find((item) => item.name === groupNameChain[props.chartLevel])) {
              newItems.push({
                id: groupIdChain[props.chartLevel],
                name: groupNameChain[props.chartLevel],
                tabs: [],
                totalMemory: 0
              });
            }
            newItems.find((item) => item.id === groupIdChain[props.chartLevel]).totalMemory += tab.privateMemory;
            newItems.find((item) => item.id === groupIdChain[props.chartLevel]).tabs.push(tab);
          }
          newTabs.push(tab);
        }
      });
    }
    newItems.sort((a, b) => a.totalMemory - b.totalMemory);
    newTabs.sort((a, b) => a.privateMemory - b.privateMemory);

    const backgroundColors = newItems.map((item, index) => {
      return "rgba(" + interpolateColorByIndex(index, newItems.length).join(", ") + ", 1)";
    });
    const borderColors = newItems.map(() => {
      return "rgb(255, 255, 255)";
    });

    setTabsInGroup(newTabs);
    setItems(newItems);
    setBackgroundColors(backgroundColors);
    setBorderColors(borderColors);
  }, [fetchTabs, firestore, selectedItem, props.chartLevel]);


  const totalMemory = items.reduce((sum, item) => sum + item.totalMemory, 0);
  const [backgroundColors, setBackgroundColors] = useState([]);
  const [borderColors, setBorderColors] = useState([]);
  let groupNameChain = [];
  if (tabsInGroup.length > 0) {
    groupNameChain = getGroupNameChain(tabsInGroup[0].group);
  }

  const chartData = {
    datasets: [
      {
        data: items.map((item) => item.totalMemory / totalMemory),
        borderWidth: 2,
        backgroundColor: backgroundColors,
        borderColor: borderColors,
      }
    ]
  };

  function switchToTab(windowId, windowIndex) {
    console.log(windowId, windowIndex);
    chrome.windows.update(
      windowId,
      {
        focused: true
      }
    ).catch((err) => {
      console.error(err);
    });
    chrome.tabs.highlight({ windowId: windowId, tabs: windowIndex })
      .catch((err) => {
        console.error(err);
      });
  }

  function selectItem(itemId) {
    let newHistory = [...props.selectedItemHistory];
    let newChartLevel = props.chartLevel + 1;
    if (props.selectedItemHistory.length < newChartLevel) {
      newHistory.push(itemId);
    } else {
      newHistory[newChartLevel - 1] = itemId;
    }
    props.setSelectedItem(itemId);
    props.setSelectedItemHistory(newHistory);
    props.setChartLevel(newChartLevel)
  }

  async function clickFreezeTab(event, windowId, windowIndex) {
    let tabs = await chrome.tabs.query({
      windowId: windowId,
      index: windowIndex
    }).catch((err) => {
      console.error(err);
    });

    if (tabs.length > 0) {
      await chrome.tabs.discard(tabs[0].id)
        .then((tab) => {
          dispatch(freezeTab({
            tabId: tab.id
          }))
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  async function clickCloseTab(event, windowId, windowIndex) {
    let tabs = await chrome.tabs.query({
      windowId: windowId,
      index: windowIndex
    }).catch((err) => {
      console.error(err);
    });

    console.log(tabs);
    if (tabs.length > 0) {
      await chrome.tabs.remove(tabs[0].id)
        .then(() => {
          dispatch(deleteTab({
            windowId: windowId,
            windowIndex: windowIndex
          }));
        })
        .catch((err) => {
          console.error(err);
        });
    }
  }

  function modalClickEvent(event, elements) {
    if (elements.length > 0) {
      const item = items[elements[0].index];
      if (fetchTabs.find(tab => tab.id === item.id)) {
        let tab = fetchTabs.find(tab => tab.id === item.id);
        switchToTab(tab.windowId, tab.windowIndex);
      } else {
        selectItem(item.id);
      }
    }
  }

  let renderItem = <></>;
  if (selectedItem &&
    (firestore.workspaces.find(workspace => workspace.id === selectedItem)
      || firestore.groups.find(group => group.id === selectedItem))) {
    renderItem =
      <>
        <div className='modal-title'>
          <Pie id="modal-pie-chart"
            data={chartData}
            options={{
              onClick: modalClickEvent,
              plugins: {
                tooltip: {
                  callbacks: {
                    label: (context) => {
                      const dataIndex = context.dataIndex;
                      const item = items[dataIndex];
                      const label = item.name ? item.name : item.alias ? item.alias : item.title;
                      const value = (context.formattedValue * 100).toFixed(1);

                      const maxLabelLength = 15;
                      if (label.length > maxLabelLength) {
                        const words = label.split("");
                        let line = "";
                        const wrappedLabel = words.reduce((result, letter) => {
                          if (line.length + 1 <= maxLabelLength) {
                            line += letter;
                          } else {
                            result.push(line);
                            line = letter;
                          }
                          return result;
                        }, []);
                        wrappedLabel.push(line + `: ${value}%`);
                        return wrappedLabel;
                      }
                      return `${label}: ${value}%`;
                    }
                  }
                }
              }
            }}
          />

          <div className='modal-title-text'>
            <Breadcrumb aria-label="breadcrumb" variant="h6" separator="/">
              {groupNameChain.map((name) => {
                return (
                  <Typography variant='h6' key={`${name}-${uuidv4()}`}>
                    {name}
                  </Typography>
                );
              })}
            </Breadcrumb>
            <Typography variant='subtitle1'>
              Memory Usage: {`${Math.round(totalMemory / 1024)} KB`}
            </Typography>
          </div>
        </div>

        <div className='modal-item-list'>
          <Typography variant='h5'>Groups</Typography>
          <ul>
            {items.filter((item) => item.name).slice().reverse().map((group, index) => {
              return (
                <li className='modal-group-item' key={`${group.name}-${uuidv4()}`}>
                  <div className='modal-list-content' onClick={(e) => { selectItem(group.id) }}>
                    <CircleIcon sx={{ color: "rgba(" + interpolateColorByIndex(items.length - 1 - index, items.length).join(", ") + ", 1)" }}></CircleIcon>
                    <div className='modal-list-content-text'>
                      <Typography variant='h6' noWrap={true}>{group.name}</Typography>
                      <Typography variant='body2' noWrap={true}>Memory Usage: {(group.totalMemory / totalMemory * 100).toFixed(1)}% ({Math.floor(group.totalMemory / 1024)} KB)</Typography>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
          <Typography variant='h5'>Tabs</Typography>
          <ul>
            {tabsInGroup.slice().reverse().map((tab, index) => {
              let tabClass = tab.status === "complete" ? 'modal-list-content' : 'modal-list-content-unload';
              let tabStatusIcon = tab.status === "complete"
                ? <CircleIcon sx={{ color: "rgba(" + interpolateColorByIndex(tabsInGroup.length - 1 - index, tabsInGroup.length).join(", ") + ", 1)" }}></CircleIcon>
                : <EnergySavingsLeafOutlinedIcon sx={{ color: "#53af2e" }}></EnergySavingsLeafOutlinedIcon>
              return (
                <li className='modal-tab-item' key={`${tab.title}-${tab.windowId}-${tab.tabId}`}>
                  <div className={tabClass} onClick={(e) => { switchToTab(tab.windowId, tab.windowIndex) }}>
                    {tabStatusIcon}
                    <div className='modal-list-content-text'>
                      <Typography variant='h6' noWrap={true}>{tab.alias}</Typography>
                      <Typography variant="subtitle2" noWrap={true}>
                        {getGroupNameChain(tab.group).join("/")}
                      </Typography>
                      <Typography variant='body2'>Memory Usage: {(tab.privateMemory / totalMemory * 100).toFixed(1)}% ({Math.floor(tab.privateMemory / 1024)} KB)</Typography>
                    </div>
                  </div>

                  <div className='modal-freeze-button-container'>
                    <IconButton onClick={(event) => clickFreezeTab(event, tab.windowId, tab.windowIndex)}>
                      <PauseOutlinedIcon></PauseOutlinedIcon>
                    </IconButton>
                  </div>

                  <div className='modal-delete-button-container'>
                    <IconButton onClick={(event) => clickCloseTab(event, tab.windowId, tab.windowIndex)}>
                      <DeleteIcon></DeleteIcon>
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </>
  }

  return (
    <Modal
      open={modalOpen}
      onClose={() => {
        props.setModalOpen(false);
        props.setSelectedItem(null);
      }}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        id='modal-box'
        sx={{
          position: 'absolute',
          width: '80%',
          height: '80%',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          bgcolor: 'beige',
          boxShadow: 24,
          p: 4
        }}>
        {selectedItem && (
          <div className="tab-modal-content">
            {renderItem}
          </div>
        )}
      </Box>

    </Modal>
  );
}


export { GroupModal };