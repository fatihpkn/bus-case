import { Outlet, createRootRouteWithContext, useRouterState } from '@tanstack/react-router'
import { TanStackDevtools } from '@tanstack/react-devtools'

import TanStackQueryDevtools from '@/integrations/tanstack-query/devtools'
import TanStackRouterDevtools from '@/integrations/tanstack-router/devtools'

import type { QueryClient } from '@tanstack/react-query'
import { Header } from '@/components/layout/public/header'

interface MyRouterContext {
  queryClient: QueryClient
}

function RootComponent() {
  const isPrintRoute = useRouterState({
    select: (state) => state.location.pathname.startsWith('/payment/print'),
  })

  // Print sayfaları için boş bir layout kullan
  if (isPrintRoute) {
    return <Outlet />
  }

  return (
    <div className="min-h-screen max-w-7xl mx-auto px-2">
      <Header />
      <div className="mt-5">
        <Outlet />
      </div>
      <TanStackDevtools
        config={{
          position: 'bottom-right',
        }}
        plugins={[TanStackRouterDevtools, TanStackQueryDevtools]}
      />
    </div>
  )
}

export const Route = createRootRouteWithContext<MyRouterContext>()({
  component: RootComponent,
})
