import React, {PureComponent} from "react";
import Template from "../template/Template";
import Web3Context from "../contexts/Web3Context";
import ErrorCallContract from "../helpers/errors/ErrorCallContract";
import InputFormat from "../helpers/InputFormat";
import IsEmpty from "../helpers/IsEmpty";
import {PieChart} from "@mui/x-charts";
import toast from "react-hot-toast";
import logo from "../images/logo.png";
import bnb from "../images/bnb.png";
import {LinearProgress} from "@mui/material";
import Modal from "@mui/joy/Modal";
import ModalClose from "@mui/joy/ModalClose";
import Sheet from "@mui/joy/Sheet";

class Home extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            amountPrimary: "",
            amountToken: "",
            amountStake: "",
            amountWithdraw: "",
            isEndSale: false,
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

    onAmountPrimary(event) {
        let value = InputFormat(event);

        this.setState({
            amountPrimary: value,
            amountToken: (value / this.context.price).toFixed(0)
        });
    }

    onAmountToken(event) {
        let value = InputFormat(event);

        this.setState({
            amountPrimary: (value * this.context.price).toFixed(5),
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
                    this.context.presale.buyTokens(this.context.web3.utils.toWei(Math.floor(this.state.amountToken).toString(), "ether"), {
                        from: this.context.account,
                        value: this.context.web3.utils.toWei((Math.floor(this.state.amountToken) * Number(this.context.price)).toString(), "ether")
                    }).then((value) => {
                        this.setState({
                            amountPrimary: "",
                            amountToken: ""
                        }, () => {
                            this.context.getPrimaryBalance();
                        });
                    }).catch((error) => {
                        ErrorCallContract(error);
                    }).finally(() => {});
                } else {
                    toast.error("Failed fetch presale contract.");
                }
            } else {
                toast.error("Please input amount you want to buy.");
            }
        } else {
            toast.error("You do not have enough BNB.");
        }
    }

    stake() {
        if (Number(this.state.amountStake) <= Number(this.context.balance)) {
            if (!IsEmpty(this.context.token)) {
                if (!IsEmpty(this.context.staking)) {
                    this.context.token.approve(
                        this.context.staking.address,
                        this.context.web3.utils.toWei(Math.floor(this.state.amountStake).toString(), "ether"),
                        {
                            from: this.context.account
                        }
                    ).then((value) => {
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
                        }).finally(() => {});
                    }).catch((error) => {
                        ErrorCallContract(error);
                    }).finally(() => {});
                } else {
                    toast.error("Failed fetch staking contract.");
                }
            } else {
                toast.error("Failed fetch token contract.");
            }
        } else {
            toast.error(`You do not have enough ${this.context.symbol}.`);
        }
    }

    withdraw() {
        if (Number(this.state.amountWithdraw) <= Number(this.context.staked)) {
            if (!IsEmpty(this.context.staking)) {
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
                }).finally(() => {});
            } else {
                toast.error("Failed fetch staking contract.");
            }
        } else {
            toast.error(`You do not have enough ${this.context.symbol} to be withdrawn.`);
        }
    }

    claim() {
        if (Number(this.context.totalCurrentRewards) > 0) {
            if (!IsEmpty(this.context.staking)) {
                this.context.staking.claim({
                    from: this.context.account
                }).then((value) => {
                    this.context.getPrimaryBalance();
                }).catch((error) => {
                    ErrorCallContract(error);
                }).finally(() => {});
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
                        <h5 className="m-0 text-white">Maelyn</h5>
                        <h2 className="mt-3 mb-0 text-white">Leave Earth! and to the MOON!!!</h2>
                    </div>
                    <div className="row mt-5">
                        <div className="col-12 col-lg-6 col-xl-5">
                            <div className="border box-shadow-primary rounded-4 p-4">
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
                                        <p className="m-0 text-white small">{new Intl.NumberFormat().format(this.context.sold)}</p>
                                        <LinearProgress variant="buffer" color="warning" value={this.context.sold / (this.context.tokenSupply * this.state.tokenomics[0].data.find((value) => value.label === "Presale").value / 100) * 100} valueBuffer={0} className="w-100 mx-3" />
                                        <p className="m-0 text-white small">{new Intl.NumberFormat().format(this.context.tokenSupply * this.state.tokenomics[0].data.find((value) => value.label === "Presale").value / 100)}</p>
                                    </div>
                                </div>
                                <p className="mt-4 mb-0 text-white small">My Balance : {new Intl.NumberFormat().format(this.context.balance)} ${this.context.symbol}</p>
                                <div className="d-flex align-items-center justify-content-center justify-content-lg-between mt-4">
                                    <div className="d-none d-lg-block border-top w-25" />
                                    <p className="d-block d-lg-none m-0 text-white">♦</p>
                                    <p className="mx-2 mb-0 text-white">1 ${this.context.symbol} = 0.00001 $BNB</p>
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
                                                                src={bnb}
                                                                alt="BNB"
                                                                width="24"
                                                                height="24"
                                                            />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                                            min="1"
                                                            pattern="[0-9]"
                                                            value={this.state.amountPrimary}
                                                            onChange={this.onAmountPrimary}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="col-12 col-md-6">
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
                                                        <input
                                                            type="text"
                                                            className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                                            min="1"
                                                            pattern="[0-9]"
                                                            value={this.state.amountToken}
                                                            onChange={this.onAmountToken}
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
                    <div id="staking" className="pt-5 mt-5">
                        <h3 className="m-0 text-white text-center">Staking</h3>
                        <div className="row mt-3">
                            <div className="col-12 col-md-9 d-flex align-items-center">
                                <p className="m-0 text-white">The distribution of ${this.context.symbol} token rewards will occur at a rate of {new Intl.NumberFormat().format(this.context.rewardRate)} ${this.context.symbol} tokens per BNB block.</p>
                            </div>
                            <div className="col-12 col-md-3 d-flex align-items-center justify-content-start justify-content-md-end mt-3 mt-md-0">
                                {IsEmpty(this.context.account) ?
                                    <button
                                        className="btn text-white bgc-FFA500 btn-bubble"
                                        onClick={this.context.loadWeb3}
                                    >Connect Wallet</button> :
                                    <button
                                        className="btn btn-success"
                                        onClick={event => this.setValue("modalWithdraw", true)}
                                        disabled={Number(this.context.staked) <= 0}
                                    >Withdraw Staked Tokens</button>
                                }
                            </div>
                        </div>
                        <div className="row mt-5">
                            <div className="col-12 col-md-3">
                                <div className="box-shadow-primary border rounded staking-box">
                                    <div className="p-3">
                                        <p className="m-0 text-white">Your ${this.context.symbol} Staked</p>
                                        <p className="mt-3 mb-0 text-white small">{new Intl.NumberFormat().format(this.context.staked)} <span className="x-small">${this.context.symbol}</span></p>
                                    </div>
                                    <div className="position-absolute w-100 bottom-0 p-3">
                                        <div className="d-grid">
                                            {IsEmpty(this.context.account) ?
                                                <button
                                                    className="btn text-white bgc-FFA500 btn-bubble"
                                                    onClick={this.context.loadWeb3}
                                                >Connect Wallet</button> :
                                                <button
                                                    className="btn btn-success"
                                                    onClick={event => this.setValue("modalStake", true)}
                                                >Stake</button>
                                            }
                                        </div>
                                    </div>
                                </div>
                            </div>
                            <div className="col-12 col-md-3 mt-3 mt-md-0">
                                <div className="box-shadow-primary border rounded staking-box p-3">
                                    <p className="m-0 text-white">Total Staked</p>
                                    <p className="mt-3 mb-0 text-white small">{new Intl.NumberFormat().format(this.context.totalStaked)} <span className="x-small">${this.context.symbol}</span></p>
                                </div>
                            </div>
                            <div className="col-12 col-md-3 mt-3 mt-md-0">
                                <div className="box-shadow-primary border rounded staking-box p-3">
                                    <p className="m-0 text-white">Reward Rate</p>
                                    <p className="mt-3 mb-0 text-white small">{new Intl.NumberFormat().format(this.context.rewardRate)} <span className="x-small">${this.context.symbol}</span></p>
                                </div>
                            </div>
                            <div className="col-12 col-md-3 mt-3 mt-md-0">
                                <div className="box-shadow-primary border rounded staking-box">
                                    <div className="p-3">
                                        <p className="m-0 text-white">Total Current Rewards</p>
                                        <p className="mt-3 mb-0 text-white small">{new Intl.NumberFormat().format(this.context.totalCurrentRewards)} <span className="x-small">${this.context.symbol}</span></p>
                                    </div>
                                    <div className="position-absolute w-100 bottom-0 p-3">
                                        <div className="d-grid">
                                            {IsEmpty(this.context.account) ?
                                                <button
                                                    className="btn text-white bgc-FFA500 btn-bubble"
                                                    onClick={this.context.loadWeb3}
                                                >Connect Wallet</button> :
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
                        <div className="row mt-5">
                            <div className="col-12 col-md-4">
                                <PieChart
                                    series={this.state.tokenomics}
                                    height={300}
                                    legend={{
                                        hidden: true
                                    }}
                                />
                            </div>
                            <div className="col-12 col-md-8 mt-3 mt-md-0">
                                <div className="row g-4">
                                    {this.state.tokenomics[0].data.map((value) => (
                                        <div className="col-12 col-md-4" key={value.id}>
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
                </div>

                <Modal
                    open={this.state.modalStake}
                    onClose={event => this.setValue("modalStake", false)}
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
                            <input
                                type="text"
                                className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                min="1"
                                pattern="[0-9]"
                                value={this.state.amountStake}
                                onChange={event => this.setValue("amountStake", InputFormat(event))}
                            />
                        </div>
                        <div className="d-grid mt-3">
                            <button
                                className="btn btn-success"
                                onClick={event => this.stake()}
                                disabled={Number(this.state.amountStake) > Number(this.context.balance)}
                            >Stake</button>
                        </div>
                    </Sheet>
                </Modal>
                <Modal
                    open={this.state.modalWithdraw}
                    onClose={event => this.setValue("modalWithdraw", false)}
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
                            <input
                                type="text"
                                className="form-control border-start-0 bgc-white-opacity-15 text-white"
                                min="1"
                                pattern="[0-9]"
                                value={this.state.amountWithdraw}
                                onChange={event => this.setValue("amountWithdraw", InputFormat(event))}
                            />
                        </div>
                        <div className="d-grid mt-3">
                            <button
                                className="btn btn-success"
                                onClick={event => this.withdraw()}
                                disabled={Number(this.state.amountWithdraw) > Number(this.context.staked)}
                            >Withdraw</button>
                        </div>
                    </Sheet>
                </Modal>
            </Template>
        );
    }
}

Home.contextType = Web3Context;

export default Home;