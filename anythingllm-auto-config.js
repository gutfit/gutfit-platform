#!/usr/bin/env node

/**
 * GutfitOS AnythingLLM Auto-Configuration System
 * Automatically configures AnythingLLM workspaces and assistants for clinical users
 * Creates personalized AI assistants with clinical knowledge bases
 */

const fs = require("fs");
const path = require("path");
const { execSync, spawn } = require("child_process");
const https = require("https");

class AnythingLLMAutoConfigurator {
  constructor() {
    this.serverUrl = "http://mtl.autho.cloud"; // Container address
    this.adminToken = process.env.ANYTHINGLLM_ADMIN_TOKEN || "default-token";
    this.dbPath = "/app/server/storage/anythingllm.db";
  }

  /**
   * Create a complete clinical workspace for a user
   */
  async createClinicalWorkspace(userConfig) {
    const { email, firstName, lastName, specialization, experience, focus } =
      userConfig;

    console.log(`🔧 Creating clinical workspace for ${email}...`);

    try {
      // 1. Create workspace with clinical specialization
      const workspaceId = await this.createWorkspace({
        name: `${firstName}'s Clinical Assistant - ${specialization}`,
        slug: `clinical-${email.replace("@", "-").replace(".", "-")}`,
        description: `Personalized AI assistant specializing in ${specialization} therapy`,
        category: "clinical",
        openAiTemp: 0.7,
      });

      // 2. Configure knowledge base for specialization
      await this.setupKnowledgeBase(workspaceId, specialization);

      // 3. Create personalized system prompt
      await this.createSystemPrompt(workspaceId, {
        name: firstName,
        specialization,
        experience,
        focus,
      });

      // 4. Upload clinical templates and protocols
      await this.uploadClinicalContent(workspaceId, specialization);

      // 5. Configure chat interface settings
      await this.configureChatSettings(workspaceId);

      console.log(`✅ Clinical AI assistant ready for ${email}`);
      return {
        workspaceId,
        assistantUrl: `${this.serverUrl}/workspace/${workspaceId}`,
        clinicalFocus: specialization,
        status: "ready",
      };
    } catch (error) {
      console.error(`❌ Failed to create workspace for ${email}:`, error);
      throw error;
    }
  }

  /**
   * Execute SQL commands on AnythingLLM database via container
   */
  async executeSQL(sql) {
    try {
      const result = execSync(
        `docker exec gutfit_anything-llm.1.9ocqyff7lf401vaqj6bwrfaao sqlite3 '${this.dbPath}' "${sql}"`,
        {
          encoding: "utf8",
          timeout: 5000,
        }
      );
      return result.trim();
    } catch (error) {
      console.error("SQL execution failed:", error.message);
      throw error;
    }
  }

  /**
   * Create workspace in database
   */
  async createWorkspace(config) {
    const { name, slug, description, category, openAiTemp } = config;

    // Generate UUID for workspace
    const workspaceId = this.generateUUID();

    const sql = `
      INSERT INTO workspaces
      (id, name, slug, description, category, openAiTemp, createdAt, lastUpdatedAt)
      VALUES
      ('${workspaceId}', '${name}', '${slug}', '${description}', '${category}', ${openAiTemp}, datetime('now'), datetime('now'));
    `;

    await this.executeSQL(sql);
    console.log(`📁 Created workspace: ${name}`);
    return workspaceId;
  }

  /**
   * Configure clinical knowledge base
   */
  async setupKnowledgeBase(workspaceId, specialization) {
    // Create vectors and embeddings for clinical content
    const knowledgeConfig = this.getClinicalKnowledgeConfig(specialization);

    for (const category of knowledgeConfig.categories) {
      const categoryId = this.generateUUID();

      const sql = `
        INSERT INTO knowledge_categories
        (id, workspaceId, name, description, createdAt)
        VALUES
        ('${categoryId}', '${workspaceId}', '${category.name}', '${category.description}', datetime('now'));
      `;

      await this.executeSQL(sql);

      // Add clinical content to category
      await this.addClinicalDocuments(categoryId, category.documents);
    }
  }

