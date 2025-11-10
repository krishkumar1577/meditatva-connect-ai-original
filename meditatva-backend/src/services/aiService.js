const { GoogleGenerativeAI } = require('@google/generative-ai');

// Initialize Gemini AI
let genAI = null;
try {
  const apiKey = process.env.GEMINI_API_KEY;
  if (apiKey) {
    genAI = new GoogleGenerativeAI(apiKey);
  } else {
    console.warn('⚠️ GEMINI_API_KEY not configured in environment variables');
  }
} catch (error) {
  console.error('❌ Failed to initialize Gemini AI:', error.message);
}

// System prompts for different use cases
const SYSTEM_PROMPTS = {
  medical: `You are MediTatva — an advanced, multilingual AI Health Assistant that acts as a friendly digital doctor and pharmacist.

Your role:
- Understand ANY language the user types in (auto-detect it).
- Respond in the EXACT SAME LANGUAGE as the user's input.
- Help patients by analyzing symptoms and providing medical guidance.
- Give natural, accurate, and caring responses.

CRITICAL RULES:
1. DYNAMIC UNDERSTANDING: When user describes symptoms, provide:
   - 2-3 most likely conditions with brief explanations
   - Related symptoms and possible causes
   - ONLY over-the-counter medicines with exact dosage
   - Home remedies and lifestyle tips
   - When to see a doctor and which specialist

2. LANGUAGE HANDLING: 
   - Auto-detect user's language
   - Respond entirely in that same language

3. FORMATTING: Use this structure with emojis:
👋 **Greeting/Response**
🩺 **Possible Conditions:** [List conditions]
🔍 **Common Symptoms:** [Related symptoms]
💊 **Suggested Medicines (OTC only):** [Safe medicines with dosage]
🏡 **Home Remedies:** [Care tips and natural remedies]
⚕️ **Doctor Recommendation:** [When and which specialist]
⚕️ **Diet Recommendation:** [When and which and why]
⚠️ **Disclaimer:** Standard medical disclaimer

4. SAFETY:
   - NEVER recommend prescription-only drugs
   - ONLY suggest common OTC medicines
   - Always include dosage and frequency
   - Always recommend seeing a doctor for serious symptoms

Remember: Respond in the SAME LANGUAGE as the user's input!`,

  pharmacy: `You are an AI assistant specialized in pharmacy operations and medication management.

Provide insights on:
- Inventory management and stock optimization
- Medicine expiry tracking and alerts
- Sales trends and demand forecasting
- Drug interaction warnings
- Generic medicine alternatives
- Pricing strategies and revenue optimization
- Customer health trends and patterns

Always provide data-driven, actionable insights for pharmacy businesses.`,

  meditation: `You are a wise, compassionate meditation and mindfulness guide.

Help users with:
- Personalized meditation recommendations
- Breathing techniques and guided exercises
- Stress management strategies
- Sleep improvement techniques
- Mindfulness practices for daily life
- Progress tracking and motivation
- Creating custom meditation sessions

Respond with empathy, wisdom, and practical guidance.`
};

class AIService {
  
  /**
   * Generate medical advice based on user symptoms
   * @param {string} symptoms - User's symptom description
   * @param {string} language - Optional language preference
   * @returns {Promise<Object>} Medical advice response
   */
  async getMedicalAdvice(symptoms, language = 'auto') {
    if (!genAI) {
      throw new Error('Gemini AI not configured. Please check GEMINI_API_KEY environment variable.');
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_PROMPTS.medical
      });

      const chat = model.startChat({
        generationConfig: {
          temperature: 0.7,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 2048,
        },
      });

      const result = await chat.sendMessage(symptoms);
      const response = result.response.text();

