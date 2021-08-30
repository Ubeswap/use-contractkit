import React from 'react';

import { Alfajores, Baklava, Mainnet } from '../constants';
import { ChainId, Network } from '../types';

const CELO_PARAMS = {
  chainName: 'Celo',
  nativeCurrency: { name: 'Celo', symbol: 'CELO', decimals: 18 as const },
};

const ALFAJORES_PARAMS = {
  chainName: 'Alfajores Testnet',
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

const params: { [chain in ChainId]: typeof CELO_PARAMS } = {
  [ChainId.Mainnet]: CELO_PARAMS,
  [ChainId.Alfajores]: ALFAJORES_PARAMS,
  [ChainId.Baklava]: BAKLAVA_PARAMS,
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
  [ChainId.Mainnet]: Mainnet,
  [ChainId.Alfajores]: Alfajores,
  [ChainId.Baklava]: Baklava,
};

export const AddCeloNetworkButton: React.FC<Props> = ({ chainId }: Props) => {
  const chainParams = params[chainId];
  return (
    <button
      onClick={async () => {
        await window.ethereum?.request({
          method: 'wallet_addEthereumChain',
          params: [makeNetworkParams(NETWORKS[chainId])],
        });
      }}
      className="tw-flex tw-items-center tw-text-gray-700 dark:tw-text-gray-400"
    >
      Switch to the {chainParams.chainName} network
    </button>
  );
};
