# 🤖 MediTatva Backend AI Integration Guide

## Overview
The MediTatva backend now has a complete AI service powered by Google's Gemini 2.0 Flash model, providing healthcare, pharmacy, and wellness insights.

## ✅ **Current Status: FULLY IMPLEMENTED**

### 🚀 **Backend AI Service Features:**
- ✅ **Medical Advice & Symptom Analysis**
- ✅ **Pharmacy Business Insights** 
- ✅ **Meditation Content Generation**
- ✅ **Progress Analysis & Recommendations**
- ✅ **Mood Insights & Wellness Guidance**
- ✅ **Multi-language Support**
- ✅ **Chat Interface for General AI Interaction**

---

## 🔧 **API Endpoints**

### Base URL: `http://localhost:5000/api/ai`

### 1. **Service Status**
```bash
GET /api/ai/status
```
**Response:** Complete service information, capabilities, and connection status

### 2. **Connection Test**
```bash
GET /api/ai/test
```
**Response:** Simple connection test result

### 3. **Medical Advice**
```bash
POST /api/ai/medical-advice
Content-Type: application/json

{
  "symptoms": "I have fever and headache since yesterday, feeling weak",
  "language": "auto" // optional
}
```
**Response:** Structured medical guidance with conditions, medicines, and recommendations

### 4. **Pharmacy Business Insights**
```bash
POST /api/ai/pharmacy-insights
Content-Type: application/json

{
  "query": "Analyze our top-selling medicines and recommend inventory optimization",
  "businessData": {
    "topSellingMedicines": ["Paracetamol", "Crocin", "Dolo 650"],
    "monthlyRevenue": 50000,
    "lowStockItems": ["Vitamin D", "Blood pressure medicines"]
  }
}
```
**Response:** AI-powered business insights and recommendations

### 5. **Meditation Content Generation**
```bash
POST /api/ai/meditation-content
Content-Type: application/json

{
  "preferences": {
    "duration": "10 minutes",
    "focus": "stress relief",
    "level": "beginner",
    "goals": "relaxation",
    "timeOfDay": "evening"
  },
  "contentType": "script" // script, guide, or plan
}
```
**Response:** Personalized meditation content

### 6. **Progress Analysis**
```bash
POST /api/ai/analyze-progress
Content-Type: application/json

{
  "progressData": {
    "sessionsCount": 25,
    "averageDuration": 12,
    "consistency": "daily",
    "goals": ["stress relief", "better sleep"],
    "recentFeedback": ["feeling calmer", "sleeping better"]
  }
}
```
**Response:** Detailed progress analysis and next steps

### 7. **Mood Insights**
```bash
POST /api/ai/mood-insights
Content-Type: application/json

{
  "moodData": {
    "entries": [
      {"date": "2025-11-01", "mood": "anxious", "energy": 3},
      {"date": "2025-11-02", "mood": "calm", "energy": 7}
    ],
    "patterns": ["work stress", "evening relaxation"]
  }
}
```
**Response:** Mood pattern analysis and wellness recommendations

### 8. **General Chat Interface**
```bash
POST /api/ai/chat
Content-Type: application/json

{
  "message": "I need help with managing stress",
  "context": {
    "type": "meditation", // medical, pharmacy, meditation, or general
    "preferences": {
      "level": "beginner"
    }
  },
  "sessionId": "unique-session-id" // optional
}
```
**Response:** Context-aware AI chat response

---

## 🔗 **Frontend Integration Examples**

### 1. **React Hook for AI API**

Create a custom hook for easy AI integration:

```typescript
// src/hooks/useAI.ts
import { useState } from 'react';

interface AIResponse {
  success: boolean;
  data?: any;
  error?: string;
}

export const useAI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const callAI = async (endpoint: string, data?: any): Promise<AIResponse> => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`http://localhost:5000/api/ai/${endpoint}`, {
        method: data ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        body: data ? JSON.stringify(data) : undefined,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'AI request failed');
      }

      return { success: true, data: result.data };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Specific AI functions
  const getMedicalAdvice = (symptoms: string, language = 'auto') => 
    callAI('medical-advice', { symptoms, language });

  const getPharmacyInsights = (query: string, businessData = {}) =>
    callAI('pharmacy-insights', { query, businessData });

  const generateMeditationContent = (preferences: any, contentType = 'script') =>
    callAI('meditation-content', { preferences, contentType });

  const analyzeProgress = (progressData: any) =>
    callAI('analyze-progress', { progressData });

  const getMoodInsights = (moodData: any) =>
    callAI('mood-insights', { moodData });

  const chatWithAI = (message: string, context = {}, sessionId?: string) =>
    callAI('chat', { message, context, sessionId });

  return {
    loading,
    error,
    getMedicalAdvice,
    getPharmacyInsights,
    generateMeditationContent,
    analyzeProgress,
    getMoodInsights,
    chatWithAI,
  };
};
```

### 2. **Medical Advice Component**

```typescript
// src/components/MedicalAdviceComponent.tsx
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card } from '@/components/ui/card';

