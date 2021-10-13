import { ContractKit, newKit, newKitFromWeb3 } from '@celo/contractkit';
import { LocalWallet } from '@celo/wallet-local';
import {
  WalletConnectWallet,
  WalletConnectWalletOptions,
} from '@celo/wallet-walletconnect';
import { BigNumber } from 'bignumber.js';

import { dappKitConfigKey, DappKitWallet } from '../dappkit-wallet';
import { localStorageKeys, WalletTypes } from '../constants';
import { ChainId, Connector, Network } from '../types';
import { clearPreviousConfig } from '../utils/helpers';

type Web3Type = Parameters<typeof newKitFromWeb3>[0];

/**
 * Connectors are our link between a DApp and the users wallet. Each
 * wallet has different semantics and these classes attempt to unify
 * them and present a workable API.
 */

export class UnauthenticatedConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.Unauthenticated;
  public kit: ContractKit;
  public account: string | null = null;

  constructor(n: Network) {
    this.kit = newKit(n.rpcUrl);
  }

  initialise(): this {
    this.initialised = true;
    return this;
  }

  close(): void {
    clearPreviousConfig();
    return;
  }
}

export class PrivateKeyConnector implements Connector {
  public initialised = true;
  public type = WalletTypes.PrivateKey;
  public kit: ContractKit;
  public account: string | null = null;

  constructor(n: Network, privateKey: string) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.PrivateKey
    );
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify([privateKey])
    );
    localStorage.setItem(localStorageKeys.lastUsedNetwork, n.name);

    const wallet = new LocalWallet();
    wallet.addAccount(privateKey);

    this.kit = newKit(n.rpcUrl, wallet);
    this.kit.defaultAccount = wallet.getAccounts()[0];
    this.account = this.kit.defaultAccount ?? null;
  }

  initialise(): this {
    this.initialised = true;
    return this;
  }

  close(): void {
    clearPreviousConfig();
    return;
  }
}

export class LedgerConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.Ledger;
  public kit: ContractKit;
  public account: string | null = null;

  constructor(private network: Network, private index: number) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.Ledger
    );
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify([index])
    );
    localStorage.setItem(localStorageKeys.lastUsedNetwork, network.name);

    this.kit = newKit(network.rpcUrl);
  }

  async initialise(): Promise<this> {
    const { default: TransportUSB } = await import(
      '@ledgerhq/hw-transport-webusb'
    );
    const { newLedgerWalletWithSetup } = await import('@celo/wallet-ledger');

    const transport = await TransportUSB.create();
    const wallet = await newLedgerWalletWithSetup(transport, [this.index]);
    this.kit = newKit(this.network.rpcUrl, wallet);
    this.kit.defaultAccount = wallet.getAccounts()[0];

    this.initialised = true;
    this.account = this.kit.defaultAccount ?? null;
    return this;
  }

  close(): void {
    clearPreviousConfig();
    return;
  }
}

export class UnsupportedChainIdError extends Error {
  public static readonly NAME: string = 'UnsupportedChainIdError';
  constructor(public readonly chainID: number) {
    super(`Unsupported chain ID: ${chainID}`);
    this.name = UnsupportedChainIdError.NAME;
  }
}

export class InjectedConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.CeloExtensionWallet;
  public kit: ContractKit;
  public account: string | null = null;
  private onNetworkChangeCallback?: (chainId: number) => void;
  private onAddressChangeCallback?: (address: string | null) => void;

  constructor(
    network: Network,
    defaultType: WalletTypes = WalletTypes.Injected
  ) {
    this.type = defaultType;
    localStorage.setItem(localStorageKeys.lastUsedWalletType, defaultType);
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify([])
    );
    localStorage.setItem(localStorageKeys.lastUsedNetwork, network.name);

    this.kit = newKit(network.rpcUrl);
  }

  async initialise(): Promise<this> {
    const { default: Web3 } = await import('web3');

    const ethereum = window.ethereum;
    if (!ethereum) {
      throw new Error('Ethereum wallet not installed');
    }
    this.type = WalletTypes.Injected;
    const web3 = new Web3(ethereum);
    void (await ethereum.request({ method: 'eth_requestAccounts' }));

    const chainId = await web3.eth.getChainId();
    if (!Object.values(ChainId).includes(chainId)) {
      throw new UnsupportedChainIdError(chainId);
    }

    ethereum.on('chainChanged', (chainIdHex: string) => {
      if (this.onNetworkChangeCallback) {
        const chainId = parseInt(chainIdHex, 16);
        this.onNetworkChangeCallback(chainId);
      }
    });

    ethereum.on('accountsChanged', (accounts) => {
      if (this.onAddressChangeCallback) {
        this.kit.defaultAccount = accounts[0];
        this.onAddressChangeCallback(accounts[0] ?? null);
      }
    });

    this.kit = newKitFromWeb3(web3 as unknown as Web3Type);
    const [defaultAccount] = await this.kit.web3.eth.getAccounts();
    this.kit.defaultAccount = defaultAccount;
    this.account = defaultAccount ?? null;
    this.initialised = true;

    return this;
  }

  onNetworkChange(callback: (chainId: number) => void): void {
    this.onNetworkChangeCallback = callback;
  }

  onAddressChange(callback: (address: string | null) => void): void {
    this.onAddressChangeCallback = callback;
  }

  close(): void {
    clearPreviousConfig();
    this.onNetworkChangeCallback = undefined;
    this.onAddressChangeCallback = undefined;
    return;
  }
}

