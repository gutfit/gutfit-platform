/**
 * Juicc AI Service
 *
 * Core AI service for intelligent content generation,
 * brand analysis, and emotional intelligence
 */

import { logger } from "../utils/logger.js";
import { BrandDNAAnalyzer } from "../intelligence/brand-dna-analyzer.js";
import { EmotionAnalyzer } from "../intelligence/emotion-analyzer.js";
import { ContentGenerator } from "../generators/content-generator.js";
import { ImageGenerator } from "../generators/image-generator.js";
import { TextGenerator } from "../generators/text-generator.js";

export class AIService {
  constructor(options = {}) {
    this.brandDNAAnalyzer = new BrandDNAAnalyzer();
    this.emotionAnalyzer = new EmotionAnalyzer();
    this.contentGenerator = new ContentGenerator();
    this.imageGenerator = new ImageGenerator();
    this.textGenerator = new TextGenerator();

    this.options = {
      model: options.model || "gpt-4",
      temperature: options.temperature || 0.7,
      maxTokens: options.maxTokens || 2000,
      ...options,
    };

    this.cache = new Map();
    this.requestQueue = [];
    this.isProcessing = false;
  }

  /**
   * Generate text content using AI
   */
  async generateText(prompt, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey("text", prompt, options);

    try {
      // Check cache first
      if (this.cache.has(cacheKey)) {
        logger.debug("AI text cache hit", { cacheKey });
        return this.cache.get(cacheKey);
      }

      logger.debug("Generating AI text", { prompt: prompt.substring(0, 100) });

      const response = await this.textGenerator.generate(prompt, {
        ...this.options,
        ...options,
      });

      const result = {
        content: response.content,
        confidence: response.confidence || 0.8,
        model: this.options.model,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      };

      // Cache result
      this.cache.set(cacheKey, result);

      logger.debug("AI text generation completed", {
        processingTime: result.processingTime,
        contentLength: result.content.length,
      });

      return result;
    } catch (error) {
      logger.error("AI text generation failed", {
        prompt: prompt.substring(0, 100),
        error: error.message,
      });
      throw new AIServiceError("TEXT_GENERATION_FAILED", error.message);
    }
  }

  /**
   * Generate visual content using AI
   */
  async generateVisual(prompt, options = {}) {
    const startTime = Date.now();
    const cacheKey = this.generateCacheKey("visual", prompt, options);

    try {
      // Check cache first
      if (this.cache.has(cacheKey)) {
        logger.debug("AI visual cache hit", { cacheKey });
        return this.cache.get(cacheKey);
      }

      logger.debug("Generating AI visual", {
        prompt: prompt.substring(0, 100),
      });

      const response = await this.imageGenerator.generate(prompt, {
        ...this.options,
        ...options,
      });

      const result = {
        content: response.content,
        url: response.url,
        confidence: response.confidence || 0.8,
        model: this.options.model,
        timestamp: new Date().toISOString(),
        processingTime: Date.now() - startTime,
      };

      // Cache result
      this.cache.set(cacheKey, result);

      logger.debug("AI visual generation completed", {
        processingTime: result.processingTime,
      });

      return result;
    } catch (error) {
      logger.error("AI visual generation failed", {
        prompt: prompt.substring(0, 100),
        error: error.message,
      });
      throw new AIServiceError("VISUAL_GENERATION_FAILED", error.message);
    }
  }

  /**
   * Generate content variations based on brand DNA and emotional context
   */
  async generateContentVariations(
    brandDNA,
    emotionalProfile,
    contentType,
    options = {}
  ) {
    try {
      logger.debug("Generating content variations", {
        brandId: brandDNA.identity.name,
        contentType,
        emotionalState: emotionalProfile.primary,
      });

      const prompt = this.buildContentPrompt(
        brandDNA,
        emotionalProfile,
        contentType,
        options
      );
      const response = await this.generateText(prompt, {
        temperature: 0.8, // Higher creativity for variations
        maxTokens: 1500,
        ...options,
      });

      return {
        variations: this.parseContentVariations(response.content),
        confidence: response.confidence,
        emotionalAlignment: this.calculateEmotionalAlignment(
          response.content,
          emotionalProfile
        ),
        brandCompliance: this.calculateBrandCompliance(
          response.content,
          brandDNA
        ),
      };
    } catch (error) {
      logger.error("Content variation generation failed", {
        contentType,
        error: error.message,
      });
      throw error;
    }
  }

