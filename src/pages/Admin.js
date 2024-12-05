import React, {PureComponent} from "react";
import Template from "../template/Template";
import Web3Context from "../contexts/Web3Context";
import ErrorCallContract from "../helpers/errors/ErrorCallContract";
import InputFormat from "../helpers/InputFormat";
import IsEmpty from "../helpers/IsEmpty";
import toast from "react-hot-toast";
import logo from "../images/logo.png";

class Admin extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            duration: "",
            amountToken: ""
        };
    }

    componentDidMount() {
        //
    }

    setValue(name, value, callback = null) {
        this.setState({
            [name]: value
        }, () => {
            if (callback && typeof callback === "function") callback();
        });
    }

    setMaxAmount() {
        this.setState({
            amountToken: this.context.stakingBalance
        });
    }

    end() {
        if (!IsEmpty(this.context.presale)) {
            this.context.presale.endSale({
                from: this.context.account
            }).then((value) => {
                this.context.getPrimaryBalance();
            }).catch((error) => {
                ErrorCallContract(error);
            }).finally(() => {});
        } else {
            toast.error("Failed fetch presale contract.");
        }
    }

    setDuration() {
        if (!IsEmpty(this.context.staking)) {
            this.context.staking.setRewardDuration(this.state.duration, {
                from: this.context.account
            }).then((value) => {
                toast.success("Successfully set duration.");
            }).catch((error) => {
                ErrorCallContract(error);
            }).finally(() => {});
        } else {
            toast.error("Failed fetch staking contract.");
        }
    }

    render() {
        return (
            <Template>
                <div className="container">
                    <div className="text-center mt-5">
                        <h5 className="m-0 text-white">Maelyn</h5>
                        <h2 className="mt-3 mb-0 text-white">Leave Earth! and to the MOON!!!</h2>
                    </div>
                    <div className="row mt-5">
                        <div className="col-12 col-md-6">
                            <div className="box-shadow-primary border rounded h-100 p-3">
                                <h5 className="m-0 text-white text-center">Presale</h5>
                                <div className="d-grid mt-3">
                                    {IsEmpty(this.context.account) ?
                                        <button
                                            className="btn text-white bgc-FFA500 btn-bubble"
                                            onClick={this.context.loadWeb3}
                                        >Connect Wallet</button> :
                                        <button
                                            className="btn btn-success"
                                            onClick={event => this.end()}
                                        >End Presale</button>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6 mt-5 mt-md-0">
                            <div className="box-shadow-primary border rounded h-100 p-3">
                                <h5 className="m-0 text-white text-center">Staking</h5>
                                <div className="row mt-3">
                                    <div className="col-12 col-md-6">
                                        <p className="m-0 text-white small">Duration (seconds)</p>
                                        <div className="input-group mt-1">
                                            <div className="input-group-text border-end-0 bgc-white-opacity-15">
                                                <svg
                                                    xmlns="http://www.w3.org/2000/svg"
                                                    width="24"
                                                    height="24"
                                                    fill="white"
                                                    className="bi bi-alarm"
                                                    viewBox="0 0 16 16"
                                                >
                                                    <path
                                                        d="M8.5 5.5a.5.5 0 0 0-1 0v3.362l-1.429 2.38a.5.5 0 1 0 .858.515l1.5-2.5A.5.5 0 0 0 8.5 9z"
                                                    />
                                                    <path
                                                        d="M6.5 0a.5.5 0 0 0 0 1H7v1.07a7.001 7.001 0 0 0-3.273 12.474l-.602.602a.5.5 0 0 0 .707.708l.746-.746A6.97 6.97 0 0 0 8 16a6.97 6.97 0 0 0 3.422-.892l.746.746a.5.5 0 0 0 .707-.708l-.601-.602A7.001 7.001 0 0 0 9 2.07V1h.5a.5.5 0 0 0 0-1zm1.038 3.018a6 6 0 0 1 .924 0 6 6 0 1 1-.924 0M0 3.5c0 .753.333 1.429.86 1.887A8.04 8.04 0 0 1 4.387 1.86 2.5 2.5 0 0 0 0 3.5M13.5 1c-.753 0-1.429.333-1.887.86a8.04 8.04 0 0 1 3.527 3.527A2.5 2.5 0 0 0 13.5 1"
                                                    />
                                                </svg>
                                            </div>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                                min="1"
                                                pattern="[0-9]"
                                                value={this.state.duration}
                                                onChange={event => this.setValue("duration", InputFormat(event))}
                                            />
                                        </div>
                                        <div className="d-grid mt-3">
                                            {IsEmpty(this.context.account) ?
                                                <button
                                                    className="btn text-white bgc-FFA500 btn-bubble"
                                                    onClick={this.context.loadWeb3}
                                                >Connect Wallet</button> :
                                                <button
                                                    className="btn btn-success"
                                                    onClick={event => this.setDuration()}
                                                >Set Duration</button>
                                            }
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <p className="m-0 text-white small">Notify Reward</p>
                                            <p className="m-0 text-info small cursor-pointer" onClick={event => this.setMaxAmount()}>Max</p>
                                        </div>
                                        <div className="input-group mt-1">
                                            <div className="input-group-text border-end-0 bgc-white-opacity-15">
                                                <img
                                                    src={logo}
                                                    alt={this.context.symbol}
                                                    width="24"
                                                    height="24"
                                                />
                                            </div>
                                            <input
                                                type="text"
                                                className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                                min="1"
                                                pattern="[0-9]"
                                                value={this.state.amountToken}
                                                onChange={event => this.setValue("amountToken", InputFormat(event))}
                                            />
                                        </div>
                                        <div className="d-grid mt-3">
                                            {IsEmpty(this.context.account) ?
                                                <button
                                                    className="btn text-white bgc-FFA500 btn-bubble"
                                                    onClick={this.context.loadWeb3}
                                                >Connect Wallet</button> :
                                                <button
                                                    className="btn btn-success"
                                                    onClick={event => this.end()}
                                                >Notify Reward</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </Template>
        );
    }
}

Admin.contextType = Web3Context;

export default Admin;