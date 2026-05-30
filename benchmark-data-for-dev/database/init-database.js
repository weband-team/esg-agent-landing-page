const { query } = require('./database');
const fs = require('fs');
const path = require('path');

async function initializeDatabase() {
    try {
        // Read schema from file
        const schema = fs.readFileSync(path.join(__dirname, 'database-schema.sql'), 'utf8');
        
        // Execute SQL script
        await query(schema);
        
        // Check created tables
        const tables = await query(`
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name
        `);
        
        // Add test data
        // Add test company
        const companyResult = await query(
            'INSERT INTO companies (name, industry, esg_level) VALUES ($1, $2, $3) RETURNING id',
            ['Sample Company', 'Technology', 'intermediate']
        );
        
        const companyId = companyResult.rows[0].id;
        
        // Add test ESG report
        const reportResult = await query(
            `INSERT INTO esg_reports (company_id, title, language, esg_level, content, status) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id`,
            [
                companyId, 
                'Sample ESG Report 2024', 
                'en', 
                'intermediate', 
                JSON.stringify({
                    executiveSummary: 'This is a sample ESG report',
                    environmentalImpact: 'Environmental initiatives and metrics',
                    socialResponsibility: 'Social responsibility programs',
                    governanceStructure: 'Corporate governance framework'
                }), 
                'published'
            ]
        );
        
        const reportId = reportResult.rows[0].id;
        
        // Add test metrics
        const metrics = [
            { category: 'environmental', metricName: 'Carbon Emissions', value: 150.5, unit: 'tons CO2', description: 'Annual carbon emissions' },
            { category: 'environmental', metricName: 'Energy Consumption', value: 2500, unit: 'MWh', description: 'Total energy consumption' },
            { category: 'social', metricName: 'Employee Satisfaction', value: 85, unit: '%', description: 'Employee satisfaction score' },
            { category: 'social', metricName: 'Diversity Index', value: 72, unit: '%', description: 'Workforce diversity index' },
            { category: 'governance', metricName: 'Board Independence', value: 80, unit: '%', description: 'Percentage of independent board members' },
            { category: 'governance', metricName: 'Ethics Score', value: 90, unit: '%', description: 'Corporate ethics compliance score' }
        ];
        
        for (const metric of metrics) {
            await query(
                `INSERT INTO esg_metrics (report_id, category, metric_name, value, unit, description) 
                 VALUES ($1, $2, $3, $4, $5, $6)`,
                [reportId, metric.category, metric.metricName, metric.value, metric.unit, metric.description]
            );
        }
        
        // Show statistics
        const stats = await query(`
            SELECT 
                (SELECT COUNT(*) FROM companies) as total_companies,
                (SELECT COUNT(*) FROM esg_reports) as total_reports,
                (SELECT COUNT(*) FROM esg_metrics) as total_metrics
        `);
        
    } catch (error) {
        process.exit(1);
    }
}

// Run initialization if file is executed directly
if (require.main === module) {
    initializeDatabase();
}

module.exports = { initializeDatabase };