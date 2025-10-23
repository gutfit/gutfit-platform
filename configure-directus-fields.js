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

// Field configurations for each collection
const fieldConfigurations = {
  visual_assets_collection: [
    {
      field: 'id',
      type: 'integer',
      interface: 'numeric',
      hidden: true,
      readonly: true
    },
    {
      field: 'title',
      type: 'string',
      interface: 'text-input',
      options: {
        placeholder: 'Enter asset title...',
        icon: 'title'
      },
      meta: {
        width: 'full',
        required: true
      }
    },
    {
      field: 'description',
      type: 'text',
      interface: 'text-input',
      options: {
        placeholder: 'Enter asset description...',
        icon: 'description'
      },
      meta: {
        width: 'full'
      }
    },
    {
      field: 'asset_type',
      type: 'string',
      interface: 'dropdown',
      options: {
        choices: [
          { text: 'Logo', value: 'logo' },
          { text: 'Product Photo', value: 'product_photo' },
          { text: 'Design System', value: 'design_system' },
          { text: 'Icon', value: 'icon' },
          { text: 'Illustration', value: 'illustration' },
          { text: 'Mockup', value: 'mockup' }
        ]
      },
      meta: {
        width: 'half',
        required: true
      }
    },
    {
      field: 'status',
      type: 'string',
      interface: 'dropdown',
      options: {
        choices: [
          { text: 'Draft', value: 'draft' },
          { text: 'Published', value: 'published' },
          { text: 'Archived', value: 'archived' }
        ]
      },
      meta: {
        width: 'half',
        required: true
      }
    },
    {
      field: 'file',
      type: 'uuid',
      interface: 'file',
      options: {
        folder: 'visual_assets'
      },
      meta: {
        width: 'full'
      }
    },
    {
      field: 'tags',
      type: 'json',
      interface: 'tags',
      meta: {
        width: 'full'
      }
    },
    {
      field: 'created_at',
      type: 'timestamp',
      interface: 'datetime',
      options: {
        relative: true
      },
      meta: {
        readonly: true,
        width: 'half'
      }
    },
    {
      field: 'updated_at',
      type: 'timestamp',
      interface: 'datetime',
      options: {
        relative: true
      },
      meta: {
        readonly: true,
        width: 'half'
      }
    }
  ],
  marketing_materials_collection: [
    {
      field: 'id',
      type: 'integer',
      interface: 'numeric',
      hidden: true,
      readonly: true
    },
    {
      field: 'title',
      type: 'string',
      interface: 'text-input',
      options: {
        placeholder: 'Enter material title...',
        icon: 'title'
      },
      meta: {
        width: 'full',
        required: true
      }
    },
    {
      field: 'description',
      type: 'text',
      interface: 'text-input',
      options: {
        placeholder: 'Enter material description...',
        icon: 'description'
      },
      meta: {
        width: 'full'
      }
    },
    {
      field: 'asset_type',
      type: 'string',
      interface: 'dropdown',
      options: {
        choices: [
          { text: 'Social Media', value: 'social_media' },
          { text: 'Email Template', value: 'email_template' },
          { text: 'Print Material', value: 'print_material' },
          { text: 'Digital Ad', value: 'digital_ad' },
          { text: 'Presentation', value: 'presentation' }
        ]
      },
      meta: {
        width: 'half',
        required: true
      }
    },
    {
      field: 'status',
      type: 'string',
      interface: 'dropdown',
      options: {
        choices: [
          { text: 'Draft', value: 'draft' },
          { text: 'Published', value: 'published' },
          { text: 'Archived', value: 'archived' }
        ]
      },
      meta: {
        width: 'half',
        required: true
      }
    },
    {
      field: 'file',
      type: 'uuid',
      interface: 'file',
      options: {
        folder: 'marketing_materials'
      },
      meta: {
        width: 'full'
      }
    },
    {
      field: 'campaign',
      type: 'string',
      interface: 'text-input',
      options: {
        placeholder: 'Associated campaign...'
      },
      meta: {
        width: 'full'
      }
    },
    {
      field: 'tags',
      type: 'json',
      interface: 'tags',
      meta: {
        width: 'full'
      }
    },
    {
      field: 'created_at',
      type: 'timestamp',
      interface: 'datetime',
      options: {
        relative: true
      },
      meta: {
        readonly: true,
        width: 'half'
      }
    },
    {
      field: 'updated_at',
      type: 'timestamp',
      interface: 'datetime',
      options: {
        relative: true
      },
      meta: {
        readonly: true,
        width: 'half'
      }
    }
  ],
  design_system_patterns_collection: [
    {
      field: 'id',
      type: 'integer',
      interface: 'numeric',
      hidden: true,
      readonly: true
    },
    {
      field: 'title',
      type: 'string',
      interface: 'text-input',
      options: {
        placeholder: 'Enter pattern title...',
        icon: 'title'
      },
      meta: {
        width: 'full',
        required: true
      }
    },
    {
      field: 'description',
      type: 'text',
      interface: 'text-input',
      options: {
        placeholder: 'Enter pattern description...',
        icon: 'description'
      },
      meta: {
        width: 'full'
      }
    },
    {
      field: 'asset_type',
      type: 'string',
      interface: 'dropdown',
      options: {
        choices: [
          { text: 'UI Components', value: 'ui_components' },
          { text: 'Brand Voice', value: 'brand_voice' },
          { text: 'Photography Guide', value: 'photography_guide' },
          { text: 'Icon System', value: 'icon_system' },
          { text: 'Motion Design', value: 'motion_design' }
        ]
      },
      meta: {
        width: 'half',
        required: true
      }
    },
    {
      field: 'status',
      type: 'string',
      interface: 'dropdown',
      options: {
        choices: [
          { text: 'Draft', value: 'draft' },
          { text: 'Published', value: 'published' },
          { text: 'Archived', value: 'archived' }
        ]
      },
      meta: {
        width: 'half',
        required: true
      }
    },
    {
      field: 'file',
      type: 'uuid',
      interface: 'file',
      options: {
        folder: 'design_system_patterns'
      },
      meta: {
        width: 'full'
      }
    },
    {
      field: 'usage_guidelines',
      type: 'text',
      interface: 'text-input',
      options: {
        placeholder: 'Usage guidelines...'
      },
      meta: {
        width: 'full'
      }
    },
    {
      field: 'tags',
      type: 'json',
      interface: 'tags',
      meta: {
        width: 'full'
      }
    },
    {
      field: 'created_at',
      type: 'timestamp',
      interface: 'datetime',
      options: {
        relative: true
      },
      meta: {
        readonly: true,
        width: 'half'
      }
    },
    {
      field: 'updated_at',
      type: 'timestamp',
      interface: 'datetime',
      options: {
        relative: true
      },
      meta: {
        readonly: true,
        width: 'half'
      }
    }
  ]
};

