import SwiperDrawer from "./SwiperDrawer";
import Notes from "./notes/Notes";
import Box from "@mui/material/Box";

const Home = () => {
  return (
    <Box style={{ display: "flex", width: "100%" }}>
      <SwiperDrawer />
      <Notes/>
    </Box>
  );
};

export default Home;