  /**
   * Create personalized AI system prompt
   */
  async createSystemPrompt(workspaceId, userInfo) {
    const { name, specialization, experience, focus } = userInfo;

    const systemPrompt = this.buildClinicalSystemPrompt({
      userName: name,
      specialization,
      experience,
      clinicalFocus: focus,
    });

    const promptId = this.generateUUID();

    const sql = `
      INSERT INTO system_prompts
      (id, workspaceId, prompt, createdAt)
      VALUES
      ('${promptId}', '${workspaceId}', '${systemPrompt.replace(
      /'/g,
      "''"
    )}', datetime('now'));
    `;

    await this.executeSQL(sql);
    console.log(
      `🧠 Configured system prompt for ${specialization} specialization`
    );
  }

  /**
   * Upload clinical protocols and templates
   */
  async uploadClinicalContent(workspaceId, specialization) {
    const clinicalContent = this.getClinicalContent(specialization);

    for (const document of clinicalContent.protocols) {
      const docId = this.generateUUID();

      const sql = `
        INSERT INTO documents
        (id, workspaceId, name, content, type, createdAt)
        VALUES
        ('${docId}', '${workspaceId}', '${
        document.name
      }', '${document.content.replace(
        /'/g,
        "''"
      )}', 'protocol', datetime('now'));
      `;

      await this.executeSQL(sql);
    }

    for (const template of clinicalContent.templates) {
      const templateId = this.generateUUID();

      const sql = `
        INSERT INTO session_templates
        (id, workspaceId, name, description, content, createdAt)
        VALUES
        ('${templateId}', '${workspaceId}', '${template.name}', '${
        template.description
      }', '${template.content.replace(/'/g, "''")}', datetime('now'));
      `;

      await this.executeSQL(sql);
    }
  }

  /**
   * Configure chat interface settings
   */
  async configureChatSettings(workspaceId) {
    const settings = {
      temperature: 0.7,
      maxTokens: 1000,
      model: "gpt-4",
      enableWebSearch: false,
      enableDocumentSearch: true,
      enableFollowUp: true,
      customInstructions:
        "You are a professional clinical assistant. Always prioritize patient safety and well-being.",
    };

    const settingsId = this.generateUUID();

    const sql = `
      INSERT INTO chat_settings
      (id, workspaceId, settings, createdAt)
      VALUES
      ('${settingsId}', '${workspaceId}', '${JSON.stringify(settings).replace(
      /'/g,
      "''"
    )}', datetime('now'));
    `;

    await this.executeSQL(sql);
  }

  /**
   * Get clinical knowledge base configuration
   */
  getClinicalKnowledgeConfig(specialization) {
    const configs = {
      cbt: {
        categories: [
          {
            name: "Cognitive Behavioral Therapy Protocols",
            description: "Evidence-based CBT protocols and techniques",
            documents: [
              "cbt_assessment.pdf",
              "cognitive_restructuring.pdf",
              "exposure_therapy.pdf",
            ],
          },
          {
            name: "Mood Disorder Interventions",
            description: "Specialized interventions for depression and anxiety",
            documents: [
              "mood_tracking.pdf",
              "activity_scheduling.pdf",
              "thought_records.pdf",
            ],
          },
        ],
      },
      trauma: {
        categories: [
          {
            name: "Trauma-Informed Care",
            description: "Protocols for trauma-sensitive treatment",
            documents: [
              "safety_planning.pdf",
              "grounding_techniques.pdf",
              "trauma_timeline.pdf",
            ],
          },
          {
            name: "EMDR Techniques",
            description: "Eye Movement Desensitization and Reprocessing",
            documents: [
              "emdr_protocol.pdf",
              "desensitization.pdf",
              "installation.pdf",
            ],
          },
        ],
      },
      humanistic: {
        categories: [
          {
            name: "Person-Centered Therapy",
            description:
              "Humanistic approaches and unconditional positive regard",
            documents: [
              "congruence.pdf",
              "empathy_skills.pdf",
              "growth_mindset.pdf",
            ],
          },
        ],
      },
    };

    return configs[specialization] || configs.cbt; // Default to CBT
  }

