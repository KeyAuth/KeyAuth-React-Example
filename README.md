# KeyAuth React Example : Please star 🌟

KeyAuth React/Next.js TypeScript example application with full 2FA support for https://keyauth.cc license key API auth.

**Built with Next.js 14, React 18, TypeScript, and Tailwind CSS**

**Uses [bun](https://bun.sh) runtime for optimal performance - highly recommended over npm/yarn.**

## **Features**

- 🔐 **Complete Authentication System** - Login with username/password or license key
- 🛡️ **Two-Factor Authentication (2FA)** - Full 2FA support with QR code setup
- 🎨 **Modern UI** - Clean, responsive design matching KeyAuth branding
- ⚡ **Next.js 14** - Latest Next.js with App Router and server components
- 🔒 **Secure Session Management** - Cookie-based authentication with context
- 📱 **Mobile Responsive** - Works seamlessly on all device sizes
- 🚀 **TypeScript** - Full type safety throughout the application

## **Installation & Setup**

1. **Clone the repository**
   ```bash
   git clone https://github.com/KeyAuth/KeyAuth-React-Example.git
   cd KeyAuth-React-Example/keyauth-react
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Configure your KeyAuth application**
   
   Edit `src/credentials.ts` with your KeyAuth application details:
   ```typescript
    export const name: string = ""; // Application name
    export const ownerid: string = ""; // Owner ID
    export const url: string = "https://keyauth.win/api/1.3/"; // API URL (change if self-hosted)
   ```

4. **Run the development server**
   ```bash
   bun dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## **Bugs**

If you are using our example with no significant changes and having problems, please report bugs here: https://keyauth.cc/app/?page=forms

However, we do **NOT** provide support for adding KeyAuth to your project. If you can't figure this out, use Google or YouTube to learn more about React/Next.js development.

## **Application Structure**

```
src/
├── app/
│   ├── page.tsx              # Main login page
│   ├── dashboard/
│   │   └── page.tsx          # User dashboard
│   ├── layout.tsx            # Root layout
│   └── globals.css           # Global styles
├── components/
│   ├── Login.tsx             # Login component with 2FA support
│   ├── TwoFALogin.tsx        # 2FA verification component
│   └── TwoFASetup.tsx        # 2FA setup/disable modal
├── contexts/
│   └── AuthContext.tsx       # Authentication context provider
├── lib/
│   ├── keyauth.ts            # KeyAuth API client
│   └── cookies.ts            # Cookie management utilities
└── credentials.ts            # Application credentials
```

## **Authentication Features**

### **Standard Login**
Users can authenticate using username/password:

```typescript
// In your component
const { login, loading, error } = useAuth();

const handleLogin = async () => {
  await login(username, password);
};
```

### **License Key Authentication**
Direct authentication with license keys:

```typescript
const { licenseAuth } = useAuth();

const handleLicenseLogin = async () => {
  await licenseAuth(licenseKey);
};
```

### **Two-Factor Authentication (2FA)**

#### **Enable 2FA**
```typescript
const { enable2FA } = useAuth();

// This returns a QR code URL for the user to scan
const result = await enable2FA();
if (result.success) {
  // Show QR code: result.qr
}
```

#### **Login with 2FA**
When 2FA is enabled, the login flow automatically detects and redirects to 2FA verification:

```typescript
const { loginWith2FA } = useAuth();

const handleVerify2FA = async (code: string) => {
  await loginWith2FA(username, password, code);
};
```

#### **Disable 2FA**
```typescript
const { disable2FA } = useAuth();

const handleDisable2FA = async () => {
  await disable2FA();
};
```

## **User Registration**

```typescript
const { register } = useAuth();

const handleRegister = async () => {
  await register(username, password, licenseKey);
};
```

## **Account Upgrade**

Users can upgrade their accounts with additional license keys:

```typescript
const { upgrade } = useAuth();

const handleUpgrade = async () => {
  const result = await upgrade(username, licenseKey);
  if (result.success) {
    // Show success message
  } else {
    // Show error: result.message
  }
};
```

## **User Data Access**

Access current user information through the context:

```typescript
const { user, isLoggedIn } = useAuth();

// User object contains:
console.log({
  username: user?.username,
  email: user?.email,
  ip: user?.ip,
  hwid: user?.hwid,
  expires: user?.expires,
  subscriptions: user?.subscriptions,
  createdate: user?.createdate,
  lastlogin: user?.lastlogin
});
```

## **Application Information**

Display app statistics:

```typescript
const { appData } = useAuth();

console.log({
  numUsers: appData?.numUsers,
  onlineUsers: appData?.onlineUsers,
  numKeys: appData?.numKeys,
  version: appData?.app_ver,
  customerPanel: appData?.customer_panel
});
```

## **Session Management**

```typescript
const { logout, checkSession } = useAuth();

// Check if session is valid
const isValid = await checkSession();

// Logout user
await logout();
```

## **Security Features**

### **Blacklist Check**
```typescript
const { checkBlacklist } = useAuth();

const isBlacklisted = await checkBlacklist();
if (isBlacklisted) {
  // Handle blacklisted user
}
```

### **Ban User**
```typescript
const { ban } = useAuth();

// Ban current user (must be logged in)
await ban();
```

## **Logging**

Send logs to KeyAuth dashboard:

```typescript
const { log } = useAuth();

await log("User performed action X");
```

## **Variables**

### **Application Variables**
```typescript
const { getVar } = useAuth();

const value = await getVar("variableName");
```

### **User Variables**
```typescript
const { getUserVar, setUserVar } = useAuth();

// Get user variable
const userValue = await getUserVar("varName");

// Set user variable
await setUserVar("varName", "varValue");
```

## **File Downloads**

```typescript
const { downloadFile } = useAuth();

const fileBytes = await downloadFile("fileId");
// Handle file bytes as needed
```

## **Chat System**

### **Get Chat Messages**
```typescript
const { getChatMessages } = useAuth();

const messages = await getChatMessages("channelName");
messages.forEach(msg => {
  console.log(`${msg.author}: ${msg.message}`);
});
```

### **Send Chat Message**
```typescript
const { sendChatMessage } = useAuth();

await sendChatMessage("Hello everyone!", "channelName");
```

## **Webhooks**

Send secure server-side requests:

```typescript
const { webhook } = useAuth();

// GET request
const response1 = await webhook("webhookId", "&param=value");

// POST with form data
const response2 = await webhook(
  "webhookId", 
  "", 
  "key=value&key2=value2", 
  "application/x-www-form-urlencoded"
);

// POST with JSON
const response3 = await webhook(
  "webhookId",
  "",
  JSON.stringify({ message: "Hello" }),
  "application/json"
);
```

## **Environment Configuration**

### **Development**
```bash
bun dev
```

### **Production Build**
```bash
bun run build
bun start
```

### **Type Checking**
```bash
bun run type-check
```

### **Linting**
```bash
bun run lint
```

## **Customization**

### **Styling**
The application uses Tailwind CSS with custom KeyAuth design tokens. Main colors:

```css
/* Custom background colors */
.bg-custom-back { /* Dark background */ }
.bg-custom-back-1 { /* Darker background */ }

/* Custom hover effects */
.hover:bg-blue-700 { /* Button hovers */ }
```

### **Authentication Context**
The `AuthContext` provides all authentication state and methods. Wrap your app with `AuthProvider`:

```typescript
import { AuthProvider } from '@/contexts/AuthContext';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
```

## **Customer Connection Issues**

This is common amongst all authentication systems. Program obfuscation causes false positives in virus scanners, and with the scale of KeyAuth this is perceived as a malicious domain. So, `keyauth.com` and `keyauth.win` have been blocked by many internet providers. For dashboard, reseller panel, customer panel, use `keyauth.cc`.

For API, `keyauth.cc` will not work because it's purposefully blocked there so `keyauth.cc` doesn't get blocked also. You should create your own domain and follow this tutorial video: https://www.youtube.com/watch?v=a2SROFJ0eYc

## **What is KeyAuth?**

KeyAuth is an Open source authentication system with cloud hosting plans as well. Client SDKs available for [C#](https://github.com/KeyAuth/KeyAuth-CSHARP-Example), [C++](https://github.com/KeyAuth/KeyAuth-CPP-Example), [Python](https://github.com/KeyAuth/KeyAuth-Python-Example), [Java](https://github.com/KeyAuth-Archive/KeyAuth-JAVA-api), [JavaScript](https://github.com/KeyAuth/KeyAuth-JavaScript-Example), [VB.NET](https://github.com/KeyAuth/KeyAuth-VB-Example), [PHP](https://github.com/KeyAuth/KeyAuth-PHP-Example), [Rust](https://github.com/KeyAuth/KeyAuth-Rust-Example), [Go](https://github.com/KeyAuth/KeyAuth-Go-Example), [Lua](https://github.com/mazkdevf/KeyAuth-Lua-Examples), [Ruby](https://github.com/mazkdevf/KeyAuth-Ruby-Example), and [Perl](https://github.com/mazkdevf/KeyAuth-Perl-Example). 

KeyAuth has several unique features such as memory streaming, webhook function where you can send requests to API without leaking the API, discord webhook notifications, ban the user securely through the application at your discretion. Feel free to join https://t.me/keyauth if you have questions or suggestions.

## **Copyright License**

KeyAuth is licensed under **Elastic License 2.0**

* You may not provide the software to third parties as a hosted or managed service, where the service provides users with access to any substantial set of the features or functionality of the software.

* You may not move, change, disable, or circumvent the license key functionality in the software, and you may not remove or obscure any functionality in the software that is protected by the license key.

* You may not alter, remove, or obscure any licensing, copyright, or other notices of the licensor in the software. Any use of the licensor's trademarks is subject to applicable law.

Thank you for your compliance, we work hard on the development of KeyAuth and do not appreciate our copyright being infringed.

## **Support**

- 📖 [KeyAuth Documentation](https://docs.keyauth.cc)
- 💬 [Telegram Community](https://t.me/keyauth)
- 🐛 [Bug Reports](https://keyauth.cc/app/?page=forms)
- 🌐 [KeyAuth Dashboard](https://keyauth.cc/app/)

---

**Made with ❤️ by the KeyAuth team**
