import React, {PureComponent} from "react";
import AppRoutes from "./AppRoutes";
import Web3Context from "./contexts/Web3Context";
import Currency from "./helpers/Currency";
import IsEmpty from "./helpers/IsEmpty";
import ErrorNotDeployed from "./helpers/errors/ErrorNotDeployed";
import Web3 from "web3";
import TruffleContract from "@truffle/contract";
import Token from "./contracts/ERC20.json";
import Presale from "./contracts/Presale.json";
import Staking from "./contracts/Staking.json";
import ERC20Lock from "./contracts/ERC20Lock.json";
import toast from "react-hot-toast";
import "./App.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.min";

class App extends PureComponent {
    constructor(props) {
        super(props);
        this.initialState = {
            loading: false,
            web3: null,
            block: 0,
            chainId: 0,
            newBlockHeadersSubscription: null,
            account: "",
            primaryBalance: 0,
            token: null,
            tokenSupply: 0,
            symbol: "",
            decimals: 0,
            balance: 0,
            presale: null,
            price: 0.00125,
            presaleBalance: 0,
            sold: 0,
            staking: null,
            stakingBalance: 0,
            staked: 0,
            totalStaked: 0,
            rewardRate: 0,
            totalCurrentRewards: 0,
            tokenLock: null,
            tokenLockBalance: 0,
            lockedTokens: [],
            fromLastBlock: 100,
            presaleTransactions: [],
            stakingTransactions: [],
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
            isLoadingAddToken: false,
            loadWeb3: () => false,
            getPrimaryBalance: () => false
        };
        this.state = {
            ...this.initialState
        };
        this.loadWeb3 = this.loadWeb3.bind(this);
        this.getPrimaryBalance = this.getPrimaryBalance.bind(this);
        this.addToken = this.addToken.bind(this);
    }

    componentDidMount() {
        this.setState({
            loadWeb3: this.loadWeb3,
            getPrimaryBalance: this.getPrimaryBalance,
            addToken: this.addToken
        }, () => {
            this.loadWeb3();
        });
    }

    setLoading(value, callback) {
        this.setState({
            loading: value
        }, () => {
            if (!IsEmpty(callback) && typeof callback === "function") callback();
        });
    }

    loadWeb3() {
        this.setLoading(true, () => {
            let web3 = null;
            if (!IsEmpty(window.ethereum)) {
                web3 = new Web3(window.ethereum);
                this.setState({
                    web3: web3
                }, () => {
                    this.getBlockNumber();
                    this.networkWatcher(() => {
                        window.ethereum.request({
                            method: "eth_requestAccounts"
                        }).then((accounts) => {
                            this.initAccounts(accounts);
                        }).catch((error) => {
                            this.errorGettingAccounts();
                        }).finally(() => {});
                    });
                });
            } else if (!IsEmpty(window.web3)) {
                web3 = new Web3(window.web3.currentProvider);
                this.setState({
                    web3: web3
                }, () => {
                    this.getBlockNumber();
                    this.networkWatcher(() => {
                        window.ethereum.enable().then((accounts) => {
                            this.initAccounts(accounts);
                        }).catch((error) => {
                            this.errorGettingAccounts();
                        }).finally(() => {});
                    });
                });
            } else {
                toast.error("Non-EVM browser detected. You should consider tyring Metamask!");
            }
        });
    }

    getBlockNumber() {
        this.state.web3.eth.getBlockNumber().then(value => {
            this.setState({
                block: this.state.web3.utils.toNumber(value)
            });
        }).catch((error) => {
            toast.error("Failed fetch block number.");
        }).finally(() => {});
    }

