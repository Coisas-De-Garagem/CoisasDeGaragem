import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'dayjs/locale/pt-br'
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider'
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs'
import './styles/global.css'
import App from './App.tsx'
import { AppMuiThemeProvider } from './theme/MuiTheme'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppMuiThemeProvider>
      <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="pt-br">
        <App />
      </LocalizationProvider>
    </AppMuiThemeProvider>
  </StrictMode>,
)
