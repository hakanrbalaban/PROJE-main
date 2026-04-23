import { Box, TextField, ClickAwayListener } from "@mui/material";
import { styled } from "@mui/material/styles";
import { useState, useRef, useContext } from "react";
import { DataContext } from "../../context/DataProvider";
import { v4 as uuid } from "uuid";

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
  min-height: 30px;
`;

const note = {
  id: uuid(),
  heading: "",
  text: "",
};

const Form = () => {
  const [showTextField, setShowTextField] = useState(false); // showTextField
  const [addNote, setAddNote] = useState(note);
  const [notes, setNotes] = useContext(DataContext);
  const containerRef = useRef(null);

  const onTextAreaClick = () => {
    setShowTextField(true);
    containerRef.current.style.minHeight = "70px";
  };

  const handleClickAway = () => {
    setShowTextField(false);
    containerRef.current.style.minHeight = "30px";
  };

  return (
    <ClickAwayListener onClickAway={handleClickAway}>
    <Container ref={containerRef}>
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
