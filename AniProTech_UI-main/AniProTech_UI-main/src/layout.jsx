import { Outlet } from "react-router-dom";
import Navbar from "./components/Common/Navbar";

const Layout = () => {
    return (
        <div className="min-h-screen">
            <Navbar />
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
