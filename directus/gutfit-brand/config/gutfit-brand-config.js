/**
 * Gutfit Brand Configuration
 *
 * Specific brand configuration for Gutfit brand assets and guidelines
 */

export const GutfitBrandConfig = {
  // Brand Identity
  identity: {
    name: "Gutfit",
    description: "Revolutionary gut health and wellness platform",
    mission: "To transform lives through personalized gut health solutions",
    vision: "A world where everyone understands their gut health",
    values: [
      "Scientific Excellence",
      "Personalized Care",
      "Innovation",
      "Trust & Transparency",
      "Holistic Wellness",
    ],
    tagline: "Your Gut, Your Health, Your Life",
    story:
      "Gutfit began with a simple realization: gut health is the foundation of overall wellness. Our platform combines cutting-edge science with personalized care to help you understand and optimize your gut health.",
    category: "Health & Wellness",
    established: "2024",
  },

  // Visual Identity
  visual: {
    colors: {
      primary: [
        "#2E7D32", // Deep Green (Health, Nature)
        "#43A047", // Light Green (Growth, Vitality)
        "#1B5E20", // Dark Green (Trust, Stability)
      ],
      secondary: [
        "#FF6F00", // Deep Orange (Energy, Metabolism)
        "#FF8F00", // Light Orange (Warmth, Digestion)
        "#E65100", // Dark Orange (Balance, Harmony)
      ],
      accent: [
        "#00ACC1", // Cyan (Clarity, Purity)
        "#0097A7", // Teal (Calm, Healing)
        "#006064", // Dark Teal (Depth, Wisdom)
      ],
      neutral: [
        "#FFFFFF", // White (Purity, Cleanliness)
        "#F5F5F5", // Light Gray (Balance, Neutrality)
        "#424242", // Dark Gray (Professional, Serious)
        "#212121", // Black (Authority, Impact)
      ],
    },
    typography: {
      primary: {
        family: "Inter",
        weights: [400, 500, 600, 700],
        style: "sans-serif",
      },
      secondary: {
        family: "Open Sans",
        weights: [300, 400, 600],
        style: "sans-serif",
      },
      display: {
        family: "Montserrat",
        weights: [600, 700, 800],
        style: "sans-serif",
      },
      body: {
        family: "Inter",
        weights: [400, 500],
        style: "sans-serif",
      },
    },
    imagery: {
      style: "Clean, Scientific, Human-Centered",
      mood: "Trustworthy, Professional, Approachable",
      subjects: [
        "Microscopic gut imagery",
        "Healthy lifestyle scenes",
        "Scientific visualization",
        "People enjoying wellness activities",
      ],
      guidelines: [
        "Use natural lighting",
        "Maintain scientific accuracy",
        "Show diversity in subjects",
        "Keep imagery positive and empowering",
      ],
    },
    logo: {
      primary: {
        description: "Gutfit logo with gut microbiome visualization",
        clearSpace: "20px",
        minimumSize: "40px",
        usage: "Primary brand identification",
      },
      variations: [
        {
          name: "Horizontal",
          description: "Logo with text to the right",
          use: "Headers, navigation",
        },
        {
          name: "Stacked",
          description: "Logo with text below",
          use: "Vertical spaces, mobile",
        },
        {
          name: "Icon Only",
          description: "Symbol without text",
          use: "Mobile apps, favicons",
        },
      ],
    },
    iconography: {
      style: "Clean, Minimal, Scientific",
      characteristics: [
        "Rounded corners for approachability",
        "Consistent stroke weight",
        "Scientific accuracy",
        "Clear symbolism",
      ],
      categories: [
        "Gut microbiome icons",
        "Health metric symbols",
        "Food and nutrition icons",
        "Wellness activity icons",
      ],
    },
    layout: {
      grid: "12-column system",
      spacing: {
        xs: "4px",
        sm: "8px",
        md: "16px",
        lg: "24px",
        xl: "32px",
        xxl: "48px",
      },
      principles: [
        "Clear hierarchy",
        "Adequate white space",
        "Consistent alignment",
        "Mobile-first responsive design",
      ],
    },
  },

  // Brand Voice
  voice: {
    tone: "Professional, Empathetic, Educational",
    personality: [
      "Knowledgeable",
      "Caring",
      "Approachable",
      "Trustworthy",
      "Innovative",
      "Supportive",
    ],
    language: "English",
    messaging: {
      primary: [
        "Transform your health from the inside out",
        "Your gut health journey starts here",
        "Science-backed wellness solutions",
      ],
      secondary: [
        "Personalized insights for better health",
        "Understand your body, transform your life",
        "The future of gut health is here",
      ],
      taglines: [
        "Your Gut, Your Health, Your Life",
        "Science Meets Wellness",
        "Health From Within",
      ],
    },
    vocabulary: {
      preferred: [
        "Optimize",
        "Balance",
        "Transform",
        "Personalize",
        "Empower",
        "Discover",
        "Enhance",
        "Support",
      ],
      avoided: [
        "Cure",
        "Miracle",
        "Guarantee",
        "Instant",
        "Perfect",
        "Magical",
        "Secret",
      ],
      technical: [
        "Microbiome",
        "Probiotics",
        "Prebiotics",
        "Gut-brain axis",
        "Microbiota",
        "Digestive health",
        "Metabolic health",
      ],
    },
    communication: {
      style: "Educational yet approachable",
      guidelines: [
        "Use scientific terms with simple explanations",
        "Maintain empathetic tone",
        "Focus on empowerment, not fear",
        "Provide actionable insights",
        "Use inclusive language",
      ],
      examples: {
        educational:
          "Your gut microbiome contains trillions of bacteria that play a crucial role in your overall health.",
        empathetic:
          "We understand that navigating gut health can be overwhelming, and we're here to guide you.",
        empowering:
          "With the right knowledge and tools, you can transform your gut health and enhance your wellbeing.",
      },
    },
  },

  // Emotional Profile
  emotional: {
    primary: ["Trust", "Hope", "Confidence"],
    secondary: ["Curiosity", "Relief", "Motivation", "Empowerment"],
    triggers: {
      trust: [
        "Scientific evidence",
        "Professional expertise",
        "Transparent information",
        "Consistent messaging",
      ],
      hope: [
        "Success stories",
        "Progress possibilities",
        "Future potential",
        "Innovation promises",
      ],
      confidence: [
        "Clear explanations",
        "Actionable steps",
        "Measurable results",
        "Expert guidance",
      ],
    },
    responses: {
      positive: [
        "Show health progress visualizations",
        "Provide educational content",
        "Offer personalized recommendations",
        "Celebrate milestones",
      ],
      concerned: [
        "Provide reassurance",
        "Offer additional resources",
        "Connect with expert support",
        "Maintain supportive tone",
      ],
    },
    personality: {
      archetype: "The Caregiver + The Sage",
      characteristics: [
        "Nurturing",
        "Knowledgeable",
        "Supportive",
        "Wise",
        "Reliable",
        "Empathetic",
      ],
    },
  },

  // Strategic Positioning
  strategic: {
    positioning:
      "The most scientifically-advanced, user-friendly gut health platform that combines cutting-edge research with personalized care.",
    differentiation: [
      "Scientific backing with real research",
      "Personalized recommendations based on actual data",
      "Holistic approach to gut health",
      "User-friendly platform",
      "Expert support community",
    ],
    targetAudience: {
      primary: {
        demographics: {
          age: "25-55",
          gender: "All",
          income: "Middle to upper middle class",
          education: "College educated",
        },
        psychographics: {
          interests: [
            "Health & Wellness",
            "Science",
            "Self-improvement",
            "Technology",
          ],
          values: ["Health", "Knowledge", "Personal Growth", "Quality"],
          lifestyle: [
            "Health-conscious",
            "Tech-savvy",
            "Goal-oriented",
            "Proactive",
          ],
        },
        painPoints: [
          "Digestive issues",
          "Confusion about gut health",
          "Lack of personalized guidance",
          "Information overload",
        ],
      },
      secondary: {
        demographics: {
          age: "18-24, 56+",
          gender: "All",
          income: "All income levels",
          education: "All education levels",
        },
        psychographics: {
          interests: ["General Health", "Wellness Trends", "Family Health"],
          values: ["Wellness", "Family", "Prevention"],
          lifestyle: [
            "Health-interested",
            "Family-focused",
            "Prevention-minded",
          ],
        },
      },
    },
    competitive: {
      advantages: [
        "Scientific credibility",
        "Personalization algorithms",
        "Comprehensive approach",
        "User experience",
        "Expert community",
      ],
      disadvantages: [
        "Newer brand",
        "Higher price point",
        "Requires user engagement",
      ],
      competitors: [
        "General wellness apps",
        "Diet tracking apps",
        "Health information websites",
        "Supplement companies",
      ],
    },
  },

  // Content Guidelines
  content: {
    types: {
      educational: [
        "Gut health basics",
        "Microbiome science",
        "Nutrition guidance",
        "Lifestyle recommendations",
      ],
      inspirational: [
        "Success stories",
        "Transformation journeys",
        "Expert insights",
        "Research breakthroughs",
      ],
      practical: [
        "How-to guides",
        "Recipes",
        "Exercise routines",
        "Product recommendations",
      ],
    },
    channels: {
      primary: [
        "Web platform",
        "Mobile app",
        "Email newsletters",
        "Social media",
      ],
      secondary: ["Blog", "Podcast", "YouTube channel", "Print materials"],
    },
    style: {
      tone: "Educational, supportive, motivating",
      voice: "Expert yet approachable",
      language: "Clear, concise, accessible",
      formatting: "Scannable, visually appealing",
    },
  },

  // Usage Guidelines
  guidelines: {
    logo: {
      do: [
        "Maintain clear space around logo",
        "Use on clean backgrounds",
        "Scale appropriately",
        "Use approved color variations",
      ],
      dont: [
        "Stretch or distort logo",
        "Change colors arbitrarily",
        "Place on busy backgrounds",
        "Use logo smaller than minimum size",
      ],
    },
    color: {
      do: [
        "Use primary colors for main branding",
        "Use accent colors for highlights",
        "Maintain contrast for accessibility",
        "Use color hierarchy consistently",
      ],
      dont: [
        "Create new color combinations",
        "Use colors outside palette",
        "Ignore accessibility guidelines",
        "Overuse bright colors",
      ],
    },
    typography: {
      do: [
        "Maintain clear hierarchy",
        "Use appropriate font weights",
        "Ensure readability",
        "Be consistent with usage",
      ],
      dont: [
        "Use too many font families",
        "Set text too small",
        "Ignore line height",
        "Use decorative fonts for body text",
      ],
    },
    imagery: {
      do: [
        "Use high-quality images",
        "Show diverse subjects",
        "Maintain consistent style",
        "Ensure scientific accuracy",
      ],
      dont: [
        "Use stock photos that look generic",
        "Show unrealistic scenarios",
        "Use low-resolution images",
        "Misrepresent scientific concepts",
      ],
    },
  },

  // Quality Standards
  quality: {
    accuracy: {
      scientific: "All health claims must be scientifically backed",
      medical: "Medical information must be reviewed by experts",
      data: "All data must be accurate and verifiable",
    },
    consistency: {
      branding: "All materials must follow brand guidelines",
      messaging: "All messaging must be consistent",
      experience: "User experience must be consistent across platforms",
    },
    accessibility: {
      digital: "All digital content must meet WCAG 2.1 AA",
      print: "All print materials must be accessible",
      content: "All content must be understandable by lay audience",
    },
  },
};

export default GutfitBrandConfig;
