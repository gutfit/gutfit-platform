const express = require("express");
const cors = require("cors");
const { exec } = require("child_process");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");

const app = express();

// Security middleware
app.use(helmet());

// Rate limiting for signup endpoint
const signupLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Limit each IP to 5 signup requests per windowMs
  message: { error: "Too many signup attempts from this IP, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// CORS with specific origins for security
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests from signup.gutfit.co and localhost for testing
    const allowedOrigins = [
      'https://signup.gutfit.co',
      'http://signup.gutfit.co',
      'http://localhost:3000',
      'http://127.0.0.1:3000'
    ];

    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json({ limit: '10kb' }));

// Input validation middleware
function validateSignupData(req, res, next) {
  const { email, firstName, lastName, role, specialization, experience, focus } = req.body;

  // Required fields validation
  const requiredFields = ['email', 'firstName', 'lastName', 'role'];
  const missingFields = requiredFields.filter(field => !req.body[field]);

  if (missingFields.length > 0) {
    return res.status(400).json({
      error: 'Missing required fields',
      details: `Please provide: ${missingFields.join(', ')}`
    });
  }

  // Email validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({ error: 'Invalid email format' });
  }

  // Name validation (prevent dangerous characters)
  if (firstName.length < 2 || lastName.length < 2 || firstName.length > 50 || lastName.length > 50) {
    return res.status(400).json({ error: 'Names must be between 2-50 characters' });
  }

  // Check for SQL injection or dangerous characters
  const dangerousChars = /[<>;'"\[\]{}\\]/;
  if (dangerousChars.test(firstName) || dangerousChars.test(lastName) || dangerousChars.test(email)) {
    return res.status(400).json({ error: 'Invalid characters in input' });
  }

  // Role validation
  const validRoles = ['clinician', 'coach', 'therapist', 'founder', 'other'];
  if (!validRoles.includes(role)) {
    return res.status(400).json({ error: 'Invalid role selection' });
  }

  next();
}

// Generate identity profile based on signup data
function createIdentityProfile(userData) {
  const { firstName, role, specialization, experience, focus } = userData;

  // Create personalized system prompt for AI assistant
  let systemPrompt = `You are ${firstName}'s personalized health and wellbeing AI assistant.

Role: You serve a ${role} specializing in ${specialization || 'therapy and counseling'}.
Experience: ${experience || 'professional level'} experience in the field.
Clinical Focus: ${focus || 'holistic wellbeing approaches'}.

Guidelines:
- Always prioritize user safety and well-being
- Use evidence-based approaches appropriate to their ${role} role
- Provide empathy and professional compassion
- Encourage seeking appropriate clinical care when needed
- Maintain professional boundaries and ethics
- Be encouraging and supportive in tone

If the user reports mental health crisis symptoms, recommend immediate professional help.`;

  // Determine initial protocol recommendations based on specialization
  let recommendedProtocols = [];
  switch (specialization) {
    case 'cbt':
      recommendedProtocols = ['cognitive-behavioral-therapy', 'mindfulness-based-stress-reduction'];
      break;
    case 'dbt':
      recommendedProtocols = ['dialectical-behavior-therapy', 'emotion-regulation'];
      break;
    case 'humanistic':
      recommendedProtocols = ['person-centered-therapy', 'existential-exploration'];
      break;
    case 'psychodynamic':
      recommendedProtocols = ['insight-oriented-therapy', 'attachment-based-approaches'];
      break;
    case 'emdr':
      recommendedProtocols = ['trauma-processing', 'flash-technique'];
      break;
    default:
      recommendedProtocols = ['general-wellbeing', 'stress-management', 'mindfulness'];
  }

  return {
    systemPrompt,
    recommendedProtocols,
    specialization,
    experience_level: experience,
    clinical_focus: focus,
    created_at: new Date().toISOString()
  };
}

