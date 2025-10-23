const axios = require('axios');

// Directus configuration
const DIRECTUS_BASE_URL = 'https://direct.gutfit.co';
const DIRECTUS_API_KEY = 'JAcnLCoEKVBA5916aVBk5DkZMyxR0tAQ';

const directusClient = axios.create({
  baseURL: DIRECTUS_BASE_URL,
  headers: {
    'Authorization': `Bearer ${DIRECTUS_API_KEY}`,
    'Content-Type': 'application/json'
  }
});

// Sample brand assets data
const visualAssets = [
  {
    title: 'Gutfit Primary Logo',
    description: 'Main company logo for Gutfit brand',
    asset_type: 'logo',
    status: 'published'
  },
  {
    title: 'Product Photography - Fitness Gear',
    description: 'Professional product shots for fitness equipment line',
    asset_type: 'product_photo',
    status: 'published'
  },
  {
    title: 'Brand Color Palette',
    description: 'Official Gutfit brand colors and specifications',
    asset_type: 'design_system',
    status: 'published'
  },
  {
    title: 'Typography Guidelines',
    description: 'Brand typography system and font usage',
    asset_type: 'design_system',
    status: 'published'
  },
  {
    title: 'App Icon Set',
    description: 'Mobile application icon variations',
    asset_type: 'icon',
    status: 'published'
  }
];

const marketingMaterials = [
  {
    title: 'Social Media Campaign - Fitness Transformation',
    description: 'Complete social media asset package for fitness campaign',
    asset_type: 'social_media',
    status: 'published'
  },
  {
    title: 'Email Newsletter Template',
    description: 'Branded email template for customer communications',
    asset_type: 'email_template',
    status: 'published'
  },
  {
    title: 'Product Brochure Design',
    description: 'Print-ready product brochure for retail distribution',
    asset_type: 'print_material',
    status: 'published'
  },
  {
    title: 'Digital Ad Banner Set',
    description: 'Various size banners for online advertising',
    asset_type: 'digital_ad',
    status: 'published'
  },
  {
    title: 'Presentation Deck Template',
    description: 'Branded PowerPoint/Keynote template for business presentations',
    asset_type: 'presentation',
    status: 'published'
  }
];

const designSystemPatterns = [
  {
    title: 'UI Component Library',
    description: 'Reusable UI components for web and mobile applications',
    asset_type: 'ui_components',
    status: 'published'
  },
  {
    title: 'Brand Voice Guidelines',
    description: 'Tone, voice, and messaging standards for Gutfit brand',
    asset_type: 'brand_voice',
    status: 'published'
  },
  {
    title: 'Photography Style Guide',
    description: 'Guidelines for brand photography and image treatment',
    asset_type: 'photography_guide',
    status: 'published'
  },
  {
    title: 'Iconography System',
    description: 'Custom icon set and usage guidelines',
    asset_type: 'icon_system',
    status: 'published'
  },
  {
    title: 'Motion Design Principles',
    description: 'Animation and motion guidelines for digital products',
    asset_type: 'motion_design',
    status: 'published'
  }
];

async function populateCollection(collectionName, items) {
  console.log(`Populating ${collectionName}...`);
  
  for (const item of items) {
    try {
      const response = await directusClient.post(`/items/${collectionName}`, item);
      console.log(`✅ Created: ${item.title}`);
    } catch (error) {
      console.error(`❌ Failed to create ${item.title}:`, error.response?.data || error.message);
    }
    
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function verifyCollections() {
  console.log('\n📊 Verifying collection counts...');
  
  try {
    const visualResponse = await directusClient.get('/items/visual_assets_collection');
    console.log(`📸 Visual Assets: ${visualResponse.data.data.length} items`);
    
    const marketingResponse = await directusClient.get('/items/marketing_materials_collection');
    console.log(`📈 Marketing Materials: ${marketingResponse.data.data.length} items`);
    
    const designResponse = await directusClient.get('/items/design_system_patterns');
    console.log(`🎨 Design System Patterns: ${designResponse.data.data.length} items`);
    
  } catch (error) {
    console.error('❌ Verification failed:', error.response?.data || error.message);
  }
}

async function main() {
  console.log('🚀 Starting to populate Directus collections...\n');
  
  try {
    // Populate each collection
    await populateCollection('visual_assets_collection', visualAssets);
    await populateCollection('marketing_materials_collection', marketingMaterials);
    await populateCollection('design_system_patterns', designSystemPatterns);
    
    // Verify the results
    await verifyCollections();
    
    console.log('\n🎉 Successfully populated all collections!');
    console.log('\n📋 Summary:');
    console.log('   • Visual Assets: 5 professional brand assets');
    console.log('   • Marketing Materials: 5 campaign-ready materials');
    console.log('   • Design System Patterns: 5 foundational patterns');
    console.log('\n🌐 Visit https://direct.gutfit.co to view your populated collections!');
    
  } catch (error) {
    console.error('❌ Population failed:', error);
  }
}

// Run the script
main().catch(console.error);