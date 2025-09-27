const { ChatOpenAI } = require('@langchain/openai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');

class AIFinancialAdvisor {
  constructor() {
    this.models = {
      openai: null,
      google: null,
      anthropic: null
    };
    
    this.initializeModels();
  }
  
  initializeModels() {
    // Initialize OpenAI if API key is available
    if (process.env.OPENAI_API_KEY) {
      this.models.openai = new ChatOpenAI({
        modelName: 'gpt-4-turbo-preview',
        temperature: 0.3,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
      console.log('✅ OpenAI model initialized');
    }
    
    // Initialize Google AI if API key is available
    if (process.env.GOOGLE_API_KEY) {
      this.models.google = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        apiKey: process.env.GOOGLE_API_KEY,
      });
      console.log('✅ Google AI model initialized');
    }
    
    // TODO: Add Anthropic when needed
    // if (process.env.ANTHROPIC_API_KEY) {
    //   this.models.anthropic = new ChatAnthropic({
    //     modelName: 'claude-3-sonnet-20240229',
    //     temperature: 0.3,
    //     anthropicApiKey: process.env.ANTHROPIC_API_KEY,
    //   });
    //   console.log('✅ Anthropic model initialized');
    // }
  }
  
  getAvailableModel() {
    if (this.models.openai) return { model: this.models.openai, provider: 'openai' };
    if (this.models.google) return { model: this.models.google, provider: 'google' };
    if (this.models.anthropic) return { model: this.models.anthropic, provider: 'anthropic' };
    
    throw new Error('No AI models available. Please configure API keys in .env file.');
  }
  
  async generateFinancialAdvice(userQuery, userProfile, financialData = {}) {
    try {
      const { model, provider } = this.getAvailableModel();
      
      const promptTemplate = PromptTemplate.fromTemplate(`
        You are a highly experienced financial advisor with expertise in personal finance, investing, budgeting, and financial planning. 
        You provide personalized, actionable advice based on the user's specific financial situation.
        
        USER PROFILE:
        - Name: {firstName} {lastName}
        - Age: {age}
        - Life Stage: {lifeStage}
        - Risk Tolerance: {riskTolerance}
        - Primary Goals: {primaryGoals}
        
        FINANCIAL SITUATION:
        - Monthly Income: {monthlyIncome}
        - Monthly Expenses: {monthlyExpenses}
        - Current Savings: {currentSavings}
        - Debt: {debt}
        - Net Worth: {netWorth}
        
        ADDITIONAL CONTEXT:
        {additionalContext}
        
        USER QUESTION: {userQuery}
        
        Please provide:
        1. A clear, personalized response to their question
        2. 3-5 specific, actionable insights
        3. 3-4 concrete suggestions they can implement
        4. If relevant, a brief visualization recommendation
        
        Keep your response practical, encouraging, and tailored to their specific situation.
        Use their actual numbers when making recommendations.
        
        Format your response as JSON with the following structure:
        {{
          "response": "Main response text",
          "insights": ["insight1", "insight2", "insight3"],
          "suggestions": ["suggestion1", "suggestion2", "suggestion3"],
          "visualization": {{
            "type": "chart_type",
            "title": "Chart title",
            "description": "Why this visualization helps"
          }},
          "followUpQuestions": ["question1", "question2"]
        }}
      `);
      
      const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
      ]);
      
      const result = await chain.invoke({
        firstName: userProfile.firstName || 'User',
        lastName: userProfile.lastName || '',
        age: userProfile.onboarding?.age || 'Not specified',
        lifeStage: userProfile.onboarding?.lifeStage || 'Not specified',
        riskTolerance: userProfile.onboarding?.riskTolerance || 'moderate',
        primaryGoals: userProfile.onboarding?.primaryGoals?.join(', ') || 'General financial health',
        monthlyIncome: userProfile.financialProfile?.monthlyIncome || 0,
        monthlyExpenses: userProfile.financialProfile?.monthlyExpenses || 0,
        currentSavings: userProfile.financialProfile?.currentSavings || 0,
        debt: userProfile.financialProfile?.debt || 0,
        netWorth: userProfile.calculateNetWorth?.() || 
                 (userProfile.financialProfile?.currentSavings || 0) - (userProfile.financialProfile?.debt || 0),
        additionalContext: JSON.stringify(financialData),
        userQuery: userQuery
      });
      
