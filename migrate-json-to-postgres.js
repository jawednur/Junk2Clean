const fs = require('fs');
const path = require('path');
const { testConnection, initializeDatabase, ContactDB } = require('./database');

async function migrateJsonToPostgres() {
    console.log('🔄 Starting migration from JSON to PostgreSQL...\n');

    try {
        // Test database connection
        console.log('1. Testing database connection...');
        const connected = await testConnection();
        if (!connected) {
            throw new Error('Database connection failed');
        }

        // Initialize database schema
        console.log('2. Initializing database schema...');
        await initializeDatabase();

        // Check if JSON file exists
        const jsonFile = path.join(__dirname, 'data', 'contacts.json');
        if (!fs.existsSync(jsonFile)) {
            console.log('📄 No existing contacts.json file found. Migration complete!');
            return;
        }

        // Read existing JSON data
        console.log('3. Reading existing JSON data...');
        const jsonData = fs.readFileSync(jsonFile, 'utf8');
        const contacts = JSON.parse(jsonData);
        
        if (contacts.length === 0) {
            console.log('📄 No contacts found in JSON file. Migration complete!');
            return;
        }

        console.log(`📊 Found ${contacts.length} contacts to migrate`);

        // Migrate each contact
        let successCount = 0;
        let errorCount = 0;

        for (const contact of contacts) {
            try {
                // Transform JSON format to database format
                const contactData = {
                    name: contact.name,
                    phone: contact.phone,
                    email: contact.email || null,
                    zip: contact.zip,
                    preferredDate: contact.preferredDate,
                    preferredTime: contact.preferredTime || 'Any time',
                    items: contact.items,
                    location: contact.location || null,
                    images: contact.images || []
                };

                // Create contact in database
                const newContact = await ContactDB.create(contactData);
                
                // Update status if different from 'new'
                if (contact.status && contact.status !== 'new') {
                    await ContactDB.updateStatus(newContact.id.toString(), contact.status);
                }

                successCount++;
                console.log(`✅ Migrated: ${contact.name} (ID: ${contact.id} → ${newContact.id})`);
            } catch (error) {
                errorCount++;
                console.error(`❌ Failed to migrate contact ${contact.id} (${contact.name}):`, error.message);
            }
        }

        console.log(`\n📊 Migration Summary:`);
        console.log(`✅ Successfully migrated: ${successCount} contacts`);
        console.log(`❌ Failed migrations: ${errorCount} contacts`);
        console.log(`📄 Total in JSON file: ${contacts.length} contacts`);

        if (successCount === contacts.length) {
            console.log('\n🎉 All contacts migrated successfully!');
            
            // Ask user if they want to backup and remove the JSON file
            console.log('\n⚠️  IMPORTANT:');
            console.log('Your data has been successfully migrated to PostgreSQL.');
            console.log('Consider backing up and removing the contacts.json file:');
            console.log('');
            console.log('# Backup the JSON file:');
            console.log('cp data/contacts.json data/contacts-backup.json');
            console.log('');
            console.log('# Remove the original (optional):');
            console.log('rm data/contacts.json');
            console.log('');
            console.log('The app will now use PostgreSQL for all contact data.');
        } else {
            console.log('\n⚠️  Some contacts failed to migrate. Please review the errors above.');
            console.log('The JSON file has been left intact for manual review.');
        }

    } catch (error) {
        console.error('❌ Migration failed:', error.message);
        process.exit(1);
    }
}

// Run migration if this script is executed directly
if (require.main === module) {
    migrateJsonToPostgres()
        .then(() => {
            console.log('\n✅ Migration script completed');
            process.exit(0);
        })
        .catch((error) => {
            console.error('\n❌ Migration script failed:', error);
            process.exit(1);
        });
}

module.exports = { migrateJsonToPostgres };
