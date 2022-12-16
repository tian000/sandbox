import { PhantomInjectedProvider, TLog } from '../types';
import { PublicKey } from '@solana/web3.js';

// MULTI-CHAIN PROVIDER TIP: Connect using the ethereum provider first for the best experience
// use onlyIfTrusted on the solana connect request so we don't double pop up.
export const connect = async ({ solana, ethereum }: PhantomInjectedProvider, createLog: (log: TLog) => void) => {
  try {
    const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
    createLog({
      providerType: 'ethereum',
      status: 'success',
      method: 'eth_requestAccounts',
      message: `Connected to account ${accounts[0]}`,
    });
  } catch (error) {
    createLog({
      providerType: 'ethereum',
      status: 'error',
      method: 'eth_requestAccounts',
      message: error.message,
    });
  }

  try {
    await solana.connect({ onlyIfTrusted: true });
  } catch (error) {
    createLog({
      providerType: 'solana',
      status: 'error',
      method: 'connect',
      message: error.message,
    });
  }
};

// Similar to solana.connect({onlyIfTrusted: true}) but for multi-chain
// MULTI-CHAIN PROVIDER TIP: Must use the solana provider first, and only the call eth provider if the solana call is successful
export const silentlyConnect = async (
  {
    solana,
    ethereum,
  }: PhantomInjectedProvider,
  createLog: (log: TLog) => void,
) => {
  let solanaPubKey: { publicKey: PublicKey } | undefined;
  try {
    solanaPubKey = await solana.connect({ onlyIfTrusted: true });
  } catch (error) {
    createLog({
      providerType: 'solana',
      status: 'error',
      method: 'connect',
      message: 'encountered error while silent connecting: ' + error.message,
    });
  }

  if (solanaPubKey) {
    try {
      const accounts = await ethereum.request({ method: 'eth_requestAccounts' });
      createLog({
        providerType: 'ethereum',
        status: 'success',
        method: 'eth_requestAccounts',
        message: `Connected to account ${accounts[0]}`,
      });
    } catch (error) {
      createLog({
        providerType: 'ethereum',
        status: 'error',
        method: 'eth_requestAccounts',
        message: 'encountered error while silent connecting: ' + error.message,
      });
    }
  }
};