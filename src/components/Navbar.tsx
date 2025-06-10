import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@mui/material';

const Navbar: React.FC = () => {
  return (
    <div>
      <Button
        color="inherit"
        component={Link}
        to="/contact"
        sx={{ mx: 1 }}
      >
        Contact
      </Button>
    </div>
  );
};

export default Navbar; 