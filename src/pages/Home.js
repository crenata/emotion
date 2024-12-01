import React, {PureComponent} from "react";
import Template from "../template/Template";
import Web3Context from "../contexts/Web3Context";
import IsEmpty from "../helpers/IsEmpty";
import {PieChart} from "@mui/x-charts";
import toast from "react-hot-toast";
import logo from "../images/logo.png";
import bnb from "../images/bnb.png";
import {LinearProgress} from "@mui/material";

class Home extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            amountPrimary: "",
            amountToken: "",
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
                    outerRadius: 150,
                    paddingAngle: 5,
                    cornerRadius: 5,
                    cx: 150,
                    valueFormatter: (item) => `${item.value}%`,
                    data: [
                        {
                            id: 1,
                            value: 30,
                            label: "Development",
                            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto consequatur dolorem ipsa minima officia, quae quas quos totam voluptate voluptatem! Aliquam, consectetur dolor expedita incidunt nobis placeat quia similique ullam!",
                            color: "#5320DB"
                        },
                        {
                            id: 2,
                            value: 8,
                            label: "Team & Advisors",
                            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto consequatur dolorem ipsa minima officia, quae quas quos totam voluptate voluptatem! Aliquam, consectetur dolor expedita incidunt nobis placeat quia similique ullam!",
                            color: "#20DBA6"
                        },
                        {
                            id: 3,
                            value: 14,
                            label: "Marketing",
                            description: "Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto consequatur dolorem ipsa minima officia, quae quas quos totam voluptate voluptatem! Aliquam, consectetur dolor expedita incidunt nobis placeat quia similique ullam!",
                            color: "#242D1B"
                        },
                        {
                            id: 4,
                            value: 18,
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
                        }
                    ]
                }
            ]
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

    buy() {
        if (Number(this.state.amountPrimary) <= Number(this.context.primaryBalance)) {
            if (!IsEmpty(this.context.presale)) {
                this.context.presale.buyTokens(Math.floor(this.state.amountToken).toString(), {
                    from: this.context.account,
                    value: this.context.web3.utils.toWei((Math.floor(this.state.amountToken) * Number(this.context.price)).toString(), "ether")
                }).then((value) => {
                    this.context.getPrimaryBalance();
                }).catch((error) => {
                    switch (error.code) {
                        case undefined:
                            toast.error("Please consider for gas fee.");
                            break;
                        default:
                            toast.error(error.message);
                            break;
                    }
                }).finally(() => {});
            } else {
                toast.error("Failed fetch presale contract.");
            }
        } else {
            toast.error("You do not have enough BNB.");
        }
    }

    end() {
        if (!IsEmpty(this.context.presale)) {
            this.context.presale.endSale({
                from: this.context.account
            }).then((value) => {
                this.context.getPrimaryBalance();
            }).catch((error) => {
                toast.error(error.message);
            }).finally(() => {});
        } else {
            toast.error("Failed fetch presale contract.");
        }
    }

    inputFormat(event) {
        let value = event.target.value;

        let [, sign, integer, decimals] = value.replace(/[^\d.-]/g, "") // invalid characters
            .replace(/(\..*?)\./g, "$1") // multiple dots
            .replace(/(.+)-/g, "$1") // invalid signs
            .match(/^(-?)(.*?)((?:\.\d*)?)$/);

        // don't convert an empty string into a 0,
        // unless there are decimal places following
        if (integer || decimals) integer = +integer;

        return sign + integer + decimals;
    }

    onAmountPrimary(event) {
        let value = this.inputFormat(event);

        this.setState({
            amountPrimary: value,
            amountToken: (value / this.context.price).toFixed(0)
        });
    }

    onAmountToken(event) {
        let value = this.inputFormat(event);

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
                                <h4 className="m-0 text-white text-center">Presale Ending In :</h4>
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
                                <p className="mt-4 mb-0 text-white small">My Balance : {new Intl.NumberFormat().format(this.context.balance)} $MAE</p>
                                <div className="d-flex align-items-center justify-content-center justify-content-lg-between mt-4">
                                    <div className="d-none d-lg-block border-top w-25" />
                                    <p className="d-block d-lg-none m-0 text-white">♦</p>
                                    <p className="mx-2 mb-0 text-white">1 $MAE = 0.00001 $BNB</p>
                                    <p className="d-block d-lg-none m-0 text-white">♦</p>
                                    <div className="d-none d-lg-block border-top w-25" />
                                </div>
                                <div className="row mt-4">
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
                                                    alt="MAE"
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
                                        >Buy MAE</button>
                                    }
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="pt-5 mt-5">
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
                            <div className="col-12 col-md-8">
                                <div className="row g-4">
                                    {this.state.tokenomics[0].data.map((value) => (
                                        <div className="col-12 col-md-4" key={value.id}>
                                            <div className="box-shadow-primary p-3">
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
            </Template>
        );
    }
}

Home.contextType = Web3Context;

export default Home;