import './GroupModal.css';
import { Box, Modal, Typography } from "@mui/material";

function GroupModal(props) {
  const modalOpen = props.modalOpen;
  const selectedItem = props.selectedItem;

  let renderItem;
  if (selectedItem?.tabs) {

  } else if (selectedItem?.groups) {

  } else if (selectedItem) {
    renderItem =
      <>
        <div className="tab-modal-title">
          {selectedItem.tabIconURL
            ? <img src={selectedItem.tabIconURL} alt="tab icon"></img>
            : <></>}
          <Typography variant="h6">
            {selectedItem.title}
          </Typography>
        </div>

        <div className="tab-modal-text">
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