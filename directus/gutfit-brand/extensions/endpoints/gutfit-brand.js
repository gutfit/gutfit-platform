/**
 * Gutfit Brand Extension
 *
 * Directus extension for Gutfit-specific brand book generation
 * and brand asset management
 */

import { GutfitBrandBookGenerator } from "../../services/gutfit-brand-book-generator.js";
import { AIService } from "../../juicc-ai-orchestrator/services/ai-service.js";
import { GutfitBrandConfig } from "../../config/gutfit-brand-config.js";
import { logger } from "../../juicc-brand-core/utils/logger.js";

export default ({ router, services, database }) => {
  const { AssetsService, BrandsService, UsersService } = services;

  // Initialize Gutfit services
  const gutfitBrandGenerator = new GutfitBrandBookGenerator();
  const aiService = new AIService();

  /**
   * Generate Gutfit Brand Book
   *
   * POST /gutfit/brand-book/generate
   *
   * Generates Gutfit-specific brand book in various formats
   */
  router.post("/gutfit/brand-book/generate", async (req, res) => {
    const startTime = Date.now();

    try {
      const { format = "web", options = {} } = req.body;

      logger.info("Gutfit brand book generation request", {
        format,
        options,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateGutfitAccess(req.accountability);

      // Generate Gutfit brand book
      const result = await gutfitBrandGenerator.generateGutfitBrandBook(
        format,
        options
      );

      // Log generation event
      await logGutfitEvent({
        action: "gutfit_brand_book_generated",
        userId: req.accountability?.user,
        format,
        options,
        duration: Date.now() - startTime,
        success: true,
      });

      logger.info("Gutfit brand book generation completed", {
        format,
        duration: Date.now() - startTime,
        contentCount: result.metadata.contentCount,
        assetCount: result.metadata.assetCount,
      });

      res.json(result);
    } catch (error) {
      logger.error("Gutfit brand book generation failed", {
        format: req.body.format,
        error: error.message,
        userId: req.accountability?.user,
      });

      // Log failure event
      await logGutfitEvent({
        action: "gutfit_brand_book_generation_failed",
        userId: req.accountability?.user,
        format: req.body.format,
        error: error.message,
        duration: Date.now() - startTime,
        success: false,
      });

      res.status(500).json({
        error: "GUTFIT_BRAND_BOOK_GENERATION_FAILED",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  });

  /**
   * Get Gutfit Brand Configuration
   *
   * GET /gutfit/brand/config
   *
   * Returns Gutfit brand configuration
   */
  router.get("/gutfit/brand/config", async (req, res) => {
    try {
      logger.info("Gutfit brand config request", {
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateGutfitAccess(req.accountability);

      // Return brand configuration
      const config = {
        identity: GutfitBrandConfig.identity,
        visual: {
          colors: GutfitBrandConfig.visual.colors,
          typography: GutfitBrandConfig.visual.typography,
          logo: GutfitBrandConfig.visual.logo,
        },
        voice: {
          tone: GutfitBrandConfig.voice.tone,
          personality: GutfitBrandConfig.voice.personality,
          messaging: GutfitBrandConfig.voice.messaging,
        },
        emotional: {
          primary: GutfitBrandConfig.emotional.primary,
          secondary: GutfitBrandConfig.emotional.secondary,
        },
      };

      logger.info("Gutfit brand config returned", {
        userId: req.accountability?.user,
      });

      res.json(config);
    } catch (error) {
      logger.error("Gutfit brand config request failed", {
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "GUTFIT_BRAND_CONFIG_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Generate Gutfit Content
   *
   * POST /gutfit/content/generate
   *
   * Generates Gutfit-specific content using AI
   */
  router.post("/gutfit/content/generate", async (req, res) => {
    try {
      const { type, specifications, context = {} } = req.body;

      logger.info("Gutfit content generation request", {
        type,
        specifications,
        context,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateGutfitAccess(req.accountability);

      // Get Gutfit brand DNA
      const brandDNA = GutfitBrandConfig;

      // Generate emotional profile
      const emotionalProfile =
        await gutfitBrandGenerator.generateGutfitEmotionalProfile(context);

      // Generate content
      const content = await aiService.generateContentVariations(
        brandDNA,
        emotionalProfile,
        type,
        specifications
      );

      logger.info("Gutfit content generation completed", {
        type,
        variationsCount: content.variations.length,
        userId: req.accountability?.user,
      });

      res.json(content);
    } catch (error) {
      logger.error("Gutfit content generation failed", {
        type: req.body.type,
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "GUTFIT_CONTENT_GENERATION_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Create Gutfit Asset
   *
   * POST /gutfit/assets/create
   *
   * Creates Gutfit-specific brand assets using AI
   */
  router.post("/gutfit/assets/create", async (req, res) => {
    try {
      const { type, specifications, options = {} } = req.body;

      logger.info("Gutfit asset creation request", {
        type,
        specifications,
        options,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateGutfitAccess(req.accountability, "write");

      // Generate asset using Gutfit brand configuration
      const asset = await aiService.generateBrandAsset(
        "gutfit",
        type,
        specifications
      );

      // Store asset in Directus
      const storedAsset = await storeGutfitAsset(
        asset,
        services,
        req.accountability
      );

      logger.info("Gutfit asset creation completed", {
        assetType: type,
        assetId: storedAsset.id,
        userId: req.accountability?.user,
      });

      res.json({
        ...asset,
        id: storedAsset.id,
        url: storedAsset.data?.full_url,
      });
    } catch (error) {
      logger.error("Gutfit asset creation failed", {
        type: req.body.type,
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "GUTFIT_ASSET_CREATION_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Get Gutfit Brand Health
   *
   * GET /gutfit/brand/health
   *
   * Returns Gutfit-specific brand health metrics
   */
  router.get("/gutfit/brand/health", async (req, res) => {
    try {
      const { timeframe = "30d" } = req.query;

      logger.info("Gutfit brand health request", {
        timeframe,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateGutfitAccess(req.accountability);

      // Calculate Gutfit-specific brand health metrics
      const health = await calculateGutfitBrandHealth(
        timeframe,
        services,
        database
      );

      logger.info("Gutfit brand health calculation completed", {
        overallScore: health.overall_score,
        userId: req.accountability?.user,
      });

      res.json(health);
    } catch (error) {
      logger.error("Gutfit brand health calculation failed", {
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "GUTFIT_BRAND_HEALTH_CALCULATION_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Get Gutfit Scientific Updates
   *
   * GET /gutfit/scientific/updates
   *
   * Returns latest scientific research updates
   */
  router.get("/gutfit/scientific/updates", async (req, res) => {
    try {
      const { limit = 10, category = "all" } = req.query;

      logger.info("Gutfit scientific updates request", {
        limit,
        category,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateGutfitAccess(req.accountability);

      // Get scientific updates
      const updates = await getGutfitScientificUpdates(
        limit,
        category,
        database
      );

      logger.info("Gutfit scientific updates returned", {
        updatesCount: updates.length,
        userId: req.accountability?.user,
      });

      res.json({
        updates,
        category,
        limit,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Gutfit scientific updates request failed", {
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "GUTFIT_SCIENTIFIC_UPDATES_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Process Gutfit AI Message
   *
   * POST /gutfit/ai/message
   *
   * Processes user message and returns Gutfit-specific AI response
   */
  router.post("/gutfit/ai/message", async (req, res) => {
    try {
      const {
        message,
        context,
        emotionalState,
        personalityMode,
        conversationHistory,
      } = req.body;

      logger.info("Gutfit AI message request", {
        message: message.substring(0, 100),
        personalityMode,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateGutfitAccess(req.accountability);

      // Process message with Gutfit brand context
      const response = await aiService.processMessage({
        message,
        brandId: "gutfit",
        context: {
          ...context,
          brandConfig: GutfitBrandConfig,
        },
        emotionalState: emotionalState || "trust",
        personalityMode: personalityMode || "professional",
        conversationHistory,
      });

      logger.info("Gutfit AI message processed", {
        responseLength: response.content.length,
        hasSuggestions: response.suggestions.length > 0,
        userId: req.accountability?.user,
      });

      res.json(response);
    } catch (error) {
      logger.error("Gutfit AI message processing failed", {
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "GUTFIT_AI_MESSAGE_PROCESSING_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Get Gutfit Templates
   *
   * GET /gutfit/templates
   *
   * Returns Gutfit-specific templates
   */
  router.get("/gutfit/templates", async (req, res) => {
    try {
      const { type = "all", format = "web" } = req.query;

      logger.info("Gutfit templates request", {
        type,
        format,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateGutfitAccess(req.accountability);

      // Get templates
      const templates = await getGutfitTemplates(type, format, database);

      logger.info("Gutfit templates returned", {
        templatesCount: templates.length,
        userId: req.accountability?.user,
      });

      res.json({
        templates,
        type,
        format,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("Gutfit templates request failed", {
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "GUTFIT_TEMPLATES_FAILED",
        message: error.message,
      });
    }
  });

  // Helper functions
  async function validateGutfitAccess(accountability, permission = "read") {
    if (!accountability?.user) {
      throw new Error("Authentication required");
    }

    // Check if user has Gutfit access
    const hasAccess =
      accountability.role === "admin" ||
      accountability.permissions?.includes("gutfit-access");

    if (!hasAccess) {
      throw new Error("User does not have access to Gutfit brand features");
    }

    if (permission === "write" && accountability.role !== "admin") {
      const hasWriteAccess =
        accountability.permissions?.includes("gutfit-write");
      if (!hasWriteAccess) {
        throw new Error(
          "User does not have write access to Gutfit brand features"
        );
      }
    }
  }

  async function storeGutfitAsset(asset, services, accountability) {
    const assetsService = new services.AssetsService({
      schema: await services.getSchema(),
      knex: services.database,
    });

    const assetData = {
      brand_id: "gutfit",
      title: `Gutfit ${asset.type}`,
      description: `AI-generated ${asset.type} for Gutfit brand`,
      type: asset.type,
      metadata: {
        generated_by: "ai",
        confidence: asset.confidence,
        specifications: asset.specifications,
        created_at: asset.generatedAt,
        gutfit_specific: true,
      },
      created_by: accountability.user,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return await assetsService.createOne(assetData);
  }

  async function calculateGutfitBrandHealth(timeframe, services, database) {
    try {
      const db = database;

      // Get Gutfit assets and their compliance scores
      const [assets, analytics, latestAnalysis] = await Promise.all([
        db("digital_assets")
          .where("brand_id", "gutfit")
          .select("compliance_score", "status"),

        db("brand_analytics")
          .where("brand_id", "gutfit")
          .where("timestamp", ">=", db.raw(`NOW() - INTERVAL '${timeframe}'`))
          .select("metric_name", "metric_value"),

        db("brand_analyses")
          .where("brand_id", "gutfit")
          .orderBy("created_at", "desc")
          .first(),
      ]);

      // Calculate Gutfit-specific metrics
      const coherence =
        assets.length > 0
          ? assets.reduce(
              (sum, asset) => sum + (asset.compliance_score || 0),
              0
            ) / assets.length
          : 0;

      const scientificCredibility = analytics
        .filter((a) => a.metric_name === "scientific_credibility")
        .reduce((sum, a, _, arr) => sum + a.metric_value / arr.length, 0);

      const userEngagement = analytics
        .filter((a) => a.metric_name === "user_engagement")
        .reduce((sum, a, _, arr) => sum + a.metric_value / arr.length, 0);

      const complianceRate =
        assets.length > 0
          ? (assets.filter((a) => a.status === "approved").length /
              assets.length) *
            100
          : 0;

      // Calculate Gutfit-specific overall score
      const overallScore =
        coherence * 0.3 +
        scientificCredibility * 0.4 +
        userEngagement * 0.2 +
        complianceRate * 0.1;

      return {
        overall_score: Math.round(overallScore * 100) / 100,
        metrics: {
          coherence: Math.round(coherence * 100) / 100,
          scientific_credibility: Math.round(scientificCredibility * 100) / 100,
          user_engagement: Math.round(userEngagement * 100) / 100,
          compliance_rate: Math.round(complianceRate * 100) / 100,
        },
        assets: {
          total: assets.length,
          approved: assets.filter((a) => a.status === "approved").length,
          needs_review: assets.filter((a) => a.status === "needs_review")
            .length,
        },
        analysis: latestAnalysis
          ? {
              confidence: latestAnalysis.confidence,
              last_analyzed: latestAnalysis.created_at,
            }
          : null,
        timeframe,
        timestamp: new Date().toISOString(),
        gutfit_specific: true,
      };
    } catch (error) {
      logger.error("Failed to calculate Gutfit brand health", {
        error: error.message,
      });
      throw error;
    }
  }

  async function getGutfitScientificUpdates(limit, category, database) {
    try {
      const db = database;

      let query = db("scientific_updates")
        .where("brand_id", "gutfit")
        .orderBy("published_at", "desc")
        .limit(limit);

      if (category !== "all") {
        query = query.where("category", category);
      }

      return await query.select("*");
    } catch (error) {
      logger.error("Failed to get Gutfit scientific updates", {
        error: error.message,
      });
      throw error;
    }
  }

  async function getGutfitTemplates(type, format, database) {
    try {
      const db = database;

      let query = db("brand_templates")
        .where("brand_id", "gutfit")
        .where("format", format);

      if (type !== "all") {
        query = query.where("type", type);
      }

      return await query.select("*");
    } catch (error) {
      logger.error("Failed to get Gutfit templates", { error: error.message });
      throw error;
    }
  }

  async function logGutfitEvent(eventData) {
    try {
      await database("gutfit_events").insert({
        ...eventData,
        metadata: JSON.stringify({
          user_agent: eventData.userAgent,
          ip_address: eventData.ipAddress,
          gutfit_specific: true,
        }),
      });
    } catch (error) {
      logger.error("Failed to log Gutfit event", { error: error.message });
    }
  }

  // Error handling middleware
  router.use((error, req, res, next) => {
    logger.error("Gutfit Brand Extension Error", {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      user: req.accountability?.user,
    });

    if (error.code === "GUTFIT_BRAND_BOOK_GENERATION_FAILED") {
      return res.status(422).json({
        error: error.code,
        message: error.message,
        details: error.details,
      });
    }

    // Default error response
    res.status(500).json({
      error: "GUTFIT_INTERNAL_ERROR",
      message: "An internal error occurred",
      reference: `gutfit_err_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    });
  });

  logger.info("Gutfit Brand Extension loaded successfully");
};