  /**
   * Analyze brand DNA from provided data
   */
  async analyzeBrandDNA(brandData) {
    try {
      logger.debug("Analyzing brand DNA", { brandId: brandData.id });

      const analysis = await this.brandDNAAnalyzer.analyze(brandData);

      return {
        identity: analysis.identity,
        visual: analysis.visual,
        voice: analysis.voice,
        emotional: analysis.emotional,
        strategic: analysis.strategic,
        confidence: analysis.confidence,
        insights: analysis.insights,
        recommendations: analysis.recommendations,
      };
    } catch (error) {
      logger.error("Brand DNA analysis failed", {
        brandId: brandData.id,
        error: error.message,
      });
      throw new AIServiceError("BRAND_DNA_ANALYSIS_FAILED", error.message);
    }
  }

  /**
   * Analyze emotional context for brand content
   */
  async analyzeEmotionalContext(brandDNA, context) {
    try {
      logger.debug("Analyzing emotional context", {
        brandId: brandDNA.identity.name,
        context: JSON.stringify(context).substring(0, 100),
      });

      const analysis = await this.emotionAnalyzer.analyze({
        brandDNA,
        context: {
          timeOfDay: new Date().getHours(),
          season: this.getCurrentSeason(),
          marketConditions: context.marketConditions || "stable",
          targetAudience:
            context.targetAudience || brandDNA.strategic.targetAudience,
          campaignGoals: context.campaignGoals || [],
          ...context,
        },
      });

      return {
        primary: analysis.primary_emotion,
        secondary: analysis.secondary_emotions,
        intensity: analysis.emotional_intensity,
        recommendations: analysis.recommendations,
        adaptations: analysis.adaptations,
        confidence: analysis.confidence,
        summary: {
          emotion: analysis.primary_emotion,
          confidence: analysis.confidence,
          rationale: analysis.rationale,
        },
      };
    } catch (error) {
      logger.error("Emotional context analysis failed", {
        brandId: brandDNA.identity.name,
        error: error.message,
      });
      throw new AIServiceError("EMOTIONAL_ANALYSIS_FAILED", error.message);
    }
  }

  /**
   * Generate contextual suggestions for brand content
   */
  async generateContextualSuggestions(brandId, context) {
    try {
      logger.debug("Generating contextual suggestions", { brandId });

      const prompt = this.buildSuggestionPrompt(brandId, context);
      const response = await this.generateText(prompt, {
        temperature: 0.9, // High creativity for suggestions
        maxTokens: 1000,
      });

      return this.parseSuggestions(response.content);
    } catch (error) {
      logger.error("Contextual suggestion generation failed", {
        brandId,
        error: error.message,
      });
      throw new AIServiceError("SUGGESTION_GENERATION_FAILED", error.message);
    }
  }

  /**
   * Process user message and generate intelligent response
   */
  async processMessage(messageData) {
    try {
      const {
        message,
        brandId,
        context,
        emotionalState,
        personalityMode,
        conversationHistory,
      } = messageData;

      logger.debug("Processing AI message", {
        brandId,
        message: message.substring(0, 100),
        personalityMode,
      });

      // Build context-aware prompt
      const prompt = this.buildMessagePrompt(messageData);

      // Generate response
      const response = await this.generateText(prompt, {
        temperature: this.getTemperatureForPersonality(personalityMode),
        maxTokens: 1000,
      });

      // Parse response components
      const parsed = this.parseMessageResponse(response.content);

      // Generate additional suggestions if needed
      let suggestions = [];
      if (context?.assets?.length > 0) {
        suggestions = await this.generateAssetSuggestions(
          brandId,
          context,
          parsed
        );
      }

      return {
        content: parsed.content,
        suggestions: suggestions,
        emotionalTone: this.detectEmotionalTone(parsed.content),
        confidence: response.confidence,
        actions: this.suggestActions(parsed, context),
        followUpQuestions: this.generateFollowUpQuestions(parsed),
      };
    } catch (error) {
      logger.error("Message processing failed", {
        brandId: messageData.brandId,
        error: error.message,
      });
      throw new AIServiceError("MESSAGE_PROCESSING_FAILED", error.message);
    }
  }

