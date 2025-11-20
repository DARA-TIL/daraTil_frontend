import Login from "@/pages/auth/Login"
import Register from "@/pages/auth/Register"
import Map from "@/pages/map/Map"
import NotFound from "@/pages/notFound/NotFound"
import RootLayout from "@/layout/rootLayout/RootLayout"
import Home from "@/pages/home/Home"

export const AppRoutes = {
  HOME: 'home',
  LOGIN: 'login',
  REGISTER: 'register',
  MAP: 'map',
  NOT_FOUND: 'not_found'
} as const

export const RoutePath: Record<typeof AppRoutes[keyof typeof AppRoutes], string> = {
  [AppRoutes.HOME]: '/',
  [AppRoutes.LOGIN]: '/login',
  [AppRoutes.REGISTER]: '/register',
  [AppRoutes.MAP]: '/map',
  [AppRoutes.NOT_FOUND]: '*'
}

export interface AppRouteConfig {
  path?: string
  index?: boolean
  element?: React.ReactNode
  children?: AppRouteConfig[]
}

export const routeConfig: AppRouteConfig[] = [
  {
    path: '/',
    element: <RootLayout />,
    children: [
      {
        path: '',
        element: <Home />
      },
      {
        path: 'login',
        element: <Login />
      },
      {
        path: 'register',
        element: <Register />
      },
      {
        path: 'map',
        element: <Map />,
      }
    ]
  },
  {
    path: '*',
    element: <NotFound />
  }
]