import { Box, TextField, ClickAwayListener } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState } from "react";

const Container = styled(Box)`
  display: flex;
  flex-direction: column;
  width: 600px;
  box-shadow:
    0 1px 2px 0 rgb(60 64 67/30%),
    0 2px 6px 2px rgb(60 64 67/ 15%);
  padding: 10px 15px;
  brorder-radius: 8px;
  border-color: #e0e0e0;
  margin: auto;
`;
const Form = () => {
  const [showTextField, setShowTextField] = useState(false); // showTextField

  const onTextAreaClick = () => {
    setShowTextField(true);
  };

  return (
    <ClickAwayListener onClickAway={() => {handleClickAway}}>
    <Container>
      {showTextField && (
        <TextField
          placeholder="Title"
          variant="standard"
          slotProps={{
            input: {
              disableUnderline: true,
            },
          }}
          style={{ marginBottom: 10 }}
        />
      )}
      <TextField
        placeholder="Take a note..."
        variant="standard"
        multiline
        maxRows={Infinity}
        slotProps={{
          input: {
            disableUnderline: true,
          },
        }}
        onClick={onTextAreaClick}
      />
    </Container>
    </ClickAwayListener>
  );
};

export default Form;
