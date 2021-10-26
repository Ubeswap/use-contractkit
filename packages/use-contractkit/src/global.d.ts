import { AbstractProvider } from 'web3-core';

declare global {
  interface Window {
    ethereum?: Ethereum;
    celo?: AbstractProvider & {
      on?: (...args: unknown[]) => void;
      removeListener?: (...args: unknown[]) => void;
      autoRefreshOnNetworkChange?: boolean;
      enable: () => Promise<void>;
    };
    web3?: unknown;
  }
}

interface Ethereum extends Exclude<AbstractProvider, 'request'> {
  on: AddEthereumEventListener;
  isMetaMask?: boolean;
  isImToken?: boolean;
  request: EthereumRequest;
  enable: () => Promise<void>;
}

type AddEthereumEventListener = <Event extends keyof EthereumEventCallbacks>(
  event: Event,
  cb: EthereumEventCallbacks[Event]
) => void;

interface EthereumEventCallbacks {
  chainChanged: (chainIdHex: string) => void;
  accountsChanged: (accounts: string[]) => void;
}

type EthereumRequest = <Method extends keyof EthereumRequestReturns>(args: {
  method: Method;
  params?: unknown[] | unknown;
}) => Promise<EthereumRequestReturns[Method]>;

interface EthereumRequestReturns {
  eth_requestAccounts: string[];
  wallet_addEthereumChain: null;
}
