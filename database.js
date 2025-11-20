const { Pool } = require('pg');

// Database configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Test database connection
async function testConnection() {
    try {
        const client = await pool.connect();
        console.log('✅ Database connected successfully');
        client.release();
        return true;
    } catch (err) {
        console.error('❌ Database connection failed:', err.message);
        return false;
    }
}

// Initialize database schema
async function initializeDatabase() {
    const client = await pool.connect();
    try {
        // Create contacts table if it doesn't exist
        await client.query(`
            CREATE TABLE IF NOT EXISTS contacts (
                id SERIAL PRIMARY KEY,
                timestamp TIMESTAMPTZ DEFAULT NOW(),
                name VARCHAR(100) NOT NULL,
                phone VARCHAR(20) NOT NULL,
                email VARCHAR(255),
                zip VARCHAR(10) NOT NULL,
                preferred_date DATE NOT NULL,
                preferred_time VARCHAR(50) DEFAULT 'Any time',
                items TEXT NOT NULL,
                location TEXT,
                images JSONB DEFAULT '[]'::jsonb,
                status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'completed')),
                created_at TIMESTAMPTZ DEFAULT NOW(),
                updated_at TIMESTAMPTZ DEFAULT NOW()
            );
        `);

        // Create index on status for faster queries
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_contacts_status ON contacts(status);
        `);

        // Create index on timestamp for sorting
        await client.query(`
            CREATE INDEX IF NOT EXISTS idx_contacts_timestamp ON contacts(timestamp DESC);
        `);

        console.log('✅ Database schema initialized');
        return true;
    } catch (err) {
        console.error('❌ Database initialization failed:', err.message);
        throw err;
    } finally {
        client.release();
    }
}

// Contact database operations
class ContactDB {
    // Create a new contact
    static async create(contactData) {
        const client = await pool.connect();
        try {
            const query = `
                INSERT INTO contacts (
                    name, phone, email, zip, preferred_date, preferred_time,
                    items, location, images, status
                ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
                RETURNING *;
            `;
            
            const values = [
                contactData.name,
                contactData.phone,
                contactData.email || null,
                contactData.zip,
                contactData.preferredDate,
                contactData.preferredTime || 'Any time',
                contactData.items,
                contactData.location || null,
                JSON.stringify(contactData.images || []),
                'new'
            ];

            const result = await client.query(query, values);
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    // Get all contacts
    static async getAll() {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    id::text,
                    timestamp,
                    name,
                    phone,
                    email,
                    zip,
                    preferred_date as "preferredDate",
                    preferred_time as "preferredTime",
                    items,
                    location,
                    images,
                    status,
                    created_at,
                    updated_at
                FROM contacts 
                ORDER BY timestamp DESC;
            `;
            
            const result = await client.query(query);
            return result.rows.map(row => ({
                ...row,
                images: typeof row.images === 'string' ? JSON.parse(row.images) : row.images
            }));
        } finally {
            client.release();
        }
    }

    // Update contact status
    static async updateStatus(id, status) {
        const client = await pool.connect();
        try {
            const query = `
                UPDATE contacts 
                SET status = $1, updated_at = NOW()
                WHERE id = $2
                RETURNING *;
            `;
            
            const result = await client.query(query, [status, id]);
            if (result.rows.length === 0) {
                throw new Error('Contact not found');
            }
            
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    // Delete contact
    static async delete(id) {
        const client = await pool.connect();
        try {
            const query = 'DELETE FROM contacts WHERE id = $1 RETURNING *;';
            const result = await client.query(query, [id]);
            
            if (result.rows.length === 0) {
                throw new Error('Contact not found');
            }
            
            return result.rows[0];
        } finally {
            client.release();
        }
    }

    // Get statistics
    static async getStats() {
        const client = await pool.connect();
        try {
            const query = `
                SELECT 
                    COUNT(*) as total,
                    COUNT(*) FILTER (WHERE status = 'new') as new,
                    COUNT(*) FILTER (WHERE status = 'contacted') as contacted,
                    COUNT(*) FILTER (WHERE status = 'completed') as completed
                FROM contacts;
            `;
            
            const result = await client.query(query);
            const stats = result.rows[0];
            
            return {
                total: parseInt(stats.total),
                new: parseInt(stats.new),
                contacted: parseInt(stats.contacted),
                completed: parseInt(stats.completed)
            };
        } finally {
            client.release();
        }
    }
}

module.exports = {
    pool,
    testConnection,
    initializeDatabase,
    ContactDB
};
