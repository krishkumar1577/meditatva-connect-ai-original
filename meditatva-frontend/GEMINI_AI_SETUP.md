# 🤖 Gemini AI-Powered MediTatva Health Assistant

## Overview
MediTatva now uses **Google's Gemini 1.5 Flash AI** for intelligent, context-aware medical reasoning. The AI dynamically understands user symptoms in ANY language and provides personalized medical guidance.

## 🚀 Setup Instructions

### 1. Get Your Gemini API Key

1. Visit [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click "Create API Key"
4. Copy your API key

### 2. Configure Environment Variable

Open `.env` file and replace the placeholder with your actual API key:

```bash
VITE_GEMINI_API_KEY="YOUR_ACTUAL_API_KEY_HERE"
```

**Important**: Replace `YOUR_ACTUAL_API_KEY_HERE` with your real Gemini API key.

### 3. Restart the Development Server

```bash
npm run dev
```

The AI will now be fully functional!

## ✨ Key Features

### 1. **True Multilingual Intelligence**
- Auto-detects ANY language (English, Hindi, Tamil, Bengali, Telugu, Kannada, Malayalam, Gujarati, Punjabi, and more)
- Responds in the EXACT SAME language as user input
- No predefined responses - pure AI reasoning

### 2. **Dynamic Symptom Analysis**
- Understands free-form text descriptions (not keyword matching)
- Example: "I feel dizzy and my head hurts when I stand up" → AI analyzes context and symptoms
- Infers medical conditions based on real symptom relationships

### 3. **Conversational Memory**
- Maintains conversation history
- Can ask follow-up questions
- Remembers previous symptoms mentioned

### 4. **Structured Medical Guidance**
The AI provides responses in this format:

```
👋 Greeting/Acknowledgment

🩺 Possible Conditions:
- Lists 2-3 likely conditions with explanations

🔍 Common Symptoms & Causes:
- Related symptoms and possible causes

💊 Suggested Medicines (OTC only):
- Safe over-the-counter medicines with exact dosage
- Example: "Paracetamol 500mg – 1 tablet every 6 hours"

🏡 Home Remedies / Self-Care:
- Practical care tips and natural remedies

⚕️ Doctor Recommendation:
- When to see a doctor and which specialist

⚠️ Disclaimer:
Always includes medical disclaimer
```

### 5. **Safety-First Approach**
- NEVER recommends prescription-only drugs
- Only suggests common OTC medicines
- Always includes proper dosage and frequency
- Recommends doctor visits for serious symptoms

## 💬 Example Conversations

### Example 1: English
**User**: "I have fever and body ache since yesterday"

**MediTatva AI**:
```
👋 I understand you're not feeling well. Let me help you with that.

🩺 Possible Conditions:
1. Common Cold or Viral Infection - Usually accompanied by fever and body aches
2. Flu (Influenza) - More severe with higher fever and muscle pain
3. Early stage of dengue (if in tropical area) - Watch for additional symptoms

🔍 Common Symptoms & Causes:
• Fever typically 100-103°F
• Generalized body aches and muscle soreness
• Fatigue and weakness
• May have mild headache

💊 Suggested Medicines (OTC):
1. Paracetamol 650mg – Take 1 tablet every 8 hours after food (max 3 times/day)
2. Ibuprofen 400mg – Alternative to paracetamol, 1 tablet twice daily after meals
3. Stay well hydrated with ORS if sweating heavily

🏡 Home Remedies / Self-Care:
• Rest completely for 24-48 hours
• Drink 8-10 glasses of water daily
• Have warm soups and light meals
• Apply cold compress on forehead if fever is high
• Avoid going out in cold or AC

⚕️ Doctor Recommendation:
Visit a General Physician if:
- Fever persists beyond 3 days
- Temperature exceeds 103°F (39.4°C)
- Severe body pain that doesn't improve with medicine
- Additional symptoms like rash, bleeding, or severe weakness appear

⚠️ Disclaimer:
This is general AI medical guidance for educational purposes and not a substitute for a doctor's consultation.
```

### Example 2: Hindi
**User**: "मुझे पेट में दर्द हो रहा है और गैस की problem है"

**MediTatva AI**:
```
👋 मैं समझ सकता हूं कि आप असहज महसूस कर रहे हैं। आइए इसका समाधान खोजें।

🩺 संभावित स्थिति:
1. अपच (Indigestion) - गलत खान-पान या जल्दी खाने से
2. गैस्ट्राइटिस (Gastritis) - पेट में एसिड बढ़ना
3. Irritable Bowel Syndrome (IBS) - तनाव या खान-पान से

🔍 सामान्य लक्षण और कारण:
• पेट में दर्द और ऐंठन
• पेट फूलना और गैस बनना
• खट्टी डकार आना
• भूख कम लगना

💊 अनुशंसित दवाएं (OTC):
1. Eno या Digene - 1 sachet पानी में मिलाकर तुरंत राहत के लिए
2. Pan 40mg - 1 tablet खाली पेट सुबह (3-5 दिन)
3. Pudin Hara - 2 बूंद चीनी के साथ

🏡 घरेलू उपचार:
• हल्का गर्म पानी पिएं
• अजवाइन का पानी बनाकर पिएं
• ज्यादा मसालेदार और तैलीय खाना avoid करें
• खाना धीरे-धीरे चबाकर खाएं
• खाने के तुरंत बाद न लेटें

⚕️ डॉक्टर की सलाह:
Gastroenterologist से मिलें अगर:
- दर्द 2-3 दिन से ज्यादा रहे
- उल्टी में खून आए
- वज़न तेजी से कम हो
- काला मल आए

⚠️ अस्वीकरण:
यह सामान्य AI सलाह है और डॉक्टर के परामर्श का विकल्प नहीं है।
```

### Example 3: Tamil
**User**: "எனக்கு தலைவலி மற்றும் கண் எரிச்சல் இருக்கிறது"

**MediTatva AI**:
```
👋 உங்கள் பிரச்சனையை நான் புரிந்துகொள்கிறேன். உதவி செய்கிறேன்.

🩺 சாத்தியமான நிலைகள்:
1. Migraine - ஒருபுற தலைவலி
2. Eye Strain - திரை பார்க்கும் வேலை
3. Sinus Headache - சைனஸ் பிரச்சனை

[... continues in Tamil ...]
```

## 🧠 AI System Prompt

The AI is instructed with a comprehensive medical system prompt that includes:

- **Role**: Act as a friendly digital doctor and pharmacist
- **Language**: Auto-detect and respond in user's language
- **Analysis**: Dynamic understanding of free-text symptoms
- **Safety**: Never recommend prescription drugs
- **Format**: Structured medical guidance with emojis
- **Tone**: Conversational, calm, empathetic

## 🔧 Technical Details

### Model Configuration
```typescript
Model: gemini-1.5-flash
Temperature: 0.7 (balanced creativity and accuracy)
Top P: 0.95
Top K: 40
Max Output Tokens: 2048
```

### Chat Session Management
- Persistent chat session across messages
- Conversation history maintained
- Context-aware follow-up responses

### Error Handling
- Graceful fallback to offline greeting if API fails
- User-friendly error messages in multiple languages
- Toast notifications for connection issues

## 🎨 UI Enhancements

### Visual Indicators
- **AI Status Badge**: "Pro" badge showing Gemini AI is active
- **Online Indicator**: Green pulsing dot
- **Typing Animation**: Sparkles icon with animated dots
- **Healthcare Colors**: #1B6CA8 and #4FC3F7 gradient

### Message Formatting
- Bot messages: White background with formatted markdown
- User messages: Healthcare gradient background
- Auto-scrolling to latest message
- Timestamps for each message

## 📊 Cost & Usage

### Free Tier (Gemini API)
- **60 requests per minute**
- **1,500 requests per day**
- **1 million tokens per month**

This is more than sufficient for typical healthcare chatbot usage.

### Paid Tier
If you need more capacity:
- $0.00025 per 1K characters for Gemini 1.5 Flash
- Extremely cost-effective for production use

## 🔐 Security Best Practices

1. **Never commit .env file** to version control
2. **Use environment variables** for API keys
3. **Rotate API keys** regularly
4. **Monitor usage** in Google AI Studio dashboard
5. **Implement rate limiting** for production

## 🚨 Important Notes

### Medical Disclaimer
- AI provides **general guidance** only
- NOT a substitute for professional medical advice
- Always recommends doctor visits for serious symptoms
- Includes disclaimer in every response

### Limitations
- Cannot diagnose definitive conditions
- Cannot prescribe controlled medicines
- Cannot replace emergency medical care
- Works best for common ailments and OTC guidance

## 🧪 Testing the AI

### Test Cases to Try:

1. **Fever**: "I have high fever since 2 days"
2. **Headache**: "severe headache and vomiting"
3. **Stomach**: "stomach pain after eating"
4. **Hindi**: "मुझे खांसी हो रही है"
5. **Tamil**: "எனக்கு காய்ச்சல் உள்ளது"
6. **Follow-up**: "Is it serious?" (after initial query)

## 📱 Production Deployment

### Environment Variables
```bash
# Production .env
VITE_GEMINI_API_KEY="your-production-api-key"
VITE_SUPABASE_URL="your-supabase-url"
VITE_SUPABASE_PUBLISHABLE_KEY="your-supabase-key"
```

### Build for Production
```bash
npm run build
```

### Deploy
- Vercel, Netlify, or any static host
- Environment variables configured in hosting platform
- SSL/HTTPS required for secure API calls

## 🆘 Troubleshooting

### "AI connection issue" Error
**Cause**: Invalid or missing API key
**Solution**: 
1. Check `.env` file has correct key
2. Verify key is active in Google AI Studio
3. Check quota limits aren't exceeded

### "AI not ready" Toast
**Cause**: Chat session not initialized
**Solution**: Wait 2-3 seconds after opening chatbot

### Responses in Wrong Language
**Cause**: Gemini's language detection
**Solution**: This is rare but AI learns from context. Try being more explicit with language.

## 📚 Resources

- [Google AI Studio](https://makersuite.google.com/)
- [Gemini API Documentation](https://ai.google.dev/docs)
- [MediTatva Documentation](./MEDITATVA_AI_ASSISTANT.md)

---

**🎉 You now have a production-ready, AI-powered multilingual health assistant!**

*Built with ❤️ using Google Gemini 1.5 Flash*
