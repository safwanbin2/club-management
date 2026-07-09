import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { App as AntApp, ConfigProvider } from 'antd'
import type { PropsWithChildren } from 'react'
import { BrowserRouter } from 'react-router-dom'

import { antdTheme } from '@config/theme'

const queryClient = new QueryClient()

export default function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider theme={antdTheme}>
      <AntApp>
        <QueryClientProvider client={queryClient}>
          <BrowserRouter>{children}</BrowserRouter>
        </QueryClientProvider>
      </AntApp>
    </ConfigProvider>
  )
}
