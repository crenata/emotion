import React, {PureComponent} from "react";
import Web3Context from "../contexts/Web3Context";
import logo from "../images/logo.png";
import "./Navbar.css";

class Footer extends PureComponent {
    render() {
        return (
            <Web3Context.Consumer>
                {(web3Context) => (
                    <footer className="container py-5 border-top z-3">
                        <div className="row">
                            <div className="col-12 col-md-3">
                                <div className="d-flex align-items-center">
                                    <img
                                        src={logo}
                                        alt="Brand"
                                        width="64"
                                    />
                                    <p className="ms-3 mb-0 text-white">Maelyn</p>
                                </div>
                                <p className="mt-3 mb-0 text-white small">{new Date().getFullYear()} &copy; All Rights Reserved</p>
                            </div>
                        </div>
                    </footer>
                )}
            </Web3Context.Consumer>
        );
    }
}

export default Footer;