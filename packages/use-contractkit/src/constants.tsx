import React from 'react';
import { isMobile } from 'react-device-detect';

import { ChainId, Network, Provider } from './types';
import {
  CELO,
  CELO_DANCE,
  CHROME_EXTENSION_STORE,
  ETHEREUM,
  IMTOKEN,
  LEDGER,
  METAMASK,
  PRIVATE_KEY,
  VALORA,
  WALLETCONNECT,
} from './walletIcons';

export const localStorageKeys = {
  lastUsedAddress: 'use-contractkit/last-used-address',
  lastUsedNetwork: 'use-contractkit/last-used-network',
  lastUsedWalletType: 'use-contractkit/last-used-wallet',
  lastUsedWalletArguments: 'use-contractkit/last-used-wallet-arguments',
};

export enum SupportedProviders {
  CeloExtensionWallet = 'Celo Extension Wallet',
  CeloTerminal = 'Celo Terminal',
  CeloWallet = 'Celo Wallet',
  CeloDance = 'CeloDance',
  Injected = 'Ethereum Web3',
  Ledger = 'Ledger',
  MetaMask = 'MetaMask',
  imToken = 'imToken',
  PrivateKey = 'Private key',
  Valora = 'Valora',
  WalletConnect = 'WalletConnect',
}

export const PROVIDERS: {
  [K in SupportedProviders]: Provider;
} = {
  [SupportedProviders.Valora]: {
    name: 'Valora',
    description:
      'Connect to Valora, a mobile payments app that works worldwide',
    icon: VALORA,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 0,
    installURL: 'https://valoraapp.com/',
  },
  [SupportedProviders.CeloExtensionWallet]: {
    name: 'Celo Extension Wallet',
    description: 'Use a wallet from the the Celo chrome extension',
    icon: CHROME_EXTENSION_STORE,
    canConnect: () => typeof window !== 'undefined' && !!window.celo,
    showInList: () => !isMobile,
    listPriority: () => 0,
    installURL:
      'https://chrome.google.com/webstore/detail/celoextensionwallet/kkilomkmpmkbdnfelcpgckmpcaemjcdh/related',
  },
  [SupportedProviders.WalletConnect]: {
    name: 'WalletConnect',
    description: 'Scan a QR code to connect your wallet',
    icon: WALLETCONNECT,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 0,
  },
  [SupportedProviders.Ledger]: {
    name: 'Ledger',
    description: 'Sync with your Ledger hardware wallet',
    icon: LEDGER,
    canConnect: () => true,
    showInList: () => !isMobile,
    listPriority: () => 0,
  },
  [SupportedProviders.CeloWallet]: {
    name: 'Celo Wallet',
    description: 'Connect to Celo Wallet for web or desktop',
    icon: CELO,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 1,
  },
  [SupportedProviders.CeloTerminal]: {
    name: 'Celo Terminal',
    description: 'Connect to the Celo Terminal desktop app',
    // TODO get SVG icon
    icon: 'https://raw.githubusercontent.com/zviadm/celoterminal/main/static/icon.png',
    canConnect: () => true,
    showInList: () => !isMobile,
    listPriority: () => 1,
  },
  [SupportedProviders.MetaMask]: {
    name: 'MetaMask',
    description: isMobile ? (
      'Open Ubeswap in your Metamask app'
    ) : (
      <>
        Use the Metamask browser extension.{' '}
        <a
          href="https://docs.celo.org/getting-started/wallets/using-metamask-with-celo"
          target="_blank"
          onClick={(e) => {
            e.stopPropagation();
            e.nativeEvent.stopPropagation();
          }}
          className="tw-underline tw-text-gray-900 dark:tw-text-gray-200 tw-font-medium"
          rel="noopener noreferrer"
        >
          Learn more
        </a>
      </>
    ),
    icon: METAMASK,
    canConnect: () =>
      typeof window !== 'undefined' && !!window.ethereum?.isMetaMask,
    showInList: () => true,
    listPriority: () => 0,
    installURL: 'https://metamask.app.link/',
  },
  [SupportedProviders.imToken]: {
    name: 'imToken',
    description:
      typeof window !== 'undefined' && window.ethereum?.isImToken ? (
        'Open Ubeswap in your imToken app'
      ) : (
        <>Connect with imToken</>
      ),
    icon: IMTOKEN,
    canConnect: () =>
      typeof window !== 'undefined' && !!window.ethereum?.isImToken,
    showInList: () => isMobile,
    listPriority: () => (isMobile ? 0 : 1),
    installURL: 'https://token.im/download',
  },
  [SupportedProviders.Injected]: {
    name: 'Ethereum Web3',
    description: 'Connect any Ethereum wallet to Celo',
    icon: ETHEREUM,
    canConnect: () => typeof window !== 'undefined' && !!window.ethereum,
    showInList: () => typeof window !== 'undefined' && !!window.ethereum,
    // Prioritize if window.ethereum is present but MetaMask is not
    listPriority: () =>
      typeof window !== 'undefined' &&
      window.ethereum &&
      !window.ethereum?.isMetaMask &&
      !window.ethereum?.isImToken
        ? 0
        : 1,
  },
  [SupportedProviders.PrivateKey]: {
    name: 'Private Key',
    description:
      'Enter a plaintext private key to load your account (testing only)',
    icon: PRIVATE_KEY,
    canConnect: () => true,
    showInList: () => process.env.NODE_ENV !== 'production',
    listPriority: () => 1,
  },
  [SupportedProviders.CeloDance]: {
    name: 'CeloDance',
    description: 'Send, vote, and earn rewards within one wallet',
    icon: CELO_DANCE,
    canConnect: () => true,
    showInList: () => true,
    listPriority: () => 1,
    installURL: 'https://celo.dance/',
  },
};

