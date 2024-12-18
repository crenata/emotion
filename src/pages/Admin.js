import React, {PureComponent} from "react";
import Template from "../template/Template";
import Web3Context from "../contexts/Web3Context";
import CopyToClipboard from "../helpers/CopyToClipboard";
import Currency from "../helpers/Currency";
import ErrorCallContract from "../helpers/errors/ErrorCallContract";
import InputFormat from "../helpers/InputFormat";
import NumberFormat from "../helpers/NumberFormat";
import IsEmpty from "../helpers/IsEmpty";
import ButtonLoading from "../helpers/loadings/ButtonLoading";
import toast from "react-hot-toast";
import logo from "../images/logo.png";
import {LinearProgress, Tooltip} from "@mui/material";
import {NumericFormat} from "react-number-format";
import Modal from "@mui/joy/Modal";
import Sheet from "@mui/joy/Sheet";
import ModalClose from "@mui/joy/ModalClose";
import moment from "moment";

class Admin extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            presaleBalance: 0,
            duration: "",
            amountToken: "",
            lockBeneficiary: "",
            lockName: "",
            lockDescription: "",
            lockAmount: "",
            lockReleaseTime: "",
            isLoadingEndPresale: false,
            isLoadingDuration: false,
            isLoadingNotifyReward: false,
            isLoadingLock: false,
            isLoadingRelease: false,
            modalLock: false
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.getPresaleBalance();
        }, 500);
    }

    setValue(name, value, callback = null) {
        this.setState({
            [name]: value
        }, () => {
            if (!IsEmpty(callback) && typeof callback === "function") callback();
        });
    }

    setMaxAmountToNotifyReward() {
        this.setState({
            amountToken: this.context.stakingBalance
        });
    }

    setMaxAmountToLock() {
        this.setState({
            lockAmount: this.context.balance
        });
    }

    getPresaleBalance() {
        if (!IsEmpty(this.context.presale)) {
            this.context.web3.eth.getBalance(this.context.presale?.address).then((value) => {
                this.setState({
                    presaleBalance: this.context.web3.utils.fromWei(value, "ether")
                });
            }).catch((error) => {
                toast.error("Failed fetch presale balance.");
            }).finally(() => {});
        }
    }

    end() {
        if (!IsEmpty(this.context.presale)) {
            this.setState({
                isLoadingEndPresale: true
            }, () => {
                this.context.presale.endSale({
                    from: this.context.account
                }).then((value) => {
                    toast.success("Successfully end presale.");
                }).catch((error) => {
                    ErrorCallContract(error);
                }).finally(() => {
                    this.setValue("isLoadingEndPresale", false);
                });
            });
        } else {
            toast.error("Failed fetch presale contract.");
        }
    }

    setDuration() {
        if (!IsEmpty(this.context.staking)) {
            if (!IsEmpty(this.state.duration)) {
                this.setState({
                    isLoadingDuration: true
                }, () => {
                    this.context.staking.setRewardDuration(this.state.duration, {
                        from: this.context.account
                    }).then((value) => {
                        toast.success("Successfully set duration.");
                        this.setValue("duration", "");
                    }).catch((error) => {
                        ErrorCallContract(error);
                    }).finally(() => {
                        this.setValue("isLoadingDuration", false);
                    });
                });
            } else {
                toast.error("Please input duration.");
            }
        } else {
            toast.error("Failed fetch staking contract.");
        }
    }

    notifyReward() {
        if (Number(this.context.stakingBalance) > 0) {
            if (Number(this.state.amountToken) > 0) {
                if (!IsEmpty(this.context.staking)) {
                    this.setState({
                        isLoadingNotifyReward: true
                    }, () => {
                        this.context.staking.notifyRewardAmount(this.context.web3.utils.toWei(Math.floor(this.state.amountToken).toString(), "ether"), {
                            from: this.context.account
                        }).then((value) => {
                            toast.success("Successfully notify reward.");
                            this.setValue("amountToken", "");
                        }).catch((error) => {
                            ErrorCallContract(error);
                        }).finally(() => {
                            this.setValue("isLoadingNotifyReward", false);
                        });
                    });
                } else {
                    toast.error("Failed fetch staking contract.");
                }
            } else {
                toast.error("Please input amount you want to set.");
            }
        } else {
            toast.error("You have not transfer token to staking contract.");
        }
    }

    lock() {
        if (IsEmpty(this.state.lockBeneficiary)) {
            toast.error("Beneficiary field is required.");
            return false;
        }
        if (IsEmpty(this.state.lockName)) {
            toast.error("Name field is required.");
            return false;
        }
        if (IsEmpty(this.state.lockDescription)) {
            toast.error("Description field is required.");
            return false;
        }
        if (IsEmpty(this.state.lockAmount)) {
            toast.error("Amount field is required.");
            return false;
        }
        if (IsEmpty(this.state.lockReleaseTime)) {
            toast.error("Unlock date field is required.");
            return false;
        }
        if (Number(this.state.lockAmount) <= Number(this.context.balance)) {
            if (!IsEmpty(this.context.token)) {
                if (!IsEmpty(this.context.tokenLock)) {
                    this.setState({
                        isLoadingLock: true
                    }, () => {
                        let approved = false;
                        this.context.token.approve(
                            this.context.tokenLock.address,
                            this.context.web3.utils.toWei(Math.floor(this.state.lockAmount).toString(), "ether"),
                            {
                                from: this.context.account
                            }
                        ).then((value) => {
                            approved = true;
                        }).catch((error) => {
                            ErrorCallContract(error);
                        }).finally(() => {
                            this.setState({
                                isLoadingLock: false
                            }, () => {
                                if (approved) {
                                    this.setState({
                                        isLoadingLock: true
                                    }, () => {
                                        this.context.tokenLock.lock(
                                            this.state.lockBeneficiary,
                                            this.state.lockName,
                                            this.state.lockDescription,
                                            this.context.web3.utils.toWei(Math.floor(this.state.lockAmount).toString(), "ether"),
                                            Math.floor(new Date(this.state.lockReleaseTime).getTime() / 1000),
                                            {
                                                from: this.context.account
                                            }
                                        ).then((value) => {
                                            toast.success("Successfully locked.");
                                            this.setState({
                                                lockBeneficiary: "",
                                                lockName: "",
                                                lockDescription: "",
                                                lockAmount: "",
                                                lockReleaseTime: "",
                                                modalLock: false
                                            }, () => {
                                                this.context.getPrimaryBalance();
                                            });
                                        }).catch((error) => {
                                            ErrorCallContract(error);
                                        }).finally(() => {
                                            this.setValue("isLoadingLock", false);
                                        });
                                    });
                                }
                            });
                        });
                    });
                } else {
                    toast.error("Failed fetch tokenLock contract.");
                }
            } else {
                toast.error("Failed fetch token contract.");
            }
        } else {
            toast.error(`You do not have enough ${this.context.symbol}.`);
        }
    }

    release(index) {
        if (!IsEmpty(this.context.tokenLock)) {
            this.setState({
                isLoadingRelease: true
            }, () => {
                this.context.tokenLock.release(index, {
                    from: this.context.account
                }).then((value) => {
                    toast.success("Successfully released.");
                    this.context.getPrimaryBalance();
                }).catch((error) => {
                    ErrorCallContract(error);
                }).finally(() => {
                    this.setValue("isLoadingRelease", false);
                });
            });
        } else {
            toast.error("Failed fetch tokenLock contract.");
        }
    }

    render() {
        return (
            <Template>
                <div className="container">
                    <div className="text-center mt-5">
                        <h5 className="m-0 text-white">Emotion</h5>
                        <h2 className="mt-3 mb-0 text-white">Get ${this.context.symbol}! for more emotion controls.</h2>
                        <p className="mt-3 mb-0 text-white">In trading, you will need to control your emotions. Lose control lose money!!! Get more ${this.context.symbol} and be ready for trades.</p>
                    </div>
                    <div className="row mt-5">
                        <div className="col-12 col-md-6 offset-md-3">
                            <div className="box-shadow-primary border rounded p-3">
                                <div className="table-responsive">
                                    <table className="table table-borderless table-transparent m-0">
                                        <tbody>
                                        <tr>
                                            <td className="text-white text-nowrap p-0">Token Address</td>
                                            <td className="text-white text-nowrap py-0 px-2">:</td>
                                            <td className="text-white text-nowrap p-0 d-flex align-items-center">
                                                <p className="m-0">{this.context.token?.address}</p>
                                                <Tooltip title="Copy" arrow={true} placement="top" className="ms-1">
                                                    <button
                                                        className="btn btn-sm text-white"
                                                        onClick={event => CopyToClipboard(this.context.token?.address)}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            className="bi bi-copy"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                                                            />
                                                        </svg>
                                                    </button>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-white text-nowrap p-0">Presale Address</td>
                                            <td className="text-white text-nowrap py-0 px-2">:</td>
                                            <td className="text-white text-nowrap p-0 d-flex align-items-center">
                                                <p className="m-0">{this.context.presale?.address}</p>
                                                <Tooltip title="Copy" arrow={true} placement="top" className="ms-1">
                                                    <button
                                                        className="btn btn-sm text-white"
                                                        onClick={event => CopyToClipboard(this.context.presale?.address)}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            className="bi bi-copy"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                                                            />
                                                        </svg>
                                                    </button>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-white text-nowrap p-0">Staking Address</td>
                                            <td className="text-white text-nowrap py-0 px-2">:</td>
                                            <td className="text-white text-nowrap p-0 d-flex align-items-center">
                                                <p className="m-0">{this.context.staking?.address}</p>
                                                <Tooltip title="Copy" arrow={true} placement="top" className="ms-1">
                                                    <button
                                                        className="btn btn-sm text-white"
                                                        onClick={event => CopyToClipboard(this.context.staking?.address)}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            className="bi bi-copy"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                                                            />
                                                        </svg>
                                                    </button>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                        <tr>
                                            <td className="text-white text-nowrap p-0">TokenLock Address</td>
                                            <td className="text-white text-nowrap py-0 px-2">:</td>
                                            <td className="text-white text-nowrap p-0 d-flex align-items-center">
                                                <p className="m-0">{this.context.tokenLock?.address}</p>
                                                <Tooltip title="Copy" arrow={true} placement="top" className="ms-1">
                                                    <button
                                                        className="btn btn-sm text-white"
                                                        onClick={event => CopyToClipboard(this.context.tokenLock?.address)}
                                                    >
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="currentColor"
                                                            className="bi bi-copy"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path
                                                                fillRule="evenodd"
                                                                d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                                                            />
                                                        </svg>
                                                    </button>
                                                </Tooltip>
                                            </td>
                                        </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="row g-4 mt-3">
                        <div className="col-12 col-md-6">
                            <div className="box-shadow-primary border rounded h-100 p-3">
                                <h5 className="m-0 text-white text-center">Presale</h5>
                                <div className="border box-shadow-primary rounded p-3 mt-4">
                                    <div className="d-flex align-items-center">
                                        <p className="m-0 text-white small">{NumberFormat(this.context.sold)}</p>
                                        <LinearProgress variant="buffer" color="warning" value={this.context.sold / (this.context.tokenSupply * this.context.tokenomics[0].data.find((value) => value.label === "Presale").value / 100) * 100} valueBuffer={0} className="w-100 mx-3" />
                                        <p className="m-0 text-white small">{NumberFormat(this.context.tokenSupply * this.context.tokenomics[0].data.find((value) => value.label === "Presale").value / 100)}</p>
                                    </div>
                                </div>
                                <p className="mt-4 mb-0 text-white small">Presale Balance : {NumberFormat(this.state.presaleBalance)} ${Currency().symbol}</p>
                                <div className="d-grid mt-3">
                                    {IsEmpty(this.context.account) ?
                                        <button
                                            className="btn text-white bgc-FFA500 btn-bubble"
                                            onClick={this.context.loadWeb3}
                                        >Connect Wallet</button> :
                                        this.state.isLoadingEndPresale ?
                                            <ButtonLoading /> :
                                            <button
                                                className="btn btn-success"
                                                onClick={event => this.end()}
                                            >End Presale</button>
                                    }
                                </div>
                            </div>
                        </div>
                        <div className="col-12 col-md-6">
                            <div className="box-shadow-primary border rounded h-100 p-3">
                                <h5 className="m-0 text-white text-center">Staking</h5>
                                <div className="row g-4 mt-1">
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
                                            <NumericFormat
                                                type="text"
                                                thousandSeparator={true}
                                                allowNegative={false}
                                                decimalScale={5}
                                                className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                                value={this.state.duration}
                                                onValueChange={(values, sourceInfo) => this.setValue("duration", InputFormat(values.value))}
                                            />
                                        </div>
                                        <div className="d-grid mt-3">
                                            {IsEmpty(this.context.account) ?
                                                <button
                                                    className="btn text-white bgc-FFA500 btn-bubble"
                                                    onClick={this.context.loadWeb3}
                                                >Connect Wallet</button> :
                                                this.state.isLoadingDuration ?
                                                    <ButtonLoading /> :
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
                                            <p className="m-0 text-info small cursor-pointer" onClick={event => this.setMaxAmountToNotifyReward()}>Max</p>
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
                                            <NumericFormat
                                                type="text"
                                                thousandSeparator={true}
                                                allowNegative={false}
                                                decimalScale={5}
                                                className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                                value={this.state.amountToken}
                                                onValueChange={(values, sourceInfo) => this.setValue("amountToken", InputFormat(values.value))}
                                            />
                                        </div>
                                        <div className="d-grid mt-3">
                                            {IsEmpty(this.context.account) ?
                                                <button
                                                    className="btn text-white bgc-FFA500 btn-bubble"
                                                    onClick={this.context.loadWeb3}
                                                >Connect Wallet</button> :
                                                this.state.isLoadingNotifyReward ?
                                                    <ButtonLoading /> :
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={event => this.notifyReward()}
                                                    >Notify Reward</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="mt-5">
                        <h3 className="m-0 text-white text-center">Locked Tokens</h3>
                        <div className="row mt-3">
                            <div className="col-12 col-md-9 d-flex align-items-center">
                                <p className="m-0 text-white">Current total ${this.context.symbol} tokens locked : {NumberFormat(this.context.tokenLockBalance)} ${this.context.symbol} tokens.</p>
                            </div>
                            <div className="col-12 col-md-3 d-flex align-items-center justify-content-start justify-content-md-end mt-3 mt-md-0">
                                {IsEmpty(this.context.account) ?
                                    <button
                                        className="btn text-white bgc-FFA500 btn-bubble"
                                        onClick={this.context.loadWeb3}
                                    >Connect Wallet</button> :
                                    this.state.isLoadingLock ?
                                        <ButtonLoading /> :
                                        <button
                                            className="btn btn-success"
                                            onClick={event => this.setValue("modalLock", true)}
                                        >Add Lock</button>
                                }
                            </div>
                        </div>
                        <div className="row g-3 mt-5">
                            {this.context.lockedTokens.map((value, index, array) => (
                                <>
                                    {Number(value.amount) > 0 &&
                                        <div className="col-12 col-sm-6 col-lg-4" key={index}>
                                            <div className="box-shadow-primary border rounded lock-box">
                                                <div className="p-3">
                                                    <div className="d-flex align-items-center">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
                                                            fill="white"
                                                            className="bi bi-caret-right-fill"
                                                            viewBox="0 0 16 16"
                                                        >
                                                            <path
                                                                d="m12.14 8.753-5.482 4.796c-.646.566-1.658.106-1.658-.753V3.204a1 1 0 0 1 1.659-.753l5.48 4.796a1 1 0 0 1 0 1.506z"
                                                            />
                                                        </svg>
                                                        <p className="ms-2 mb-0 text-white">{value.name}</p>
                                                    </div>
                                                    <p className="m-0 text-white text-break xx-small">{value.beneficiary}
                                                        <Tooltip title="Copy" arrow={true} placement="top" className="ms-1">
                                                            <button
                                                                className="btn btn-sm text-white"
                                                                onClick={event => CopyToClipboard(value.beneficiary)}
                                                            >
                                                                <svg
                                                                    xmlns="http://www.w3.org/2000/svg"
                                                                    width="10"
                                                                    height="10"
                                                                    fill="currentColor"
                                                                    className="bi bi-copy"
                                                                    viewBox="0 0 16 16"
                                                                >
                                                                    <path
                                                                        fillRule="evenodd"
                                                                        d="M4 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2zm2-1a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1zM2 5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1h1v1a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h1v1z"
                                                                    />
                                                                </svg>
                                                            </button>
                                                        </Tooltip>
                                                    </p>
                                                    <div className="d-flex align-items-center mt-3">
                                                        <img
                                                            src={logo}
                                                            alt={this.context.symbol}
                                                            width="16"
                                                            height="16"
                                                        />
                                                        <p className="ms-2 mb-0 text-white small">{NumberFormat(this.context.web3.utils.fromWei(value.amount, "ether"))} <span className="x-small">${this.context.symbol}</span></p>
                                                    </div>
                                                    <div className="d-flex align-items-center mt-2">
                                                        <svg
                                                            xmlns="http://www.w3.org/2000/svg"
                                                            width="16"
                                                            height="16"
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
                                                        <p className="ms-2 mb-0 text-white small">{moment.unix(value.releaseTime).format("DD MMM YYYY HH:mm")}</p>
                                                    </div>
                                                    <div className="mt-4 overflow-auto lock-description">
                                                        <p className="m-0 text-white small">{value.description}</p>
                                                    </div>
                                                </div>
                                                <div className="position-absolute w-100 bottom-0 p-3">
                                                    <div className="d-grid">
                                                        {IsEmpty(this.context.account) ?
                                                            <button
                                                                className="btn text-white bgc-FFA500 btn-bubble"
                                                                onClick={this.context.loadWeb3}
                                                            >Connect Wallet</button> :
                                                            this.state.isLoadingRelease ?
                                                                <ButtonLoading /> :
                                                                <button
                                                                    className="btn btn-success"
                                                                    onClick={event => this.release(index)}
                                                                >Release</button>
                                                        }
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    }
                                </>
                            ))}
                        </div>
                    </div>
                </div>

                <Modal
                    open={this.state.modalLock}
                    onClose={event => {
                        this.state.isLoadingLock ? event.preventDefault() : this.setValue("modalLock", false)
                    }}
                    sx={{display: "flex", justifyContent: "center", alignItems: "center"}}
                >
                    <Sheet
                        variant="outlined"
                        className="bg-transparent"
                        sx={{maxWidth: 500, borderRadius: "md", p: 2, boxShadow: "lg"}}
                    >
                        <ModalClose variant="plain" sx={{m: 1}} />
                        <h5 className="m-0 text-white">Lock Your Tokens</h5>
                        <p className="mt-3 mb-0 text-white">Lets lock your tokens and be great developers!!!</p>
                        <div className="mt-3">
                            <p className="m-0 text-white small">Beneficiary</p>
                            <div className="input-group mt-1">
                                <div className="input-group-text border-end-0 bgc-white-opacity-15">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="white"
                                        className="bi bi-journal-code"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8.646 5.646a.5.5 0 0 1 .708 0l2 2a.5.5 0 0 1 0 .708l-2 2a.5.5 0 0 1-.708-.708L10.293 8 8.646 6.354a.5.5 0 0 1 0-.708m-1.292 0a.5.5 0 0 0-.708 0l-2 2a.5.5 0 0 0 0 .708l2 2a.5.5 0 0 0 .708-.708L5.707 8l1.647-1.646a.5.5 0 0 0 0-.708"
                                        />
                                        <path
                                            d="M3 0h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2v-1h1v1a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H3a1 1 0 0 0-1 1v1H1V2a2 2 0 0 1 2-2"
                                        />
                                        <path
                                            d="M1 5v-.5a.5.5 0 0 1 1 0V5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0V8h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1zm0 3v-.5a.5.5 0 0 1 1 0v.5h.5a.5.5 0 0 1 0 1h-2a.5.5 0 0 1 0-1z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                    value={this.state.lockBeneficiary}
                                    onChange={(event) => this.setValue("lockBeneficiary", event.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="m-0 text-white small">Name</p>
                            <div className="input-group mt-1">
                                <div className="input-group-text border-end-0 bgc-white-opacity-15">
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="24"
                                        height="24"
                                        fill="white"
                                        className="bi bi-bookmark"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            d="M2 2a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v13.5a.5.5 0 0 1-.777.416L8 13.101l-5.223 2.815A.5.5 0 0 1 2 15.5zm2-1a1 1 0 0 0-1 1v12.566l4.723-2.482a.5.5 0 0 1 .554 0L13 14.566V2a1 1 0 0 0-1-1z"
                                        />
                                    </svg>
                                </div>
                                <input
                                    type="text"
                                    className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                    value={this.state.lockName}
                                    onChange={(event) => this.setValue("lockName", event.target.value)}
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="m-0 text-white small">Description</p>
                            <textarea
                                rows="3"
                                className="form-control bgc-white-opacity-15 text-white mt-1"
                                value={this.state.lockDescription}
                                onChange={(event) => this.setValue("lockDescription", event.target.value)}
                            />
                        </div>
                        <div className="mt-3">
                            <div className="d-flex align-items-center justify-content-between">
                                <p className="m-0 text-white small">Amount to Lock</p>
                                <p className="m-0 text-info small cursor-pointer" onClick={event => this.setMaxAmountToLock()}>Max</p>
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
                                <NumericFormat
                                    type="text"
                                    thousandSeparator={true}
                                    allowNegative={false}
                                    decimalScale={5}
                                    className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                    value={this.state.lockAmount}
                                    onValueChange={(values, sourceInfo) => this.setValue("lockAmount", InputFormat(values.value))}
                                />
                            </div>
                        </div>
                        <div className="mt-3">
                            <p className="m-0 text-white small">Unlock Date</p>
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
                                    type="datetime-local"
                                    className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                    min={new Date().toISOString().slice(0, 16)}
                                    value={this.state.lockReleaseTime}
                                    onChange={(event) => this.setValue("lockReleaseTime", event.target.value)}
                                />
                            </div>
                        </div>
                        <div className="d-grid mt-3">
                            {IsEmpty(this.context.account) ?
                                <button
                                    className="btn text-white bgc-FFA500 btn-bubble"
                                    onClick={this.context.loadWeb3}
                                >Connect Wallet</button> :
                                this.state.isLoadingLock ?
                                    <ButtonLoading /> :
                                    <button
                                        className="btn btn-success"
                                        onClick={event => this.lock()}
                                        disabled={
                                            IsEmpty(this.state.lockBeneficiary) ||
                                            IsEmpty(this.state.lockName) ||
                                            IsEmpty(this.state.lockDescription) ||
                                            IsEmpty(this.state.lockAmount) ||
                                            Number(this.state.lockAmount) > Number(this.context.balance) ||
                                            IsEmpty(this.state.lockReleaseTime)
                                        }
                                    >Lock</button>
                            }
                        </div>
                    </Sheet>
                </Modal>
            </Template>
        );
    }
}

Admin.contextType = Web3Context;

export default Admin;