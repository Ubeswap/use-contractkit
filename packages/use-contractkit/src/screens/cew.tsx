import React, { useCallback, useEffect } from 'react';
import Loader from 'react-loader-spinner';

import { CeloExtensionWalletConnector } from '../connectors';
import { useInternalContractKit } from '../use-contractkit';
import { ConnectorProps } from '.';

export const CeloExtensionWallet: React.FC<ConnectorProps> = ({
  onSubmit,
}: ConnectorProps) => {
  const { network, initConnector, initError: error } = useInternalContractKit();

  const initialiseConnection = useCallback(async () => {
    const connector = new CeloExtensionWalletConnector(network);
    await initConnector(connector);
    void onSubmit(connector);
  }, [initConnector, network, onSubmit]);

  useEffect(() => {
    void initialiseConnection();
  }, [initialiseConnection]);

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      {error ? (
        <p
          style={{
            paddingBottom: '0.25em',
            paddingTop: '0.75em',
            fontSize: '0.7em',
            color: 'red',
          }}
        >
          {error.message}
        </p>
      ) : (
        <Loader type="TailSpin" color="white" height="36px" width="36px" />
      )}
    </div>
  );
};
