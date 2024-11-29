import React, {PureComponent} from "react";
import Template from "../template/Template";
import Web3Context from "../contexts/Web3Context";
import TruffleContract from "@truffle/contract";
import Token from "../contracts/BEP20Token.json";
import Presale from "../contracts/Presale.json";
import ErrorNotDeployed from "../helpers/errors/ErrorNotDeployed";
import IsEmpty from "../helpers/IsEmpty";
import logo from "../images/logo.png";
import bnb from "../images/bnb.png";

class Home extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            token: null,
            presale: null,
            price: 0.00001,
            balance: 0,
            amountPrimary: 0,
            amountToken: 0,
            isEndSale: false,
            countdownDate: new Date("Dec 31, 2024 20:00:00").getTime(),
            countdown: {
                days: 0,
                hours: 0,
                minutes: 0,
                seconds: 0
            },
            interval: null
        };
    }

    componentDidMount() {
        // setTimeout(() => {
        //     this.loadToken();
        //     this.loadPresale();
        // }, 1000);
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

    loadToken() {
        const token = TruffleContract(Token);
        token.setProvider(this.context.web3.currentProvider);
        this.setState({
            token: token
        }, () => {
            this.state.token.deployed().then((data) => {
                data.balanceOf(this.context.account).then((result) => {
                    this.setState({
                        balance: this.context.web3.utils.fromWei(result, "ether")
                    });
                }).catch((error) => {
                    console.error(error);
                }).finally(() => {});
            }).catch((error) => {
                ErrorNotDeployed(this.state.token, error);
            }).finally(() => {});
        });
    }

    loadPresale() {
        const presale = TruffleContract(Presale);
        presale.setProvider(this.context.web3.currentProvider);
        presale.deployed().then(data => {
            this.setState({
                presale: data
            }, () => {
                this.state.presale.tokenPrice().then(value => {
                    this.setState({
                        price: value
                    });
                })
            });
        });
    }

    buy() {
        this.state.presale.buyTokens(this.state.amountPrimary, {
            from: this.context.account,
            value: this.state.amountPrimary * this.state.price
        });
    }

    end() {
        this.state.presale.endSale({
            from: this.context.account
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
                        <div className="col-12 col-md-5">
                            <div className="border box-shadow-primary rounded-4 p-3">
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
                                <p className="mt-4 mb-0 text-white small">My Balance : {new Intl.NumberFormat().format(this.state.balance)} $MAE</p>
                                <div className="d-flex align-items-center justify-content-center justify-content-md-between mt-4">
                                    <div className="d-none d-md-block border-top w-25" />
                                    <p className="d-block d-md-none m-0 text-white">♦</p>
                                    <p className="mx-2 mb-0 text-white">1 $MAE = 0.00001 $BNB</p>
                                    <p className="d-block d-md-none m-0 text-white">♦</p>
                                    <div className="d-none d-md-block border-top w-25" />
                                </div>
                                <div className="row mt-4">
                                    <div className="col-12 col-md-6">
                                        <div className="d-flex align-items-center justify-content-between">
                                            <p className="m-0 text-white small">You Pay</p>
                                            <p className="m-0 text-info small cursor-pointer">Max</p>
                                        </div>
                                        <div className="input-group mt-1">
                                            <div className="input-group-text">
                                                <img
                                                    src={bnb}
                                                    alt="BNB"
                                                    width="24"
                                                    height="24"
                                                />
                                            </div>
                                            <input
                                                type="number"
                                                className="form-control border-start-0"
                                                min="1"
                                                pattern="[0-9]"
                                                value={this.state.amountPrimary}
                                                onChange={(event) => {
                                                    let value = Number(event.target.value);
                                                    this.setValue("amountPrimary", value);
                                                    this.setValue("amountToken", (value / this.state.price).toFixed(0));
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <p className="m-0 text-white small">You Receive</p>
                                        <div className="input-group mt-1">
                                            <div className="input-group-text">
                                                <img
                                                    src={logo}
                                                    alt="MAE"
                                                    width="24"
                                                    height="24"
                                                />
                                            </div>
                                            <input
                                                type="number"
                                                className="form-control border-start-0"
                                                min="1"
                                                pattern="[0-9]"
                                                value={this.state.amountToken}
                                                onChange={(event) => {
                                                    let value = Number(event.target.value);
                                                    this.setValue("amountToken", value);
                                                    this.setValue("amountPrimary", (value * this.state.price).toFixed(5));
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="d-grid mt-3">
                                    {IsEmpty(this.context.account) ?
                                        <button className="btn text-white bgc-FFA500 btn-bubble" onClick={this.context.loadWeb3}>Connect Wallet</button> :
                                        <button className="btn btn-success mt-3" onClick={event => this.buy()}>Buy MAE</button>
                                    }
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