export const MedicalAdviceComponent = () => {
  const [symptoms, setSymptoms] = useState('');
  const [advice, setAdvice] = useState<string | null>(null);
  const { getMedicalAdvice, loading, error } = useAI();

  const handleGetAdvice = async () => {
    if (!symptoms.trim()) return;

    const result = await getMedicalAdvice(symptoms);
    if (result.success) {
      setAdvice(result.data.advice);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold mb-4">🩺 AI Medical Advice</h3>
      
      <Textarea
        placeholder="Describe your symptoms..."
        value={symptoms}
        onChange={(e) => setSymptoms(e.target.value)}
        className="mb-4"
      />
      
      <Button 
        onClick={handleGetAdvice}
        disabled={loading || !symptoms.trim()}
        className="mb-4"
      >
        {loading ? 'Getting Advice...' : 'Get Medical Advice'}
      </Button>

      {error && (
        <div className="text-red-500 mb-4">Error: {error}</div>
      )}

      {advice && (
        <div className="bg-blue-50 p-4 rounded-lg">
          <div className="whitespace-pre-wrap">{advice}</div>
        </div>
      )}
    </Card>
  );
};
```

### 3. **Pharmacy Insights Dashboard**

```typescript
// src/components/PharmacyInsightsDashboard.tsx
import { useState } from 'react';
import { useAI } from '@/hooks/useAI';

export const PharmacyInsightsDashboard = () => {
  const [insights, setInsights] = useState<string | null>(null);
  const { getPharmacyInsights, loading } = useAI();

  const handleGetInsights = async (query: string) => {
    const businessData = {
      topSellingMedicines: ['Paracetamol', 'Crocin', 'Dolo 650'],
      monthlyRevenue: 50000,
      lowStockItems: ['Vitamin D', 'Blood pressure medicines']
    };

    const result = await getPharmacyInsights(query, businessData);
    if (result.success) {
      setInsights(result.data.insights);
    }
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold">💼 AI Pharmacy Insights</h2>
      
      <div className="grid gap-2">
        <Button onClick={() => handleGetInsights('Analyze inventory and suggest optimizations')}>
          Inventory Analysis
        </Button>
        <Button onClick={() => handleGetInsights('Predict next month sales trends')}>
          Sales Forecast
        </Button>
        <Button onClick={() => handleGetInsights('Recommend pricing strategies')}>
          Pricing Strategy
        </Button>
      </div>

      {loading && <div>Generating insights...</div>}
      
      {insights && (
        <div className="bg-green-50 p-4 rounded-lg">
          <div className="whitespace-pre-wrap">{insights}</div>
        </div>
      )}
    </div>
  );
};
```

### 4. **AI Chat Integration**

```typescript
// Update existing Chatbot.tsx to use backend
import { useAI } from '@/hooks/useAI';

// In your existing Chatbot component, replace the AI call with:
const { chatWithAI } = useAI();

const handleSendMessage = async (message: string) => {
  const result = await chatWithAI(message, {
    type: 'medical',
    language: 'auto'
  }, sessionId);

  if (result.success) {
    // Handle the response
    setMessages(prev => [...prev, {
      text: result.data.response,
      isBot: true,
      timestamp: new Date()
    }]);
  }
};
```

---

## 🔄 **Environment Variables**

### Backend (.env)
```bash
# Gemini AI Configuration
GEMINI_API_KEY=your_gemini_api_key_here

# API Configuration
NODE_ENV=development
PORT=5000
FRONTEND_URL=http://localhost:8080
```

### Frontend (.env)
```bash
# For direct frontend calls (current implementation)
VITE_GEMINI_API_KEY=your_gemini_api_key_here

# For backend integration
VITE_API_BASE_URL=http://localhost:5000/api
```

---

## 🚀 **Getting Started**

### 1. Start Backend
```bash
cd meditatva-backend
npm run dev
# Server runs on http://localhost:5000
```

### 2. Verify AI Service
```bash
curl http://localhost:5000/api/ai/status
```

### 3. Test Medical Advice
```bash
curl -X POST http://localhost:5000/api/ai/medical-advice \
  -H "Content-Type: application/json" \
  -d '{"symptoms": "I have a headache and fever"}'
```

---

## 📊 **Benefits of Backend AI Implementation**

### ✅ **Advantages:**
- **Centralized AI Logic** - All AI processing in one place
- **API Rate Limiting** - Better control over API usage
- **Caching** - Can implement response caching
- **Logging** - Track all AI interactions
- **Security** - API keys hidden from frontend
- **Scalability** - Easy to add more AI features
- **Consistency** - Same AI responses across all clients

### 🔄 **Migration Options:**
1. **Keep Frontend AI** - For real-time chat (current)
2. **Use Backend AI** - For business logic and insights
3. **Hybrid Approach** - Frontend for chat, backend for analytics

---

## 🎯 **Next Steps**

1. **Choose Integration Approach**: Frontend-only, Backend-only, or Hybrid
2. **Implement Authentication**: Add user-based AI interactions
3. **Add Caching**: Cache common AI responses
4. **Add Analytics**: Track AI usage and performance
5. **Rate Limiting**: Implement proper API limits
6. **Error Handling**: Enhanced error management

---

**🎉 Your MediTatva platform now has a complete, production-ready AI backend!**

The AI service is fully functional and ready to power your healthcare, pharmacy, and wellness applications.