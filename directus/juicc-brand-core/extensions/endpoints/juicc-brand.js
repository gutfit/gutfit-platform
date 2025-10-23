/**
 * Juicc Brand Extension
 *
 * Enhanced Directus extension with brand book generation,
 * AI-powered content creation, and advanced analytics
 */

import { JuiccBrandBookGenerator } from "../../services/brand-book-generator.js";
import { AIService } from "../../ai-orchestrator/services/ai-service.js";
import { BrandDNAAnalyzer } from "../../intelligence/brand-dna-analyzer.js";
import { EmotionAnalyzer } from "../../intelligence/emotion-analyzer.js";
import { logger } from "../../utils/logger.js";

export default ({ router, services, database }) => {
  const { AssetsService, BrandsService, UsersService } = services;

  // Initialize services
  const brandBookGenerator = new JuiccBrandBookGenerator();
  const aiService = new AIService();
  const brandDNAAnalyzer = new BrandDNAAnalyzer();
  const emotionAnalyzer = new EmotionAnalyzer();

  /**
   * Generate Brand Book
   *
   * POST /brands/:id/generate-book
   *
   * Generates a comprehensive brand book in various formats
   */
  router.post("/brands/:id/generate-book", async (req, res) => {
    const startTime = Date.now();

    try {
      const { id } = req.params;
      const { format = "web", options = {} } = req.body;

      logger.info("Brand book generation request", {
        brandId: id,
        format,
        options,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateBrandAccess(req.accountability, id);

      // Generate brand book
      const result = await brandBookGenerator.generateBrandBook(
        id,
        format,
        options
      );

      // Log generation event
      await logBrandEvent({
        action: "brand_book_generated",
        brandId: id,
        userId: req.accountability?.user,
        format,
        options,
        duration: Date.now() - startTime,
        success: true,
      });

      logger.info("Brand book generation completed", {
        brandId: id,
        format,
        duration: Date.now() - startTime,
        contentCount: result.metadata.contentCount,
        assetCount: result.metadata.assetCount,
      });

      res.json(result);
    } catch (error) {
      logger.error("Brand book generation failed", {
        brandId: req.params.id,
        format: req.body.format,
        error: error.message,
        userId: req.accountability?.user,
      });

      // Log failure event
      await logBrandEvent({
        action: "brand_book_generation_failed",
        brandId: req.params.id,
        userId: req.accountability?.user,
        format: req.body.format,
        error: error.message,
        duration: Date.now() - startTime,
        success: false,
      });

      res.status(500).json({
        error: "BRAND_BOOK_GENERATION_FAILED",
        message: error.message,
        details:
          process.env.NODE_ENV === "development" ? error.stack : undefined,
      });
    }
  });

  /**
   * Analyze Brand DNA
   *
   * POST /brands/:id/analyze-dna
   *
   * Performs comprehensive brand DNA analysis
   */
  router.post("/brands/:id/analyze-dna", async (req, res) => {
    try {
      const { id } = req.params;
      const { options = {} } = req.body;

      logger.info("Brand DNA analysis request", {
        brandId: id,
        options,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateBrandAccess(req.accountability, id);

      // Get brand data
      const brandData = await getBrandData(id, services);

      // Analyze brand DNA
      const analysis = await aiService.analyzeBrandDNA(brandData);

      // Store analysis results
      await storeBrandAnalysis(id, analysis, database);

      logger.info("Brand DNA analysis completed", {
        brandId: id,
        confidence: analysis.confidence,
        userId: req.accountability?.user,
      });

      res.json(analysis);
    } catch (error) {
      logger.error("Brand DNA analysis failed", {
        brandId: req.params.id,
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "BRAND_DNA_ANALYSIS_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Generate AI-Powered Content
   *
   * POST /brands/:id/generate-content
   *
   * Generates brand-compliant content using AI
   */
  router.post("/brands/:id/generate-content", async (req, res) => {
    try {
      const { id } = req.params;
      const { type, specifications, context = {} } = req.body;

      logger.info("Content generation request", {
        brandId: id,
        type,
        specifications,
        context,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateBrandAccess(req.accountability, id);

      // Get brand data for context
      const brandData = await getBrandData(id, services);
      const brandDNA = await aiService.analyzeBrandDNA(brandData);

      // Generate content
      const content = await aiService.generateContentVariations(
        brandDNA,
        context.emotionalProfile || { primary: "neutral" },
        type,
        specifications
      );

      logger.info("Content generation completed", {
        brandId: id,
        type,
        variationsCount: content.variations.length,
        userId: req.accountability?.user,
      });

      res.json(content);
    } catch (error) {
      logger.error("Content generation failed", {
        brandId: req.params.id,
        type: req.body.type,
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "CONTENT_GENERATION_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Analyze Emotional Profile
   *
   * POST /brands/:id/emotional-profile
   *
   * Generates emotional profile analysis for the brand
   */
  router.post("/brands/:id/emotional-profile", async (req, res) => {
    try {
      const { id } = req.params;
      const { context = {} } = req.body;

      logger.info("Emotional profile analysis request", {
        brandId: id,
        context,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateBrandAccess(req.accountability, id);

      // Get brand data
      const brandData = await getBrandData(id, services);
      const brandDNA = await aiService.analyzeBrandDNA(brandData);

      // Analyze emotional profile
      const profile = await aiService.analyzeEmotionalContext(
        brandDNA,
        context
      );

      // Store emotional profile
      await storeEmotionalProfile(id, profile, database);

      logger.info("Emotional profile analysis completed", {
        brandId: id,
        primaryEmotion: profile.primary,
        userId: req.accountability?.user,
      });

      res.json(profile);
    } catch (error) {
      logger.error("Emotional profile analysis failed", {
        brandId: req.params.id,
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "EMOTIONAL_PROFILE_ANALYSIS_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Create Brand Asset
   *
   * POST /brands/:id/create-asset
   *
   * Creates brand assets using AI generation
   */
  router.post("/brands/:id/create-asset", async (req, res) => {
    try {
      const { id } = req.params;
      const { type, specifications, options = {} } = req.body;

      logger.info("Asset creation request", {
        brandId: id,
        type,
        specifications,
        options,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateBrandAccess(req.accountability, id, "write");

      // Generate asset
      const asset = await aiService.generateBrandAsset(
        id,
        type,
        specifications
      );

      // Store asset in Directus
      const storedAsset = await storeBrandAsset(
        id,
        asset,
        services,
        req.accountability
      );

      logger.info("Asset creation completed", {
        brandId: id,
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
      logger.error("Asset creation failed", {
        brandId: req.params.id,
        type: req.body.type,
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "ASSET_CREATION_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Get Brand Health Dashboard
   *
   * GET /brands/:id/health
   *
   * Returns comprehensive brand health metrics
   */
  router.get("/brands/:id/health", async (req, res) => {
    try {
      const { id } = req.params;
      const { timeframe = "30d" } = req.query;

      logger.info("Brand health request", {
        brandId: id,
        timeframe,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateBrandAccess(req.accountability, id);

      // Calculate brand health metrics
      const health = await calculateBrandHealth(
        id,
        timeframe,
        services,
        database
      );

      logger.info("Brand health calculation completed", {
        brandId: id,
        overallScore: health.overall_score,
        userId: req.accountability?.user,
      });

      res.json(health);
    } catch (error) {
      logger.error("Brand health calculation failed", {
        brandId: req.params.id,
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "BRAND_HEALTH_CALCULATION_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Get AI Suggestions
   *
   * POST /brands/:id/suggestions
   *
   * Returns contextual AI suggestions for brand improvement
   */
  router.post("/brands/:id/suggestions", async (req, res) => {
    try {
      const { id } = req.params;
      const { context = {} } = req.body;

      logger.info("AI suggestions request", {
        brandId: id,
        context,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateBrandAccess(req.accountability, id);

      // Generate suggestions
      const suggestions = await aiService.generateContextualSuggestions(
        id,
        context
      );

      logger.info("AI suggestions generated", {
        brandId: id,
        suggestionsCount: suggestions.length,
        userId: req.accountability?.user,
      });

      res.json({
        suggestions,
        brandId: id,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("AI suggestions generation failed", {
        brandId: req.params.id,
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "AI_SUGGESTIONS_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Process AI Message
   *
   * POST /ai/message
   *
   * Processes user message and returns AI response
   */
  router.post("/ai/message", async (req, res) => {
    try {
      const {
        message,
        brandId,
        context,
        emotionalState,
        personalityMode,
        conversationHistory,
      } = req.body;

      logger.info("AI message request", {
        brandId,
        message: message.substring(0, 100),
        personalityMode,
        userId: req.accountability?.user,
      });

      // Validate brand access if brandId is provided
      if (brandId) {
        await validateBrandAccess(req.accountability, brandId);
      }

      // Process message
      const response = await aiService.processMessage({
        message,
        brandId,
        context,
        emotionalState,
        personalityMode,
        conversationHistory,
      });

      logger.info("AI message processed", {
        brandId,
        responseLength: response.content.length,
        hasSuggestions: response.suggestions.length > 0,
        userId: req.accountability?.user,
      });

      res.json(response);
    } catch (error) {
      logger.error("AI message processing failed", {
        brandId: req.body.brandId,
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "AI_MESSAGE_PROCESSING_FAILED",
        message: error.message,
      });
    }
  });

  /**
   * Recommend Channels
   *
   * POST /brands/:id/recommend-channels
   *
   * Recommends optimal channels for brand content distribution
   */
  router.post("/brands/:id/recommend-channels", async (req, res) => {
    try {
      const { id } = req.params;
      const { campaignData } = req.body;

      logger.info("Channel recommendation request", {
        brandId: id,
        campaignGoals: campaignData.goals?.length || 0,
        userId: req.accountability?.user,
      });

      // Validate user permissions
      await validateBrandAccess(req.accountability, id);

      // Get brand data
      const brandData = await getBrandData(id, services);

      // Generate recommendations
      const recommendations = await aiService.recommendChannels(
        brandData,
        campaignData
      );

      logger.info("Channel recommendations generated", {
        brandId: id,
        optimalChannels: recommendations.optimal.length,
        userId: req.accountability?.user,
      });

      res.json(recommendations);
    } catch (error) {
      logger.error("Channel recommendation failed", {
        brandId: req.params.id,
        error: error.message,
        userId: req.accountability?.user,
      });

      res.status(500).json({
        error: "CHANNEL_RECOMMENDATION_FAILED",
        message: error.message,
      });
    }
  });

  // Helper functions
  async function validateBrandAccess(
    accountability,
    brandId,
    permission = "read"
  ) {
    if (!accountability?.user) {
      throw new Error("Authentication required");
    }

    // Check if user has access to the brand
    const userBrands = accountability.brand_permissions || [];
    const hasAccess = userBrands.some(
      (perm) =>
        perm.brand_id === brandId && perm.permissions.includes(permission)
    );

    if (!hasAccess && accountability.role !== "admin") {
      throw new Error("User does not have access to this brand");
    }
  }

  async function getBrandData(brandId, services) {
    const brandsService = new services.BrandsService({
      schema: await services.getSchema(),
      knex: services.database,
    });

    const brand = await brandsService.readOne(brandId, {
      fields: ["*"],
      deep: {
        assets: {
          fields: [
            "id",
            "type",
            "title",
            "description",
            "filename",
            "filesize",
            "type",
          ],
        },
        rules: {
          fields: ["id", "rule_type", "rule_name", "rule_config"],
        },
      },
    });

    return brand;
  }

  async function storeBrandAnalysis(brandId, analysis, database) {
    try {
      await database("brand_analyses").insert({
        brand_id: brandId,
        analysis_data: JSON.stringify(analysis),
        confidence: analysis.confidence,
        created_at: new Date(),
        updated_at: new Date(),
      });
    } catch (error) {
      logger.error("Failed to store brand analysis", {
        brandId,
        error: error.message,
      });
    }
  }

  async function storeEmotionalProfile(brandId, profile, database) {
    try {
      await database("emotional_profiles").insert({
        brand_id: brandId,
        primary_emotion: profile.primary,
        secondary_emotions: JSON.stringify(profile.secondary),
        intensity: profile.intensity,
        profile_data: JSON.stringify(profile),
        created_at: new Date(),
        updated_at: new Date(),
      });
    } catch (error) {
      logger.error("Failed to store emotional profile", {
        brandId,
        error: error.message,
      });
    }
  }

  async function storeBrandAsset(brandId, asset, services, accountability) {
    const assetsService = new services.AssetsService({
      schema: await services.getSchema(),
      knex: services.database,
    });

    // For now, create a basic asset record
    // In production, this would handle file uploads and storage
    const assetData = {
      brand_id: brandId,
      title: `AI Generated ${asset.type}`,
      description: `AI-generated ${asset.type} with ${asset.confidence} confidence`,
      type: asset.type,
      metadata: {
        generated_by: "ai",
        confidence: asset.confidence,
        specifications: asset.specifications,
        created_at: asset.generatedAt,
      },
      created_by: accountability.user,
      created_at: new Date(),
      updated_at: new Date(),
    };

    return await assetsService.createOne(assetData);
  }

  async function calculateBrandHealth(brandId, timeframe, services, database) {
    try {
      const db = database;

      // Get brand assets and their compliance scores
      const [assets, analytics, latestAnalysis] = await Promise.all([
        db("digital_assets")
          .where("brand_id", brandId)
          .select("compliance_score", "status"),

        db("brand_analytics")
          .where("brand_id", brandId)
          .where("timestamp", ">=", db.raw(`NOW() - INTERVAL '${timeframe}'`))
          .select("metric_name", "metric_value"),

        db("brand_analyses")
          .where("brand_id", brandId)
          .orderBy("created_at", "desc")
          .first(),
      ]);

      // Calculate coherence (average compliance score)
      const coherence =
        assets.length > 0
          ? assets.reduce(
              (sum, asset) => sum + (asset.compliance_score || 0),
              0
            ) / assets.length
          : 0;

      // Calculate emotional resonance
      const emotionalScore = analytics
        .filter((a) => a.metric_name === "emotional_resonance")
        .reduce((sum, a, _, arr) => sum + a.metric_value / arr.length, 0);

      // Calculate compliance rate
      const complianceRate =
        assets.length > 0
          ? (assets.filter((a) => a.status === "approved").length /
              assets.length) *
            100
          : 0;

      // Calculate overall score
      const overallScore =
        coherence * 0.4 + emotionalScore * 0.3 + complianceRate * 0.3;

      return {
        overall_score: Math.round(overallScore * 100) / 100,
        metrics: {
          coherence: Math.round(coherence * 100) / 100,
          emotional_resonance: Math.round(emotionalScore * 100) / 100,
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
      };
    } catch (error) {
      logger.error("Failed to calculate brand health", {
        brandId,
        error: error.message,
      });
      throw error;
    }
  }

  async function logBrandEvent(eventData) {
    try {
      await database("brand_events").insert({
        ...eventData,
        metadata: JSON.stringify({
          user_agent: eventData.userAgent,
          ip_address: eventData.ipAddress,
        }),
      });
    } catch (error) {
      logger.error("Failed to log brand event", { error: error.message });
    }
  }

  // Error handling middleware
  router.use((error, req, res, next) => {
    logger.error("Juicc Brand Extension Error", {
      error: error.message,
      stack: error.stack,
      url: req.url,
      method: req.method,
      user: req.accountability?.user,
    });

    if (error.code === "BRAND_BOOK_GENERATION_FAILED") {
      return res.status(422).json({
        error: error.code,
        message: error.message,
        details: error.details,
      });
    }

    // Default error response
    res.status(500).json({
      error: "INTERNAL_ERROR",
      message: "An internal error occurred",
      reference: `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });
  });

  logger.info("Juicc Brand Extension loaded successfully");
};