    networkWatcher(callback) {
        if (!IsEmpty(window.ethereum)) {
            window.ethereum.request({
                method: "eth_chainId"
            }).then((value) => {
                this.setState({
                    chainId: Number(value)
                }, () => {
                    if (this.state.chainId !== Number(process.env.REACT_APP_CHAIN_ID)) {
                        window.ethereum.request({
                            method: "wallet_switchEthereumChain",
                            params: [
                                {
                                    chainId: this.state.web3.utils.toHex(Number(process.env.REACT_APP_CHAIN_ID))
                                }
                            ]
                        }).then((value) => {
                            toast.success("Automatic switch network.");
                            if (!IsEmpty(callback) && typeof callback === "function") callback();
                        }).catch((error) => {
                            toast.error("Failed to automatic switch network, try automatic add network.");
                            window.ethereum.request({
                                method: "wallet_addEthereumChain",
                                params: [
                                    {
                                        chainId: this.state.web3.utils.toHex(process.env.REACT_APP_CHAIN_ID),
                                        chainName: "Ethereum Mainnet",
                                        rpcUrls: [
                                            "https://mainnet.infura.io"
                                        ],
                                        iconUrls: [
                                            "https://etherscan.io/images/svg/brands/ethereum-original.svg"
                                        ],
                                        nativeCurrency: {
                                            name: "Ethereum",
                                            symbol: "ETH",
                                            decimals: 18
                                        },
                                        blockExplorerUrls: [
                                            "https://etherscan.io"
                                        ]
                                    }
                                ],
                            }).then((value) => {
                                toast.success("Successfully add network.");
                                if (!IsEmpty(callback) && typeof callback === "function") callback();
                            }).catch((error) => {
                                toast.error("Failed to add network.");
                            }).finally(() => {});
                        }).finally(() => {});
                    } else {
                        if (!IsEmpty(callback) && typeof callback === "function") callback();
                    }
                });
            }).catch((error) => {
                toast.error("Failed fetch chain id.");
            }).finally(() => {});
        } else {
            toast.error("Non-EVM browser detected. You should consider tyring Metamask!");
        }
    }

    initAccounts(accounts) {
        this.getAccounts(accounts);
        this.getListeners();
    }

    getAccounts(accounts) {
        if (!IsEmpty(accounts)) {
            this.setState({
                account: accounts[0]
            }, () => {
                this.getPrimaryBalance();
            });
        }
    }

