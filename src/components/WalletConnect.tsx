import { useEffect } from 'react';
import { useWalletStore } from '../store/useWalletStore';
import { useAuthStore } from '../store/useAuthStore';
import { Loader2, AlertCircle, LogOut, Wallet, ShieldCheck } from 'lucide-react';
import clsx from 'clsx';


const WalletConnect = () => {
    const {
        publicKey,
        balance,
        network,
        isConnecting,
        connect,
        disconnect,
        checkConnection
    } = useWalletStore();
    const { isAuthenticated } = useAuthStore();

    useEffect(() => {
        checkConnection();
    }, [checkConnection]);



    const shortAddress = publicKey
        ? `${publicKey.slice(0, 4)}...${publicKey.slice(-4)}`
        : '';

    if (publicKey) {
        return (
            <div className="flex items-center gap-3">
                {network !== 'TESTNET' && (
                    <div className="hidden md:flex items-center text-red-500 text-sm font-medium bg-red-50 dark:bg-red-900/20 px-2 py-1 rounded">
                        <AlertCircle className="w-4 h-4 mr-1" />
                        Testnet Only
                    </div>
                )}

                <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white dark:bg-gray-800 border border-[#BEC7FE] dark:border-gray-700 rounded-lg shadow-sm">
                    <span className="text-sm font-semibold text-[#4D4D4D] dark:text-gray-300">
                        {balance}
                    </span>
                </div>

                <div className="flex items-center gap-2 p-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg pr-3 relative group">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 flex items-center justify-center text-white text-xs">
                        <Wallet className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-200">
                        {shortAddress}
                    </span>
                    {isAuthenticated && (
                        <ShieldCheck className="w-4 h-4 text-green-500" aria-label="Authenticated with backend" />
                    )}

                    <button
                        onClick={disconnect}
                        className="absolute top-full right-0 mt-2 w-full min-w-[120px] bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-lg shadow-lg py-2 px-3 flex items-center gap-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                        <LogOut className="w-4 h-4" />
                        <span className="text-sm cursor-pointer">Disconnect</span>
                    </button>
                </div>
            </div>
        );
    }

    return (
        <button
            onClick={connect}
            disabled={isConnecting}
            className={clsx(
                "flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all duration-200 cursor-pointer",
                "bg-[#2C4BFD] hover:bg-[#1a3bf0] text-white shadow-lg shadow-blue-500/20",
                "disabled:opacity-70 disabled:cursor-not-allowed"
            )}
        >
            {isConnecting ? (
                <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Connecting...</span>
                </>
            ) : (
                <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet</span>
                </>
            )}
        </button>
    );
};

export default WalletConnect;