  /**
   * Generate brand assets using AI
   */
  async generateBrandAsset(brandId, assetType, specifications) {
    try {
      logger.debug("Generating brand asset", {
        brandId,
        assetType,
        specifications: JSON.stringify(specifications).substring(0, 100),
      });

      // Get brand data for context
      const brandData = await this.getBrandData(brandId);
      const brandDNA = await this.analyzeBrandDNA(brandData);

      // Build asset generation prompt
      const prompt = this.buildAssetPrompt(brandDNA, assetType, specifications);

      let response;
      if (this.isVisualAsset(assetType)) {
        response = await this.generateVisual(prompt, {
          style: brandDNA.visual.imagery.style,
          colors: brandDNA.visual.colors.primary,
        });
      } else {
        response = await this.generateText(prompt);
      }

      return {
        type: assetType,
        content: response.content,
        url: response.url,
        specifications,
        brandCompliance: this.calculateBrandCompliance(
          response.content,
          brandDNA
        ),
        confidence: response.confidence,
        generatedAt: new Date().toISOString(),
      };
    } catch (error) {
      logger.error("Brand asset generation failed", {
        brandId,
        assetType,
        error: error.message,
      });
      throw new AIServiceError("ASSET_GENERATION_FAILED", error.message);
    }
  }

  /**
   * Recommend optimal channels for brand content
   */
  async recommendChannels(brandData, campaignData) {
    try {
      logger.debug("Recommending channels", {
        brandId: brandData.id,
        campaignGoals: campaignData.goals?.length || 0,
      });

      const prompt = this.buildChannelRecommendationPrompt(
        brandData,
        campaignData
      );
      const response = await this.generateText(prompt, {
        temperature: 0.5, // Lower temperature for more analytical response
        maxTokens: 1500,
      });

      return this.parseChannelRecommendations(response.content);
    } catch (error) {
      logger.error("Channel recommendation failed", {
        brandId: brandData.id,
        error: error.message,
      });
      throw new AIServiceError("CHANNEL_RECOMMENDATION_FAILED", error.message);
    }
  }

  // Helper methods
  generateCacheKey(type, prompt, options) {
    const optionsStr = JSON.stringify(options);
    return `${type}:${prompt.substring(0, 50)}:${optionsStr}`.replace(
      /\s+/g,
      "-"
    );
  }

  buildContentPrompt(brandDNA, emotionalProfile, contentType, options) {
    const basePrompt = `
      Generate ${contentType} content for a brand with the following characteristics:
      
      Brand Name: ${brandDNA.identity.name}
      Brand Personality: ${brandDNA.voice.personality.join(", ")}
      Brand Tone: ${brandDNA.voice.tone}
      Primary Emotion: ${emotionalProfile.primary}
      Target Audience: ${JSON.stringify(brandDNA.strategic.targetAudience)}
      
      Content Type: ${contentType}
      Emotional Context: ${emotionalProfile.primary} with intensity ${
      emotionalProfile.intensity
    }
    `;

    if (options.purpose) {
      return `${basePrompt}\nPurpose: ${options.purpose}`;
    }

    if (options.platform) {
      return `${basePrompt}\nPlatform: ${options.platform}`;
    }

    return basePrompt;
  }

  buildSuggestionPrompt(brandId, context) {
    return `
      Generate intelligent suggestions for brand content creation.
      
      Brand ID: ${brandId}
      Current Context: ${JSON.stringify(context)}
      Available Assets: ${context.assets?.length || 0}
      Creative Mode: ${context.creativeMode || "design"}
      
      Provide 3-5 actionable suggestions that would enhance the brand experience.
      Each suggestion should include:
      - Type of suggestion (asset, layout, interaction, etc.)
      - Brief description
      - Expected impact
      - Implementation difficulty (easy, medium, hard)
    `;
  }

