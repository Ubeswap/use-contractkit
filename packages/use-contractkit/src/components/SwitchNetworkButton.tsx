import React from 'react';

import { NetworkNames } from '..';
import {
  Alfajores,
  Avalanche,
  Baklava,
  Celo,
  Ethereum,
  Fuji,
  Kovan,
} from '../constants';
import { ChainId, Network } from '../types';

const CELO_PARAMS = {
  chainName: 'Celo',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 as const },
};

const ALFAJORES_PARAMS = {
  chainName: 'Alfajores',
  nativeCurrency: {
    name: 'Alfajores Celo',
    symbol: 'A-CELO',
    decimals: 18 as const,
  },
};

const BAKLAVA_PARAMS = {
  chainName: 'Baklava Testnet',
  nativeCurrency: {
    name: 'Baklava Celo',
    symbol: 'B-CELO',
    decimals: 18 as const,
  },
};

const ETHEREUM_PARAMS = {
  chainName: 'Ethereum',
  nativeCurrency: { name: 'Ethereum', symbol: 'ETH', decimals: 18 as const },
};

const KOVAN_PARAMS = {
  chainName: 'Kovan',
  nativeCurrency: {
    name: 'Kovan Ethereum',
    symbol: 'KETH',
    decimals: 18 as const,
  },
};

const AVALANCHE_PARAMS = {
  chainName: NetworkNames.Avalanche,
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 as const },
};

const FUJI_PARAMS = {
  chainName: NetworkNames.Fuji,
  nativeCurrency: { name: 'Avalanche', symbol: 'AVAX', decimals: 18 as const },
};

const params: { [chain in ChainId]: typeof CELO_PARAMS } = {
  [ChainId.Celo]: CELO_PARAMS,
  [ChainId.Alfajores]: ALFAJORES_PARAMS,
  [ChainId.Baklava]: BAKLAVA_PARAMS,
  [ChainId.Ethereum]: ETHEREUM_PARAMS,
  [ChainId.Kovan]: KOVAN_PARAMS,
  [ChainId.Avalanche]: AVALANCHE_PARAMS,
  [ChainId.Fuji]: FUJI_PARAMS,
};

interface AddEthereumChainParameter {
  chainId: string; // A 0x-prefixed hexadecimal string
  chainName: string;
  nativeCurrency: {
    name: string;
    symbol: string; // 2-6 characters long
    decimals: 18;
  };
  rpcUrls: string[];
  blockExplorerUrls?: string[];
  iconUrls?: string[]; // Currently ignored.
}

const makeNetworkParams = (info: Network): AddEthereumChainParameter => ({
  chainId: `0x${info.chainId.toString(16)}`,
  chainName: params[info.chainId].chainName ?? info.name,
  nativeCurrency:
    params[info.chainId].nativeCurrency ?? CELO_PARAMS.nativeCurrency,
  rpcUrls: [info.rpcUrl],
  blockExplorerUrls: [info.explorer],
  iconUrls: ['future'],
});

interface Props {
  chainId: ChainId;
}

const NETWORKS = {
  [ChainId.Celo]: Celo,
  [ChainId.Alfajores]: Alfajores,
  [ChainId.Baklava]: Baklava,
  [ChainId.Ethereum]: Ethereum,
  [ChainId.Kovan]: Kovan,
  [ChainId.Avalanche]: Avalanche,
  [ChainId.Fuji]: Fuji,
};

export const SwitchNetworkButton: React.FC<Props> = ({ chainId }: Props) => {
  const chainParams = params[chainId];
  return (
    <button
      onClick={async () => {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [makeNetworkParams(NETWORKS[chainId])],
        });
      }}
      className="tw-flex tw-items-center tw-font-semibold tw-text-blue-500 dark:tw-text-blue-400 focus:tw-outline-none"
    >
      Switch to the {chainParams.chainName} Network
    </button>
  );
};
