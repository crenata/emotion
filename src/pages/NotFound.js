import React, {PureComponent} from "react";
import Template from "../template/Template";

class NotFound extends PureComponent {
    render() {
        return (
            <Template>
                <div className="app-content d-flex align-items-center justify-content-center">
                    <h3 className="m-0 text-white">Whoops, page not found!</h3>
                </div>
            </Template>
        );
    }
}

export default NotFound;