  buildMessagePrompt(messageData) {
    const {
      message,
      brandId,
      context,
      emotionalState,
      personalityMode,
      conversationHistory,
    } = messageData;

    let prompt = `
      You are an intelligent brand assistant for brand ${brandId}.
      Current emotional state: ${emotionalState}
      Personality mode: ${personalityMode}
      
      User message: "${message}"
      
      Context: ${JSON.stringify(context)}
    `;

    if (conversationHistory && conversationHistory.length > 0) {
      const recentHistory = conversationHistory.slice(-3);
      prompt += `\n\nRecent conversation:\n`;
      recentHistory.forEach((msg, index) => {
        prompt += `${index + 1}. ${msg.type}: ${msg.content}\n`;
      });
    }

    prompt += `
      
      Respond in a ${personalityMode} tone that aligns with the ${emotionalState} emotional state.
      Provide helpful, brand-aware guidance.
      If relevant, suggest specific actions or next steps.
    `;

    return prompt;
  }

  buildAssetPrompt(brandDNA, assetType, specifications) {
    return `
      Generate a ${assetType} for brand ${brandDNA.identity.name}.
      
      Brand Visual Identity:
      - Primary Colors: ${brandDNA.visual.colors.primary?.join(", ") || "N/A"}
      - Typography: ${brandDNA.visual.typography.primary?.family || "N/A"}
      - Imagery Style: ${brandDNA.visual.imagery.style || "N/A"}
      
      Brand Voice:
      - Tone: ${brandDNA.voice.tone}
      - Personality: ${brandDNA.voice.personality.join(", ")}
      
      Asset Specifications: ${JSON.stringify(specifications)}
      
      Ensure the asset aligns with the brand's visual identity and voice.
    `;
  }

  buildChannelRecommendationPrompt(brandData, campaignData) {
    return `
      Analyze and recommend optimal channels for a brand campaign.
      
      Brand Data:
      - Name: ${brandData.name}
      - Industry: ${brandData.industry || "N/A"}
      - Target Audience: ${JSON.stringify(brandData.targetAudience)}
      - Brand Personality: ${brandData.personality?.join(", ") || "N/A"}
      
      Campaign Data:
      - Goals: ${campaignData.goals?.join(", ") || "N/A"}
      - Budget: ${campaignData.budget || "N/A"}
      - Duration: ${campaignData.duration || "N/A"}
      - Target Geography: ${campaignData.geography || "N/A"}
      
      Recommend 3-5 optimal channels with:
      - Channel name
      - Rationale for selection
      - Expected reach/engagement
      - Required budget allocation
      - Content recommendations
    `;
  }

  parseContentVariations(content) {
    // Implementation would parse AI response into structured variations
    try {
      // Simple parsing - in production would use more sophisticated parsing
      const lines = content.split("\n").filter((line) => line.trim());
      return lines.map((line, index) => ({
        id: `variation-${index + 1}`,
        content: line.trim(),
        type: "text",
      }));
    } catch (error) {
      logger.error("Failed to parse content variations", {
        error: error.message,
      });
      return [
        {
          id: "variation-1",
          content: content,
          type: "text",
        },
      ];
    }
  }

  parseSuggestions(content) {
    try {
      // Simple parsing - in production would use more sophisticated parsing
      const suggestions = [];
      const lines = content.split("\n").filter((line) => line.trim());

      let currentSuggestion = null;

      for (const line of lines) {
        if (line.match(/^\d+\./)) {
          if (currentSuggestion) {
            suggestions.push(currentSuggestion);
          }
          currentSuggestion = {
            id: `suggestion-${suggestions.length + 1}`,
            title: line.replace(/^\d+\.\s*/, ""),
            description: "",
            impact: "",
            difficulty: "medium",
          };
        } else if (currentSuggestion) {
          if (line.toLowerCase().includes("impact:")) {
            currentSuggestion.impact = line.replace(/impact:\s*/i, "");
          } else if (line.toLowerCase().includes("difficulty:")) {
            currentSuggestion.difficulty = line.replace(/difficulty:\s*/i, "");
          } else {
            currentSuggestion.description += line + " ";
          }
        }
      }

      if (currentSuggestion) {
        suggestions.push(currentSuggestion);
      }

      return suggestions;
    } catch (error) {
      logger.error("Failed to parse suggestions", { error: error.message });
      return [
        {
          id: "suggestion-1",
          title: "General Suggestion",
          description: content,
          impact: "Medium",
          difficulty: "medium",
        },
      ];
    }
  }

