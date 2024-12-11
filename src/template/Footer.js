import React, {PureComponent} from "react";
import Web3Context from "../contexts/Web3Context";
import logo from "../images/logo.png";
import metamask from "../images/metamask.png";
import toast from "react-hot-toast";
import "./Navbar.css";
import IsEmpty from "../helpers/IsEmpty";

class Footer extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            isLoadingAddToken: false
        };
    }

    addToken() {
        if (!IsEmpty(window.ethereum)) {
            this.setState({
                isLoadingAddToken: true
            }, () => {
                window.ethereum.request({
                    method: "wallet_watchAsset",
                    params: {
                        type: "ERC20",
                        options: {
                            address: this.context.token?.address,
                            symbol: this.context.symbol,
                            decimals: this.context.decimals,
                            image: `${window.location.origin}/logo512.png`,
                        }
                    }
                }).then((value) => {
                    toast.success("Added.");
                }).catch((error) => {
                    toast.error("Failed add token to wallet.");
                }).finally(() => {
                    this.setState({
                        isLoadingAddToken: false
                    });
                });
            });
        } else {
            toast.error("Non-EVM browser detected. You should consider tyring Metamask!");
        }
    }

    render() {
        return (
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
                        {this.state.isLoadingAddToken ?
                            <button className="box-shadow-primary border rounded bg-transparent text-white x-small text-nowrap px-2 py-1 mt-3" disabled>
                                <span className="spinner-border spinner-border-xs" aria-hidden="true" />
                                <span role="status" className="ms-2">Loading...</span>
                            </button> :
                            <button
                                className="box-shadow-primary border rounded bg-transparent text-white x-small text-nowrap px-2 py-1 mt-3"
                                onClick={event => this.addToken()}
                            >
                                <img
                                    src={metamask}
                                    alt="Metamask"
                                    width="16"
                                    height="16"
                                    className="me-2"
                                />
                                Add ${this.context.symbol} Token
                            </button>
                        }
                        <p className="mt-5 mb-0 text-white small">{new Date().getFullYear()} &copy; All Rights Reserved</p>
                    </div>
                </div>
            </footer>
        );
    }
}

Footer.contextType = Web3Context;

export default Footer;