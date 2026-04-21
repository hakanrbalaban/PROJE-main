import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";

//components
import Form from "./Form";
const DrawerHeader = styled('div')(({ theme }) => ({
 
  // necessary for content to be below app bar
  ...theme.mixins.toolbar,
}));

const Notes = () => {
  return (
    <div className="">
      <Box sx={{ display: "flex" }}>
        <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
            <DrawerHeader />
            <Form />
        </Box>
      </Box>
    </div>
  );
};

export default Notes;
