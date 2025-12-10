"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface TwoFALoginProps {
  username: string;
  password: string;
  license?: string;
  loginType: 'login' | 'license';
  onBack: () => void;
}

export function TwoFALogin({ username, password, license, loginType, onBack }: TwoFALoginProps) {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const { loginWith2FA, licenseAuthWith2FA } = useAuth();

  const handleSubmit = async () => {
    if (!code || code.length !== 6) {
      setError("Please enter a valid 6-digit 2FA code.");
      return;
    }

    setError("");
    setIsLoading(true);

    try {
      let result;
      if (loginType === 'login') {
        result = await loginWith2FA(username, password, code);
      } else {
        result = await licenseAuthWith2FA(license || "", code);
      }

      if (result.success) {
        window.location.href = "/dashboard";
      } else {
        setError(result.message || "2FA authentication failed.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="bg-custom-back rounded-xl p-4 md:p-10 w-full max-w-lg flex flex-col justify-center mx-2">
        {/* Logo Banner */}
        <div className="flex justify-center mb-3">
          <a href="../">
            <img 
              src="https://cdn.keyauth.cc/v3/imgs/KeyauthBanner.png" 
              alt="KeyAuth Logo" 
              className="h-12 md:h-20 w-auto"
            />
          </a>
        </div>

        {/* 2FA Icon */}
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

        <h2 className="mb-3 text-2xl md:text-3xl text-center font-bold text-white">
          Two-Factor Authentication
        </h2>
        <p className="mb-8 text-sm md:text-base text-center font-normal text-gray-300">
          Enter the 6-digit code from your authenticator app
        </p>

        {/* 2FA Form */}
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

          <button 
            type="button"
            onClick={handleSubmit}
            disabled={isLoading || code.length !== 6}
            className="cursor-pointer text-white hover:bg-blue-700 hover:text-white-500 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center mb-3 w-full bg-custom-back-1 disabled:opacity-50"
          >
            <span className="inline-flex">
              {isLoading ? 'Verifying...' : 'Verify & Continue'}
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

          <div className="text-center">
            <button
              type="button"
              onClick={onBack}
              disabled={isLoading}
              className="text-sm text-gray-400 hover:text-blue-500 transition-colors disabled:opacity-50"
            >
              ← Back to login
            </button>
          </div>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-sm text-red-400 text-center">{error}</p>
          </div>
        )}

        {/* Help Text */}
        <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
          <p className="text-xs text-gray-300 text-center">
            <strong>Tip:</strong> Make sure your device time is synced correctly. If you're having trouble, contact support.
          </p>
        </div>
      </div>
    </section>
  );
}