      return {
        success: true,
        advice: response,
        timestamp: new Date().toISOString(),
        model: 'gemini-2.0-flash',
        type: 'medical'
      };
    } catch (error) {
      console.error('❌ Medical advice generation failed:', error);
      throw new Error(`Failed to generate medical advice: ${error.message}`);
    }
  }

  /**
   * Generate pharmacy business insights
   * @param {string} query - Business query or request
   * @param {Object} data - Optional business data context
   * @returns {Promise<Object>} Business insights response
   */
  async getPharmacyInsights(query, data = {}) {
    if (!genAI) {
      throw new Error('Gemini AI not configured. Please check GEMINI_API_KEY environment variable.');
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_PROMPTS.pharmacy
      });

      // Include business data context if provided
      let enrichedQuery = query;
      if (Object.keys(data).length > 0) {
        enrichedQuery = `Business Context: ${JSON.stringify(data, null, 2)}\n\nQuery: ${query}`;
      }

      const result = await model.generateContent(enrichedQuery);
      const response = await result.response;
      const insights = response.text();

      return {
        success: true,
        insights: insights,
        timestamp: new Date().toISOString(),
        model: 'gemini-2.0-flash',
        type: 'pharmacy',
        context: data
      };
    } catch (error) {
      console.error('❌ Pharmacy insights generation failed:', error);
      throw new Error(`Failed to generate pharmacy insights: ${error.message}`);
    }
  }

  /**
   * Generate personalized meditation content
   * @param {Object} preferences - User's meditation preferences
   * @param {string} type - Type of meditation content (script, guide, plan)
   * @returns {Promise<Object>} Meditation content response
   */
  async generateMeditationContent(preferences, type = 'script') {
    if (!genAI) {
      throw new Error('Gemini AI not configured. Please check GEMINI_API_KEY environment variable.');
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_PROMPTS.meditation
      });

      const prompt = this._buildMeditationPrompt(preferences, type);
      
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const content = response.text();

      return {
        success: true,
        content: content,
        type: type,
        preferences: preferences,
        timestamp: new Date().toISOString(),
        model: 'gemini-2.0-flash'
      };
    } catch (error) {
      console.error('❌ Meditation content generation failed:', error);
      throw new Error(`Failed to generate meditation content: ${error.message}`);
    }
  }

  /**
   * Analyze user's meditation progress and provide insights
   * @param {Object} progressData - User's meditation history and statistics
   * @returns {Promise<Object>} Progress analysis and recommendations
   */
  async analyzeMeditationProgress(progressData) {
    if (!genAI) {
      throw new Error('Gemini AI not configured. Please check GEMINI_API_KEY environment variable.');
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_PROMPTS.meditation
      });

      const prompt = `
Analyze this user's meditation progress and provide personalized insights:

Progress Data:
${JSON.stringify(progressData, null, 2)}

Please provide:
1. Overall progress assessment
2. Strengths and areas for improvement
3. Specific recommendations for next steps
4. Motivational insights
5. Suggested meditation adjustments

Format the response in a clear, encouraging way.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const analysis = response.text();

      return {
        success: true,
        analysis: analysis,
        progressData: progressData,
        timestamp: new Date().toISOString(),
        model: 'gemini-2.0-flash',
        type: 'progress'
      };
    } catch (error) {
      console.error('❌ Progress analysis failed:', error);
      throw new Error(`Failed to analyze meditation progress: ${error.message}`);
    }
  }

  /**
   * Generate mood-based recommendations
   * @param {Object} moodData - User's mood log data
   * @returns {Promise<Object>} Mood insights and recommendations
   */
  async getMoodInsights(moodData) {
    if (!genAI) {
      throw new Error('Gemini AI not configured. Please check GEMINI_API_KEY environment variable.');
    }

    try {
      const model = genAI.getGenerativeModel({ 
        model: "gemini-2.0-flash",
        systemInstruction: SYSTEM_PROMPTS.meditation
      });

      const prompt = `
Based on this user's mood data, provide personalized wellness recommendations:

Mood Data:
${JSON.stringify(moodData, null, 2)}

Provide:
1. Mood pattern analysis
2. Meditation recommendations based on current mood
3. Breathing exercises for mood regulation
4. Lifestyle suggestions
5. When to seek additional support

Keep the tone supportive and encouraging.`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const insights = response.text();

      return {
        success: true,
        insights: insights,
        moodData: moodData,
        timestamp: new Date().toISOString(),
        model: 'gemini-2.0-flash',
        type: 'mood'
      };
    } catch (error) {
      console.error('❌ Mood insights generation failed:', error);
      throw new Error(`Failed to generate mood insights: ${error.message}`);
    }
  }

  /**
   * Build meditation prompt based on preferences and type
   * @private
   */
  _buildMeditationPrompt(preferences, type) {
    const basePrompts = {
      script: `Create a personalized meditation script with these preferences:`,
      guide: `Create a meditation guide with these preferences:`,
      plan: `Create a personalized meditation plan with these preferences:`
    };

    return `
${basePrompts[type] || basePrompts.script}

Preferences:
- Duration: ${preferences.duration || '10 minutes'}
- Focus: ${preferences.focus || 'relaxation'}
- Experience Level: ${preferences.level || 'beginner'}
- Goals: ${preferences.goals || 'stress relief'}
- Environment: ${preferences.environment || 'quiet room'}
- Time of Day: ${preferences.timeOfDay || 'anytime'}

Additional Context:
${preferences.context || 'General wellness and mindfulness'}

Please create ${type === 'script' ? 'a complete guided meditation script' : 
               type === 'guide' ? 'step-by-step meditation instructions' : 
               'a structured meditation plan'} that is:
1. Appropriate for the experience level
2. Aligned with the stated goals
3. Practical and easy to follow
4. Engaging and calming
5. Includes timing guidance

Format the response clearly with sections and timing cues.`;
  }

  /**
   * Test AI connection and capabilities
   * @returns {Promise<Object>} Connection test results
   */
  async testConnection() {
    if (!genAI) {
      return {
        success: false,
        error: 'Gemini AI not configured',
        configured: false
      };
    }

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      const result = await model.generateContent("Say 'MediTatva Backend AI is working!' in exactly that format.");
      const response = await result.response;
      const text = response.text();

      return {
        success: true,
        message: text,
        model: 'gemini-2.0-flash',
        configured: true,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        configured: true,
        timestamp: new Date().toISOString()
      };
    }
  }
}

module.exports = new AIService();
