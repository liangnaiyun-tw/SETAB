import { Pie } from 'react-chartjs-2';
import { interpolateColorByIndex } from '../../utils/interpolateColor';
import { getGroupNameChain } from '../../utils/tabs';
import './GroupModal.css';
import { Box, Modal, Typography } from "@mui/material";

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
          <ul>
            <li className='modal-item'></li>
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
      onClose={() => props.setModalOpen(false)}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box sx={{
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