  /**
   * Get clinical content for assistant
   */
  getClinicalContent(specialization) {
    return {
      protocols: [
        {
          name: `Initial ${specialization.toUpperCase()} Assessment`,
          content: `Clinical assessment protocol for ${specialization} sessions...`,
        },
        {
          name: `${specialization.toUpperCase()} Treatment Planning`,
          content: `Structured treatment planning for ${specialization} interventions...`,
        },
      ],
      templates: [
        {
          name: "Session Progress Tracking",
          description: "Track client progress across therapy sessions",
          content: "Progress tracking template with outcome measures...",
        },
        {
          name: "Homework Assignment Template",
          description: "Structured homework and between-session activities",
          content: "Between-session activity planning template...",
        },
      ],
    };
  }

  /**
   * Build personalized clinical system prompt
   */
  buildClinicalSystemPrompt(user) {
    return `You are ${
      user.userName
    }'s specialized AI clinical assistant, trained in ${
      user.specialization
    } therapy with ${user.experience} of clinical experience.

PRIMARY ROLE: Licensed Clinical Social Worker specialization in ${
      user.clinicalFocus
    } disorders.

CLINICAL APPROACH:
- ${user.specialization.toUpperCase()}-based interventions with evidence-based techniques
- Person-centered, trauma-informed care
- Ethical considerations and mandatory reporting requirements
- Cultural competence and diversity awareness

SAFETY PROTOCOLS:
- Crisis intervention and suicide risk assessment
- Child protection and elder abuse recognition
- Emergency resource coordination
- Clarify you are not a replacement for licensed clinical care

SESSION STRUCTURE:
1. Warm empathetic check-in and rapport building
2. Agenda setting with client goals and priorities
3. Active listening and validation of client experiences
4. Evidence-based intervention delivery
5. Homework and between-session activity assignment
6. Session summary and feedback

CLINICAL EXPERIENCE: You bring ${
      user.experience
    } of demonstrated clinical effectiveness across diverse client populations.

RESPONSE STYLE: Professional, warm, evidence-based, encouraging, and clinically competent.

Always prioritize client safety and clinical appropriateness in every interaction.`;
  }

  /**
   * Generate UUID for database records
   */
  generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c == "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      }
    );
  }

  /**
   * Add clinical documents to knowledge category
   */
  async addClinicalDocuments(categoryId, documentNames) {
    for (const docName of documentNames) {
      const documentPath = this.getClinicalDocumentPath(docName);

      if (fs.existsSync(documentPath)) {
        const docId = this.generateUUID();
        const content = fs.readFileSync(documentPath, "utf8");

        const sql = `
          INSERT INTO category_documents
          (id, categoryId, name, content, createdAt)
          VALUES
          ('${docId}', '${categoryId}', '${docName}', '${content.replace(
          /'/g,
          "''"
        )}', datetime('now'));
        `;

        await this.executeSQL(sql);
      }
    }
  }

  /**
   * Get path to clinical document
   */
  getClinicalDocumentPath(docName) {
    return path.join(__dirname, "clinical-templates", docName);
  }
}

// Export for use in signup backend
module.exports = AnythingLLMAutoConfigurator;

// CLI interface for testing
if (require.main === module) {
  const config = new AnythingLLMAutoConfigurator();

  // Test configuration
  const testUser = {
    email: "test@clinical.com",
    firstName: "Test",
    lastName: "Clinician",
    specialization: "cbt",
    experience: "5-10 years",
    focus: "anxiety disorders",
  };

  config
    .createClinicalWorkspace(testUser)
    .then((result) => {
      console.log("✅ Test workspace created:", result);
    })
    .catch((error) => {
      console.error("❌ Test failed:", error);
    });
}
