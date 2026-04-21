
import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import MuiDrawer from '@mui/material/Drawer';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import List from '@mui/material/List';
import CssBaseline from '@mui/material/CssBaseline';
import Typography from '@mui/material/Typography';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import { Image } from '@mui/icons-material';


const Header = styled(AppBar)`
z-index: 1201;
background-color: #fff;
height: 70px;
box-shadow: 0px 2px 4px rgba(0, 0, 0, 0.1);
`;
const Heading = styled(Typography)`
color: #5F6368;
font-size: 20px;
font-weight: 600;
margin-left: 20px;
`;

const HeaderBar = ({open, handleDrawer}) => {
  return (
    <Header open={open}>
      <Toolbar>
        <IconButton
          
          onClick={handleDrawer}
          edge="start"
        >
          <Menu />
        </IconButton>
        <img src="./logo.png" alt="" width={70} height={70} style={{width:70}}/>
        <Heading>
          Note Taking App
        </Heading>
      </Toolbar>
    </Header>
  );
};

export default HeaderBar;