  parseMessageResponse(content) {
    try {
      // Simple parsing - in production would use more sophisticated parsing
      return {
        content: content.trim(),
        type: "text",
        hasSuggestions: content.toLowerCase().includes("suggest"),
        hasQuestions: content.includes("?"),
        hasActions:
          content.toLowerCase().includes("should") ||
          content.toLowerCase().includes("recommend"),
      };
    } catch (error) {
      logger.error("Failed to parse message response", {
        error: error.message,
      });
      return {
        content: content,
        type: "text",
        hasSuggestions: false,
        hasQuestions: false,
        hasActions: false,
      };
    }
  }

  parseChannelRecommendations(content) {
    try {
      // Simple parsing - in production would use more sophisticated parsing
      const recommendations = [];
      const lines = content.split("\n").filter((line) => line.trim());

      let currentRecommendation = null;

      for (const line of lines) {
        if (line.match(/^\d+\./) || line.match(/^[A-Z][a-z]+:/)) {
          if (currentRecommendation) {
            recommendations.push(currentRecommendation);
          }

          const channelName = line.replace(/^\d+\.\s*/, "").replace(/:.*$/, "");
          currentRecommendation = {
            id: `channel-${recommendations.length + 1}`,
            name: channelName,
            rationale: "",
            expectedReach: "",
            budgetAllocation: "",
            contentRecommendations: [],
          };
        } else if (currentRecommendation) {
          if (line.toLowerCase().includes("rationale:")) {
            currentRecommendation.rationale = line.replace(
              /rationale:\s*/i,
              ""
            );
          } else if (line.toLowerCase().includes("reach:")) {
            currentRecommendation.expectedReach = line.replace(
              /reach:\s*/i,
              ""
            );
          } else if (line.toLowerCase().includes("budget:")) {
            currentRecommendation.budgetAllocation = line.replace(
              /budget:\s*/i,
              ""
            );
          } else {
            currentRecommendation.contentRecommendations.push(line.trim());
          }
        }
      }

      if (currentRecommendation) {
        recommendations.push(currentRecommendation);
      }

      return {
        optimal: recommendations,
        alternatives: [],
        confidence: 0.8,
      };
    } catch (error) {
      logger.error("Failed to parse channel recommendations", {
        error: error.message,
      });
      return {
        optimal: [],
        alternatives: [],
        confidence: 0.5,
      };
    }
  }

  calculateEmotionalAlignment(content, emotionalProfile) {
    // Simple implementation - in production would use more sophisticated analysis
    const emotion = emotionalProfile.primary.toLowerCase();
    const contentLower = content.toLowerCase();

    const emotionWords = {
      joy: ["happy", "excited", "delighted", "cheerful"],
      trust: ["reliable", "dependable", "consistent", "honest"],
      creativity: ["innovative", "creative", "imaginative", "original"],
      elegance: ["sophisticated", "refined", "elegant", "premium"],
      energy: ["dynamic", "energetic", "vibrant", "bold"],
    };

    const words = emotionWords[emotion] || [];
    const matches = words.filter((word) => contentLower.includes(word));

    return Math.min(matches.length / words.length, 1.0);
  }

  calculateBrandCompliance(content, brandDNA) {
    // Simple implementation - in production would use more sophisticated analysis
    const brandName = brandDNA.identity.name.toLowerCase();
    const brandValues = brandDNA.identity.values.map((v) => v.toLowerCase());
    const contentLower = content.toLowerCase();

    let score = 0.5; // Base score

    if (contentLower.includes(brandName)) {
      score += 0.2;
    }

    const valueMatches = brandValues.filter((value) =>
      contentLower.includes(value)
    );
    score += (valueMatches.length / brandValues.length) * 0.3;

    return Math.min(score, 1.0);
  }

