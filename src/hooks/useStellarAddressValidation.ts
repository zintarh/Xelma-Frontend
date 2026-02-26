import { useState, useEffect, useCallback, useRef } from 'react';
import {
  validateStellarAddress,
  type Network,
  type ValidationResult,
} from '../utils/validateStellarAddress';

export type ValidationState =
  | 'idle'
  | 'validating'
  | 'valid'
  | 'invalid-format'
  | 'wrong-network'
  | 'not-found'
  | 'network-error';

interface CacheEntry {
  result: ValidationResult;
  timestamp: number;
  network: Network;
}

// Cache with 5-minute TTL (300000 ms)
const CACHE_TTL = 5 * 60 * 1000;
const cache = new Map<string, CacheEntry>();

/**
 * Hook for validating Stellar addresses with debounce and caching
 * @param address - The Stellar address to validate
 * @param network - The network to validate against ('MAINNET' or 'TESTNET')
 * @param debounceMs - Debounce delay in milliseconds (default: 300ms)
 * @returns Object containing validation state and helper functions
 */
export function useStellarAddressValidation(
  address: string,
  network: Network,
  debounceMs: number = 300
) {
  const [state, setState] = useState<ValidationState>('idle');
  const [errorMessage, setErrorMessage] = useState<string>('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Clear cache when network changes
  useEffect(() => {
    cache.clear();
  }, [network]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  const validate = useCallback(
    async (addr: string, net: Network) => {
      // Cancel any pending validation
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }

      // Create new abort controller for this validation
      const controller = new AbortController();
      abortControllerRef.current = controller;

      // Normalize address (strip spaces, uppercase)
      const normalized = addr.trim().toUpperCase();

      // If empty, reset to idle
      if (!normalized) {
        setState('idle');
        setErrorMessage('');
        return;
      }

      // Check cache first
      const cacheKey = `${normalized}:${net}`;
      const cached = cache.get(cacheKey);

      if (cached) {
        const age = Date.now() - cached.timestamp;
        if (age < CACHE_TTL && cached.network === net) {
          // Cache hit - use cached result
          const result = cached.result;
          if (result.valid) {
            setState('valid');
            setErrorMessage('');
          } else {
            setState(result.error);
            setErrorMessage(getErrorMessage(result.error));
          }
          return;
        } else {
          // Cache expired, remove it
          cache.delete(cacheKey);
        }
      }

      // Set validating state
      setState('validating');
      setErrorMessage('');

      try {
        // Perform validation
        const result = await validateStellarAddress(normalized, net);

        // Check if validation was aborted
        if (controller.signal.aborted) {
          return;
        }

        // Cache the result
        cache.set(cacheKey, {
          result,
          timestamp: Date.now(),
          network: net,
        });

        // Update state based on result
        if (result.valid) {
          setState('valid');
          setErrorMessage('');
        } else {
          setState(result.error);
          setErrorMessage(getErrorMessage(result.error));
        }
      } catch (error) {
        // Check if validation was aborted
        if (controller.signal.aborted) {
          return;
        }

        // Network or other error
        setState('network-error');
        setErrorMessage(
          'Network error. Please check your connection and try again.'
        );
      }
    },
    []
  );

  // Debounced validation effect
  useEffect(() => {
    // Clear existing timer
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    // If address is empty, reset immediately
    if (!address.trim()) {
      setState('idle');
      setErrorMessage('');
      return;
    }

    // Set debounce timer
    debounceTimerRef.current = setTimeout(() => {
      validate(address, network);
    }, debounceMs);

    // Cleanup function
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [address, network, debounceMs, validate]);

  // Helper function to get error message
  const getErrorMessage = (error: ValidationResult['error']): string => {
    switch (error) {
      case 'invalid-format':
        return 'Invalid Stellar address format. Address must be 56 characters and valid Base32.';
      case 'wrong-network':
        return `Address doesn't match selected network. Please use a ${network === 'MAINNET' ? 'Mainnet' : 'Testnet'} address.`;
      case 'not-found':
        return 'Account not found on the selected network.';
      case 'network-error':
        return 'Network error. Please check your connection and try again.';
      default:
        return '';
    }
  };

  // Check if address is valid
  const isValid = state === 'valid';

  // Check if validation is in progress
  const isValidating = state === 'validating';

  return {
    state,
    isValid,
    isValidating,
    errorMessage,
    // Manual validation trigger (useful for form submission)
    validate: () => validate(address, network),
  };
}