"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface TwoFASetupProps {
  onClose: () => void;
  mode: 'enable' | 'disable';
}

export function TwoFASetup({ onClose, mode }: TwoFASetupProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [qrCodeData, setQrCodeData] = useState<string | null>(null);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [secret, setSecret] = useState<string | null>(null);
  const [step, setStep] = useState(mode === 'enable' ? 1 : 2); // Step 1: QR Code, Step 2: Verify Code

  const { enable2FA, disable2FA } = useAuth();

  // Generate QR code image when qrCodeData is available
  useEffect(() => {
    const generateQRCode = async () => {
      if (qrCodeData && typeof window !== 'undefined') {
        try {
          // Use a simple canvas approach to generate QR code
          // For production, you'd want to use a proper QR code library
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          if (!ctx) return;

          // Simple QR code placeholder - in production use QRCode.js or similar
          canvas.width = 200;
          canvas.height = 200;
          
          // Fill white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, 200, 200);
          
          // For now, let's use a QR code API service
          const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(qrCodeData)}`;
          setQrCodeImage(qrApiUrl);
        } catch (error) {
          console.error('Failed to generate QR code:', error);
        }
      }
    };

    generateQRCode();
  }, [qrCodeData]);

  const handleEnable2FA = async () => {
    if (step === 1) {
      setIsLoading(true);
      setError("");

      try {
        // First call to get QR code
        const result = await enable2FA();
        if (result.success) {
          setQrCodeData(result.qrCode || null);
          setSecret(result.secret || null);
          setStep(2);
        } else {
          setError(result.message || "Failed to enable 2FA.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    } else if (step === 2) {
      if (!code || code.length !== 6) {
        setError("Please enter a valid 6-digit code.");
        return;
      }

      setIsLoading(true);
      setError("");

      try {
        // Second call with verification code
        const result = await enable2FA(code);
        if (result.success) {
          onClose();
        } else {
          setError(result.message || "Failed to verify 2FA code.");
        }
      } catch (err) {
        setError("An unexpected error occurred.");
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleDisable2FA = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit code to disable 2FA.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      const result = await disable2FA(code);
      if (result.success) {
        onClose();
      } else {
        setError(result.message || "Failed to disable 2FA.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async () => {
    if (mode === 'enable') {
      await handleEnable2FA();
    } else {
      await handleDisable2FA();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="fixed inset-0 bg-custom-back-1 bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-custom-back rounded-xl p-4 md:p-10 w-full max-w-lg flex flex-col justify-center mx-2">
        {mode === 'enable' && step === 1 ? (
          <div className="flex justify-center mb-3">
            <a href="../">
              <img 
                src="https://cdn.keyauth.cc/v3/imgs/KeyauthBanner.png" 
                alt="KeyAuth Logo" 
                className="h-12 md:h-20 w-auto"
              />
            </a>
          </div>
        ) : mode === 'enable' && step === 2 && qrCodeImage ? (
          <div className="flex justify-center mb-3">
            <div className="bg-white p-4 rounded-lg">
              <img src={qrCodeImage} alt="QR Code" className="w-32 h-32 md:w-40 md:h-40" />
            </div>
          </div>
        ) : (
          <div className="flex justify-center mb-3">
            <a href="../">
              <img 
                src="https://cdn.keyauth.cc/v3/imgs/KeyauthBanner.png" 
                alt="KeyAuth Logo" 
                className="h-12 md:h-20 w-auto"
              />
            </a>
          </div>
        )}

        <div className="absolute top-4 right-4">
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {!(mode === 'enable' && step === 2 && qrCodeImage) && (
          <div className="flex justify-center mb-6">
            <div className="bg-blue-500/10 rounded-full p-6">
              <svg 
                className="w-16 h-16 text-blue-500" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth="2" 
                  d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                />
              </svg>
            </div>
          </div>
        )}

        {mode === 'enable' && step === 1 ? (
          <>
            <h2 className="mb-3 text-2xl md:text-3xl text-center font-bold text-white">
              Enable Two-Factor Authentication
            </h2>
            <p className="mb-8 text-sm md:text-base text-center font-normal text-gray-300">
              Secure your account with an additional layer of protection
            </p>
            <div className="text-center">
              <button
                onClick={handleEnable2FA}
                disabled={isLoading}
                className="cursor-pointer text-white hover:bg-blue-700 hover:text-white-500 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center mb-3 w-full bg-custom-back-1 disabled:opacity-50"
              >
                <span className="inline-flex">
                  {isLoading ? 'Generating...' : 'Generate QR Code'}
                  {!isLoading && (
                    <svg 
                      className="w-3.5 h-3.5 ml-2 mt-1" 
                      aria-hidden="true" 
                      fill="none" 
                      viewBox="0 0 14 10"
                    >
                      <path 
                        stroke="currentColor" 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth="2" 
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          </>
        ) : mode === 'enable' && step === 2 ? (
          <>
            <h2 className="mb-3 text-2xl md:text-3xl text-center font-bold text-white">
              Scan QR Code
            </h2>
            <p className="mb-4 text-sm md:text-base text-center font-normal text-gray-300">
              Scan the QR code above with your authenticator app
            </p>
            
            {secret && (
              <div className="mb-6 p-4 bg-gray-800/50 rounded-lg border border-gray-700">
                <p className="text-xs text-gray-400 mb-2 text-center">Or enter this secret manually:</p>
                <code className="block bg-gray-900 text-green-400 px-3 py-2 rounded text-sm break-all text-center font-mono">
                  {secret}
                </code>
              </div>
            )}

            <p className="mb-8 text-sm text-center font-normal text-gray-300">
              Then enter the 6-digit code from your authenticator app
            </p>
          </>
        ) : (
          <>
            <h2 className="mb-3 text-2xl md:text-3xl text-center font-bold text-white">
              Disable Two-Factor Authentication
            </h2>
            <p className="mb-8 text-sm md:text-base text-center font-normal text-gray-300">
              Enter your current 2FA code to disable two-factor authentication
            </p>
          </>
        )}

        {(step === 2 || mode === 'disable') && (
          <form 
            className="space-y-6 flex-1" 
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="relative">
              <input 
                type="text" 
                id="twoFactorCode" 
                className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white-900 bg-transparent rounded-lg border-1 border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer text-center text-2xl tracking-widest" 
                placeholder=" " 
                autoComplete="off" 
                maxLength={6} 
                pattern="[0-9]{6}" 
                inputMode="numeric" 
                required 
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                onKeyPress={handleKeyPress}
                disabled={isLoading}
              />
              <label 
                htmlFor="twoFactorCode" 
                className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-lbl px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
              >
                Authentication Code
              </label>
            </div>

            <div className="space-y-4">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isLoading || code.length !== 6}
                className="bg-custom-back-1 cursor-pointer text-white hover:!bg-blue-600 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center w-full disabled:opacity-50"
              >
                <span className="inline-flex">
                  {isLoading 
                    ? (mode === 'enable' ? 'Enabling...' : 'Disabling...') 
                    : (mode === 'enable' ? 'Enable 2FA' : 'Disable 2FA')
                  }
                  {!isLoading && (
                    <svg
                      className="w-3.5 h-3.5 ml-2 mt-1"
                      aria-hidden="true"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 14 10"
                    >
                      <path
                        stroke="currentColor"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M1 5h12m0 0L9 1m4 4L9 9"
                      />
                    </svg>
                  )}
                </span>
              </button>
              
              <button
                type="button"
                onClick={onClose}
                disabled={isLoading}
                className="bg-custom-back-1 cursor-pointer text-white hover:!bg-blue-600 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center w-full disabled:opacity-50"
              >
                <span className="inline-flex">
                  Cancel
                  <svg
                    className="w-3.5 h-3.5 ml-2 mt-1 rotate-180"
                    aria-hidden="true"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 14 10"
                  >
                    <path
                      stroke="currentColor"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M1 5h12m0 0L9 1m4 4L9 9"
                    />
                  </svg>
                </span>
              </button>
            </div>
          </form>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {(step === 2 || mode === 'disable') && (
          <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <p className="text-xs text-gray-300 text-center">
              <strong>Tip:</strong> Make sure your device time is synced correctly. If you're having trouble, contact support.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}