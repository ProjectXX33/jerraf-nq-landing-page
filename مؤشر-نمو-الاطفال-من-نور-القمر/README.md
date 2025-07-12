# مؤشر نمو الأطفال من نور القمر
# Child Growth Indicator from Noor Al-Qamar

This contains everything you need to run your AI-powered child growth assessment app locally.

## Run Locally

**Prerequisites:**  Node.js (version 18 or higher)

### Setup Instructions:

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up the Gemini API key:**
   
   **Option 1 - Create .env file (Recommended):**
   ```bash
   # Create a .env file in the root directory
   touch .env
   ```
   
   Add the following to your `.env` file:
   ```
   VITE_GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```
   
   **Option 2 - Create .env.local file:**
   ```bash
   # Create a .env.local file in the root directory
   touch .env.local
   ```
   
   Add the following to your `.env.local` file:
   ```
   GEMINI_API_KEY=your_actual_gemini_api_key_here
   ```

3. **Get your Gemini API key:**
   - Go to [Google AI Studio](https://aistudio.google.com/app/apikey)
   - Sign in with your Google account
   - Click "Create API key"
   - Copy the generated key and replace `your_actual_gemini_api_key_here` in your environment file

4. **Run the app:**
   ```bash
   npm run dev
   ```

## Troubleshooting

**Error: "حدث خطأ أثناء إنشاء التقرير" (An error occurred while creating the report)**

This error typically occurs when:
- The Gemini API key is not set or is invalid
- The API key has exceeded its quota limits
- There's no internet connection

**Solutions:**
1. Verify your API key is correctly set in the `.env` file
2. Check if your API key is valid at [Google AI Studio](https://aistudio.google.com/app/apikey)
3. Ensure you have internet connectivity
4. If you're using a free tier, check if you've exceeded the usage limits

## Features

- AI-powered child growth assessment
- Arabic language support
- PDF report generation
- Product recommendations based on growth analysis
- Responsive design for mobile and desktop

## Support

For issues or questions, please contact the development team.
