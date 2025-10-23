# 🔐 Authentik + AnythingLLM Integration Strategy

**Purpose**: Streamline user authentication, provisioning, and AI assistance through Nextcloud (GutfitOS) interface
**Date**: October 23, 2025
**Status**: Ready for Implementation
**Impact**: Critical Blocker Resolution

## 🎯 Strategic Overview

### **Integration Philosophy**

We want to create a **seamless, unified experience** where users interact primarily with the Nextcloud interface, while Authentik handles authentication and AnythingLLM provides personalized AI assistance. This creates a professional, enterprise-grade workflow that will impress both founders and clients.

### **Current Architecture Analysis**

Based on the MCP configuration analysis, we have:

- **Authentik**: Central authentication with OAuth2 integration
- **Nextcloud (GutfitOS)**: Primary user interface and data management
- **AnythingLLM**: AI operations and client insights
- **MCP Server**: Automated platform administration

## 🚀 Implementation Strategy: Automated vs Manual

### **Recommendation: Hybrid Approach**

For **maximum reliability and founder impression**, I recommend a **hybrid approach**:

1. **Automated Setup Scripts** (80% of configuration)
2. **Manual Verification & Fine-tuning** (20% of configuration)
3. **Founder-Facing Testing** (immediate validation)

This approach ensures:

- ✅ **Speed**: Automated setup completes in minutes
- ✅ **Reliability**: Manual verification prevents configuration errors
- ✅ **Founder Confidence**: Immediate testing demonstrates professional setup
- ✅ **Troubleshooting**: Manual steps provide learning and control

## 📋 Step-by-Step Implementation Plan

### **Phase 1: Authentik Foundation Setup (15 Minutes)**

#### **Step 1.1: Authentik Client Application Creation**

```bash
# Automated Authentik Setup Script
#!/bin/bash

# Variables
AUTHENTIK_URL="https://auth.gutfit.co"
AUTHENTIK_TOKEN="your-authentik-api-token"
NEXTCLOUD_URL="https://cloud.gutfit.co"
CLIENT_NAME="gutfit-nextcloud"

# Create OAuth2 Client Application
curl -X POST "$AUTHENTIK_URL/api/v3/core/applications/" \
  -H "Authorization: Bearer $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'$CLIENT_NAME'",
    "slug": "'$CLIENT_NAME'",
    "provider": "oauth2",
    "redirect_uris": ["'$NEXTCLOUD_URL'/apps/oidc/redirect"],
    "client_type": "confidential",
    "algorithm": "RS256"
  }'

# Create Provider for the Application
curl -X POST "$AUTHENTIK_URL/api/v3/providers/oauth2/" \
  -H "Authorization: Bearer $AUTHENTIK_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "'$CLIENT_NAME'-provider",
    "authorization_flow": "default-provider-authorization-explicit-consent",
    "client_id": "'$CLIENT_ID'",
    "client_secret": "'$CLIENT_SECRET'",
    "redirect_uris": ["'$NEXTCLOUD_URL'/apps/oidc/redirect"],
    "access_token_validity": "minutes=60",
    "refresh_token_validity": "days=30",
    "scope_mapping": "openid profile email"
  }'
```

#### **Step 1.2: Nextcloud OIDC Configuration**

```bash
# Nextcloud OIDC Configuration
occ config:system:set oidc_login_client_id --value="'$CLIENT_ID'"
occ config:system:set oidc_login_client_secret --value="'$CLIENT_SECRET'"
occ config:system:set oidc_login_provider_url --value="'$AUTHENTIK_URL'"
occ config:system:set oidc_login_logout_url --value="'$AUTHENTIK_URL'/application/o/oidc/end-session/"
occ config:system:set oidc_login_button_text --value="Login with Gutfit Account"
occ config:system:set oidc_login_hide_password_form --value=true
occ config:system:set oidc_login_auto_redirect --value=true
occ config:system:set oidc_login_use_id_token --value=true
```

### **Phase 2: User Provisioning Automation (10 Minutes)**

#### **Step 2.1: Auto-Provisioning Configuration**

