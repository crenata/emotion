import React, {PureComponent} from "react";
import Template from "../template/Template";
import Web3Context from "../contexts/Web3Context";
import CopyToClipboard from "../helpers/CopyToClipboard";
import Currency from "../helpers/Currency";
import ErrorCallContract from "../helpers/errors/ErrorCallContract";
import InputFormat from "../helpers/InputFormat";
import IsEmpty from "../helpers/IsEmpty";
import NumberFormat from "../helpers/NumberFormat";
import ButtonLoading from "../helpers/loadings/ButtonLoading";
import {PieChart} from "@mui/x-charts";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";
import toast from "react-hot-toast";
import moment from "moment";
import {LinearProgress, Tooltip} from "@mui/material";
import {NumericFormat} from "react-number-format";
import logo from "../images/logo.png";
import "./Home.css";
import metamask from "../images/metamask.png";

class Home extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            amountPrimary: "",
            amountToken: "",
            amountStake: "",
            amountWithdraw: "",
            isEndSale: false,
            isLoadingBuy: false,
            isLoadingStake: false,
            isLoadingWithdraw: false,
            isLoadingClaim: false,
            countdownDate: new Date("Dec 31, 2024 20:00:00").getTime(),
            countdown: {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            },
            interval: null,
            tokenomics: [
                {
                    innerRadius: 30,
                    outerRadius: 140,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    cx: 140,
                    valueFormatter: (item) => `${item.value}%`,
                    data: [
                        {
                            id: 1,
                            value: 20,
                            label: "Development",
                            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto consequatur dolorem ipsa minima officia, quae quas quos totam voluptate voluptatem! Aliquam, consectetur dolor expedita incidunt nobis placeat quia similique ullam!",
                            color: "#5320DB"
                        },
                        {
                            id: 2,
                            value: 7,
                            label: "Team & Advisors",
                            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto consequatur dolorem ipsa minima officia, quae quas quos totam voluptate voluptatem! Aliquam, consectetur dolor expedita incidunt nobis placeat quia similique ullam!",
                            color: "#20DBA6"
                        },
                        {
                            id: 3,
                            value: 10,
                            label: "Marketing",
                            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto consequatur dolorem ipsa minima officia, quae quas quos totam voluptate voluptatem! Aliquam, consectetur dolor expedita incidunt nobis placeat quia similique ullam!",
                            color: "#242D1B"
                        },
                        {
                            id: 4,
                            value: 13,
                            label: "Liquidity",
                            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto consequatur dolorem ipsa minima officia, quae quas quos totam voluptate voluptatem! Aliquam, consectetur dolor expedita incidunt nobis placeat quia similique ullam!",
                            color: "#9D135B"
                        },
                        {
                            id: 5,
                            value: 30,
                            label: "Presale",
                            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto consequatur dolorem ipsa minima officia, quae quas quos totam voluptate voluptatem! Aliquam, consectetur dolor expedita incidunt nobis placeat quia similique ullam!",
                            color: "#D27F73"
                        },
                        {
                            id: 6,
                            value: 20,
                            label: "Staking",
                            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto consequatur dolorem ipsa minima officia, quae quas quos totam voluptate voluptatem! Aliquam, consectetur dolor expedita incidunt nobis placeat quia similique ullam!",
                            color: "#172F14"
                        }
                    ]
                }
            ],
            modalStake: false,
            modalWithdraw: false
        };
        this.onAmountPrimary = this.onAmountPrimary.bind(this);
        this.onAmountToken = this.onAmountToken.bind(this);
    }

    componentDidMount() {
        this.countdown();
    }

    componentWillUnmount() {
        clearInterval(this.state.interval);
    }

    setValue(name, value, callback = null) {
        this.setState({
            [name]: value
        }, () => {
            if (callback && typeof callback === "function") callback();
        });
    }

    countdown() {
        this.setState({
            interval: setInterval(() => {
                let now = new Date().getTime();
                let distance = this.state.countdownDate - now;

                let days = Math.floor(distance / (1000 * 60 * 60 * 24));
                let hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
                let minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
                let seconds = Math.floor((distance % (1000 * 60)) / 1000);

                this.setState({
                    countdown: {
                        days: days.toString().length < 2 ? ("0" + days).slice(-2) : days,
                        hours: ("0" + hours).slice(-2),
                        minutes: ("0" + minutes).slice(-2),
                        seconds: ("0" + seconds).slice(-2)
                    }
                });

                if (distance < 0) this.setState({
                    isEndSale: true
                });
            })
        });
    }

    onAmountPrimary(value) {
        value = InputFormat(value);

        this.setState({
            amountPrimary: value,
            amountToken: (value / this.context.price).toFixed(0)
        });
    }

    onAmountToken(value) {
        value = InputFormat(value);

        this.setState({
            amountPrimary: Number((value * this.context.price).toFixed(5).toString()),
            amountToken: value
        });
    }

    setMaxAmount() {
        this.setState({
            amountPrimary: this.context.primaryBalance,
            amountToken: (this.context.primaryBalance / this.context.price).toFixed(0)
        });
    }

    setMaxAmountToStake() {
        this.setState({
            amountStake: this.context.balance
        });
    }

    setMaxAmountToWithdraw() {
        this.setState({
            amountWithdraw: this.context.staked
        });
    }

    buy() {
        if (Number(this.state.amountPrimary) <= Number(this.context.primaryBalance)) {
            if (Number(this.state.amountToken) > 0) {
                if (!IsEmpty(this.context.presale)) {
                    this.setState({
                        isLoadingBuy: true
                    }, () => {
                        this.context.presale.buyTokens(this.context.web3.utils.toWei(this.state.amountToken, "ether"), {
                            from: this.context.account,
                            value: this.context.web3.utils.toWei((Number(this.state.amountToken) * Number(this.context.price)).toString(), "ether")
                        }).then((value) => {
                            this.setState({
                                amountPrimary: "",
                                amountToken: ""
                            }, () => {
                                this.context.getPrimaryBalance();
                            });
                        }).catch((error) => {
                            ErrorCallContract(error);
                        }).finally(() => {
                            this.setValue("isLoadingBuy", false);
                        });
                    });
                } else {
                    toast.error("Failed fetch presale contract.");
                }
            } else {
                toast.error("Please input amount you want to buy.");
            }
        } else {
            toast.error(`You do not have enough ${Currency().symbol}.`);
        }
    }

    stake() {
        if (Number(this.state.amountStake) > 0) {
            if (Number(this.state.amountStake) <= Number(this.context.balance)) {
                if (!IsEmpty(this.context.token)) {
                    if (!IsEmpty(this.context.staking)) {
                        this.setState({
                            isLoadingStake: true
                        }, () => {
                            let approved = false;
                            this.context.token.approve(
                                this.context.staking.address,
                                this.context.web3.utils.toWei(Math.floor(this.state.amountStake).toString(), "ether"),
                                {
                                    from: this.context.account
                                }
                            ).then((value) => {
                                approved = true;
                            }).catch((error) => {
                                ErrorCallContract(error);
                            }).finally(() => {
                                this.setState({
                                    isLoadingStake: false
                                }, () => {
                                    if (approved) {
                                        this.setState({
                                            isLoadingStake: true
                                        }, () => {
                                            this.context.staking.stake(this.context.web3.utils.toWei(Math.floor(this.state.amountStake).toString(), "ether"), {
                                                from: this.context.account
                                            }).then((value) => {
                                                this.setState({
                                                    amountStake: "",
                                                    modalStake: false
                                                }, () => {
                                                    this.context.getPrimaryBalance();
                                                });
                                            }).catch((error) => {
                                                ErrorCallContract(error);
                                            }).finally(() => {
                                                this.setValue("isLoadingStake", false);
                                            });
                                        });
                                    }
                                });
                            });
                        });
                    } else {
                        toast.error("Failed fetch staking contract.");
                    }
                } else {
                    toast.error("Failed fetch token contract.");
                }
            } else {
                toast.error(`You do not have enough ${this.context.symbol}.`);
            }
        } else {
            toast.error("Please input amount you want to stake.");
        }
    }

    withdraw() {
        if (Number(this.state.amountWithdraw) > 0) {
            if (Number(this.state.amountWithdraw) <= Number(this.context.staked)) {
                if (!IsEmpty(this.context.staking)) {
                    this.setState({
                        isLoadingWithdraw: true
                    }, () => {
                        this.context.staking.withdraw(this.context.web3.utils.toWei(Math.floor(this.state.amountWithdraw).toString(), "ether"), {
                            from: this.context.account
                        }).then((value) => {
                            this.setState({
                                amountWithdraw: "",
                                modalWithdraw: false
                            }, () => {
                                this.context.getPrimaryBalance();
                            });
                        }).catch((error) => {
                            ErrorCallContract(error);
                        }).finally(() => {
                            this.setValue("isLoadingWithdraw", false);
                        });
                    });
                } else {
                    toast.error("Failed fetch staking contract.");
                }
            } else {
                toast.error(`You do not have enough ${this.context.symbol} to be withdrawn.`);
            }
        } else {
            toast.error("Please input amount you want to withdraw.");
        }
    }

    claim() {
        if (Number(this.context.totalCurrentRewards) > 0) {
            if (!IsEmpty(this.context.staking)) {
                this.setState({
                    isLoadingClaim: true
                }, () => {
                    this.context.staking.claim({
                        from: this.context.account
                    }).then((value) => {
                        this.context.getPrimaryBalance();
                    }).catch((error) => {
                        ErrorCallContract(error);
                    }).finally(() => {
                        this.setValue("isLoadingClaim", false);
                    });
                });
            } else {
                toast.error("Failed fetch staking contract.");
            }
        } else {
            toast.error("Currently not available rewards can claimed.");
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
                        <div className="col-12 col-lg-6 col-xl-5">
                            <div className="border box-shadow-primary rounded-4 px-2 py-3 p-sm-4">
                                {Number(this.context.presaleBalance) > 0 ?
                                    <h4 className="m-0 text-white text-center">Presale Ending In :</h4> :
                                    <h4 className="m-0 text-white text-center">Trading Begins In :</h4>
                                }
                                <div className="border box-shadow-primary rounded px-2 py-3 mt-3">
                                    <div className="row">
                                        <div className="col-3">
                                            <div className="text-center">
                                                <h4 className="m-0 text-white">{this.state.countdown.days}</h4>
                                                <p className="mt-2 mb-0 text-white small">Days</p>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div className="text-center">
                                                <h4 className="m-0 text-white">{this.state.countdown.hours}</h4>
                                                <p className="mt-2 mb-0 text-white small">Hours</p>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div className="text-center">
                                                <h4 className="m-0 text-white">{this.state.countdown.minutes}</h4>
                                                <p className="mt-2 mb-0 text-white small">Minutes</p>
                                            </div>
                                        </div>
                                        <div className="col-3">
                                            <div className="text-center">
                                                <h4 className="m-0 text-white">{this.state.countdown.seconds}</h4>
                                                <p className="mt-2 mb-0 text-white small">Seconds</p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="border box-shadow-primary rounded p-3 mt-4">
                                    <div className="d-flex align-items-center">
                                        <p className="m-0 text-white small">{NumberFormat(this.context.sold)}</p>
                                        <LinearProgress variant="buffer" color="warning" value={this.context.sold / (this.context.tokenSupply * this.state.tokenomics[0].data.find((value) => value.label === "Presale").value / 100) * 100} valueBuffer={0} className="w-100 mx-3" />
                                        <p className="m-0 text-white small">{NumberFormat(this.context.tokenSupply * this.state.tokenomics[0].data.find((value) => value.label === "Presale").value / 100)}</p>
                                    </div>
                                </div>
                                <p className="mt-4 mb-0 text-white small">My Balance : {NumberFormat(this.context.balance)} ${this.context.symbol}</p>
                                <div className="d-flex align-items-center justify-content-center justify-content-lg-between mt-4">
                                    <div className="d-none d-lg-block border-top w-25" />
                                    <p className="d-block d-lg-none m-0 text-white">♦</p>
                                    <p className="mx-2 mb-0 text-white text-nowrap">1 ${this.context.symbol} = 0.00125 ${Currency().symbol}</p>
                                    <p className="d-block d-lg-none m-0 text-white">♦</p>
                                    <div className="d-none d-lg-block border-top w-25" />
                                </div>
                                <div className="mt-4">
                                    {Number(this.context.presaleBalance) > 0 ?
                                        <div className="">
                                            <div className="row">
                                                <div className="col-12 col-md-6">
                                                    <div className="d-flex align-items-center justify-content-between">
                                                        <p className="m-0 text-white small">You Pay</p>
                                                        <p className="m-0 text-info small cursor-pointer" onClick={event => this.setMaxAmount()}>Max</p>
                                                    </div>
                                                    <div className="input-group mt-1">
                                                        <div className="input-group-text border-end-0 bgc-white-opacity-15">
                                                            <img
                                                                src={Currency().image}
                                                                alt={Currency().symbol}
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
                                                            value={this.state.amountPrimary}
                                                            onValueChange={(values, sourceInfo) => this.onAmountPrimary(values.value)}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-6 mt-3 mt-md-0">
                                                    <p className="m-0 text-white small">You Receive</p>
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
                                                            onValueChange={(values, sourceInfo) => this.onAmountToken(values.value)}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="d-grid mt-3">
                                                {IsEmpty(this.context.account) ?
                                                    <button
                                                        className="btn text-white bgc-FFA500 btn-bubble"
                                                        onClick={this.context.loadWeb3}
                                                    >Connect Wallet</button> :
                                                    this.state.isLoadingBuy ?
                                                        <ButtonLoading /> :
                                                        <button
                                                            className="btn btn-success"
                                                            onClick={event => this.buy()}
                                                            disabled={Number(this.state.amountPrimary) > Number(this.context.primaryBalance)}
                                                        >Buy {this.context.symbol}</button>
                                                }
                                            </div>
                                        </div> :
                                        <div className="text-center">
                                            <h4 className="m-0 text-white text-center">Presale Sold Out</h4>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="d-flex align-items-center justify-content-center mt-5">
                        <div className="border box-shadow-primary rounded px-3 py-2">
                            <p className="m-0 text-white text-break">Token Address : {this.context.token?.address}
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
                            </p>
                            <div className="d-flex align-items-center justify-content-center mt-3 mt-sm-2">
                                {this.context.isLoadingAddToken ?
                                    <button className="box-shadow-primary border rounded bg-transparent text-white x-small text-nowrap px-2 py-1" disabled>
                                        <span className="spinner-border spinner-border-xs" aria-hidden="true" />
                                        <span role="status" className="ms-2">Loading...</span>
                                    </button> :
                                    <button
                                        className="box-shadow-primary border rounded bg-transparent text-white x-small text-nowrap px-2 py-1"
                                        onClick={this.context.addToken}
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
                                <a
                                    href={`${process.env.REACT_APP_BLOCKCHAIN_URL}/token/${this.context.token?.address}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="border box-shadow-primary rounded d-flex align-items-center text-decoration-none px-2 py-1 ms-2"
                                >
                                    <p className="m-0 text-white x-small">View on Blockchain</p>
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        width="12"
                                        height="12"
                                        fill="white"
                                        className="bi bi-box-arrow-up-right ms-2"
                                        viewBox="0 0 16 16"
                                    >
                                        <path
                                            fillRule="evenodd"
                                            d="M8.636 3.5a.5.5 0 0 0-.5-.5H1.5A1.5 1.5 0 0 0 0 4.5v10A1.5 1.5 0 0 0 1.5 16h10a1.5 1.5 0 0 0 1.5-1.5V7.864a.5.5 0 0 0-1 0V14.5a.5.5 0 0 1-.5.5h-10a.5.5 0 0 1-.5-.5v-10a.5.5 0 0 1 .5-.5h6.636a.5.5 0 0 0 .5-.5"
                                        />
                                        <path
                                            fillRule="evenodd"
                                            d="M16 .5a.5.5 0 0 0-.5-.5h-5a.5.5 0 0 0 0 1h3.793L6.146 9.146a.5.5 0 1 0 .708.708L15 1.707V5.5a.5.5 0 0 0 1 0z"
                                        />
                                    </svg>
                                </a>
                            </div>
                        </div>
                    </div>
                    <div id="staking" className="pt-5 mt-5">
                        <h3 className="m-0 text-white text-center">Staking</h3>
                        <div className="row mt-3">
                            <div className="col-12 col-md-9 d-flex align-items-center">
                                <p className="m-0 text-white">The distribution of ${this.context.symbol} token rewards will occur at a rate of {NumberFormat(this.context.rewardRate)} ${this.context.symbol} tokens per {Currency().symbol} block.</p>
                            </div>
                            <div className="col-12 col-md-3 d-flex align-items-center justify-content-start justify-content-md-end mt-3 mt-md-0">
                                {IsEmpty(this.context.account) ?
                                    <button
                                        className="btn text-white bgc-FFA500 btn-bubble"
                                        onClick={this.context.loadWeb3}
                                    >Connect Wallet</button> :
                                    this.state.isLoadingWithdraw ?
                                        <ButtonLoading /> :
                                        <button
                                            className="btn btn-success"
                                            onClick={event => this.setValue("modalWithdraw", true)}
                                            disabled={Number(this.context.staked) <= 0}
                                        >Withdraw Staked Tokens</button>
                                }
                            </div>
                        </div>
                        <div className="row g-3 mt-5">
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="box-shadow-primary border rounded staking-box">
                                    <div className="p-3">
                                        <p className="m-0 text-white">Your ${this.context.symbol} Staked</p>
                                        <p className="mt-3 mb-0 text-white small">{NumberFormat(this.context.staked)} <span className="x-small">${this.context.symbol}</span></p>
                                    </div>
                                    <div className="position-absolute w-100 bottom-0 p-3">
                                        <div className="d-grid">
                                            {IsEmpty(this.context.account) ?
                                                <button
                                                    className="btn text-white bgc-FFA500 btn-bubble"
                                                    onClick={this.context.loadWeb3}
                                                >Connect Wallet</button> :
                                                this.state.isLoadingStake ?
                                                    <ButtonLoading /> :
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={event => this.setValue("modalStake", true)}
                                                    >Stake</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="box-shadow-primary border rounded staking-box p-3">
                                    <p className="m-0 text-white">Total Staked</p>
                                    <p className="mt-3 mb-0 text-white small">{NumberFormat(this.context.totalStaked)} <span className="x-small">${this.context.symbol}</span></p>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="box-shadow-primary border rounded staking-box p-3">
                                    <p className="m-0 text-white">Reward Rate</p>
                                    <p className="mt-3 mb-0 text-white small">{NumberFormat(this.context.rewardRate)} <span className="x-small">${this.context.symbol}</span></p>
                                </div>
                            </div>
                            <div className="col-12 col-sm-6 col-lg-3">
                                <div className="box-shadow-primary border rounded staking-box">
                                    <div className="p-3">
                                        <p className="m-0 text-white">Total Current Rewards</p>
                                        <p className="mt-3 mb-0 text-white small">{NumberFormat(this.context.totalCurrentRewards)} <span className="x-small">${this.context.symbol}</span></p>
                                    </div>
                                    <div className="position-absolute w-100 bottom-0 p-3">
                                        <div className="d-grid">
                                            {IsEmpty(this.context.account) ?
                                                <button
                                                    className="btn text-white bgc-FFA500 btn-bubble"
                                                    onClick={this.context.loadWeb3}
                                                >Connect Wallet</button> :
                                                this.state.isLoadingClaim ?
                                                    <ButtonLoading /> :
                                                    <button
                                                        className="btn btn-success"
                                                        onClick={event => this.claim()}
                                                        disabled={Number(this.context.totalCurrentRewards) <= 0}
                                                    >Claim Rewards</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="tokenomics" className="pt-5 mt-5">
                        <h3 className="m-0 text-white text-center">Tokenomics</h3>
                        <div className="row g-3 mt-5">
                            <div className="col-12 col-lg-4">
                                <PieChart
                                    series={this.state.tokenomics}
                                    height={300}
                                    legend={{
                                        hidden: true
                                    }}
                                />
                            </div>
                            <div className="col-12 col-lg-8">
                                <div className="row g-4">
                                    {this.state.tokenomics[0].data.map((value) => (
                                        <div className="col-12 col-sm-6 col-lg-4" key={value.id}>
                                            <div className="box-shadow-primary border rounded p-3">
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <h6 className="m-0 text-white">{value.label}</h6>
                                                    <h6 className="m-0 text-white">{value.value}%</h6>
                                                </div>
                                                <div className="border-top my-3" />
                                                <p className="m-0 text-white small">{value.description}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div id="transactions" className="pt-5 mt-5">
                        <h3 className="m-0 text-white text-center">Transactions</h3>
                        <p className="mt-3 mb-0 text-white">Showing up real-time transactions from last {NumberFormat(this.context.fromLastBlock)} blocks.</p>
                        <div className="row g-4 mt-5">
                            <div className="col-12 col-md-6">
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
                                    <h5 className="ms-2 mb-0 text-white">Presale Transactions</h5>
                                </div>
                                <div className="box-shadow-primary border rounded overflow-auto presale-transactions p-3 mt-3">
                                    {this.context.presaleTransactions.length > 0 ?
                                        this.context.presaleTransactions.map((value, index, array) => (
                                            <div className={`box-shadow-primary border rounded p-2 ${index > 0 ? "mt-3" : ""}`} key={value.blockNumber}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="">
                                                        <div className="d-flex align-items-center">
                                                            <div className="d-flex align-items-center">
                                                                <p className="m-0 text-white transaction-amount">{NumberFormat(this.context.web3.utils.fromWei(value.args.amountPrimary, "ether"))}</p>
                                                                <img
                                                                    src={Currency().image}
                                                                    alt={Currency().symbol}
                                                                    width="18"
                                                                    height="18"
                                                                    className="ms-2"
                                                                />
                                                            </div>
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="18"
                                                                height="18"
                                                                fill="white"
                                                                className="bi bi-arrow-right-short mx-2"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path
                                                                    fillRule="evenodd"
                                                                    d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"
                                                                />
                                                            </svg>
                                                            <div className="d-flex align-items-center">
                                                                <p className="m-0 text-white transaction-amount">{NumberFormat(this.context.web3.utils.fromWei(value.args.amountToken, "ether"))}</p>
                                                                <img
                                                                    src={logo}
                                                                    alt={this.context.symbol}
                                                                    width="18"
                                                                    height="18"
                                                                    className="ms-2"
                                                                />
                                                            </div>
                                                        </div>
                                                        <div className="d-flex align-items-center mt-2">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="14"
                                                                height="14"
                                                                fill="white"
                                                                className="bi bi-clock"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path
                                                                    d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"
                                                                />
                                                                <path
                                                                    d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"
                                                                />
                                                            </svg>
                                                            <p className="ms-2 mb-0 text-white x-small">{moment(this.context.web3.utils.toNumber(value.args.timestamp) * 1000).fromNow()}</p>
                                                        </div>
                                                    </div>
                                                    <a
                                                        href={`${process.env.REACT_APP_BLOCKCHAIN_URL}/tx/${value.transactionHash}`}
                                                        target="_blank"
                                                        rel="noreferrer"
                                                        className="text-decoration-none"
                                                    >
                                                        <svg
                                                            width="38"
                                                            height="38"
                                                            viewBox="0 0 34 34"
                                                            fill="none"
                                                            xmlns="http://www.w3.org/2000/svg"
                                                        >
                                                            <g clipPath="url(#clip0_126_200)">
                                                                <path
                                                                    d="M7.0293 16.0477C7.02933 15.8589 7.06665 15.672 7.13914 15.4977C7.21162 15.3233 7.3178 15.165 7.45163 15.0318C7.58546 14.8987 7.74428 14.7932 7.91896 14.7216C8.09364 14.65 8.28076 14.6136 8.46957 14.6144L10.8574 14.6222C11.2381 14.6222 11.6032 14.7735 11.8724 15.0427C12.1417 15.3119 12.2929 15.677 12.2929 16.0578V25.0873C12.5618 25.0076 12.906 24.9226 13.2847 24.8334C13.5471 24.7716 13.781 24.6231 13.9484 24.4118C14.1157 24.2005 14.2069 23.9389 14.2069 23.6693V12.4696C14.2069 12.0889 14.3581 11.7237 14.6274 11.4545C14.8966 11.1852 15.2617 11.0339 15.6425 11.0338H18.0375C18.4182 11.0339 18.7834 11.1852 19.0526 11.4545C19.3218 11.7237 19.473 12.0889 19.473 12.4696V22.8647C19.473 22.8647 20.0722 22.6223 20.6555 22.3759C20.8722 22.2842 21.0572 22.1308 21.1873 21.9347C21.3174 21.7385 21.3869 21.5085 21.3871 21.2731V8.88069C21.3871 8.50003 21.5382 8.13495 21.8074 7.86573C22.0766 7.59652 22.4416 7.44525 22.8223 7.44516H25.2148C25.5953 7.44555 25.9601 7.59694 26.229 7.86612C26.4979 8.13531 26.649 8.50022 26.649 8.88069V19.0854C28.7233 17.5822 30.8255 15.774 32.4937 13.6C32.7356 13.2844 32.8958 12.9139 32.9599 12.5213C33.0238 12.1288 32.9898 11.7265 32.8604 11.3504C32.0882 9.12878 30.8606 7.09276 29.2564 5.37272C27.6522 3.65269 25.7065 2.28647 23.544 1.36151C21.3814 0.436563 19.0496 -0.0267617 16.6977 0.00119375C14.3458 0.0291491 12.0257 0.547768 9.88572 1.52386C7.74576 2.49995 5.83315 3.91203 4.27023 5.66972C2.70734 7.42741 1.52857 9.49202 0.809376 11.7314C0.0901775 13.9708 -0.153613 16.3357 0.0936031 18.6747C0.340819 21.0137 1.0736 23.2754 2.24505 25.315C2.44914 25.6668 2.74941 25.9531 3.11058 26.1402C3.47173 26.3273 3.87879 26.4074 4.28394 26.3712C4.73653 26.3313 5.30004 26.275 5.97001 26.1964C6.26157 26.1633 6.53079 26.024 6.72631 25.8052C6.92187 25.5864 7.03011 25.3033 7.03042 25.0098V16.0477"
                                                                    fill="white"
                                                                />
                                                                <path
                                                                    d="M6.97809 30.5287C9.5 32.3633 12.4803 33.4646 15.5892 33.7104C18.6981 33.9565 21.8145 33.3376 24.5936 31.9224C27.3726 30.5072 29.7059 28.3507 31.3354 25.6917C32.9649 23.0326 33.8272 19.9746 33.8266 16.8559C33.8266 16.4658 33.8085 16.0817 33.7826 15.6988C27.606 24.9109 16.2016 29.2174 6.97809 30.5287Z"
                                                                    fill="#EFB90B"
                                                                />
                                                            </g>
                                                            <defs>
                                                                <clipPath id="clip0_126_200">
                                                                    <rect width="34" height="34" fill="white" />
                                                                </clipPath>
                                                            </defs>
                                                        </svg>
                                                    </a>
                                                </div>
                                            </div>
                                        )) :
                                        <div className="d-flex align-items-center justify-content-center h-100">
                                            <h5 className="m-0 text-white">No Data</h5>
                                        </div>
                                    }
                                </div>
                            </div>
                            <div className="col-12 col-md-6">
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
                                    <h5 className="ms-2 mb-0 text-white">Staking Transactions</h5>
                                </div>
                                <div className="box-shadow-primary border rounded overflow-auto staking-transactions p-3 mt-3">
                                    {this.context.stakingTransactions.length > 0 ?
                                        this.context.stakingTransactions.map((value, index, array) => (
                                            <div className={`box-shadow-primary border rounded p-2 ${index > 0 ? "mt-3" : ""}`} key={value.blockNumber}>
                                                <div className="d-flex align-items-center justify-content-between">
                                                    <div className="">
                                                        <div className="d-flex align-items-center">
                                                            <p className="m-0 text-white transaction-amount">{NumberFormat(this.context.web3.utils.fromWei(value.args.amount, "ether"))}</p>
                                                            <img
                                                                src={logo}
                                                                alt={this.context.symbol}
                                                                width="18"
                                                                height="18"
                                                                className="ms-2"
                                                            />
                                                        </div>
                                                        <div className="d-flex align-items-center mt-1">
                                                            <svg
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                width="14"
                                                                height="14"
                                                                fill="white"
                                                                className="bi bi-clock"
                                                                viewBox="0 0 16 16"
                                                            >
                                                                <path
                                                                    d="M8 3.5a.5.5 0 0 0-1 0V9a.5.5 0 0 0 .252.434l3.5 2a.5.5 0 0 0 .496-.868L8 8.71z"
                                                                />
                                                                <path
                                                                    d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16m7-8A7 7 0 1 1 1 8a7 7 0 0 1 14 0"
                                                                />
                                                            </svg>
                                                            <p className="ms-2 mb-0 text-white x-small">{moment(this.context.web3.utils.toNumber(value.args.timestamp) * 1000).fromNow()}</p>
                                                        </div>
                                                    </div>
                                                    <div className="d-flex align-items-center justify-content-end">
                                                        <div className="box-shadow-primary border rounded px-2 py-1">
                                                            <p className="m-0 text-white xx-small">{value.event}</p>
                                                        </div>
                                                        <a
                                                            href={`${process.env.REACT_APP_BLOCKCHAIN_URL}/tx/${value.transactionHash}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="text-decoration-none"
                                                        >
                                                            <svg
                                                                width="38"
                                                                height="38"
                                                                viewBox="0 0 34 34"
                                                                fill="none"
                                                                xmlns="http://www.w3.org/2000/svg"
                                                                className="ms-3"
                                                            >
                                                                <g clipPath="url(#clip0_126_200)">
                                                                    <path
                                                                        d="M7.0293 16.0477C7.02933 15.8589 7.06665 15.672 7.13914 15.4977C7.21162 15.3233 7.3178 15.165 7.45163 15.0318C7.58546 14.8987 7.74428 14.7932 7.91896 14.7216C8.09364 14.65 8.28076 14.6136 8.46957 14.6144L10.8574 14.6222C11.2381 14.6222 11.6032 14.7735 11.8724 15.0427C12.1417 15.3119 12.2929 15.677 12.2929 16.0578V25.0873C12.5618 25.0076 12.906 24.9226 13.2847 24.8334C13.5471 24.7716 13.781 24.6231 13.9484 24.4118C14.1157 24.2005 14.2069 23.9389 14.2069 23.6693V12.4696C14.2069 12.0889 14.3581 11.7237 14.6274 11.4545C14.8966 11.1852 15.2617 11.0339 15.6425 11.0338H18.0375C18.4182 11.0339 18.7834 11.1852 19.0526 11.4545C19.3218 11.7237 19.473 12.0889 19.473 12.4696V22.8647C19.473 22.8647 20.0722 22.6223 20.6555 22.3759C20.8722 22.2842 21.0572 22.1308 21.1873 21.9347C21.3174 21.7385 21.3869 21.5085 21.3871 21.2731V8.88069C21.3871 8.50003 21.5382 8.13495 21.8074 7.86573C22.0766 7.59652 22.4416 7.44525 22.8223 7.44516H25.2148C25.5953 7.44555 25.9601 7.59694 26.229 7.86612C26.4979 8.13531 26.649 8.50022 26.649 8.88069V19.0854C28.7233 17.5822 30.8255 15.774 32.4937 13.6C32.7356 13.2844 32.8958 12.9139 32.9599 12.5213C33.0238 12.1288 32.9898 11.7265 32.8604 11.3504C32.0882 9.12878 30.8606 7.09276 29.2564 5.37272C27.6522 3.65269 25.7065 2.28647 23.544 1.36151C21.3814 0.436563 19.0496 -0.0267617 16.6977 0.00119375C14.3458 0.0291491 12.0257 0.547768 9.88572 1.52386C7.74576 2.49995 5.83315 3.91203 4.27023 5.66972C2.70734 7.42741 1.52857 9.49202 0.809376 11.7314C0.0901775 13.9708 -0.153613 16.3357 0.0936031 18.6747C0.340819 21.0137 1.0736 23.2754 2.24505 25.315C2.44914 25.6668 2.74941 25.9531 3.11058 26.1402C3.47173 26.3273 3.87879 26.4074 4.28394 26.3712C4.73653 26.3313 5.30004 26.275 5.97001 26.1964C6.26157 26.1633 6.53079 26.024 6.72631 25.8052C6.92187 25.5864 7.03011 25.3033 7.03042 25.0098V16.0477"
                                                                        fill="white"
                                                                    />
                                                                    <path
                                                                        d="M6.97809 30.5287C9.5 32.3633 12.4803 33.4646 15.5892 33.7104C18.6981 33.9565 21.8145 33.3376 24.5936 31.9224C27.3726 30.5072 29.7059 28.3507 31.3354 25.6917C32.9649 23.0326 33.8272 19.9746 33.8266 16.8559C33.8266 16.4658 33.8085 16.0817 33.7826 15.6988C27.606 24.9109 16.2016 29.2174 6.97809 30.5287Z"
                                                                        fill="#EFB90B"
                                                                    />
                                                                </g>
                                                                <defs>
                                                                    <clipPath id="clip0_126_200">
                                                                        <rect width="34" height="34" fill="white" />
                                                                    </clipPath>
                                                                </defs>
                                                            </svg>
                                                        </a>
                                                    </div>
                                                </div>
                                            </div>
                                        )) :
                                        <div className="d-flex align-items-center justify-content-center h-100">
                                            <h5 className="m-0 text-white">No Data</h5>
                                        </div>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <Modal
                    open={this.state.modalStake}
                    onClose={event => {
                        this.state.isLoadingStake ? event.preventDefault() : this.setValue("modalStake", false)
                    }}
                    sx={{display: "flex", justifyContent: "center", alignItems: "center"}}
                >
                    <Sheet
                        variant="outlined"
                        className="bg-transparent"
                        sx={{maxWidth: 500, borderRadius: "md", p: 2, boxShadow: "lg"}}
                    >
                        <ModalClose variant="plain" sx={{m: 1}} />
                        <h5 className="m-0 text-white">Stake Your Tokens</h5>
                        <p className="mt-3 mb-0 text-white">Lets stake your tokens and earn the rewards!!!</p>
                        <div className="d-flex align-items-center justify-content-between mt-3">
                            <p className="m-0 text-white small">Amount to Stake</p>
                            <p className="m-0 text-info small cursor-pointer" onClick={event => this.setMaxAmountToStake()}>Max</p>
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
                                value={this.state.amountStake}
                                onValueChange={(values, sourceInfo) => this.setValue("amountStake", InputFormat(values.value))}
                            />
                        </div>
                        <div className="d-grid mt-3">
                            {IsEmpty(this.context.account) ?
                                <button
                                    className="btn text-white bgc-FFA500 btn-bubble"
                                    onClick={this.context.loadWeb3}
                                >Connect Wallet</button> :
                                this.state.isLoadingStake ?
                                    <ButtonLoading /> :
                                    <button
                                        className="btn btn-success"
                                        onClick={event => this.stake()}
                                        disabled={Number(this.state.amountStake) > Number(this.context.balance)}
                                    >Stake</button>
                            }
                        </div>
                    </Sheet>
                </Modal>
                <Modal
                    open={this.state.modalWithdraw}
                    onClose={event => {
                        this.state.isLoadingWithdraw ? event.preventDefault() : this.setValue("modalWithdraw", false)
                    }}
                    sx={{display: "flex", justifyContent: "center", alignItems: "center"}}
                >
                    <Sheet
                        variant="outlined"
                        className="bg-transparent"
                        sx={{maxWidth: 500, borderRadius: "md", p: 2, boxShadow: "lg"}}
                    >
                        <ModalClose variant="plain" sx={{m: 1}} />
                        <h5 className="m-0 text-white">Withdraw Your Tokens</h5>
                        <p className="mt-3 mb-0 text-white">See you later!!! :(</p>
                        <div className="d-flex align-items-center justify-content-between mt-3">
                            <p className="m-0 text-white small">Amount to Withdraw</p>
                            <p className="m-0 text-info small cursor-pointer" onClick={event => this.setMaxAmountToWithdraw()}>Max</p>
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
                                value={this.state.amountWithdraw}
                                onValueChange={(values, sourceInfo) => this.setValue("amountWithdraw", InputFormat(values.value))}
                            />
                        </div>
                        <div className="d-grid mt-3">
                            {IsEmpty(this.context.account) ?
                                <button
                                    className="btn text-white bgc-FFA500 btn-bubble"
                                    onClick={this.context.loadWeb3}
                                >Connect Wallet</button> :
                                this.state.isLoadingWithdraw ?
                                    <ButtonLoading /> :
                                    <button
                                        className="btn btn-success"
                                        onClick={event => this.withdraw()}
                                        disabled={Number(this.state.amountWithdraw) > Number(this.context.staked)}
                                    >Withdraw</button>
                            }
                        </div>
                    </Sheet>
                </Modal>
            </Template>
        );
    }
}

Home.contextType = Web3Context;

export default Home;