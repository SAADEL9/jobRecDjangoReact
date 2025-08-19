import React, { useState, useEffect } from 'react';
import { Box, TextField, InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

const SearchBar = ({ onSearch }) => {
  const [searchTerm, setSearchTerm] = useState('');

  // Debounce the search to avoid too many updates
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      onSearch(searchTerm);
    }, 300);
    return () => clearTimeout(timeoutId);
  }, [searchTerm, onSearch]);

  const handleChange = (event) => {
    setSearchTerm(event.target.value);
  };

  return (
    <Box sx={{ width: '100%', maxWidth: 600, mx: 'auto', mb: 3 }}>
      <TextField
        fullWidth
        variant="outlined"
        placeholder="Search by title, location, company..."
        value={searchTerm}
        onChange={handleChange}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon color="action" />
            </InputAdornment>
          ),
        }}
        sx={{
          '& .MuiOutlinedInput-root': {
            backgroundColor: 'white',
            borderRadius: 2,
            '&:hover': {
              '& > fieldset': {
                borderColor: 'primary.main',
              },
            },
          },
        }}
      />
    </Box>
  );
};

export default SearchBar;