export const images = {
  [SupportedProviders.Valora]: VALORA,
  [SupportedProviders.MetaMask]: METAMASK,
  [SupportedProviders.WalletConnect]: WALLETCONNECT,
  [SupportedProviders.Ledger]: LEDGER,
  [SupportedProviders.CeloWallet]: CELO,
  [SupportedProviders.CeloDance]: CELO_DANCE,
  [SupportedProviders.CeloTerminal]: CELO,
  [SupportedProviders.CeloExtensionWallet]: CHROME_EXTENSION_STORE,
  [SupportedProviders.PrivateKey]: PRIVATE_KEY,
};

export enum NetworkNames {
  Unknown = 'Unknown',

  Alfajores = 'Alfajores',
  Baklava = 'Baklava',
  Celo = 'Celo',

  Ethereum = 'Ethereum',
  Kovan = 'Kovan',

  Fuji = 'Fuji',
  Avalanche = 'Avalanche',
}

export const Alfajores: Network = {
  name: NetworkNames.Alfajores,
  rpcUrl: 'https://alfajores-forno.celo-testnet.org',
  graphQl: 'https://alfajores-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://alfajores-blockscout.celo-testnet.org',
  chainId: ChainId.Alfajores,
};

export const Baklava: Network = {
  name: NetworkNames.Baklava,
  rpcUrl: 'https://baklava-forno.celo-testnet.org',
  graphQl: 'https://baklava-blockscout.celo-testnet.org/graphiql',
  explorer: 'https://baklava-blockscout.celo-testnet.org',
  chainId: ChainId.Baklava,
};

export const Celo: Network = {
  name: NetworkNames.Celo,
  rpcUrl: 'https://forno.celo.org',
  graphQl: 'https://explorer.celo.org/graphiql',
  explorer: 'https://explorer.celo.org',
  chainId: ChainId.Celo,
};

export const Ethereum: Network = {
  name: NetworkNames.Ethereum,
  rpcUrl:
    process.env.ETHEREUM_RPC_URL ||
    process.env.REACT_APP_ETHEREUM_RPC_URL ||
    '',
  explorer: 'https://etherscan.io',
  chainId: ChainId.Ethereum,
};

export const Kovan: Network = {
  name: NetworkNames.Kovan,
  rpcUrl:
    process.env.KOVAN_RPC_URL || process.env.REACT_APP_KOVAN_RPC_URL || '',
  explorer: 'https://kovan.etherscan.io',
  chainId: ChainId.Kovan,
};

export const Avalanche: Network = {
  name: NetworkNames.Avalanche,
  rpcUrl: 'https://api.avax.network/ext/bc/C/rpc',
  explorer: 'https://snowtrace.io',
  chainId: ChainId.Avalanche,
};

export const Fuji: Network = {
  name: NetworkNames.Fuji,
  rpcUrl: 'https://api.avax-test.network/ext/bc/C/rpc',
  explorer: 'https://testnet.snowtrace.io',
  chainId: ChainId.Fuji,
};

export enum WalletTypes {
  Valora = 'Valora',
  MetaMask = 'MetaMask',
  WalletConnect = 'WalletConnect',
  CeloDance = 'CeloDance',
  CeloWallet = 'CeloWallet',
  CeloTerminal = 'CeloTerminal',
  CeloExtensionWallet = 'CeloExtensionWallet',
  Ledger = 'Ledger',
  Injected = 'Injected',
  PrivateKey = 'PrivateKey',
  Unauthenticated = 'Unauthenticated',
}

/**
 * These wallets cannot have their networks
 * updated via use-contractkit
 */
export const STATIC_NETWORK_WALLETS = [
  WalletTypes['MetaMask'],
  WalletTypes['CeloExtensionWallet'],
];

/**
 * Gets the provider associated with a wallet type.
 * @param wallet
 * @returns
 */
export const getProviderForWallet = (
  wallet: WalletTypes
): SupportedProviders | null =>
  wallet === WalletTypes.Unauthenticated ? null : SupportedProviders[wallet];

/**
 * Default networks to connect to.
 */
export const DEFAULT_NETWORKS = [
  Celo,
  Alfajores,
  Baklava,
  Ethereum,
  Kovan,
  Avalanche,
  Fuji,
];

/**
 * Chain ID of a default network.
 */
export type DefaultChainId = ChainId.Celo | ChainId.Alfajores;

export const FALLBACK_NETWORK = (chainId: number): Network => ({
  name: NetworkNames.Unknown,
  rpcUrl: 'https://forno.celo.org', // TODO: Perhaps it should be null/empty
  explorer: '',
  chainId,
});