async function createField(collection, fieldConfig) {
  try {
    const response = await directusClient.post(`/fields/${collection}`, fieldConfig);
    console.log(`✅ Created field: ${fieldConfig.field} in ${collection}`);
    return response.data;
  } catch (error) {
    // If field already exists, update it instead
    if (error.response?.status === 400 && error.response?.data?.errors?.[0]?.message?.includes('already exists')) {
      try {
        const response = await directusClient.patch(`/fields/${collection}/${fieldConfig.field}`, fieldConfig);
        console.log(`✅ Updated field: ${fieldConfig.field} in ${collection}`);
        return response.data;
      } catch (updateError) {
        console.error(`❌ Failed to update field ${fieldConfig.field}:`, updateError.response?.data || updateError.message);
        return null;
      }
    } else {
      console.error(`❌ Failed to create field ${fieldConfig.field}:`, error.response?.data || error.message);
      return null;
    }
  }
}

async function configureCollectionFields(collectionName, fields) {
  console.log(`\n🔧 Configuring fields for ${collectionName}...`);
  
  for (const fieldConfig of fields) {
    await createField(collectionName, fieldConfig);
    // Small delay to avoid rate limiting
    await new Promise(resolve => setTimeout(resolve, 100));
  }
}

async function verifyFieldConfiguration(collectionName) {
  console.log(`\n📊 Verifying field configuration for ${collectionName}...`);
  
  try {
    const response = await directusClient.get(`/fields/${collectionName}`);
    const fields = response.data.data;
    
    console.log(`✅ ${collectionName} has ${fields.length} configured fields:`);
    fields.forEach(field => {
      console.log(`   • ${field.field} (${field.type}) - ${field.interface || 'no interface'}`);
    });
    
    return fields;
  } catch (error) {
    console.error(`❌ Failed to verify ${collectionName}:`, error.response?.data || error.message);
    return [];
  }
}

async function main() {
  console.log('🚀 Starting Directus field configuration...\n');
  
  try {
    // Configure fields for each collection
    for (const [collectionName, fields] of Object.entries(fieldConfigurations)) {
      await configureCollectionFields(collectionName, fields);
      await verifyFieldConfiguration(collectionName);
    }
    
    console.log('\n🎉 Successfully configured all collection fields!');
    console.log('\n📋 Summary:');
    console.log('   • Visual Assets Collection: Professional asset management fields');
    console.log('   • Marketing Materials Collection: Campaign-focused material fields');
    console.log('   • Design System Patterns Collection: Pattern and guideline fields');
    console.log('\n🌐 Visit https://direct.gutfit.co to see your properly configured collections!');
    
  } catch (error) {
    console.error('❌ Field configuration failed:', error);
  }
}

// Run the script
main().catch(console.error);