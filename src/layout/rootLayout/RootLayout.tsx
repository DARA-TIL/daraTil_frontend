import NavBar from "@/widgets/navBar/NavBar"
import { Outlet } from "react-router-dom"

const RootLayout = () => {
  return (
    <div>
      <NavBar />
      <main>
        <Outlet />
      </main>
    </div>
  )
}

export default RootLayout