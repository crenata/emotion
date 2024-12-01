import React, {PureComponent} from "react";
import PropTypes from 'prop-types';
import {CSSTransition, TransitionGroup} from "react-transition-group";
import Web3Context from "../contexts/Web3Context";
import Loading from "../helpers/loadings/Loading";
import Navbar from "./Navbar";
import "./Template.css";
import Footer from "./Footer";
import BgOuterSpace from "../helpers/backgrounds/BgOuterSpace";
import {Toaster} from "react-hot-toast";

class Template extends PureComponent {
    render() {
        return (
            <Web3Context.Consumer>
                {(web3Context) => (
                    <TransitionGroup className={`app position-relative ${this.props.className}`}>
                        <CSSTransition
                            key={web3Context.loading}
                            timeout={1000}
                            classNames="fade-out"
                        >
                            {web3Context.loading ? <Loading /> : <BgOuterSpace className="app">
                                <Toaster containerClassName="z-4" position="top-right" />
                                <Navbar />
                                <div className="position-absolute w-100 app-content z-3">
                                    <div className="pb-5">
                                        {this.props.children}
                                    </div>
                                    <Footer />
                                </div>
                            </BgOuterSpace>}
                        </CSSTransition>
                    </TransitionGroup>
                )}
            </Web3Context.Consumer>
        );
    }
}

Template.propTypes = {
    className: PropTypes.string
};

export default Template;