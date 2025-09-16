# Cold Solutions CRM - CSV Import Guide

## Overview
The Cold Solutions CRM now includes comprehensive CSV import functionality for cold callers to easily import and manage lead lists. This guide explains how to use the new features.

## Features Added

### 1. CSV Import Functionality
- **File Upload**: Upload CSV files with lead data
- **Data Validation**: Automatic validation of required fields and email formats
- **Duplicate Detection**: Smart duplicate detection with merge options
- **Lead List Creation**: Automatically create organized lead lists from imported data

### 2. Lead Management
- **Bulk Assignment**: Assign entire lead lists to cold callers
- **Individual Lead View**: Detailed lead view with calling interface
- **Call Logging**: Track all call activities and outcomes
- **Progress Tracking**: Monitor performance and conversion rates

## CSV File Format

### Required Fields
- `name` - Lead's full name
- `email` - Lead's email address
- `phone` - Lead's phone number

### Optional Fields
- `company` or `company_name` - Company name
- `position`, `title`, or `job_title` - Job title
- `industry` - Industry type
- `territory` or `region` - Geographic territory
- `notes` or `comments` - Additional notes
- `tags` - Comma-separated tags
- `estimated_value` - Estimated deal value
- `company_size` - Company size
- `website` - Company website
- `address` - Company address

### Sample CSV Format
```csv
name,email,phone,company,position,industry,territory,notes,tags,estimated_value
John Smith,john.smith@techcorp.com,555-123-4567,TechCorp Inc,CEO,Technology,East Coast,Interested in AI solutions,high-priority,25000
Sarah Johnson,sarah.j@healthplus.com,555-987-6543,Health Plus,CTO,Healthcare,West Coast,Looking for patient management system,healthcare,18000
```

## How to Use

### 1. Import CSV Data
1. Navigate to the Cold Caller Dashboard
2. Click the "Import CSV" button in the header
3. Upload your CSV file
4. Fill in the lead list details:
   - Lead List Name (required)
   - Territory
   - Industry
   - Priority
   - Description
5. Click "Import X Leads" to process the data

### 2. Handle Duplicates
If duplicates are detected, you'll see a modal with options:
- **Skip Duplicates**: Import only new leads
- **Merge & Import**: Merge duplicates with existing leads
- **Import All**: Import all leads including duplicates

### 3. Assign Lead Lists
1. Find an unassigned lead list
2. Click "Assign to Caller"
3. Select a cold caller from the dropdown
4. Click "Assign Leads" to bulk assign all leads

### 4. Start Calling
1. Click "Start Calling" on any active lead list
2. View individual leads with their details
3. Click "Start Call" on any lead
4. Use the call interface to:
   - Track call duration
   - Record call outcome
   - Add call notes
   - Update lead status

### 5. Track Progress
- **Call Log**: View all call activities and outcomes
- **My Progress**: Monitor performance metrics and conversion rates

## Lead Status Flow
1. **New** - Just imported, not yet contacted
2. **Contacted** - Initial call made
3. **Qualified** - Lead shows interest
4. **Proposal** - Proposal sent
5. **Negotiation** - In negotiation phase
6. **Won** - Deal closed successfully
7. **Lost** - Deal lost

## Priority Levels
- **Low** - Standard priority
- **Medium** - Normal priority
- **High** - Important leads
- **Critical** - Must-call leads

## Territories
- East Coast
- West Coast
- Midwest
- Southeast
- Southwest
- Northeast

## Industries
- Technology
- Healthcare
- Finance
- Manufacturing
- Real Estate
- Retail
- Other

## Tips for Success

### CSV Preparation
1. Ensure all required fields are present
2. Use consistent formatting for phone numbers
3. Validate email addresses before importing
4. Use clear, descriptive company names
5. Add relevant tags for better organization

### Lead Management
1. Assign lead lists to callers based on territory and expertise
2. Prioritize leads based on estimated value and industry
3. Use call notes to track conversation details
4. Update lead status promptly after each call
5. Review progress regularly to identify trends

### Call Quality
1. Prepare before each call by reviewing lead details
2. Take detailed notes during calls
3. Follow up on promises made during calls
4. Track call outcomes accurately
5. Use the conversion rate metric to improve performance

## Troubleshooting

### Common Issues
1. **CSV Import Fails**: Check that required fields (name, email, phone) are present
2. **Invalid Email Format**: Ensure email addresses are properly formatted
3. **Duplicate Detection**: Review suggested duplicates carefully before merging
4. **Assignment Issues**: Ensure callers are properly set up in the system

### File Size Limits
- Maximum file size: 10MB
- Recommended: 1000 leads per import for best performance
- For larger datasets, split into multiple files

## Support
For technical support or questions about the CSV import functionality, contact your system administrator.

---

*This guide covers the basic functionality. For advanced features and customization options, refer to the full system documentation.*