      try {
        // Clean the result string before parsing
        let cleanResult = result.trim();
        
        // Remove any markdown code blocks if present
        if (cleanResult.startsWith('```json')) {
          cleanResult = cleanResult.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanResult.startsWith('```')) {
          cleanResult = cleanResult.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsedResult = JSON.parse(cleanResult);
        return {
          ...parsedResult,
          provider: provider,
          timestamp: new Date()
        };
      } catch (parseError) {
        console.warn('JSON parsing failed, attempting to extract JSON from response:', parseError.message);
        
        // Try to extract JSON from the response if it's embedded in text
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsedResult = JSON.parse(jsonMatch[0]);
            return {
              ...parsedResult,
              provider: provider,
              timestamp: new Date()
            };
          } catch (secondParseError) {
            console.warn('Second JSON parse attempt failed:', secondParseError.message);
          }
        }
        
        // Final fallback if JSON parsing completely fails
        return {
          response: result,
          insights: ["AI provided detailed financial advice"],
          suggestions: [
            "Review the advice provided above",
            "Consider implementing the recommendations",
            "Ask follow-up questions for clarification"
          ],
          provider: provider,
          timestamp: new Date()
        };
      }
      
    } catch (error) {
      console.error('AI Advisor error:', error);
      throw new Error(`Failed to generate financial advice: ${error.message}`);
    }
  }
  
  async analyzeSpendingPattern(transactions, userProfile, timeframe = '30d') {
    try {
      const { model, provider } = this.getAvailableModel();
      
      const promptTemplate = PromptTemplate.fromTemplate(`
        You are a financial data analyst. Analyze the following spending data and provide insights.
        
        USER PROFILE:
        - Monthly Income: {monthlyIncome}
        - Monthly Expenses: {monthlyExpenses}
        - Risk Tolerance: {riskTolerance}
        
        SPENDING DATA (last {timeframe}):
        {transactionData}
        
        Analyze the spending patterns and provide:
        1. Key spending insights
        2. Areas of concern or improvement
        3. Spending efficiency recommendations
        4. Budget optimization suggestions
        
        Format as JSON:
        {{
          "summary": "Overall spending analysis",
          "insights": ["insight1", "insight2", "insight3"],
          "concerns": ["concern1", "concern2"],
          "recommendations": [
            {{
              "category": "category",
              "current": amount,
              "recommended": amount,
              "strategy": "how to achieve this"
            }}
          ],
          "efficiency_score": number_out_of_100,
          "potential_savings": monthly_amount
        }}
      `);
      
      const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
      ]);
      
      const result = await chain.invoke({
        monthlyIncome: userProfile.financialProfile?.monthlyIncome || 0,
        monthlyExpenses: userProfile.financialProfile?.monthlyExpenses || 0,
        riskTolerance: userProfile.onboarding?.riskTolerance || 'moderate',
        timeframe: timeframe,
        transactionData: JSON.stringify(transactions)
      });
      
      return JSON.parse(result);
      
    } catch (error) {
      console.error('Spending analysis error:', error);
      throw new Error(`Failed to analyze spending: ${error.message}`);
    }
  }
  
  async optimizeGoals(goals, userProfile, currentProgress) {
    try {
      const { model, provider } = this.getAvailableModel();
      
      const promptTemplate = PromptTemplate.fromTemplate(`
        You are a financial goal optimization expert. Help optimize the user's financial goals.
        
        USER PROFILE:
        - Monthly Income: ${monthlyIncome}
        - Monthly Expenses: ${monthlyExpenses}
        - Current Savings: ${currentSavings}
        - Risk Tolerance: {riskTolerance}
        
        CURRENT GOALS:
        {goalsData}
        
        PROGRESS DATA:
        {progressData}
        
        Provide goal optimization advice:
        1. Priority ranking of goals
        2. Realistic timeline adjustments
        3. Contribution recommendations
        4. Strategy improvements
        
        Format as JSON:
        {{
          "prioritized_goals": [
            {{
              "goal": "goal_name",
              "priority": number,
              "reasoning": "why this priority",
              "recommended_monthly": amount,
              "projected_completion": "date"
            }}
          ],
          "optimization_strategies": ["strategy1", "strategy2"],
          "timeline_adjustments": {{
            "goal_name": "new_timeline_explanation"
          }},
          "overall_advice": "comprehensive advice"
        }}
      `);
      
      const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
      ]);
      
      const result = await chain.invoke({
        monthlyIncome: userProfile.financialProfile?.monthlyIncome || 0,
        monthlyExpenses: userProfile.financialProfile?.monthlyExpenses || 0,
        currentSavings: userProfile.financialProfile?.currentSavings || 0,
        riskTolerance: userProfile.onboarding?.riskTolerance || 'moderate',
        goalsData: JSON.stringify(goals),
        progressData: JSON.stringify(currentProgress)
      });
      
      return JSON.parse(result);
      
    } catch (error) {
      console.error('Goal optimization error:', error);
      throw new Error(`Failed to optimize goals: ${error.message}`);
    }
  }
  
  async generateBudgetPlan(userProfile, preferences = {}) {
    try {
      const { model, provider } = this.getAvailableModel();
      
      const promptTemplate = PromptTemplate.fromTemplate(`
        Create a personalized budget plan for this user.
        
        USER PROFILE:
        - Monthly Income: {monthlyIncome}
        - Monthly Expenses: {monthlyExpenses}
        - Current Savings: {currentSavings}
        - Debt: {debt}
        - Life Stage: {lifeStage}
        - Primary Goals: {primaryGoals}
        
        PREFERENCES:
        {preferences}
        
        Create a realistic, personalized budget using proven budgeting methods.
        Consider their life stage, goals, and current financial situation.
        
        Format as JSON:
        {{
          "budget_method": "50/30/20 or Zero-based or custom",
          "categories": {{
            "needs": {{ "amount": number, "percentage": number, "items": ["item1", "item2"] }},
            "wants": {{ "amount": number, "percentage": number, "items": ["item1", "item2"] }},
            "savings": {{ "amount": number, "percentage": number, "items": ["item1", "item2"] }},
            "debt_payment": {{ "amount": number, "percentage": number }}
          }},
          "monthly_surplus": number,
          "recommendations": ["recommendation1", "recommendation2"],
          "adjustments_needed": ["adjustment1", "adjustment2"],
          "success_tips": ["tip1", "tip2", "tip3"]
        }}
      `);
      
      const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
      ]);
      
      const result = await chain.invoke({
        monthlyIncome: userProfile.financialProfile?.monthlyIncome || 0,
        monthlyExpenses: userProfile.financialProfile?.monthlyExpenses || 0,
        currentSavings: userProfile.financialProfile?.currentSavings || 0,
        debt: userProfile.financialProfile?.debt || 0,
        lifeStage: userProfile.onboarding?.lifeStage || 'Not specified',
        primaryGoals: userProfile.onboarding?.primaryGoals?.join(', ') || 'General financial health',
        preferences: JSON.stringify(preferences)
      });
      
      return JSON.parse(result);
      
    } catch (error) {
      console.error('Budget planning error:', error);
      throw new Error(`Failed to generate budget plan: ${error.message}`);
    }
  }
}

module.exports = new AIFinancialAdvisor();
