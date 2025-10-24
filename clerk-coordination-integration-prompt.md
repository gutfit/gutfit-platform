# 🔐 CLERK AUTHENTICATION INTEGRATION INTO GUTFIT COORDINATION CLI

## 🎯 MISSION OVERVIEW

**Integrate the Clerk authentication callback into the Gutfit coordination CLI tool to enable secure, authenticated multi-agent operations.**

## 📋 CONTEXT & ARCHITECTURE

### **Current Coordination System:**

- **Framework**: HAZEL (HAZEL Coordination Framework v1.0)
- **Sync Method**: Git-based JSON state management
- **Agents**: RooCode, KiloCode, Cline, Warp coordination-ready
- **Security**: Currently unauthenticated - vulnerable to unauthorized operations

### **Clinical Platform Scope:**

- **$300B TAM**: Autonomous clinical platform for evidence-based mental healthcare
- **Sensitive Data**: HIPAA-protected clinical records, patient interactions
- **Critical Operations**: Account creation, SSO management, autonomous appointments
- **High-Stakes**: Misuse could violate healthcare regulations

---

## 🤖 INTEGRATION REQUIREMENTS

### **1. Authentication Handler Creation**

You need to implement Clerk authentication specifically in the Gutfit CLI tool located at `gutfit-coord.js` (which doesn't exist yet - you'll need to create it).

#### **Authentication Flow:**

```
1. User runs: gutfit-coord auth
2. Opens Clerk OAuth URL in browser
3. User completes authentication
4. Callback processed: /?code=ABC123&state=XYZ789
5. Token stored securely
6. CLI session becomes authenticated
```

#### **Security Storage:**

- **Location**: `~/.gutfit/coordination/auth.json`
- **Encryption**: AES-256 encrypted with user-specific key
- **Permissions**: 0600 (owner-only read/write)
- **Auto-expiry**: 24 hours max session

### **2. CLI Tool Architecture**

#### **Essential Commands:**

```bash
# Authentication
gutfit-coord auth                   # Authenticate with Clerk
gutfit-coord whoami                # Show current user and permissions
gutfit-coord logout                # Clear authentication session
gutfit-coord auth-status           # Show session details and expiry

# Secured Coordination (now require auth)
gutfit-coord tasks claim <task_id> # Only if authenticated
gutfit-coord emergency takeover    # Only admin users
gutfit-coord status               # Show coordination state
gutfit-coord status secure        # Show with user attribution logs
```

#### **Command Implementation:**

```javascript
// gutfit-coord.js structure
const commands = {
  auth: require("./commands/auth"),
  whoami: require("./commands/whoami"),
  logout: require("./commands/logout"),
  "auth-status": require("./commands/auth-status"),
  // ... existing coordination commands but with auth checks
};
```

### **3. Callback Handler Implementation**

#### **HTTP Server Setup (Temporary):**

```javascript
// Create local HTTP server to receive callback
const http = require("http");
const server = http.createServer((req, res) => {
  if (req.url?.startsWith("/clerk-callback?")) {
    const url = new URL(req.url, "http://localhost");
    const code = url.searchParams.get("code");
    const state = url.searchParams.get("state");

    // Process authentication
    processClerkCallback(code, state)
      .then(() => {
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(
          "<h1>✅ Authentication Successful! You can close this window.</h1>"
        );
      })
      .catch((error) => {
        res.writeHead(500, { "Content-Type": "text/plain" });
        res.end(`Authentication failed: ${error.message}`);
      });

    server.close(); // Close after single use
  }
});
```

#### **Token Exchange Process:**

```javascript
async function processClerkCallback(code, state) {
  // 1. Verify state parameter (CSRF protection)
  const expectedState = loadStoredState();
  if (state !== expectedState) {
    throw new Error("State mismatch - potential security issue");
  }

  // 2. Exchange code for tokens
  const tokenResponse = await fetch(
    "https://your-app.clerk.accounts.dev/oauth/token",
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "authorization_code",
        code,
        redirect_uri: "http://localhost:5123/clerk-callback",
        client_id: env.CLERK_CLIENT_ID,
        client_secret: env.CLERK_CLIENT_SECRET,
      }),
    }
  );

  if (!tokenResponse.ok) {
    throw new Error("Failed to exchange code for tokens");
  }

  const tokens = await tokenResponse.json();

  // 3. Decode and validate JWT
  const decodedToken = jwt.decode(tokens.access_token);
  validateTokenContents(decodedToken);

  // 4. Store securely
  await storeAuthCredentials(tokens, decodedToken);

  return { success: true, user: decodedToken.sub };
}
```

---

## 🔧 FILE STRUCTURE & IMPLEMENTATION

### **Create Directory Structure:**