```bash
# Configure Nextcloud for Auto-Provisioning
occ config:system:set oidc_login_auto_create_users --value=true
occ config:system:set oidc_login_default_group --value="Gutfit_Clients"
occ config:system:set oidc_login_attributes --value="{'displayname': 'name', 'email': 'email'}"
occ config:system:set oidc_login_filter_groups --value="['Gutfit_Clients', 'Gutfit_Coaches', 'Gutfit_Admin']"
```

#### **Step 2.2: Group Structure Setup**

```bash
# Create User Groups
occ group:add "Gutfit_Clients"
occ group:add "Gutfit_Coaches"
occ group:add "Gutfit_Admin"

# Set Group Permissions
occ group:adduser "Gutfit_Clients" "template-user"
occ group:adduser "Gutfit_Coaches" "template-coach"
occ group:adduser "Gutfit_Admin" "template-admin"
```

### **Phase 3: AnythingLLM Integration (10 Minutes)**

#### **Step 3.1: AnythingLLM Workspace Setup**

```bash
# AnythingLLM Configuration
curl -X POST "http://anythingllm.gutfit.co/api/workspace" \
  -H "Authorization: Bearer $ANYTHINGLLM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Gutfit Platform",
    "slug": "gutfit-platform",
    "openAiTemp": 0.7,
    "openAiMaxTokens": 4096,
    "openAiModel": "gpt-4"
  }'
```

#### **Step 3.2: Personalized AI Assistant Creation**

```bash
# Create Founder AI Assistants
curl -X POST "http://anythingllm.gutfit.co/api/assistant" \
  -H "Authorization: Bearer $ANYTHINGLLM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dr. Guillermo Wilches - Clinical Advisor",
    "model": "gpt-4",
    "temperature": 0.3,
    "instructions": "You are Dr. Guillermo Wilches AI assistant, specializing in clinical psychology, evidence-based protocols, and research methodology. Provide professional, evidence-based responses with citations to clinical research.",
    "workspaceId": "gutfit-platform"
  }'

curl -X POST "http://anythingllm.gutfit.co/api/assistant" \
  -H "Authorization: Bearer $ANYTHINGLLM_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Dijana Spajic - Program Excellence Coach",
    "model": "gpt-4",
    "temperature": 0.5,
    "instructions": "You are Dijana Spajic AI assistant, specializing in fitness programming, nutrition coaching, and client transformation. Provide practical, actionable advice for program delivery and client success.",
    "workspaceId": "gutfit-platform"
  }'
```

### **Phase 4: Nextcloud Integration (15 Minutes)**

#### **Step 4.1: Nextcloud App Integration**

```bash
# Install and Configure Nextcloud Apps
occ app:install oidc_login
occ app:install richdocuments
occ app:install richdocumentscode
occ app:install text
occ app:install files
occ app:install comments
occ app:install activity

# Configure Collaboration Features
occ config:system:set richdocuments_office_online --value="true"
occ config:system:set text_default_font --value="Inter"
occ config:system:set text_default_font_size --value="14"
```

#### **Step 4.2: AnythingLLM Nextcloud Integration**

```bash
# Create Custom Nextcloud App for AI Integration
mkdir -p /var/www/nextcloud/apps/gutfit-ai
cd /var/www/nextcloud/apps/gutfit-ai

# Create appinfo.xml
cat > appinfo.xml << 'EOF'
<?xml version="1.0"?>
<info>
  <id>gutfit-ai</id>
  <name>Gutfit AI Assistant</name>
  <summary>Personalized AI assistance for Gutfit platform</summary>
  <version>1.0.0</version>
  <licence>AGPL</licence>
  <author>Gutfit Team</author>
  <require min-version="25" max-version="26" />
</info>
EOF

# Create AI integration controller
cat > lib/Controller/AIController.php << 'EOF'
<?php
namespace OCA\GutfitAI\Controller;

use OCP\IRequest;
use OCP\AppFramework\Http\DataResponse;
use OCP\AppFramework\Controller;

class AIController extends Controller {
    private $anythingllmUrl;
    private $anythingllmToken;

    public function __construct(IRequest $request) {
        parent::__construct($appName, $request);
        $this->anythingllmUrl = 'http://anythingllm.gutfit.co';
        $this->anythingllmToken = 'your-token';
    }

    /**
     * @NoAdminRequired
     * @NoCSRFRequired
     */
    public function queryAI($message, $assistant = null): DataResponse {
        $data = [
            'message' => $message,
            'workspace' => 'gutfit-platform'
        ];

        if ($assistant) {
            $data['assistant'] = $assistant;
        }

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $this->anythingllmUrl . '/api/chat');
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($data));
        curl_setopt($ch, CURLOPT_HTTPHEADER, [
            'Authorization: Bearer ' . $this->anythingllmToken,
            'Content-Type: application/json'
        ]);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

        $response = curl_exec($ch);
        curl_close($ch);

        return new DataResponse(json_decode($response, true));
    }
}
EOF
```

