import { Link } from 'react-router';
import './leftMenu.css'

const LeftMenu = () => {
  return (
    <div className="leftMenu">
      <Link to="/login">Dashboard</Link>;

    </div>
  );
}

export default LeftMenu