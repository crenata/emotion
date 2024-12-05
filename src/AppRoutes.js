import React, {PureComponent} from "react";
import {BrowserRouter, Routes, Route} from "react-router-dom";
import Config from "./configs/Config";
import RouteElement from "./helpers/RouteElement";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
import Admin from "./pages/Admin";

class AppRoutes extends PureComponent {
    render() {
        return (
            <BrowserRouter>
                <Routes>
                    <Route path={Config.Routers.Home} element={<RouteElement component={Home} />} />
                    <Route path={Config.Routers.Admin} element={<RouteElement component={Admin} />} />
                    <Route path={Config.Routers.NotFound} element={<RouteElement component={NotFound} />} />
                </Routes>
            </BrowserRouter>
        );
    }
}

export default AppRoutes;