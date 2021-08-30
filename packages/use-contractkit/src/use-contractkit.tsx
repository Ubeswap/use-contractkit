import { ContractKit } from '@celo/contractkit';
import React, { ReactNode, useCallback, useState } from 'react';
import ReactModal from 'react-modal';
import { Container, createContainer } from 'unstated-next';

import { DEFAULT_NETWORKS, WalletTypes } from './constants';
import {
  ActionModal,
  ActionModalProps,
  ConnectModal,
  ConnectModalProps,
} from './modals';
import { Connector, Dapp, Network } from './types';
import {
  UseConnectorConfig,
  useConnectorConfig,
} from './utils/useConnectorConfig';

/**
 * Exports for ContractKit.
 */
export interface UseContractKit
  extends Omit<UseConnectorConfig, 'connector' | 'connectionCallback'> {
  dapp: Dapp;
  kit: ContractKit;
  walletType: WalletTypes;

  /**
   * Name of the account.
   */
  account: string | null;

  /**
   * Helper function for handling any interaction with a Celo wallet. Perform action will
   * - open the action modal
   * - handle multiple transactions in order
   */
  performActions: (
    ...operations: ((kit: ContractKit) => unknown | Promise<unknown>)[]
  ) => Promise<unknown[]>;

  /**
   * Whether or not the connector has been fully loaded.
   */
  initialised: boolean;
  /**
   * Initialisation error, if applicable.
   */
  initError: Error | null;

  /**
   * Gets the connected instance of ContractKit.
   * If the user is not connected, this opens up the connection modal.
   */
  getConnectedKit: () => Promise<ContractKit>;
}

interface UseContractKitInternal
  extends UseContractKit,
    Pick<UseConnectorConfig, 'connectionCallback'> {
  initConnector: (connector: Connector) => Promise<{
    connector: Connector | null;
    error: Error | null;
  }>;
  pendingActionCount: number;
}

type DappInput = Omit<Dapp, 'icon'> & Partial<Pick<Dapp, 'icon'>>;

/**
 * State of useKit.
 */
interface UseKitState {
  networks?: Network[];
  dapp: DappInput;
}

const DEFAULT_KIT_STATE = {
  networks: DEFAULT_NETWORKS,
  dapp: {
    name: 'Celo dApp',
    description: 'Celo dApp',
    url: 'https://celo.org',
  },
};

const useKit = ({
  networks = DEFAULT_NETWORKS,
  dapp: dappInput,
}: UseKitState = DEFAULT_KIT_STATE): UseContractKitInternal => {
  const [dapp] = useState<Required<Dapp>>({
    name: dappInput.name,
    description: dappInput.description,
    icon: dappInput.icon ?? `${dappInput.url}/favicon.ico`,
    url: dappInput.url,
  });
  const connectorConfig = useConnectorConfig({ networks });

  const [pendingActionCount, setPendingActionCount] = useState(0);

  // Initialisation error state management
  const [initError, setInitError] = useState<Error | null>(null);
  const initConnector = useCallback(
    async (
      nextConnector: Connector
    ): Promise<{
      connector: Connector | null;
      error: Error | null;
    }> => {
      try {
        const connector = await nextConnector.initialise();
        setInitError(null);
        return { connector, error: null };
      } catch (e) {
        console.error(
          '[use-contractkit] Error initializing connector',
          nextConnector.type,
          e
        );
        setInitError(e);
        return { connector: null, error: e as Error };
      }
    },
    []
  );

  const { connector, connect } = connectorConfig;
  const getConnectedKit = useCallback(async () => {
    let initialisedConnection = connector;
    if (connector.type === WalletTypes.Unauthenticated) {
      initialisedConnection = await connect();
    } else if (!initialisedConnection.initialised) {
      await initConnector(initialisedConnection);
    }

    return initialisedConnection.kit;
  }, [connect, connector, initConnector]);

  const performActions = useCallback(
    async (
      ...operations: ((kit: ContractKit) => unknown | Promise<unknown>)[]
    ) => {
      const kit = await getConnectedKit();

      setPendingActionCount(operations.length);
      const results: unknown[] = [];
      for (const op of operations) {
        try {
          results.push(await op(kit));
        } catch (e) {
          setPendingActionCount(0);
          throw e;
        }

        setPendingActionCount((c) => c - 1);
      }
      return results;
    },
    [getConnectedKit]
  );

  return {
    ...connectorConfig,
    dapp,

    kit: connector.kit,
    walletType: connector.type,
    account: connector.account,
    initialised: connector.initialised,

    performActions,
    getConnectedKit,

    initError,

    // private
    initConnector,
    pendingActionCount,
  };
};

const KitState = createContainer<UseContractKitInternal, UseKitState>(useKit);

export const useContractKit: Container<
  UseContractKit,
  UseKitState
>['useContainer'] = KitState.useContainer;

/**
 * UseContractKit with internal methods exposed. Package use only.
 */
export const useInternalContractKit: Container<
  UseContractKitInternal,
  UseKitState
>['useContainer'] = KitState.useContainer;

interface ContractKitProviderProps {
  children: ReactNode;
  dapp: DappInput;
  networks?: Network[];

  connectModal?: ConnectModalProps;
  actionModal?: {
    reactModalProps?: Partial<ReactModal.Props>;
    render?: (props: ActionModalProps) => ReactNode;
  };
}

export const ContractKitProvider: React.FC<ContractKitProviderProps> = ({
  children,
  connectModal,
  actionModal,
  dapp,
  networks,
}: ContractKitProviderProps) => {
  return (
    <KitState.Provider initialState={{ networks, dapp }}>
      <ConnectModal {...connectModal} />
      <ActionModal {...actionModal} />

      {children}
    </KitState.Provider>
  );
};
