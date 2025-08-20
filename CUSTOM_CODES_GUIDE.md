# Custom Codes Guide for Growth System

## Overview
The custom codes feature allows administrators to create promotional or access codes that customers can use to access the Growth System without needing to make a purchase or have an existing order.

## Features

### Admin Dashboard
- **Create Custom Codes**: Generate codes with customizable usage limits and expiration dates
- **Manage Codes**: View, edit, activate/deactivate, and delete existing codes
- **Usage Tracking**: Monitor how many times each code has been used
- **Statistics**: View overall statistics for all custom codes

### Customer Experience
- **Optional Input**: Customers can enter a custom code in the Growth System form
- **Instant Access**: Valid codes provide immediate access to generate growth reports
- **One-time Use**: Each code usage is tracked and limited according to admin settings

## Database Setup

Run the SQL file `ADD_CUSTOM_CODES_TABLE.sql` in your Supabase database to create the necessary tables:

```sql
-- This will create:
-- 1. custom_codes table (for storing code information)
-- 2. custom_code_usage table (for tracking usage)
-- 3. Required indexes and triggers
-- 4. Real-time subscriptions
```

## Admin Usage

### Creating a Custom Code
1. Log into the Admin Dashboard
2. Navigate to the "الأكواد" (Codes) tab
3. Click "إنشاء كود جديد" (Create New Code)
4. Fill in the details:
   - **Code**: Optional - leave empty for auto-generation
   - **Description**: Required - describe the code's purpose
   - **Usage Limit**: Number of times the code can be used
   - **Expiration Date**: Optional - when the code expires
5. Click "إنشاء الكود" (Create Code)

### Managing Codes
- **View**: See all codes with their current status and usage
- **Copy**: Click the copy button to copy a code to clipboard
- **Toggle**: Activate/deactivate codes without deleting them
- **Delete**: Permanently remove codes (use with caution)

## Customer Usage

### Using a Custom Code
1. Navigate to the Growth System section
2. Fill in the child's information
3. **Optional**: Enter a custom code in the "كود مخصص" field
4. Submit the form
5. If the code is valid, the system will:
   - Use the code (increment usage count)
   - Generate the growth report
   - Clear the code field for next use

### Code Validation
The system checks:
- Code exists and is active
- Code hasn't expired
- Usage limit hasn't been reached
- Code is properly formatted

## Technical Details

### Code Format
- Codes are automatically converted to uppercase
- Auto-generated codes use alphanumeric characters (A-Z, 0-9)
- Custom codes can be any length (recommended: 6-12 characters)

### Usage Tracking
- Each code usage is logged with customer information
- Usage count is automatically incremented
- Database triggers prevent over-usage

### Security
- Codes are validated server-side
- Usage limits are enforced at the database level
- Expired codes are automatically rejected

## Error Messages

### Common Error Messages
- **كود غير صحيح**: Invalid code
- **الكود معطل**: Code is disabled
- **الكود منتهي الصلاحية**: Code has expired
- **تم استنفذ عدد مرات استخدام الكود**: Code usage limit reached
- **حدث خطأ أثناء التحقق من الكود**: Technical error during validation

## Best Practices

### For Administrators
1. **Descriptive Names**: Use clear descriptions for codes
2. **Reasonable Limits**: Set appropriate usage limits
3. **Expiration Dates**: Use expiration dates for promotional codes
4. **Monitor Usage**: Regularly check code usage statistics
5. **Clean Up**: Delete unused or expired codes

### For Customers
1. **Case Insensitive**: Codes work regardless of case
2. **One-time Use**: Each code can only be used once per submission
3. **Clear Field**: The code field is cleared after successful use
4. **Optional**: Codes are not required for existing customers

## Integration

The custom codes system integrates seamlessly with:
- Existing order-based access system
- Customer blocking system
- Admin dashboard
- Real-time updates
- Usage tracking and analytics

## Troubleshooting

### Common Issues
1. **Code not working**: Check if code is active and not expired
2. **Usage limit reached**: Code has been used maximum number of times
3. **Database errors**: Ensure custom codes tables are properly set up
4. **Real-time updates**: Check Supabase real-time subscriptions

### Support
For technical support or questions about custom codes, refer to the main system documentation or contact the development team.
