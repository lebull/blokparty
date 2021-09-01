import React from 'react';
import { Container, CssBaseline } from '@material-ui/core';
import './App.css';
import { MusicAnalyzerWorker } from './components/music/MusicAnalyzerWorker';
import Navbar from './layout/navbar';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#e65100',
    },
    secondary: {
      main: '#7e57c2',
    },
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
        <CssBaseline />
        <div className="App">
          <Navbar />
          <Container>
            <MusicAnalyzerWorker />
          </Container>
        </div>
    </ThemeProvider>
  );
}

export default App;
