import { Container, CssBaseline } from '@material-ui/core';
import React from 'react';
import './App.css';
import { ButtplugConnectedDeviceList } from "./components/buttplug/Buttplug";
import { MusicAnalyzerWorker } from './components/music/MusicAnalyzerWorker';
import { ButtplugContextProvider } from './contexts/ButtplugContext';
import Navbar from './layout/navbar';

import { createMuiTheme, ThemeProvider } from '@material-ui/core/styles';

const theme = createMuiTheme({
  palette: {
    type: 'dark',
    primary: {
      main: '#e65100',
    },
    secondary: {
      main: '#4dd0e1',
    },
  },
});

function App() {

  return (
    <ThemeProvider theme={theme}>
      <ButtplugContextProvider>
        <CssBaseline />
        <div className="App">
          <Navbar />
          <Container>
            <MusicAnalyzerWorker />
            <ButtplugConnectedDeviceList />
          </Container>
        </div>
      </ButtplugContextProvider >
    </ThemeProvider>
  );
}

export default App;
