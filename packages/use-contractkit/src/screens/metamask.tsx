import React from 'react';
import Loader from 'react-loader-spinner';

import { SwitchNetworkButton } from '../components/SwitchNetworkButton';
import { useMetaMaskConnector } from '../connectors/useMetaMaskConnector';
import { ConnectorProps } from '.';

export const MetaMaskWallet: React.FC<ConnectorProps> = ({
  onSubmit,
}: ConnectorProps) => {
  const { error, dapp, network } = useMetaMaskConnector(onSubmit);
  console.log('metamask', network);

  if (!dapp.supportedNetworks.includes(network)) {
    return (
      <div className="tw-space-y-6">
        <p className="tw-text-xl tw-font-medium dark:tw-text-gray-200">
          Change network
        </p>
        <p className="tw-text-md tw-font-normal dark:tw-text-gray-200">
          In order to use {dapp.name} you must be connected to one of the
          following networks.{' '}
        </p>

        {dapp.supportedNetworks.map((n, i) => {
          return (
            <div key={i} className="tw-flex tw-justify-center">
              <SwitchNetworkButton chainId={n.chainId} />
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="tw-flex tw-items-center tw-justify-center">
      {error ? (
        <p className="tw-text-red-500 tw-pb-4">{error.message}</p>
      ) : (
        <div className="tw-my-8 tw-flex tw-items-center tw-justify-center">
          <Loader type="TailSpin" color="#666666" height="60px" width="60px" />
        </div>
      )}
    </div>
  );
};