  detectEmotionalTone(content) {
    // Simple implementation - in production would use more sophisticated analysis
    const contentLower = content.toLowerCase();

    const toneWords = {
      professional: ["professional", "business", "formal", "corporate"],
      friendly: ["friendly", "warm", "approachable", "casual"],
      creative: ["creative", "innovative", "imaginative", "artistic"],
      confident: ["confident", "bold", "strong", "assured"],
      empathetic: ["empathetic", "understanding", "compassionate", "caring"],
    };

    let maxScore = 0;
    let detectedTone = "neutral";

    for (const [tone, words] of Object.entries(toneWords)) {
      const matches = words.filter((word) => contentLower.includes(word));
      const score = matches.length / words.length;

      if (score > maxScore) {
        maxScore = score;
        detectedTone = tone;
      }
    }

    return detectedTone;
  }

  suggestActions(parsed, context) {
    const actions = [];

    if (parsed.hasSuggestions) {
      actions.push({
        type: "generate_suggestions",
        label: "Generate More Suggestions",
        description: "Get additional AI-powered suggestions",
      });
    }

    if (context.assets && context.assets.length > 0) {
      actions.push({
        type: "analyze_assets",
        label: "Analyze Assets",
        description: "Get AI analysis of your current assets",
      });
    }

    if (parsed.hasActions) {
      actions.push({
        type: "create_content",
        label: "Create Content",
        description: "Generate new brand content",
      });
    }

    return actions;
  }

  generateFollowUpQuestions(parsed) {
    const questions = [];

    if (parsed.hasSuggestions) {
      questions.push(
        "Would you like me to elaborate on any of these suggestions?"
      );
    }

    if (parsed.hasActions) {
      questions.push("What type of content would you like to create?");
    }

    questions.push("How can I help you further with your brand?");

    return questions;
  }

  async generateAssetSuggestions(brandId, context, parsed) {
    try {
      const suggestions = [];

      if (context.assets && context.assets.length > 0) {
        for (const asset of context.assets.slice(0, 3)) {
          // Limit to 3 assets
          const prompt = `
            Suggest improvements for this brand asset:
            Asset Type: ${asset.type}
            Current Description: ${asset.description || "No description"}
            Brand Context: ${JSON.stringify(context)}
          `;

          const response = await this.generateText(prompt, { maxTokens: 300 });

          suggestions.push({
            assetId: asset.id,
            suggestions: this.parseSuggestions(response.content),
            confidence: response.confidence,
          });
        }
      }

      return suggestions;
    } catch (error) {
      logger.error("Failed to generate asset suggestions", {
        error: error.message,
      });
      return [];
    }
  }

  isVisualAsset(assetType) {
    const visualTypes = [
      "logo",
      "icon",
      "image",
      "banner",
      "poster",
      "thumbnail",
    ];
    return visualTypes.includes(assetType.toLowerCase());
  }

  getTemperatureForPersonality(personalityMode) {
    const temperatures = {
      professional: 0.3,
      creative: 0.9,
      playful: 0.8,
      elegant: 0.4,
    };

    return temperatures[personalityMode] || 0.7;
  }

  getCurrentSeason() {
    const month = new Date().getMonth();
    if (month >= 2 && month <= 4) return "spring";
    if (month >= 5 && month <= 7) return "summer";
    if (month >= 8 && month <= 10) return "fall";
    return "winter";
  }

  async getBrandData(brandId) {
    // Implementation would fetch from Directus or database
    return {
      id: brandId,
      name: "Sample Brand",
      industry: "Technology",
      targetAudience: {
        demographics: {},
        psychographics: {},
      },
      personality: ["innovative", "reliable"],
    };
  }
}

// Custom Error Class
export class AIServiceError extends Error {
  constructor(code, message, details = {}) {
    super(message);
    this.name = "AIServiceError";
    this.code = code;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }

  toJSON() {
    return {
      error: {
        code: this.code,
        message: this.message,
        details: this.details,
        timestamp: this.timestamp,
        stack: process.env.NODE_ENV === "development" ? this.stack : undefined,
      },
    };
  }
}

export default AIService;
