# 🛒 WooCommerce API Setup Guide

Follow these steps to connect your WooCommerce store with the ordering system.

## 📋 Prerequisites

- WooCommerce plugin installed and activated on your WordPress site
- Administrator access to your WordPress dashboard
- Products with IDs 28427 and 28431 created in WooCommerce

## 🔑 Step 1: Generate WooCommerce API Keys

1. **Login to your WordPress admin panel**
2. **Navigate to**: `WooCommerce → Settings → Advanced → REST API`
3. **Click**: "Add Key"
4. **Fill in the details**:
   - **Description**: `Quick Order System`
   - **User**: Select an administrator user
   - **Permissions**: `Read/Write`
5. **Click**: "Generate API Key"
6. **IMPORTANT**: Copy the **Consumer Key** and **Consumer Secret** immediately (they won't be shown again)

## ⚙️ Step 2: Configure the API in Your Project

Open the file: `src/services/woocommerceService.ts`

Replace the placeholder values with your actual credentials:

```typescript
const WOOCOMMERCE_CONFIG: WooCommerceConfig = {
  // Your WordPress/WooCommerce site URL (without trailing slash)
  siteUrl: 'https://your-actual-site.com',
  
  // Your WooCommerce API Consumer Key (starts with ck_)
  consumerKey: 'ck_your_actual_consumer_key_here',
  
  // Your WooCommerce API Consumer Secret (starts with cs_)
  consumerSecret: 'cs_your_actual_consumer_secret_here',
  
  // API Version (leave as v3)
  apiVersion: 'v3'
};
```

## 🔧 Step 3: Set Up Your Products

### Product 1: إن كيو أرجيتون شراب (ID: 28427)
1. Go to `WooCommerce → Products`
2. Create/Edit product with ID 28427
3. Set:
   - **Name**: `إن كيو أرجيتون شراب`
   - **Price**: `75` SAR
   - **Status**: Published
   - **Stock Status**: In Stock

### Product 2: إن كيو أرجيتون أقراص (ID: 28431)
1. Create/Edit product with ID 28431
2. Set:
   - **Name**: `إن كيو أرجيتون أقراص 30 قرص`
   - **Price**: `75` SAR
   - **Status**: Published
   - **Stock Status**: In Stock

## 🧪 Step 4: Test the Connection

1. Open your website's browser console (F12)
2. Type: `wooCommerceService.testConnection()`
3. You should see `true` if the connection is successful

## 🚛 Step 5: Configure Shipping

In your WooCommerce settings:

1. Go to `WooCommerce → Settings → Shipping`
2. Set up shipping zones for Saudi Arabia
3. Configure shipping rates:
   - **Standard Shipping**: 10 SAR
   - **Free Shipping**: For orders over 200 SAR

## 💳 Step 6: Enable Cash on Delivery (COD)

1. Go to `WooCommerce → Settings → Payments`
2. Enable "Cash on Delivery"
3. Configure COD settings as needed

## 🔒 Step 7: Security Considerations

### CORS Headers (if needed)
If you encounter CORS issues, add this to your WordPress theme's `functions.php`:

```php
// Enable CORS for WooCommerce API
add_action('rest_api_init', function() {
    remove_filter('rest_pre_serve_request', 'rest_send_cors_headers');
    add_filter('rest_pre_serve_request', function($served, $result, $request, $server) {
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization');
        return $served;
    }, 10, 4);
});
```

### HTTPS Requirement
- WooCommerce API requires HTTPS for production
- Ensure your site has a valid SSL certificate

## 🐛 Troubleshooting

### Common Issues:

**1. Authentication Error (401)**
- Check your Consumer Key and Consumer Secret
- Ensure the API user has administrator privileges

**2. Product Not Found (404)**
- Verify product IDs 28427 and 28431 exist
- Check that products are published

**3. CORS Error**
- Add CORS headers (see security section above)
- Or deploy your frontend to the same domain

**4. SSL Error**
- Ensure your WordPress site uses HTTPS
- Check SSL certificate validity

## 📞 Testing Orders

To test the complete flow:

1. Fill out the order form on your website
2. Submit the order
3. Check `WooCommerce → Orders` in your admin panel
4. Verify the order details are correct

## 🔧 Development Tools

In development mode, you can use these console commands:

```javascript
// Test connection
wooCommerceService.testConnection()

// Get product details
wooCommerceService.getProduct(28427)

// Test purchase flow
purchaseUtils.markAsPurchased()
purchaseUtils.resetPurchaseStatus()
```

## ✅ Final Checklist

- [ ] API keys generated and configured
- [ ] Products 28427 and 28431 created with correct prices (75 SAR each)
- [ ] Shipping rates configured (10 SAR, free over 200 SAR)
- [ ] Cash on Delivery enabled
- [ ] SSL certificate installed
- [ ] API connection tested successfully
- [ ] Test order submitted and received

---

**Need Help?** Check the browser console for error messages and refer to the [WooCommerce REST API documentation](https://woocommerce.github.io/woocommerce-rest-api-docs/). 