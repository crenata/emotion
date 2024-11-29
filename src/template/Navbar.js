import React, {PureComponent} from "react";
import {Link} from "react-router-dom";
import Identicon from "identicon.js";
import Config from "../configs/Config";
import Web3Context from "../contexts/Web3Context";
import logo from "../images/logo.png";
import IsEmpty from "../helpers/IsEmpty";
import TextNeon from "../helpers/texts/TextNeon";
import TextGlow from "../helpers/texts/TextGlow";
import "./Navbar.css";

class Navbar extends PureComponent {
    render() {
        return (
            <Web3Context.Consumer>
                {(web3Context) => (
                    <nav className="navbar navbar-light navbar-expand-lg z-4">
                        <div className="container h-100">
                            <Link to={Config.Links.Home} className="navbar-brand text-white d-flex align-items-center">
                                <img
                                    src={logo}
                                    alt="Brand"
                                    width="36"
                                    height="36"
                                />&nbsp;&nbsp;
                                <TextNeon className="m-0 fw-bold fs-4" size={5}>Maelyn</TextNeon>
                            </Link>
                            <button
                                className="navbar-toggler"
                                data-bs-toggle="collapse"
                                data-bs-target="#navbar-maelyn"
                                aria-controls="navbar-maelyn"
                                aria-expanded="false"
                                aria-label="Toggle navigation"
                            >
                                <span className="navbar-toggler-icon" />
                            </button>
                            <div className="collapse navbar-collapse p-3 p-md-0" id="navbar-maelyn">
                                <ul className="navbar-nav">
                                    <li className="nav-item">
                                        <a className="nav-link text-white" href="#">Tokenomics</a>
                                    </li>
                                    <li className="nav-item">
                                        <a className="nav-link text-white" href="#">Roadmap</a>
                                    </li>
                                </ul>
                                <div className="ms-auto mt-1 mt-md-0">
                                    {IsEmpty(web3Context.account) ?
                                        <button className="btn text-white bgc-FFA500 btn-bubble" onClick={web3Context.loadWeb3}>Connect Wallet</button> :
                                        <div className="account d-flex align-items-center">
                                            <TextGlow className="m-0 small" size={1}>{web3Context.account}</TextGlow>
                                            <img
                                                src={`data:image/png;base64, ${new Identicon(web3Context.account, 24).toString()}`}
                                                alt="Account"
                                                width="24"
                                                height="24"
                                                className="rounded-circle ms-2 logo"
                                            />
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </nav>
                )}
            </Web3Context.Consumer>
        );
    }
}

export default Navbar;