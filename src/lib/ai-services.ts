import { getOpenRouter, OpenRouterMessage } from './openrouter';

export interface MoodEntry {
  mood: string;
  note?: string;
  created_at: string;
}

export interface JournalEntry {
  content: string;
  created_at: string;
}

export interface AIInsight {
  type: 'pattern' | 'suggestion' | 'warning' | 'celebration';
  title: string;
  description: string;
  actionable?: string;
  severity?: 'low' | 'medium' | 'high';
}

export class AIService {
  async analyzeMoodPattern(moodEntries: MoodEntry[]): Promise<AIInsight[]> {
    if (moodEntries.length < 3) {
      return [{
        type: 'suggestion',
        title: 'Keep Tracking',
        description: 'Track your mood for a few more days to get personalized insights.',
        severity: 'low',
      }];
    }

    const moodData = moodEntries
      .slice(0, 30)
      .map(e => `${e.mood} - ${e.note || 'no note'} (${new Date(e.created_at).toLocaleDateString()})`)
      .join('\n');

    const systemPrompt = `You are a compassionate mental health AI assistant. Analyze mood patterns and provide actionable insights. Be empathetic, encouraging, and focus on positive psychology principles. Keep responses concise (2-3 sentences per insight).`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `Analyze these mood entries and provide 2-3 insights in JSON format. Each insight should have: type ("pattern"|"suggestion"|"warning"|"celebration"), title (short), description (2-3 sentences), actionable (optional action step), severity ("low"|"medium"|"high").

Recent moods:
${moodData}

Return ONLY valid JSON array of insights, no other text.`,
      },
    ];

    try {
      const response = await getOpenRouter().chat(messages, {
        systemPrompt,
        temperature: 0.7,
        maxTokens: 800,
      });

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        const insights = JSON.parse(jsonMatch[0]);
        return insights;
      }

      return [{
        type: 'suggestion',
        title: 'Analysis Complete',
        description: response.slice(0, 200),
        severity: 'low',
      }];
    } catch (error) {
      console.error('AI mood analysis failed:', error);
      return [{
        type: 'suggestion',
        title: 'Continue Tracking',
        description: 'Keep logging your moods to unlock deeper insights about your emotional patterns.',
        severity: 'low',
      }];
    }
  }

  async analyzeJournalEntry(entry: string): Promise<{
    sentiment: 'positive' | 'neutral' | 'negative' | 'crisis';
    themes: string[];
    suggestions: string[];
    needsSupport: boolean;
  }> {
    const systemPrompt = `You are a mental health support AI. Analyze journal entries for emotional content, identify themes, and detect if immediate support is needed. Be sensitive and non-judgmental.`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `Analyze this journal entry and return JSON with: sentiment ("positive"|"neutral"|"negative"|"crisis"), themes (array of 2-3 themes), suggestions (array of 2-3 supportive suggestions), needsSupport (boolean - true if mentions self-harm, suicide, or severe distress).

Journal entry:
"${entry}"

Return ONLY valid JSON, no other text.`,
      },
    ];

    try {
      const response = await getOpenRouter().chat(messages, {
        systemPrompt,
        temperature: 0.6,
        maxTokens: 500,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return {
        sentiment: 'neutral',
        themes: ['reflection'],
        suggestions: ['Continue expressing your thoughts through journaling.'],
        needsSupport: false,
      };
    } catch (error) {
      console.error('AI journal analysis failed:', error);
      return {
        sentiment: 'neutral',
        themes: ['reflection'],
        suggestions: ['Thank you for sharing. Consider talking to a professional if you need support.'],
        needsSupport: false,
      };
    }
  }

  async generatePersonalizedAffirmation(
    moodHistory?: MoodEntry[],
    recentThemes?: string[]
  ): Promise<string> {
    const context = moodHistory
      ? `Recent moods: ${moodHistory.slice(0, 5).map(m => m.mood).join(', ')}`
      : '';
    const themes = recentThemes ? `Recent themes: ${recentThemes.join(', ')}` : '';

    const systemPrompt = `You are a compassionate mental health supporter. Generate personalized, uplifting affirmations. Keep them short (1-2 sentences), present-tense, and empowering.`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `Generate one personalized daily affirmation. ${context} ${themes}

Return only the affirmation text, no quotes or extra formatting.`,
      },
    ];

    try {
      const response = await getOpenRouter().chat(messages, {
        systemPrompt,
        temperature: 0.8,
        maxTokens: 100,
      });

      return response.trim().replace(/^["']|["']$/g, '');
    } catch (error) {
      console.error('AI affirmation generation failed:', error);
      const fallbacks = [
        'You are worthy of peace, love, and happiness.',
        'Every small step forward is progress worth celebrating.',
        'Your feelings are valid, and you deserve support.',
        'You have survived 100% of your hardest days so far.',
        'Growth happens in the moments you choose to keep going.',
      ];
      return fallbacks[Math.floor(Math.random() * fallbacks.length)];
    }
  }

  async chatWithSupport(
    messages: OpenRouterMessage[],
    customSystemPrompt?: string,
    onChunk?: (chunk: string) => void
  ): Promise<string> {
    const defaultSystemPrompt = `You are a compassionate mental health support companion. You are NOT a replacement for professional therapy.

Guidelines:
- Be warm, empathetic, and non-judgmental
- Validate emotions without minimizing them
- Suggest healthy coping strategies when appropriate
- If user mentions self-harm, suicide, or severe crisis, urgently recommend professional help (988 Suicide & Crisis Lifeline, local emergency services)
- Encourage professional therapy for ongoing issues
- Use active listening techniques
- Keep responses conversational and supportive (2-4 sentences)
- Never diagnose or prescribe treatment

Remember: You're a supportive companion, not a therapist.`;

    const systemPrompt = customSystemPrompt || defaultSystemPrompt;

    try {
      if (onChunk) {
        let fullResponse = '';
        await getOpenRouter().streamChat(
          messages,
          (chunk) => {
            fullResponse += chunk;
            onChunk(chunk);
          },
          {
            systemPrompt,
            temperature: 0.8,
            maxTokens: 500,
          }
        );
        return fullResponse;
      } else {
        return await getOpenRouter().chat(messages, {
          systemPrompt,
          temperature: 0.8,
          maxTokens: 500,
        });
      }
    } catch (error) {
      console.error('AI chat failed:', error);
      return "I'm having trouble connecting right now. If you need immediate support, please reach out to the 988 Suicide & Crisis Lifeline or contact a mental health professional.";
    }
  }

  async generateCopingStrategies(situation: string): Promise<string[]> {
    const systemPrompt = `You are a mental health expert specializing in evidence-based coping strategies. Provide practical, actionable techniques.`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `Generate 4-5 specific coping strategies for: "${situation}"

Return as a JSON array of strings. Each strategy should be:
- Actionable and specific
- Evidence-based (CBT, DBT, mindfulness)
- Brief (1 sentence)

Example format: ["Strategy 1", "Strategy 2", ...]

Return ONLY the JSON array, no other text.`,
      },
    ];

    try {
      const response = await getOpenRouter().chat(messages, {
        systemPrompt,
        temperature: 0.7,
        maxTokens: 400,
      });

      const jsonMatch = response.match(/\[[\s\S]*\]/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return [
        'Practice deep breathing: 4 counts in, 7 hold, 8 out',
        'Ground yourself using the 5-4-3-2-1 senses technique',
        'Take a short walk or do gentle stretching',
        'Write down your thoughts in a journal',
        'Reach out to a trusted friend or support person',
      ];
    } catch (error) {
      console.error('AI coping strategies failed:', error);
      return [
        'Practice deep breathing exercises',
        'Use grounding techniques to stay present',
        'Engage in gentle physical activity',
        'Express your feelings through journaling',
        'Connect with supportive people in your life',
      ];
    }
  }

  async predictCrisisRisk(moodHistory: MoodEntry[]): Promise<{
    level: 'low' | 'moderate' | 'high' | 'critical';
    score: number;
    confidence: number;
    triggers: string[];
    predictedTimeframe: string;
    recommendations: string[];
    supportResources: Array<{
      title: string;
      contact: string;
      description: string;
    }>;
  }> {
    if (moodHistory.length < 7) {
      return {
        level: 'low',
        score: 0,
        confidence: 0,
        triggers: [],
        predictedTimeframe: '',
        recommendations: ['Continue tracking your mood daily for better insights.'],
        supportResources: [],
      };
    }

    const recentMoods = moodHistory.slice(0, 30).map(e =>
      `${e.mood} - ${e.note || 'no note'} (${new Date(e.created_at).toLocaleDateString()})`
    ).join('\n');

    const systemPrompt = `You are a mental health AI specializing in crisis prediction and early intervention. Analyze mood patterns to identify concerning trends that may indicate increased mental health risk. Be sensitive, evidence-based, and err on the side of caution.`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `Analyze these mood logs and predict crisis risk. Return JSON with:
- level: "low"|"moderate"|"high"|"critical" (critical only if clear suicide/self-harm indicators)
- score: 0-100 (risk score)
- confidence: 0.0-1.0 (how confident is the prediction)
- triggers: array of 2-4 identified concerning patterns (be specific)
- predictedTimeframe: when risk may peak (e.g., "next 3-7 days", "next 2 weeks")
- recommendations: array of 3-5 actionable prevention steps
- supportResources: array of 1-3 resources with title, contact (phone/url), description

Mood history (most recent first):
${recentMoods}

Consider: declining trends, sudden changes, negative note patterns, consistency of low moods, mentions of hopelessness/isolation.

Return ONLY valid JSON, no other text.`,
      },
    ];

    try {
      const response = await getOpenRouter().chat(messages, {
        systemPrompt,
        temperature: 0.6,
        maxTokens: 800,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);

        // Always include 988 if risk is high or critical
        if ((result.level === 'high' || result.level === 'critical') &&
            !result.supportResources.some((r: any) => r.contact.includes('988'))) {
          result.supportResources.unshift({
            title: '988 Suicide & Crisis Lifeline',
            contact: 'tel:988',
            description: '24/7 free and confidential support',
          });
        }

        return result;
      }

      return this.getDefaultCrisisResponse();
    } catch (error) {
      console.error('Crisis prediction failed:', error);
      return this.getDefaultCrisisResponse();
    }
  }

  private getDefaultCrisisResponse() {
    return {
      level: 'low' as const,
      score: 20,
      confidence: 0.5,
      triggers: ['Continue tracking for more accurate analysis'],
      predictedTimeframe: 'Unable to determine with current data',
      recommendations: [
        'Continue daily mood tracking for better insights',
        'Practice regular self-care activities',
        'Stay connected with supportive people',
        'Consider speaking with a mental health professional',
      ],
      supportResources: [
        {
          title: '988 Suicide & Crisis Lifeline',
          contact: 'tel:988',
          description: '24/7 support for anyone in crisis',
        },
        {
          title: 'Crisis Text Line',
          contact: 'https://www.crisistextline.org',
          description: 'Text HOME to 741741',
        },
      ],
    };
  }

  async generateWeeklyReport(data: {
    moodLogs: MoodEntry[];
    journalEntries: JournalEntry[];
    streakDays: number;
    toolsUsed: string[];
    weekStartDate: string;
  }): Promise<{
    summary: string;
    moodTrend: 'improving' | 'stable' | 'declining';
    highlights: string[];
    concerns: string[];
    recommendations: string[];
    nextWeekGoals: string[];
    engagementScore: number;
  }> {
    const moodSummary = data.moodLogs.slice(0, 7).map(m =>
      `${m.mood}${m.note ? ` (${m.note.slice(0, 50)})` : ''}`
    ).join(', ');

    const systemPrompt = `You are a compassionate mental health analyst creating weekly progress reports. Be encouraging, specific, and actionable.`;

    const messages: OpenRouterMessage[] = [
      {
        role: 'user',
        content: `Generate a weekly mental health report for the week starting ${data.weekStartDate}.

Data:
- Moods logged: ${data.moodLogs.length} (${moodSummary})
- Journal entries: ${data.journalEntries.length}
- Current streak: ${data.streakDays} days
- Tools used: ${data.toolsUsed.join(', ')}

Return JSON with:
- summary: 2-3 sentence overview of the week
- moodTrend: "improving"|"stable"|"declining"
- highlights: array of 2-3 positive observations
- concerns: array of 0-2 areas needing attention (empty if none)
- recommendations: array of 3-4 actionable suggestions for next week
- nextWeekGoals: array of 2-3 specific, achievable goals
- engagementScore: 0-100 based on activity level

Be encouraging and specific. Return ONLY JSON.`,
      },
    ];

    try {
      const response = await getOpenRouter().chat(messages, {
        systemPrompt,
        temperature: 0.7,
        maxTokens: 700,
      });

      const jsonMatch = response.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      return this.getDefaultWeeklyReport();
    } catch (error) {
      console.error('Weekly report generation failed:', error);
      return this.getDefaultWeeklyReport();
    }
  }

  private getDefaultWeeklyReport() {
    return {
      summary: 'Keep up the great work tracking your mental health journey. Every check-in brings valuable self-awareness.',
      moodTrend: 'stable' as const,
      highlights: [
        'You continued showing up for yourself',
        'Building self-awareness through regular tracking',
      ],
      concerns: [],
      recommendations: [
        'Try to maintain daily mood logging for better insights',
        'Explore different wellness tools available',
        'Consider journaling when experiencing strong emotions',
      ],
      nextWeekGoals: [
        'Log mood at least 5 times',
        'Try one new coping strategy',
      ],
      engagementScore: 65,
    };
  }

  // Generic text generation method
  async generateText(prompt: string): Promise<string> {
    try {
      const messages: OpenRouterMessage[] = [
        { role: 'user', content: prompt }
      ];

      const response = await getOpenRouter().chat(messages, {
        systemPrompt: 'You are a compassionate mental health assistant. Keep responses brief, encouraging, and actionable (1-2 sentences).',
        temperature: 0.7,
        maxTokens: 150,
      });

      return response;
    } catch (error) {
      console.error('Text generation failed:', error);
      return 'Thank you for sharing. Keep up the great work on your mental health journey! 💙';
    }
  }
}

export const aiService = new AIService();
