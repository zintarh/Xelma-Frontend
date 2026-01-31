import { create } from 'zustand';
import {
  isConnected,
  requestAccess,
  getAddress,
  getNetwork,
} from '@stellar/freighter-api';
import { toast } from 'sonner';

interface WalletState {
  publicKey: string | null;
  network: string | null;
  balance: string | null;
  isConnecting: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
  checkConnection: () => Promise<void>;
}

export const useWalletStore = create<WalletState>((set) => ({
  publicKey: null,
  network: null,
  balance: null,
  isConnecting: false,

  connect: async () => {
    try {
      set({ isConnecting: true });

      let connected = false;
      for (let i = 0; i < 5; i++) {
        const { isConnected: isFreighterConnected } = await isConnected();
        if (isFreighterConnected) {
          connected = true;
          break;
        }
        await new Promise(resolve => setTimeout(resolve, 100));
      }

      if (!connected) {
        toast.error('Freighter wallet not installed!');
        set({ isConnecting: false });
        return;
      }

      const timeoutPromise = new Promise<{ address: string; error?: string }>((_, reject) => {
        setTimeout(() => reject(new Error("Connection timed out")), 30000); // 30 seconds timeout
      });

      const { address, error } = await Promise.race([
        requestAccess(),
        timeoutPromise
      ]);

      if (error) {
        throw new Error(error.toString());
      }

      if (!address) {
        throw new Error('User denied access');
      }

      const { network } = await getNetwork();

      if (network !== 'TESTNET') {
        toast.error('Please switch to Stellar Testnet in Freighter');
      }

      let formattedBalance = '0.00 XLM';
      try {
        const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
        if (response.status === 404) {
          formattedBalance = '0.00 XLM';
        } else if (!response.ok) {
          throw new Error('Failed to fetch account data');
        } else {
          const data = await response.json();
          const balances = data.balances;
          const nativeBalance = balances.find((b: any) => b.asset_type === 'native');

          if (nativeBalance) {
            formattedBalance = `${parseFloat(nativeBalance.balance).toFixed(2)} XLM`;
          }
        }
      } catch (err) {
        console.error('Failed to fetch balance:', err);
        toast.error("Failed to fetch wallet balance");

        set({ isConnecting: false });
        return;
      }

      set({
        publicKey: address,
        network: (network as string | null) || null,
        balance: formattedBalance,
        isConnecting: false
      });

      toast.success('Wallet connected!');
    } catch (error) {
      console.error('Connection error:', error);
      toast.error('Failed to connect wallet');
      set({ isConnecting: false });
    }
  },

  disconnect: () => {
    set({ publicKey: null, network: null, balance: null });
    toast.success('Wallet disconnected');
  },

  checkConnection: async () => {
    try {
      const { isConnected: connected } = await isConnected();
      if (connected) {
        // use getAddress to check if we still have access without prompting
        const { address } = await getAddress();

        if (address) {
          const { network } = await getNetwork();

          let formattedBalance = '0.00 XLM';
          try {
            const response = await fetch(`https://horizon-testnet.stellar.org/accounts/${address}`);
            if (response.status === 404) {
              formattedBalance = '0.00 XLM';
            } else if (!response.ok) {
              throw new Error("Fetch failed");
            } else {
              const data = await response.json();
              const balances = data.balances;
              const nativeBalance = balances.find((b: any) => b.asset_type === 'native');

              if (nativeBalance) {
                formattedBalance = `${parseFloat(nativeBalance.balance).toFixed(2)} XLM`;
              }
            }
          } catch (err) {
            console.error('Failed to check balance:', err);
            toast.error("Failed to fetch wallet balance");
            return;
          }

          set({
            publicKey: address,
            network: (network as string | null) || null,
            balance: formattedBalance
          });
        }
      }
    } catch (e) {
      
    }
  }
}));