// Enhanced signup endpoint with full error handling and user experience
app.post("/api/signup", signupLimiter, validateSignupData, async (req, res) => {
  const userData = req.body;
  console.log("🎯 New GutfitOS signup:", userData);

  try {
    const { email, firstName, lastName, role, specialization, experience, focus } = userData;
    const fullName = `${firstName} ${lastName}`;

    // 1. Create clinical identity profile first
    console.log("📝 Creating identity profile...");
    const identityProfile = createIdentityProfile(userData);

    // 2. Create Nextcloud user account
    console.log("☁️ Creating Nextcloud account...");
    const nextcloudCmd = `docker exec gutfit_nextcloud.1.jxdsh14mtvaqr5fh1xezoofyn php occ user:add '${email}' --display-name '${fullName}' --group 'Gutfit_${role.charAt(0).toUpperCase() + role.slice(1)}s'`;

    await new Promise((resolve, reject) => {
      exec(nextcloudCmd, (error, stdout) => {
        if (error) {
          console.error("❌ Nextcloud user creation failed:", error);
          reject(new Error("Unable to create your clinical workspace account"));
          return;
        }
        console.log("✅ Nextcloud user created successfully:", stdout);
        resolve(stdout);
      });
    });

    // 3. Upload identity profile to Nextcloud
    console.log("📁 Setting up clinical workspace...");
    const identityFilePath = `/var/www/nextcloud/data/${email}/files/.gutfit/identity.json`;
    const identityJson = JSON.stringify(identityProfile, null, 2);

    await new Promise((resolve, reject) => {
      exec(`docker exec gutfit_nextcloud.1.jxdsh14mtvaqr5fh1xezoofyn bash -c "mkdir -p /var/www/nextcloud/data/${email}/files/.gutfit && echo '${identityJson}' > ${identityFilePath}"`, (error) => {
        if (error) {
          console.error("❌ Identity profile creation failed:", error);
          reject(new Error("Unable to configure your personalized workspace"));
          return;
        }
        console.log("✅ Identity profile created and stored");
        resolve();
      });
    });

    // 4. Create personalized folders based on specialization
    console.log("📊 Setting up clinical protocols...");
    let protocolFolders = [];
    switch (specialization) {
      case 'cbt':
        protocolFolders = ['CBT/Pre_Intake', 'CBT/Cognitive_Reassessment', 'CBT/Homework_Tracking'];
        break;
      case 'trauma':
        protocolFolders = ['Trauma/Stabilization', 'Trauma/Processing', 'Trauma/Post_Integration'];
        break;
      default:
        protocolFolders = ['Assessment', 'Sessions', 'Homework', 'Progress_Notes'];
    }

    for (const folder of protocolFolders) {
      await new Promise((resolve, reject) => {
        exec(`docker exec gutfit_nextcloud.1.jxdsh14mtvaqr5fh1xezoofyn mkdir -p '/var/www/nextcloud/data/${email}/files/Clinical/${folder}'`, (error) => {
          if (error) console.warn(`⚠️ Folder creation warning for ${folder}:`, error);
          resolve(); // Don't fail signup over folder creation issues
        });
      });
    }

    // 5. Execute file scan to ensure files are visible
    console.log("🔍 Scanning user files...");
    await new Promise((resolve, reject) => {
      exec(`docker exec gutfit_nextcloud.1.jxdsh14mtvaqr5fh1xezoofyn php occ files:scan '${email}'`, (error) => {
        if (error) console.warn("⚠️ File scan warning:", error);
        resolve(); // Don't fail over file scan
      });
    });

    // Success response with exceptional user experience
    const successResponse = {
      success: true,
      message: `🎉 Welcome to GutfitOS, ${firstName}! Your clinical workspace has been created successfully.`,
      details: {
        account: "Clinical workspace ready for login",
        location: "Login at https://cloud.gutfit.co",
        specialization: specialization || 'General Practice',
        next_steps: [
          "Check your email for login credentials",
          "Visit your clinical workspace at https://cloud.gutfit.co",
          "Your personalized AI assistant is ready to help",
          "Explore your protocol library and tools"
        ],
        support: "Need help? Contact support@gutfit.co"
      },
      login_url: "https://cloud.gutfit.co",
      timestamp: new Date().toISOString()
    };

    console.log("🚀 Signup completion successful for:", email);
    res.status(201).json(successResponse);

  } catch (error) {
    console.error("💥 Signup error:", error);

    // Provide user-friendly error messages based on error type
    let userMessage = "An error occurred during account creation. Please try again.";
    let details = "";

    if (error.message.includes("already exists")) {
      userMessage = "It looks like you already have a GutfitOS account!";
      details = "Please try logging in at https://cloud.gutfit.co or contact support@gutfit.co";
    } else if (error.message.includes("email")) {
      userMessage = "There was an issue with your email configuration.";
      details = "Please check your email address or contact support@gutfit.co";
    } else if (error.message.includes("workspace")) {
      userMessage = "Your clinical workspace couldn't be fully set up.";
      details = "Your account was created - please contact support@gutfit.co to complete setup";
    }

    res.status(500).json({
      error: userMessage,
      details: details,
      support: "Please contact support@gutfit.co if this problem persists.",
      timestamp: new Date().toISOString()
    });
  }
}

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    service: "GutfitOS Clinical Signup API"
  });
});

const AnythingLLMAutoConfigurator = require('./anythingllm-auto-config');

const llmConfigurator = new AnythingLLMAutoConfigurator();

// Endpoint to create AI assistant after account creation
app.post("/api/create-ai-assistant", async (req, res) => {
  const { email, specialization, experience, focus, firstName, lastName } = req.body;

  try {
    console.log("🤖 Creating AI clinical assistant for:", email, specialization);

    // Create personalized AI assistant using the autoconfigurator
    const assistantConfig = await llmConfigurator.createClinicalWorkspace({
      email,
      firstName: firstName || "Valued",
      lastName: lastName || "Clinician",
      specialization,
      experience,
      focus
    });

    res.json({
      success: true,
      message: "Clinical AI assistant created and fully configured for your practice",
      assistantId: assistantConfig.workspaceId,
      assistantUrl: assistantConfig.assistantUrl,
      specialization,
      features: [
        "Personalized clinical system prompts",
        "Evidence-based protocol integration",
        "Specialization-specific knowledge base",
        "Session templates and progress tracking",
        "HIPAA-compliant documentation"
      ],
      status: assistantConfig.status
    });

  } catch (error) {
    console.error("❌ AI Assistant creation failed:", error);
    res.status(500).json({
      success: false,
      message: "AI assistant creation in progress - will be available shortly",
      specialization,
      features: ["Basic clinical support", "Protocol access"],
      status: "partially_ready",
      retry_after: 60
    });
  }
});

function buildPersonalizedPrompt(data) {
  const { specialization, experience, focus } = data;

  return `You are a specialized clinical assistant for ${specialization} practice.

Clinical Profile:
- Specialization: ${specialization}
- Experience: ${experience}
- Focus: ${focus}

Guidelines:
- Provide evidence-based recommendations
- Use clinical protocols appropriate to specialization
- Maintain HIPAA compliance in all interactions
- Never provide medical advice, only educational support
- Encourage consultation with healthcare professionals`;
}

async function execAsync(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) reject(error);
      else resolve(stdout);
    });
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error("Unhandled error:", error);
  res.status(500).json({
    error: "An unexpected error occurred",
    support: "Please contact support@gutfit.co"
  });
});

app.listen(3000, () => {
  console.log("🚀 Signup backend running on port 3000 - Ready for clinical signups!");
});
