import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import { magic } from './libs/magic';

import { Networks } from './utils/networks';
import { useWeb3 } from './contexts/Web3Context';
import { useUser } from './contexts/UserContext';
import { logout } from './utils/logout';
import NFTs from './components/nfts';

import Wallet from './components/wallet';
import WalletMethods from './components/wallet-methods';
import SigningMethods from './components/signing';
import SendTransaction from './components/send-transaction';
import Erc20Tokens from './components/erc20-tokens';
import SmartContracts from './components/contracts';

import { getWeb3 } from './libs/web3';

import './styles.css';

function App() {
    const [disabled, setDisabled] = useState(false);

    const { user, setUser } = useUser();
    const { web3, setWeb3 } = useWeb3();
    const network =
        (localStorage.getItem('network') as Networks) || Networks.Sepolia;

    // Update state for newly connected wallet
    const handleDisconnect = () => {
        logout(setWeb3, setUser);
    };

    // Refresh the page when a user changes networks,
    const handleChainChanged = () => {
        window.location.reload();
    };

    // Update state for newly connected wallet
    const handleAccountsChanged = (acc: any) => {
        console.log('New account:', acc);
        // If user disconnected wallet, logout & reset web3
        if (!acc[0]) {
            handleDisconnect();
        } else {
            localStorage.setItem('user', acc[0]);
            setUser(acc[0]);
        }
    };

    useEffect(() => {
        if (!web3 || !user) return;
        // Once a user is connected, check if the wallet is on the correct network
        (async function () {
            const userWalletChainId = await web3.eth.getChainId();
            const dappChainId = getChainIdForSetNetwork();
            if (Number(userWalletChainId) !== dappChainId) {
                alert(
                    `Connected wallet is on the wrong network. Please switch to ${network} (chainId ${dappChainId})`
                );
            }
        })();

        // Listen for events emitted by third party wallets
        web3.currentProvider.on('accountsChanged', handleAccountsChanged);
        web3.currentProvider.on('chainChanged', handleChainChanged);
        return () => {
            web3.currentProvider.removeListener(
                'accountsChanged',
                handleAccountsChanged
            );
            web3.currentProvider.removeListener(
                'chainChanged',
                handleChainChanged
            );
        };
    }, [web3, user]);

    const getChainIdForSetNetwork = () => {
        switch (network) {
            case Networks.Polygon:
                return 80001;
            case Networks.Optimism:
                return 420;
            case Networks.Goerli:
                return 5;
            default:
                return 11155111;
        }
    };

    const connect = async () => {
        try {
            setDisabled(true);
            const accounts = await magic.wallet.connectWithUI();
            setDisabled(false);
            console.log('Logged in user:', accounts[0]);
            localStorage.setItem('user', accounts[0]);

            // Once user is logged in, re-initialize web3 instance to use the new provider (if connected with third party wallet)
            const web3 = await getWeb3();
            setWeb3(web3);
            setUser(accounts[0]);
        } catch (error) {
            setDisabled(false);
            console.error(error);
        }
    };
    return (
        <div className="App">
            <header className="App-header">
                {!user && (
                    <button className="connect-wallet" onClick={connect}>
                        Connect Wallet
                    </button>
                )}

                {user && <Wallet />}
                {user && <SendTransaction />}
                {user && <Erc20Tokens />}
                {user && <NFTs />}
            </header>
        </div>
    );
}

export default App;
