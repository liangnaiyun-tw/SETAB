import { Pie } from 'react-chartjs-2';
import { interpolateColorByIndex } from '../../utils/interpolateColor';
import { getGroupNameChain } from '../../utils/tabs';
import './GroupModal.css';
import { Box, IconButton, Modal, Typography } from "@mui/material";
import CircleIcon from '@mui/icons-material/Circle';
import DeleteIcon from '@mui/icons-material/Delete';
import { createRandomUUID } from '../../utils/hash';

function GroupModal(props) {
  const modalOpen = props.modalOpen;
  const selectedItem = props.selectedItem;
  let totalMemory = 0;
  const items = [];

  console.log(selectedItem);
  if (selectedItem) {
    selectedItem.tabs.forEach((tab) => {
      totalMemory += tab.privateMemory;
      let groupNameChain = getGroupNameChain(tab.group);
      if (groupNameChain.length === selectedItem.chartLevel) {
        // Insert tab
        items.push({
          ...tab,
          totalMemory: tab.privateMemory
        });
      } else if (groupNameChain.length > selectedItem.chartLevel) {
        if (!items.find((item) => item.name === groupNameChain[selectedItem.chartLevel])) {
          // Insert group
          items.push({
            name: groupNameChain[selectedItem.chartLevel],
            tabs: [],
            totalMemory: 0,
            chartLevel: selectedItem.chartLevel + 1,
          });
        }
        items.find((item) => item.name === groupNameChain[selectedItem.chartLevel]).totalMemory += tab.privateMemory;
        items.find((item) => item.name === groupNameChain[selectedItem.chartLevel]).tabs.push(tab);
      }
    });
  }
  items.sort((a, b) => a.totalMemory - b.totalMemory);

  const backgroundColors = [];
  const borderColors = [];
  items.forEach((item, index) => {
    backgroundColors.push("rgba(" + interpolateColorByIndex(index, items.length).join(", ") + ", 1)");
    borderColors.push("rgb(255, 255, 255)");
  });

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

  let renderItem;
  if (selectedItem?.tabs) {
    renderItem =
      <>
        <div className='modal-title'>
          <Pie id="modal-pie-chart"
            data={chartData}
            options={{
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
            <Typography variant='h6'>
              {getGroupNameChain(selectedItem.tabs[0].group).slice(0, selectedItem.chartLevel).join("/")}
            </Typography>
            <Typography variant='subtitle1'>
              Memory Usage: {`${Math.round(selectedItem.totalMemory / 1024)} KB`}
            </Typography>
          </div>
        </div>

        <div className='modal-item-list'>
          <Typography variant='h5'>Groups</Typography>
          <ul>
            {items.filter((item) => item.name).slice().reverse().map((group, index) => {
              return (
                <li className='modal-group-item' key={`${group.name}-${createRandomUUID()}`}>
                  <div className='modal-list-content'>
                    <CircleIcon sx={{ color: "rgba(" + interpolateColorByIndex(items.length - 1 - index, items.length).join(", ") + ", 1)" }}></CircleIcon>
                    <Typography variant='h6'>{group.name}</Typography>
                    <div>Memory Usage: {(group.totalMemory / totalMemory * 100).toFixed(1)}%</div>
                  </div>

                  <div className='modal-delete-button-container'>
                    <IconButton>
                      <DeleteIcon></DeleteIcon>
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
          <Typography variant='h5'>Tabs</Typography>
          <ul>
            {items.filter((item) => !item.name).slice().reverse().map((tab, index) => {
              return (
                <li className='modal-tab-item' key={`${tab.title}-${tab.windowId}-${tab.tabId}`}>
                  <div className='modal-list-content'>
                    <CircleIcon sx={{ color: "rgba(" + interpolateColorByIndex(items.length - 1 - index, items.length).join(", ") + ", 1)" }}></CircleIcon>
                    <Typography variant='h6'>{tab.alias}</Typography>
                    <div>Memory Usage: {(tab.totalMemory / totalMemory * 100).toFixed(1)}%</div>
                  </div>

                  <div className='modal-delete-button-container'>
                    <IconButton>
                      <DeleteIcon></DeleteIcon>
                    </IconButton>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
      </>
  } else if (selectedItem) {
    renderItem =
      <>
        <div className="modal-title">
          {selectedItem.tabIconUrl
            ? <img src={selectedItem.tabIconUrl} alt="tab icon"></img>
            : <></>}
          <Typography variant="h6">
            {selectedItem.title}
          </Typography>
        </div>

        <div className="modal-text">
          <ul>
            <li>
              <Typography variant='subtitle1'>
                URL: {selectedItem.tabUrl}
              </Typography>
            </li>
            <li>
              <Typography variant="subtitle1">
                Memory Usage: {`${Math.round(selectedItem.privateMemory / 1024)} KB`}
              </Typography>
            </li>
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