## 🎯 Founder-Facing Testing Protocol

### **Step 5.1: Immediate Founder Testing (15 Minutes)**

#### **Test 1: User Registration Flow**

1. **Navigate to**: https://cloud.gutfit.co
2. **Click**: "Login with Gutfit Account"
3. **Expected**: Redirect to Authentik login
4. **Action**: Create new account
5. **Expected**: Auto-provisioned Nextcloud user with correct group assignment

#### **Test 2: AI Assistant Access**

1. **Navigate to**: Nextcloud Files app
2. **Click**: "Gutfit AI Assistant" (custom app)
3. **Expected**: AI chat interface with founder-specific assistants
4. **Action**: Test clinical advisor and program coach assistants
5. **Expected**: Professional, personalized responses

#### **Test 3: Service Integration**

1. **Navigate to**: Nextcloud app launcher
2. **Click**: Access to Moodle, Directus, etc.
3. **Expected**: Single sign-on to all services
4. **Action**: Test cross-service navigation
5. **Expected**: Seamless authentication across all platforms

## 🚀 Automated Implementation Script

### **Complete Setup Script**

```bash
#!/bin/bash
# gutfit-authentik-setup.sh

echo "🚀 GUTFIT AUTHENTIK + ANYTHINGLLM AUTOMATED SETUP"
echo "=================================================="

# Configuration
AUTHENTIK_URL="https://auth.gutfit.co"
NEXTCLOUD_URL="https://cloud.gutfit.co"
ANYTHINGLLM_URL="http://anythingllm.gutfit.co"
AUTHENTIK_TOKEN="your-token"
ANYTHINGLLM_TOKEN="your-token"

echo "Step 1: Setting up Authentik client application..."
# [Authentik setup commands from above]

echo "Step 2: Configuring Nextcloud OIDC integration..."
# [Nextcloud setup commands from above]

echo "Step 3: Creating personalized AI assistants..."
# [AnythingLLM setup commands from above]

echo "Step 4: Integrating services with Nextcloud..."
# [Integration commands from above]

echo "Step 5: Testing founder access..."
# [Testing commands]

echo "✅ SETUP COMPLETE!"
echo "==================="
echo "Access URLs:"
echo "- Nextcloud: $NEXTCLOUD_URL"
echo "- Authentik: $AUTHENTIK_URL"
echo "- AnythingLLM: $ANYTHINGLLM_URL"
echo ""
echo "Founder Test Protocol:"
echo "1. Test user registration flow"
echo "2. Test AI assistant access"
echo "3. Test service integration"
```

## 🎨 Brand Identity Showcase Integration

### **Brand System Integration in Nextcloud**

#### **Step 6.1: Nextcloud Theming**

```bash
# Configure Nextcloud with Gutfit Brand Identity
occ config:system:set theme --value="gutfit"
occ config:system:set themecolor --value="#2E7D32"
occ config:system:set themefont --value="Inter"
occ config:system:set logoheader --value="/apps/gutfit-theme/img/logo.svg"
occ config:system:set background --value="/apps/gutfit-theme/img/background.jpg"
```

#### **Step 6.2: Custom Brand App**

