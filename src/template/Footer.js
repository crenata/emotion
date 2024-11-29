import React, {PureComponent} from "react";
import Web3Context from "../contexts/Web3Context";
import logo from "../images/logo.png";
import "./Navbar.css";

class Footer extends PureComponent {
    render() {
        return (
            <Web3Context.Consumer>
                {(web3Context) => (
                    <footer className="z-3">
                        <div className="row">
                            <div className="col-12 col-md-3">
                                <img
                                    src={logo}
                                    alt="Brand"
                                    className="w-100"
                                />
                            </div>
                        </div>
                    </footer>
                )}
            </Web3Context.Consumer>
        );
    }
}

export default Footer;