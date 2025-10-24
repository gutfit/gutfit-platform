#!/usr/bin/env node

/**
 * Gutfit Authentik Setup Script
 * Creates internal OAuth provider and configures applications
 * For autho.gutfit.co (autho.id brand system)
 */

const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const AUTHENTIK_API = "https://autho.gutfit.co/api/v3";
const API_TOKEN = process.env.AUTHENTIK_API_TOKEN || "your-authentik-token";

// Configuration for internal provider
const INTERNAL_PROVIDER_CONFIG = {
  name: "Gutfit Internal SSO",
  type: "oauth2",
  authorization_flow: null, // Use default
  client_type: "public",
  scopes: "openid email profile",
  redirect_uris: ["http://localhost:8000/*", "https://autho.gutfit.co/*"],
  configurations: {
    url: "https://autho.gutfit.co",
    jwks_url:
      "https://autho.gutfit.co/application/o/oauth/internal/.well-known/jwks.json",
    token_endpoint: "",
    userinfo_endpoint: "",
  },
};

const APPLICATION_CONFIG = {
  name: "VS Code Remote Development",
  slug: "vscode-dev",
  provider: null, // Will be set after provider creation
  launch_url: null,
  meta: {
    launch_url: null,
    description: "Remote VS Code development environment",
  },
};

async function makeApiCall(endpoint, method = "GET", data = null) {
  const url = `${AUTHENTIK_API}${endpoint}`;
  const headers = {
    Authorization: `Bearer ${API_TOKEN}`,
    "Content-Type": "application/json",
    Accept: "application/json",
  };

  const fetchConfig = {
    method,
    headers,
  };

  if (data) {
    fetchConfig.body = JSON.stringify(data);
  }

  try {
    const response = await fetch(url, fetchConfig);

    if (!response.ok) {
      console.error(
        `API call failed: ${response.status} ${response.statusText}`
      );
      const errorText = await response.text();
      console.error("Error details:", errorText);
      return null;
    }

    return await response.json();
  } catch (error) {
    console.error("Request failed:", error);
    return null;
  }
}

async function setupInternalProvider() {
  console.log("🔧 Creating Gutfit Internal SSO Provider...");

  const providerData = {
    name: INTERNAL_PROVIDER_CONFIG.name,
    provider_type: INTERNAL_PROVIDER_CONFIG.type,
    authorization_flow: INTERNAL_PROVIDER_CONFIG.authorization_flow,
    client_type: INTERNAL_PROVIDER_CONFIG.client_type,
    scopes: "openid email profile",
    redirect_uris: INTERNAL_PROVIDER_CONFIG.redirect_uris,
    config: {
      restrictions: ["client-type-public"],
      jwks_url:
        "https://autho.gutfit.co/application/o/oauth/internal/.well-known/jwks.json",
    },
  };

  const result = await makeApiCall("/providers/oauth2/", "POST", providerData);

  if (result) {
    console.log("✅ Internal SSO provider created successfully");
    return result.pk; // Return provider ID
  }

  return null;
}

async function setupApplication(providerId) {
  console.log("📱 Creating VS Code Development Application...");

  const appData = {
    name: APPLICATION_CONFIG.name,
    slug: APPLICATION_CONFIG.slug,
    provider: providerId,
    meta_launch_url: null,
    meta_description: APPLICATION_CONFIG.description,
    meta_publisher: "Gutfit Development Team",
    meta_issuer: "autho.gutfit.co",
  };

  const result = await makeApiCall("/applications/", "POST", appData);

  if (result) {
    console.log("✅ VS Code Development application created successfully");
    console.log(
      "🚀 Application access URL:",
      `https://autho.gutfit.co/application/o/${APPLICATION_CONFIG.slug}/authorize/`
    );
    return result;
  }

  return null;
}

async function createTestGroup() {
  console.log("👥 Creating Gutfit Developers group...");

  const groupData = {
    name: "Gutfit Developers",
    is_superuser: false,
  };

  const result = await makeApiCall("/core/groups/", "POST", groupData);

  if (result) {
    console.log("✅ Gutfit Developers group created successfully");
  }

  return result;
}

async function createTestUser() {
  console.log("👤 Creating test developer user...");

  const userData = {
    username: "demo",
    name: "Demo Developer",
    email: "demo@gutfit.co",
    is_active: true,
    password: "DemoPass2025!", // In production, would use proper password hashing
  };

  const result = await makeApiCall("/core/users/", "POST", userData);

  if (result) {
    console.log('✅ Test user "demo" created successfully');
    console.log("🔑 Login credentials: demo@gutfit.co / DemoPass2025!");
  }

  return result;
}

async function main() {
  console.log("🚀 Gutfit Autho.gutfit.co SSO Setup Starting...\n");

  try {
    // Step 1: Create internal OAuth provider
    const providerId = await setupInternalProvider();
    if (!providerId) {
      console.error("❌ Failed to create provider. Aborting setup.");
      process.exit(1);
    }

    // Step 2: Create VS Code application
    const application = await setupApplication(providerId);
    if (!application) {
      console.error("❌ Failed to create application. Aborting setup.");
      process.exit(1);
    }

    // Step 3: Create test group and user
    await createTestGroup();
    await createTestUser();

    console.log("\n🎉 Authentik setup completed successfully!");
    console.log("\n🔗 Next Steps:");
    console.log(
      "1. Update your VS Code auth configuration with the application URL"
    );
    console.log("2. Test login with demo@gutfit.co / DemoPass2025!");
    console.log("3. Add enrolled users to the Gutfit Developers group");
    console.log(
      "4. Configure enrollment flows for additional authentication methods (Google/GitHub)"
    );
  } catch (error) {
    console.error("💥 Setup failed with error:", error);
    process.exit(1);
  }
}

// Run setup
if (require.main === module) {
  main();
}

module.exports = { main };
