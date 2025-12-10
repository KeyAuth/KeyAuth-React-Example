"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { TwoFALogin } from "./TwoFALogin";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [license, setLicense] = useState("");
  const [upgradeUsername, setUpgradeUsername] = useState("");
  const [upgradeLicense, setUpgradeLicense] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [showTwoFA, setShowTwoFA] = useState(false);
  const [activeTab, setActiveTab] = useState<'login' | 'upgrade' | 'license'>('login');
  const [twoFAData, setTwoFAData] = useState<{
    username: string;
    password: string;
    license?: string;
    loginType: 'login' | 'license';
  } | null>(null);

  const { login, register, licenseAuth, upgrade } = useAuth();

  const handleLogin = async () => {
    if (!username || !password) {
      setError("Username and password are required for login.");
      return;
    }

    setError("");
    setSuccess("");
    const result = await login(username, password);

    if (result.success) {
      window.location.href = "/dashboard";
    } else if (result.needsTwoFA) {
      setTwoFAData({ username, password, loginType: 'login' });
      setShowTwoFA(true);
    } else {
      setError(result.message || "Login failed.");
    }
  };

  const handleRegister = async () => {
    if (!username || !password || !license) {
      setError("Username, password, and license are required for register.");
      return;
    }

    setError("");
    setSuccess("");
    const result = await register(username, password, license);

    if (result.success) {
      window.location.href = "/dashboard";
    } else {
      setError(result.message || "Registration failed.");
    }
  };

  const handleLicenseAuth = async () => {
    if (!license) {
      setError("License is required for license auth.");
      return;
    }

    setError("");
    setSuccess("");
    const result = await licenseAuth(license);

    if (result.success) {
      window.location.href = "/dashboard";
    } else if (result.needsTwoFA) {
      setTwoFAData({ username: '', password: '', license, loginType: 'license' });
      setShowTwoFA(true);
    } else {
      setError(result.message || "License authentication failed.");
    }
  };

  const handleUpgrade = async () => {
    if (!upgradeUsername || !upgradeLicense) {
      setError("Username and license are required for upgrade.");
      return;
    }

    setError("");
    setSuccess("");
    const result = await upgrade(upgradeUsername, upgradeLicense);

    if (result.success) {
      setSuccess(result.message || "Account upgraded successfully!");
      setUpgradeUsername("");
      setUpgradeLicense("");
    } else {
      setError(result.message || "Upgrade failed.");
    }
  };

  const handleBackFromTwoFA = () => {
    setShowTwoFA(false);
    setTwoFAData(null);
  };

  if (showTwoFA && twoFAData) {
    return (
      <TwoFALogin
        username={twoFAData.username}
        password={twoFAData.password}
        license={twoFAData.license}
        loginType={twoFAData.loginType}
        onBack={handleBackFromTwoFA}
      />
    );
  }

  return (
    <section className="flex items-center justify-center min-h-screen">
      <div className="bg-custom-back rounded-xl p-4 md:p-10 w-full max-w-lg flex flex-col justify-center mx-2">
        <div className="flex justify-center mb-3">
          <a href="../">
            <img
              src="https://cdn.keyauth.cc/v3/imgs/KeyauthBanner.png"
              alt="KeyAuth Logo"
              className="h-12 md:h-20 w-auto"
            />
          </a>
        </div>

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex bg-custom-back-1 rounded-lg p-1">
            <button
              type="button"
              onClick={() => { setActiveTab('login'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'login'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              User/Pass
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('upgrade'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'upgrade'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Upgrade
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('license'); setError(''); setSuccess(''); }}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-md transition-colors ${
                activeTab === 'license'
                  ? 'bg-blue-600 text-white'
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              License
            </button>
          </div>
        </div>

        <form
          className="space-y-4 md:space-y-6 flex-1"
          onSubmit={(e) => e.preventDefault()}
        >
          {/* Login/Register Tab */}
          {activeTab === 'login' && (
            <>
              <div className="relative">
                <input
                  id="username"
                  type="text"
                  name="username"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white-900 bg-transparent rounded-lg border-1 border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  autoComplete="on"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                />
                <label
                  htmlFor="username"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-lbl px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Username
                </label>
              </div>

              <div className="relative">
                <input
                  id="password"
                  type="password"
                  name="password"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white-900 bg-transparent rounded-lg border-1 border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <label
                  htmlFor="password"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-lbl px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Password
                </label>
              </div>

              <div className="relative">
                <input
                  id="license-key"
                  type="text"
                  name="license-key"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white-900 bg-transparent rounded-lg border-1 border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                />
                <label
                  htmlFor="license-key"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-lbl px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  License Key (for register)
                </label>
              </div>

              <div className="flex flex-col space-y-3">
                <button
                  onClick={handleLogin}
                  className="bg-custom-back-1 cursor-pointer text-white hover:!bg-blue-600 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center w-full"
                >
                  <span className="inline-flex">
                    Login
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
                  </span>
                </button>
                <button
                  onClick={handleRegister}
                  className="bg-custom-back-1 cursor-pointer text-white hover:!bg-blue-600 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center w-full"
                >
                  <span className="inline-flex">
                    Register
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
                  </span>
                </button>
              </div>
            </>
          )}

          {/* Upgrade Tab */}
          {activeTab === 'upgrade' && (
            <>
              <div className="relative">
                <input
                  id="upgrade-username"
                  type="text"
                  name="upgrade-username"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white-900 bg-transparent rounded-lg border-1 border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  autoComplete="on"
                  required
                  value={upgradeUsername}
                  onChange={(e) => setUpgradeUsername(e.target.value)}
                />
                <label
                  htmlFor="upgrade-username"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-lbl px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  Username
                </label>
              </div>

              <div className="relative">
                <input
                  id="upgrade-license"
                  type="text"
                  name="upgrade-license"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white-900 bg-transparent rounded-lg border-1 border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                  value={upgradeLicense}
                  onChange={(e) => setUpgradeLicense(e.target.value)}
                />
                <label
                  htmlFor="upgrade-license"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-lbl px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  License Key
                </label>
              </div>

              <button
                onClick={handleUpgrade}
                className="bg-custom-back-1 cursor-pointer text-white hover:!bg-blue-600 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center w-full"
              >
                <span className="inline-flex">
                  Upgrade Account
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
                </span>
              </button>
            </>
          )}

          {/* License Tab */}
          {activeTab === 'license' && (
            <>
              <div className="relative">
                <input
                  id="license-only"
                  type="text"
                  name="license-only"
                  className="block px-2.5 pb-2.5 pt-4 w-full text-sm text-white-900 bg-transparent rounded-lg border-1 border-custom appearance-none focus:outline-none focus:ring-0 focus:border-blue-600 peer"
                  placeholder=" "
                  required
                  value={license}
                  onChange={(e) => setLicense(e.target.value)}
                />
                <label
                  htmlFor="license-only"
                  className="absolute text-sm text-gray-500 duration-300 transform -translate-y-4 scale-75 top-2 z-10 origin-[0] bg-custom-back-lbl px-2 peer-focus:px-2 peer-focus:text-blue-600 peer-placeholder-shown:scale-100 peer-placeholder-shown:-translate-y-1/2 peer-placeholder-shown:top-1/2 peer-focus:top-2 peer-focus:scale-75 peer-focus:-translate-y-4 left-1"
                >
                  License Key
                </label>
              </div>

              <button
                onClick={handleLicenseAuth}
                className="bg-custom-back-1 cursor-pointer text-white hover:!bg-blue-600 focus:ring-0 focus:outline-none transition duration-200 font-medium rounded-lg text-sm px-5 py-2.5 text-center items-center w-full"
              >
                <span className="inline-flex">
                  Login with License
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
                </span>
              </button>
            </>
          )}

          {error && (
            <div className="bg-red-500/10 border border-red-500/20 text-red-400 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-500/10 border border-green-500/20 text-green-400 px-4 py-3 rounded-lg text-sm">
              {success}
            </div>
          )}
        </form>
      </div>
    </section>
  );
}