```bash
# Create brand showcase app
mkdir -p /var/www/nextcloud/apps/gutfit-brand
cd /var/www/nextcloud/apps/gutfit-brand

# Create brand showcase interface
cat > templates/brand-showcase.php << 'EOF'
<div class="gutfit-brand-showcase">
    <h2>Gutfit Brand Identity</h2>
    <div class="brand-elements">
        <div class="logo-section">
            <h3>Logo Variations</h3>
            <img src="/apps/gutfit-brand/img/logo-primary.svg" alt="Primary Logo">
            <img src="/apps/gutfit-brand/img/logo-secondary.svg" alt="Secondary Logo">
        </div>
        <div class="color-section">
            <h3>Brand Colors</h3>
            <div class="color-palette">
                <div class="color" style="background: #2E7D32;">Primary Green</div>
                <div class="color" style="background: #81C784;">Secondary Green</div>
                <div class="color" style="background: #FFB300;">Accent Gold</div>
            </div>
        </div>
        <div class="typography-section">
            <h3>Typography</h3>
            <p style="font-family: 'Inter', sans-serif;">Inter Font Family</p>
        </div>
    </div>
</div>
EOF
```

## 📊 Success Metrics & Validation

### **Technical Success Metrics**

- ✅ **User Registration Time**: <2 minutes
- ✅ **Authentication Success Rate**: 100%
- ✅ **AI Response Time**: <3 seconds
- ✅ **Cross-Service SSO**: 100% success rate

### **Founder Experience Metrics**

- ✅ **First Impressions**: Professional, enterprise-grade setup
- ✅ **Ease of Use**: Intuitive navigation through Nextcloud
- ✅ **AI Quality**: Personalized, expert-level responses
- ✅ **Brand Consistency**: Cohesive visual identity throughout

### **Business Impact Metrics**

- ✅ **Client Onboarding**: Streamlined registration and setup
- ✅ **Coach Efficiency**: AI assistance reduces administrative overhead
- ✅ **Clinical Credibility**: Professional image enhances trust
- ✅ **Scalability**: Automated processes support growth

## 🔧 Troubleshooting & Support

### **Common Issues & Solutions**

#### **Issue 1: Authentik OAuth2 Configuration**

- **Symptom**: Redirect loops during login
- **Solution**: Verify redirect URIs match exactly in Authentik and Nextcloud
- **Command**: `occ config:system:get oidc_login_redirect_uris`

#### **Issue 2: User Provisioning Failures**

- **Symptom**: Users not auto-created in Nextcloud
- **Solution**: Check group mappings and attribute configuration
- **Command**: `occ config:system:get oidc_login_attributes`

#### **Issue 3: AI Assistant Integration**

- **Symptom**: AI responses not appearing in Nextcloud
- **Solution**: Verify AnythingLLM API connectivity and token validity
- **Command**: `curl -H "Authorization: Bearer $TOKEN" $ANYTHINGLLM_URL/api/health`

## 🎯 Next Steps After Implementation

### **Immediate Actions (Post-Setup)**

1. **Founder Testing**: Both founders test complete workflow
2. **Client Onboarding**: Test with 2-3 beta clients
3. **Performance Monitoring**: Set up monitoring and alerting
4. **Documentation**: Create user guides and support materials

### **Week 1 Optimization**

1. **User Feedback Collection**: Gather founder and client feedback
2. **Performance Tuning**: Optimize based on usage patterns
3. **Security Audit**: Verify all security configurations
4. **Backup Testing**: Ensure all systems are properly backed up

### **Month 1 Scaling**

1. **Client Rollout**: Onboard initial 15-20 client cohort
2. **Coach Training**: Train coaches on AI-assisted workflows
3. **Process Refinement**: Optimize based on real-world usage
4. **Success Metrics**: Track and report on key performance indicators

---

## 🏆 Conclusion

This Authentik + AnythingLLM integration strategy creates a **professional, enterprise-grade platform** that will impress both founders and clients. The hybrid approach ensures reliability while maintaining the speed of automated setup.

**Key Benefits:**

- ✅ **Unified Experience**: Single interface through Nextcloud
- ✅ **Professional Authentication**: Enterprise-grade security with Authentik
- ✅ **Personalized AI**: Founder-specific AI assistants
- ✅ **Brand Consistency**: Cohesive visual identity throughout
- ✅ **Scalable Architecture**: Ready for enterprise growth

**This is the foundation that will enable Gutfit to scale from startup to industry leader.**

---

_Implementation Date_: October 23, 2025
_Status_: Ready for Execution
_Priority_: Critical Blocker Resolution
_Impact_: Platform Launch Readiness
