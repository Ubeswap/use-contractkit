import { isMobile } from 'react-device-detect';

import { WalletTypes } from '../constants';
import { Connector, Network } from '../types';
import {
  CeloExtensionWalletConnector,
  InjectedConnector,
  LedgerConnector,
  MetaMaskConnector,
  PrivateKeyConnector,
  UnauthenticatedConnector,
  ValoraConnector,
  WalletConnectConnector,
} from './connectors';

/**
 * Connectors for each wallet.
 */
export const CONNECTOR_TYPES: {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [x in WalletTypes]: new (n: Network, ...args: any[]) => Connector;
} = {
  [WalletTypes.CeloExtensionWallet]: CeloExtensionWalletConnector,
  [WalletTypes.Injected]: InjectedConnector,
  [WalletTypes.Ledger]: LedgerConnector,
  [WalletTypes.MetaMask]: MetaMaskConnector,
  [WalletTypes.PrivateKey]: PrivateKeyConnector,
  [WalletTypes.Unauthenticated]: UnauthenticatedConnector,
  [WalletTypes.Valora]: isMobile ? ValoraConnector : WalletConnectConnector,
  [WalletTypes.WalletConnect]: WalletConnectConnector,
  [WalletTypes.CeloDance]: WalletConnectConnector,
  [WalletTypes.CeloTerminal]: WalletConnectConnector,
  [WalletTypes.CeloWallet]: WalletConnectConnector,
};