```
coordination/
├── cli/
│   ├── gutfit-coord.js             # Main CLI entry point
│   ├── commands/
│   │   ├── auth.js                 # Clerk authentication
│   │   ├── whoami.js              # User identity
│   │   ├── logout.js              # Session termination
│   │   └── auth-status.js         # Session details
│   ├── lib/
│   │   ├── clerk.js               # Clerk API integration
│   │   ├── storage.js             # Encrypted token storage
│   │   ├── security.js            # JWT validation & encryption
│   │   └── coordination.js        # Core coordination functions (from existing)
│   └── utils/
│       ├── browser.js             # Open browser for auth
│       ├── crypto.js              # Encryption utilities
│       └── gui.js                 # CLI formatting
└── config/
    └── default.json                # Clerk OAuth endpoints, redirect URIs
```

### **Configuration File (config/default.json):**

```json
{
  "clerk": {
    "authorizationUrl": "https://accounts.clerk.com/oauth/authorize",
    "tokenUrl": "https://accounts.clerk.com/oauth/token",
    "redirectUri": "http://localhost:5123/clerk-callback",
    "scope": "openid email profile",
    "clientId": "${CLERK_CLIENT_ID}",
    "clientSecret": "${CLERK_CLIENT_SECRET}"
  },
  "server": {
    "port": 5123,
    "timeout": 300000
  },
  "storage": {
    "path": "${HOME}/.gutfit/coordination",
    "keyDerivationRounds": 10000,
    "encryptionAlgorithm": "aes-256-gcm"
  }
}
```

---

## 🛡️ SECURITY IMPLEMENTATION

### **Token Storage & Management:**

```javascript
// storage.js
class SecureTokenStorage {
  constructor() {
    this.storagePath = path.join(os.homedir(), ".gutfit", "coordination");
    this.createStorageDirectory();
  }

  async storeTokens(tokens) {
    const encryptionKey = await this.deriveKeyFromPassword();
    const encrypted = await this.encrypt(tokens, encryptionKey);
    await fs.promises.writeFile(this.getTokenPath(), encrypted, {
      mode: 0o600,
    });
  }

  async getTokens() {
    const encrypted = await fs.promises.readFile(this.getTokenPath());
    const encryptionKey = await this.deriveKeyFromPassword();
    return await this.decrypt(encrypted, encryptionKey);
  }

  async deriveKeyFromPassword() {
    // Use PBKDF2 with user-specific salt
    const salt = await this.getOrCreateSalt();
    return crypto.pbkdf2Sync(
      process.env.USER || "default",
      salt,
      10000,
      32,
      "sha256"
    );
  }
}
```

### **JWT Validation:**

```javascript
function validateTokenContents(decodedToken) {
  // Check issuer
  if (decodedToken.iss !== "https://accounts.clerk.com") {
    throw new Error("Invalid token issuer");
  }

  // Check audience (client ID)
  if (decodedToken.aud !== process.env.CLERK_CLIENT_ID) {
    throw new Error("Invalid token audience");
  }

  // Check expiration
  if (decodedToken.exp < Date.now() / 1000) {
    throw new Error("Token has expired");
  }

  // Check required claims
  const requiredClaims = ["sub", "email", "name"];
  for (const claim of requiredClaims) {
    if (!decodedToken[claim]) {
      throw new Error(`Missing required claim: ${claim}`);
    }
  }

  return decodedToken;
}
```

---

## 🧪 TESTING REQUIREMENTS

### **Unit Tests:**

```bash
# Test authentication flow
npm test -- --grep "clerk-auth"

# Test secure storage
npm test -- --grep "token-storage"

# Test CLI commands
npm test -- --grep "cli-auth"
```

### **Integration Tests:**

- **Callback processing**: Mock OAuth server & verify token exchange
- **Session persistence**: Restart CLI and verify authenticated state
- **Security validation**: Attempt invalid tokens, check rejection
- **Browser automation**: Headless testing of authentication flow

### **Manual Testing:**

```bash
# Fresh install test
rm -rf ~/.gutfit/coordination
gutfit-coord auth
# Should open browser, complete oauth, return authenticated

# Session persistence test
gutfit-coord auth-status
# Should show current user and session validity

# Coordination security test
gutfit-coord tasks claim some-task
# Should require authentication
gutfit-coord auth
gutfit-coord tasks claim some-task
# Should succeed with proper permissions
```

---

## 📊 METRICS & MONITORING

### **Authentication Analytics:**

- Login success/failure rates
- Session duration statistics
- Permission usage patterns
- Security incident detection

### **CLI Usage Tracking:**

- Command completion rates
- Error frequency analysis
- Performance optimization opportunities
- User adoption metrics

**This implementation will secure the coordination framework while enabling seamless authenticated multi-agent operations for the $300B clinical platform.**

---

## 🚀 DEPLOYMENT & USAGE

### **Installation:**

```bash
npm install -g gutfit-coordination-cli
env CLERK_CLIENT_ID=your_id CLERK_CLIENT_SECRET=your_secret gutfit-coord auth
```

### **Usage:**

```bash
gutfit-coord auth              # Authenticate with Clerk
gutfit-coord coordination      # Start agent coordination (requires auth)
gutfit-coord emergency takeover # Admin emergency operations
```

**Ready to implement secure, authenticated CLI coordination for the autonomous clinical platform!**
