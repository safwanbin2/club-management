import 'antd/dist/reset.css'
import './resource/styles/global.css'

import React from 'react'
import ReactDOM from 'react-dom/client'

import AppProviders from '@common/context/app-providers'
import App from './App'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AppProviders>
      <App />
    </AppProviders>
  </React.StrictMode>
)
