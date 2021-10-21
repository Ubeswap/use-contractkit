import React from 'react';
import { isMobile } from 'react-device-detect';

import { SupportedProviders } from '../constants';
import { Connector } from '../types';
import { CeloDance } from './celo-dance';
import { CeloWallet } from './celo-wallet';
import { CeloExtensionWallet } from './cew';
import { Ledger } from './ledger';
import { MetaMaskWallet } from './metamask';
import { PrivateKey } from './private-key';
import { Valora } from './valora';
import { WalletConnect } from './wallet-connect';

export const defaultScreens: {
  [P in SupportedProviders]: React.FC<ConnectorProps>;
} = {
  [SupportedProviders.Valora]: isMobile ? Valora : WalletConnect,
  [SupportedProviders.MetaMask]: MetaMaskWallet,
  [SupportedProviders.imToken]: MetaMaskWallet,
  [SupportedProviders.WalletConnect]: WalletConnect,
  [SupportedProviders.Ledger]: Ledger,
  [SupportedProviders.CeloWallet]: CeloWallet,
  [SupportedProviders.CeloDance]: isMobile ? CeloDance : WalletConnect,
  [SupportedProviders.CeloTerminal]: WalletConnect,
  [SupportedProviders.CeloExtensionWallet]: CeloExtensionWallet,
  [SupportedProviders.Injected]: MetaMaskWallet,
  [SupportedProviders.PrivateKey]: PrivateKey,
};

export type ConnectorProps = {
  onSubmit: (connector: Connector) => void;
};
