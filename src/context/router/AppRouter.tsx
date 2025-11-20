import { Suspense } from 'react'
import { Route, Routes } from 'react-router-dom'
import { routeConfig, type AppRouteConfig } from '@/shared/config/routeConfig/routeConfig'

const renderRoutes = (route: AppRouteConfig, routeIndex: number) => {
  const { path, element, children } = route

  if (children && children.length > 0) {
    return (
      <Route
        key={path || routeIndex}
        path={path}
        element={(
          <Suspense fallback={<div>Loading...</div>}>
            {element}
          </Suspense>
        )}
      >
        {children.map((child, idx) => renderRoutes(child, idx))}
      </Route>
    )
  }

  return (
    <Route
      key={path || routeIndex}
      path={path}
      element={(
        <Suspense fallback={<div>Loading...</div>}>
          {element}
        </Suspense>
      )}
    />
  )
}

const AppRouter = () => {
  return (
    <Routes>
      {Object.values(routeConfig).map((route, index) => renderRoutes(route, index))}
    </Routes>
  )
}

export default AppRouter