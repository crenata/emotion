import React, {PureComponent} from "react";
import Template from "../template/Template";
import Web3Context from "../contexts/Web3Context";
import TruffleContract from "@truffle/contract";
import BEP20Token from "../contracts/BEP20Token.json";
import Presale from "../contracts/Presale.json";
import ErrorNotDeployed from "../helpers/errors/ErrorNotDeployed";

class Home extends PureComponent {
    constructor(props) {
        super(props);
        this.state = {
            token: null,
            presale: null,
            price: 0,
            balance: 0,
            amount: 0
        };
    }

    componentDidMount() {
        setTimeout(() => {
            this.loadBEP20Token();
            this.loadPresale();
        }, 1000);
    }

    setValue(name, value, callback = null) {
        this.setState({
            [name]: value
        }, () => {
            if (callback && typeof callback === "function") callback();
        });
    }

    loadBEP20Token() {
        const token = TruffleContract(BEP20Token);
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
        this.state.presale.buyTokens(this.state.amount, {
            from: this.context.account,
            value: this.state.amount * this.state.price
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
                {new Intl.NumberFormat().format(this.state.balance)}

                <input
                    type="number"
                    className="form-control"
                    min="1"
                    pattern="[0-9]"
                    value={this.state.amount}
                    onChange={(event) => this.setValue("amount", event.target.value)}
                />
                <button className="btn btn-primary mt-3" onClick={event => this.buy()}>Buy</button>
                <button className="btn btn-primary mt-3" onClick={event => this.end()}>End</button>
            </Template>
        );
    }
}

Home.contextType = Web3Context;

export default Home;