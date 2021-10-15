import { CeloTx } from '@celo/connect';
import { ContractKit } from '@celo/contractkit';
import {
  AccountAuthRequest,
  AccountAuthResponseSuccess,
  DappKitRequestMeta,
  DappKitRequestTypes,
  DappKitResponseStatus,
  DAPPKIT_BASE_HOST,
  parseDappkitResponseDeeplink,
  serializeDappKitRequestDeeplink,
  SignTxRequest,
  SignTxResponseSuccess,
  TxToSignParam,
} from '@celo/utils';
import { WalletTypes } from '../constants';

import Linking from './linking';

export {
  AccountAuthRequest,
  DappKitRequestMeta,
  serializeDappKitRequestDeeplink,
  SignTxRequest,
} from '@celo/utils';

const CELO_DANCE_HOST = 'celo://wallet/dappkit/celodance';

export const valoraLocalStorageKey = 'use-contractkit/dappkit';
// hack to get around deeplinking issue where new tabs are opened
// and the url hash state is not respected (Note this implementation
// of dappkit doesn't use URL hashes to always force the newtab experience).
const checkUrlValora = (onTrue?: () => any) => {
  if (typeof window !== 'undefined') {
    const nonHashUrl = window.location.href.replace('/#', '');
    const params = new URL(nonHashUrl).searchParams;
    if (params.get('type') && params.get('requestId')) {
      localStorage.setItem(valoraLocalStorageKey, nonHashUrl);
      onTrue && onTrue();
    }
  }
};

if (typeof window !== 'undefined') {
  checkUrlValora(window.close);
}

function clearParams() {
  const whereQuery = window.location.href.indexOf('?');
  if (whereQuery) {
    window.location.href = window.location.href.substring(0, whereQuery);
  }
}

async function waitForResponse() {
  for (;;) {
    let value = localStorage.getItem(valoraLocalStorageKey);
    if (!value) {
      checkUrlValora(clearParams);
      value = localStorage.getItem(valoraLocalStorageKey);
    }
    if (value) {
      return value;
    }
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
}

export async function waitForAccountAuth(
  requestId: string
): Promise<AccountAuthResponseSuccess> {
  const url = await waitForResponse();
  const dappKitResponse = parseDappkitResponseDeeplink(url);
  if (
    requestId === dappKitResponse.requestId &&
    dappKitResponse.type === DappKitRequestTypes.ACCOUNT_ADDRESS &&
    dappKitResponse.status === DappKitResponseStatus.SUCCESS
  ) {
    return dappKitResponse;
  }

  throw new Error('Unable to parse Valora response');
}

export async function waitForSignedTxs(
  requestId: string
): Promise<SignTxResponseSuccess> {
  const url = await waitForResponse();

  const dappKitResponse = parseDappkitResponseDeeplink(url);
  if (
    requestId === dappKitResponse.requestId &&
    dappKitResponse.type === DappKitRequestTypes.SIGN_TX &&
    dappKitResponse.status === DappKitResponseStatus.SUCCESS
  ) {
    return dappKitResponse;
  }

  console.warn('Unable to parse url', url);
  throw new Error('Unable to parse Valora response');
}

export function requestAccountAddress(meta: DappKitRequestMeta): void {
  localStorage.removeItem(valoraLocalStorageKey);

  const deepLink = serializeDappKitRequestDeeplink(AccountAuthRequest(meta));
  if (meta.requestId.endsWith(WalletTypes.CeloDance)) {
    Linking.openURL(deepLink.replace(DAPPKIT_BASE_HOST, CELO_DANCE_HOST));
  } else {
    Linking.openURL(deepLink);
  }
}

export async function requestTxSig(
  kit: ContractKit,
  txParams: CeloTx[],
  meta: DappKitRequestMeta
): Promise<void> {
  localStorage.removeItem(valoraLocalStorageKey);

  const baseNonce = await kit.connection.nonce(txParams[0]?.from as string);
  const txs = txParams.map((txParam: CeloTx, index: number) => {
    const value = txParam.value === undefined ? '0' : txParam.value;
    return {
      txData: txParam.data,
      estimatedGas: txParam.gas ?? 150000,
      nonce: baseNonce + index,
      feeCurrencyAddress: undefined,
      value,
      ...txParam,
    } as unknown as TxToSignParam;
  });

  const request = SignTxRequest(txs, meta);
  const deepLink = serializeDappKitRequestDeeplink(request);
  if (meta.requestId.endsWith(WalletTypes.CeloDance)) {
    Linking.openURL(deepLink.replace(DAPPKIT_BASE_HOST, CELO_DANCE_HOST));
  } else {
    Linking.openURL(deepLink);
  }
}
