import React, { useState } from 'react';
import Loader from 'react-loader-spinner';

import { LedgerConnector } from '../connectors';
import { images } from '../constants';
import { useInternalContractKit } from '../use-contractkit';
import { ConnectorProps } from '.';

export const Ledger: React.FC<ConnectorProps> = ({
  onSubmit,
}: ConnectorProps) => {
  const { network, initConnector, initError: error } = useInternalContractKit();
  const [submitting, setSubmitting] = useState(false);
  const [index, setIndex] = useState('0');

  const submit = async () => {
    setSubmitting(true);
    const connector = new LedgerConnector(network, parseInt(index, 10));
    const { error } = await initConnector(connector);
    if (!error) {
      await onSubmit(connector);
    }
    setSubmitting(false);
  };

  return (
    <div className="tw-p-2">
      <div>
        <div className="tw-flex">
          <div className="tw-mr-4">
            <images.Ledger style={{ height: '36px', minWidth: '36px' }} />
          </div>

          <div className="tw-flex tw-flex-col">
            <div className="tw-text-lg tw-mb-1 tw-font-medium dark:tw-text-gray-200">
              Ledger Connect
            </div>
            <p className="tw-text-sm tw-text-gray-600 dark:tw-text-gray-400">
              Securely connect to your ledger device. Before proceeding, please
              ensure you have:
              <ul className="tw-list-disc tw-list-inside tw-mt-2">
                <li>Connected your Ledger (via USB)</li>
                <li>Unlocked your Ledger</li>
                <li>
                  Opened the{' '}
                  <a
                    href="https://docs.celo.org/celo-owner-guide/ledger"
                    target="_blank"
                    rel="noreferrer"
                  >
                    Celo application
                  </a>{' '}
                </li>
              </ul>
            </p>
            {error && (
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
            )}

            <p className="tw-text-sm tw-text-gray-600 dark:tw-text-gray-400 tw-mt-2">
              Connect to account at index{' '}
              <input
                type="number"
                className="tw-ml-1 tw-text-gray-700 dark:tw-text-gray-300 tw-outline-none focus:tw-outline-none"
                style={{ width: '40px', background: 'unset' }}
                value={index}
                onChange={(e) => setIndex(e.target.value)}
              />
            </p>

            <button
              className="tw-mt-4 tw-px-4 tw-py-2 tw-border tw-border-transparent tw-rounded-md tw-shadow-sm tw-text-base tw-font-medium tw-text-white tw-bg-gradient-to-r tw-from-purple-600 tw-to-indigo-600 hover:tw-from-purple-700 hover:tw-to-indigo-700"
              onClick={submit}
            >
              {submitting ? (
                <div className="tw-flex tw-items-center tw-justify-center">
                  <Loader
                    type="TailSpin"
                    color="white"
                    height={18}
                    width={18}
                  />
                </div>
              ) : (
                'Connect'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
