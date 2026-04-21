import * as React from "react";
import { styled, useTheme } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import MuiAppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Typography from "@mui/material/Typography";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import MailIcon from "@mui/icons-material/Mail";
import HeaderBar from "./HeaderBar";
import { idID } from "@mui/material/locale";
import {
  LightbulbOutlined as Lightbulb,
  ArchiveOutlined as Archive,
  DeleteOutlineOutlined as Delete,
  ArchiveOutlined,
} from "@mui/icons-material";
const NavList = ({ open }) => {
  const navList = [
    { id: 1, name: "Notes", icon: <Lightbulb /> },
    { id: 2, name: "Archive", icon: <Archive /> },
    { id: 3, name: "Trash", icon: <Delete /> },
  ];
  return (
    <List>
      {navList.map((list) => (
        <ListItem button="true" key={list.id}>
          <ListItemIcon>{list.icon}</ListItemIcon>
          <ListItemText
            primary={list.name}
            sx={{
              opacity: open ? 1 : 0,
              width: open ? "auto" : 0,
              overflow: "hidden",
              transition: "0.3s",
            }}
          />
          <ListItemButton />
        </ListItem>
      ))}
    </List>
  );
};

export default NavList;
