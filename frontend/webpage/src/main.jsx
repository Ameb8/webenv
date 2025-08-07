import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css'
import App from './App.jsx'
import { AuthProvider} from "./context/AuthContext.jsx";
import {ColorProvider} from "./context/ColorContext.jsx";
import { FileProvider } from './context/FileContext';
import SaveShortcut from './util/SaveShortcut';
import { ProjectProvider } from './context/ProjectContext';

createRoot(document.getElementById('root')).render(
  <StrictMode>
      <ColorProvider>
          <AuthProvider>
              <FileProvider>
                  <ProjectProvider>
                      <SaveShortcut />
                      <App />
                  </ProjectProvider>
              </FileProvider>
          </AuthProvider>
      </ColorProvider>
  </StrictMode>,
)