export class MetaMaskConnector extends InjectedConnector {
  constructor(network: Network) {
    super(network, WalletTypes.MetaMask);
  }
}

export class CeloExtensionWalletConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.CeloExtensionWallet;
  public kit: ContractKit;
  public account: string | null = null;
  private onNetworkChangeCallback?: (chainId: number) => void;

  constructor(network: Network) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.CeloExtensionWallet
    );
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify([])
    );
    localStorage.setItem(localStorageKeys.lastUsedNetwork, network.name);

    this.kit = newKit(network.rpcUrl);
  }

  async initialise(): Promise<this> {
    const { default: Web3 } = await import('web3');

    const celo = window.celo;
    if (!celo) {
      throw new Error('Celo Extension Wallet not installed');
    }
    const web3 = new Web3(celo);
    await celo.enable();

    (
      web3.currentProvider as unknown as {
        publicConfigStore: {
          on: (
            event: string,
            cb: (args: { networkVersion: number }) => void
          ) => void;
        };
      }
    ).publicConfigStore.on('update', ({ networkVersion }) => {
      if (this.onNetworkChangeCallback) {
        this.onNetworkChangeCallback(networkVersion);
      }
    });

    this.kit = newKitFromWeb3(web3 as unknown as Web3Type);
    const [defaultAccount] = await this.kit.web3.eth.getAccounts();
    this.kit.defaultAccount = defaultAccount;
    this.account = defaultAccount ?? null;
    this.initialised = true;

    return this;
  }

  onNetworkChange(callback: (chainId: number) => void): void {
    this.onNetworkChangeCallback = callback;
  }

  close(): void {
    clearPreviousConfig();
    return;
  }
}

export class WalletConnectConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.WalletConnect;
  public kit: ContractKit;
  public account: string | null = null;

  private onUriCallback?: (uri: string) => void;
  private onCloseCallback?: () => void;

  constructor(
    private network: Network,
    options: WalletConnectWalletOptions,
    readonly autoOpen = false,
    readonly getDeeplinkUrl?: (uri: string) => string
  ) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.WalletConnect
    );
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify([options])
    );
    localStorage.setItem(localStorageKeys.lastUsedNetwork, network.name);

    const wallet = new WalletConnectWallet(options);
    this.kit = newKit(network.rpcUrl, wallet);
  }

  onUri(callback: (uri: string) => void): void {
    this.onUriCallback = callback;
  }

  onClose(callback: () => void): void {
    this.onCloseCallback = callback;
  }

  async initialise(): Promise<this> {
    const wallet = this.kit.getWallet() as WalletConnectWallet;

    if (this.onCloseCallback) {
      wallet.onPairingDeleted = () => this.onCloseCallback?.();
      wallet.onSessionDeleted = () => this.onCloseCallback?.();
    }

    const uri = await wallet.getUri();
    if (uri && this.onUriCallback) {
      this.onUriCallback(uri);
    }

    if (uri && this.autoOpen) {
      const deepLink = this.getDeeplinkUrl ? this.getDeeplinkUrl(uri) : uri;
      location.href = deepLink;
    }

    await wallet.init();
    const [address] = wallet.getAccounts();
    const defaultAccount = await this.fetchWalletAddressForAccount(address);
    this.kit.defaultAccount = defaultAccount;
    this.account = defaultAccount ?? null;
    this.initialised = true;

    return this;
  }

  private async fetchWalletAddressForAccount(address?: string) {
    if (!address) {
      return undefined;
    }
    const accounts = await this.kit.contracts.getAccounts();
    const walletAddress = await accounts.getWalletAddress(address);
    return new BigNumber(walletAddress).isZero() ? address : walletAddress;
  }

  close(): Promise<void> {
    clearPreviousConfig();
    const wallet = this.kit.getWallet() as WalletConnectWallet;
    return wallet.close();
  }
}

export class ValoraConnector implements Connector {
  public initialised = false;
  public type = WalletTypes.Valora;
  public kit: ContractKit;
  public wallet: DappKitWallet;

  get account(): string | null {
    const storedConfig = localStorage.getItem(dappKitConfigKey);
    let dappKitConfig = storedConfig ? JSON.parse(storedConfig) : null;
    if (dappKitConfig) {
      return dappKitConfig.phoneNumber;
    }
    return null;
  }

  constructor(private network: Network, dappName: string) {
    localStorage.setItem(
      localStorageKeys.lastUsedWalletType,
      WalletTypes.Valora
    );
    localStorage.setItem(
      localStorageKeys.lastUsedWalletArguments,
      JSON.stringify([dappName])
    );

    this.wallet = new DappKitWallet(dappName);
    this.kit = newKit(network.rpcUrl, this.wallet);
    this.wallet.setKit(this.kit);
  }

  async initialise(): Promise<this> {
    await this.wallet.init();

    this.kit = newKit(this.network.rpcUrl, this.wallet);
    this.kit.defaultAccount = this.wallet.getAccounts()[0];
    this.wallet.setKit(this.kit);
    this.initialised = true;

    return this;
  }

  close(): void {
    localStorage.removeItem(dappKitConfigKey);
    return;
  }
}