    getPrimaryBalance() {
        if (!IsEmpty(this.state.account)) {
            this.state.web3.eth.getBalance(this.state.account).then((value) => {
                this.setState({
                    primaryBalance: this.state.web3.utils.fromWei(value, "ether")
                }, () => {
                    this.getBlockchainData();
                });
            }).catch((error) => {
                toast.error(`Failed fetch ${Currency().symbol} balance.`);
            }).finally(() => {
                this.setLoading(false);
            });
        }
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
                            address: this.state.token?.address,
                            symbol: this.state.symbol,
                            decimals: this.state.decimals,
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

    listenAccountChanges() {
        if (!IsEmpty(window.ethereum)) {
            window.ethereum.on("accountsChanged", (accounts) => {
                this.getAccounts(accounts);
            });
        }
    }

    listenChainChanges() {
        if (!IsEmpty(window.ethereum)) {
            window.ethereum.on("chainChanged", (chainId) => {
                this.getBlockchainData();
            });
        }
    }

    listenNewBlockHeaders() {
        if (!IsEmpty(this.state.web3)) {
            let newBlockHeadersSubscription = this.state.web3.eth.subscribe("newBlockHeaders", (error, blockHeader) => {
                if (IsEmpty(error)) {
                    this.getPrimaryBalance();
                } else {
                    console.error("Block Headers Subscription Error.", error);
                }
            }).on("connected", (subscriptionId) => {
                console.info("Block Headers Subscription Connected :", subscriptionId);
            }).on("data", (data) => {
                console.info("Block Headers Subscription Data :", data);
            }).on("error", (error) => {
                console.error("Block Headers Subscription Error :", error);
            });
            this.setState({
                newBlockHeadersSubscription: newBlockHeadersSubscription
            });
        }
    }

    errorGettingAccounts() {
        toast.error("Not connected account.");
        this.setLoading(false);
    }

    getListeners() {
        this.listenAccountChanges();
        this.listenChainChanges();
        // this.listenNewBlockHeaders();
    }

    getBlockchainData() {
        this.loadToken();
        // this.loadPresale();
        // this.loadStaking();
    }

    loadToken() {
        if (!IsEmpty(this.state.web3)) {
            const token = TruffleContract(Token);
            token.setProvider(this.state.web3.currentProvider);
            token.deployed().then((data) => {
                this.setState({
                    token: data
                }, () => {
                    this.state.token.balanceOf(this.state.account).then((value) => {
                        this.setState({
                            balance: this.state.web3.utils.fromWei(value, "ether")
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch token balance.");
                    }).finally(() => {});

                    this.state.token.totalSupply().then((value) => {
                        this.setState({
                            tokenSupply: this.state.web3.utils.fromWei(value, "ether")
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch token supply.");
                    }).finally(() => {});

                    this.state.token.symbol().then((value) => {
                        this.setState({
                            symbol: value
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch token symbol.");
                    }).finally(() => {});

                    this.state.token.decimals().then((value) => {
                        this.setState({
                            decimals: this.state.web3.utils.toNumber(value)
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch token decimals.");
                    }).finally(() => {});

                    this.loadPresale();
                });
            }).catch((error) => {
                ErrorNotDeployed(token, error);
            }).finally(() => {});
        }
    }

    loadPresale() {
        if (!IsEmpty(this.state.web3)) {
            const presale = TruffleContract(Presale);
            presale.setProvider(this.state.web3.currentProvider);
            presale.deployed().then((data) => {
                this.setState({
                    presale: data
                }, () => {
                    this.state.token.balanceOf(this.state.presale.address).then((value) => {
                        this.setState({
                            presaleBalance: this.state.web3.utils.fromWei(value, "ether")
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch presale balance.");
                    }).finally(() => {});

                    this.state.presale.tokenPrice().then(value => {
                        this.setState({
                            price: this.state.web3.utils.fromWei(value, "ether")
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch token price.");
                    }).finally(() => {});

                    this.state.presale.tokensSold().then(value => {
                        this.setState({
                            sold: this.state.web3.utils.fromWei(value, "ether")
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch tokens sold.");
                    }).finally(() => {});

                    this.loadStaking();
                    this.presaleTransactions();
                });
            }).catch((error) => {
                ErrorNotDeployed(presale, error);
            }).finally(() => {});
        }
    }

    loadStaking() {
        if (!IsEmpty(this.state.web3)) {
            const staking = TruffleContract(Staking);
            staking.setProvider(this.state.web3.currentProvider);
            staking.deployed().then((data) => {
                this.setState({
                    staking: data
                }, () => {
                    this.state.token.balanceOf(this.state.staking.address).then(value => {
                        this.setState({
                            stakingBalance: this.state.web3.utils.fromWei(value, "ether")
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch staking token balance.");
                    }).finally(() => {});

                    this.state.staking.balanceOf(this.state.account).then(value => {
                        this.setState({
                            staked: this.state.web3.utils.fromWei(value, "ether")
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch token staked.");
                    }).finally(() => {});

                    this.state.staking.totalStaked().then(value => {
                        this.setState({
                            totalStaked: this.state.web3.utils.fromWei(value, "ether")
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch total token staked.");
                    }).finally(() => {});

                    this.state.staking.rewardRate().then(value => {
                        this.setState({
                            rewardRate: Number(this.state.web3.utils.fromWei(value, "ether")).toFixed(2)
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch staking rewards rate.");
                    }).finally(() => {});

                    this.state.staking.earned({
                        from: this.state.account
                    }).then(value => {
                        this.setState({
                            totalCurrentRewards: this.state.web3.utils.fromWei(value, "ether")
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch total current rewards.");
                    }).finally(() => {});

                    this.loadTokenLock();
                    this.stakingTransactions();
                });
            }).catch((error) => {
                ErrorNotDeployed(staking, error);
            }).finally(() => {});
        }
    }

    loadTokenLock() {
        if (!IsEmpty(this.state.web3)) {
            const tokenLock = TruffleContract(ERC20Lock);
            tokenLock.setProvider(this.state.web3.currentProvider);
            tokenLock.deployed().then((data) => {
                this.setState({
                    tokenLock: data
                }, () => {
                    this.state.token.balanceOf(this.state.tokenLock.address).then(value => {
                        this.setState({
                            tokenLockBalance: this.state.web3.utils.fromWei(value, "ether")
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch tokenLock token balance.");
                    }).finally(() => {});

                    this.state.tokenLock.lockedTokens().then(value => {
                        this.setState({
                            lockedTokens: value
                        });
                    }).catch((error) => {
                        toast.error("Failed fetch total tokens locked.");
                    }).finally(() => {});
                });
            }).catch((error) => {
                ErrorNotDeployed(tokenLock, error);
            }).finally(() => {});
        }
    }

    presaleTransactions() {
        this.state.presale.getPastEvents("Buy", {
            fromBlock: Math.max(Number(this.state.block) - this.state.fromLastBlock, 0)
        }).then((value) => {
            this.setState({
                presaleTransactions: value.reverse()
            });
        }).catch((error) => {
            toast.error("Failed fetch presale events.");
        }).finally(() => {});
    }

    stakingTransactions() {
        this.state.staking.getPastEvents("allEvents", {
            fromBlock: Math.max(Number(this.state.block) - this.state.fromLastBlock, 0)
        }).then((value) => {
            this.setState({
                stakingTransactions: value.reverse().filter((value) => ["Stake", "Withdraw"].includes(value.event))
            });
        }).catch((error) => {
            toast.error("Failed fetch presale events.");
        }).finally(() => {});
    }

    render() {
        return (
            <Web3Context.Provider value={this.state}>
                <AppRoutes />
            </Web3Context.Provider>
        );
    }
}

export default App;
