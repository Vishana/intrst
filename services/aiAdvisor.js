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
    console.log('🔍 Checking Google API key availability:', !!process.env.GOOGLE_API_KEY);
    if (process.env.GOOGLE_API_KEY) {
      try {
        this.models.google = new ChatGoogleGenerativeAI({
          model: 'gemini-2.5-flash',
          temperature: 0.3,
          apiKey: process.env.GOOGLE_API_KEY,
        });
        console.log('✅ Google AI model (Gemini 2.5 Flash) initialized successfully');
      } catch (error) {
        console.error('❌ Failed to initialize Google AI model:', error.message);
      }
    } else {
      console.log('❌ GOOGLE_API_KEY not found in environment variables');
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
        
        INTEGRATION DATA (Real Financial Accounts):
        - Connected Accounts: {connectedAccounts}
        - Total Net Worth from Integrations: {integrationNetWorth}
        - Total Investments: {totalInvestments}
        - Monthly Spending from Data: {actualMonthlySpending}
        - Spending by Category: {spendingByCategory}
        - Investment Allocation: {investmentAllocation}
        
        RECENT ACTIVITY:
        {additionalContext}
        
        USER QUESTION: {userQuery}
        
        Please provide:
        1. A clear, personalized response to their question using REAL data from their connected accounts
        2. 3-5 specific, actionable insights based on their actual financial data
        3. 3-4 concrete suggestions they can implement immediately
        4. If relevant, a brief visualization recommendation using their real data
        
        When you have real integration data, prioritize that over the basic profile data.
        Use their actual spending patterns, investment allocations, and account balances in your advice.
        Keep your response practical, encouraging, and tailored to their specific situation.
        
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
        // Integration data
        connectedAccounts: financialData.connectedIntegrations?.map(conn => `${conn.provider} (${conn.type})`).join(', ') || 'None connected',
        integrationNetWorth: financialData.financialSummary?.netWorth || financialData.financialInsights?.totalNetWorth || 0,
        totalInvestments: financialData.financialSummary?.totalInvestments || financialData.financialInsights?.totalInvestments || 0,
        actualMonthlySpending: financialData.financialSummary?.monthlySpending || financialData.financialInsights?.monthlySpending || 0,
        spendingByCategory: JSON.stringify(financialData.financialInsights?.spendingByCategory || []),
        investmentAllocation: JSON.stringify(financialData.financialInsights?.investmentAllocation || []),
        additionalContext: JSON.stringify({
          recentTransactions: financialData.recentTransactions?.slice(0, 5) || [],
          currentGoals: financialData.currentGoals || [],
          hasIntegrationData: !!(financialData.integrationData && Object.keys(financialData.integrationData).length > 0)
        }),
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

  async generateLifePathProjection(userData, timeRange = '40y') {
    try {
      const { model, provider } = this.getAvailableModel();
      
      console.log(`🤖 Generating life path projection with ${provider} (Gemini 2.5 Flash)...`);
      
      const promptTemplate = PromptTemplate.fromTemplate(`
        You are a financial planner. Create TWO net worth projections: current path vs optimized path.
        
        USER: Age {currentAge}, Income {monthlyIncome}/month, Savings {currentSavings}, Risk {riskTolerance}
        
        Create yearly projections from age {currentAge} to {retirementAge}.
        Current path: based on current savings rate
        Optimized path: with improved savings/investment strategy
        
        Format as JSON:
        {{
          "currentPath": [
            {{"age": 25, "year": 2025, "netWorth": 50000}}
          ],
          "optimizedPath": [
            {{"age": 25, "year": 2025, "netWorth": 55000}}
          ],
          "assumptions": {{
            "currentSavingsRate": 10,
            "optimizedSavingsRate": 20,
            "annualReturn": 7
          }},
          "optimizations": ["Increase 401k", "Reduce expenses", "Side income"]
        }}
        
        Make optimized path 20-30% better than current path.
      `);
      
      const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
      ]);
      
      const result = await chain.invoke({
        currentAge: userData?.currentAge || userData?.age || 25,
        retirementAge: userData?.retirementAge || 65,
        lifeStage: userData?.onboarding?.lifeStage || userData?.lifeStage || 'Early Career',
        riskTolerance: userData?.onboarding?.riskTolerance || userData?.riskTolerance || 'moderate',
        monthlyIncome: userData?.financialProfile?.monthlyIncome || userData?.monthlyIncome || 5000,
        monthlyExpenses: userData?.financialProfile?.monthlyExpenses || userData?.monthlyExpenses || 3500,
        currentSavings: userData?.financialProfile?.currentSavings || userData?.currentSavings || 15000,
        debt: userData?.financialProfile?.debt || userData?.debt || 0,
        netWorth: (userData?.financialProfile?.currentSavings || userData?.currentSavings || 15000) - (userData?.financialProfile?.debt || userData?.debt || 0),
        primaryGoals: userData?.onboarding?.primaryGoals?.join(', ') || userData?.goals?.map(g => g?.title).join(', ') || 'Financial independence',
        recentActivity: JSON.stringify({
          hasTransactions: !!(userData?.transactions && userData.transactions.length > 0),
          recentGoals: userData?.goals?.slice(0, 3) || [],
          spendingPatterns: userData?.spendingPatterns || []
        })
      });
      
      console.log('✅ Gemini 2.5 Flash life path response received, parsing...');
      
      try {
        // Clean the result string before parsing (same as generateFinancialAdvice)
        let cleanResult = result.trim();
        
        // Remove any markdown code blocks if present
        if (cleanResult.startsWith('```json')) {
          cleanResult = cleanResult.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        } else if (cleanResult.startsWith('```')) {
          cleanResult = cleanResult.replace(/^```\s*/, '').replace(/\s*```$/, '');
        }
        
        const parsedResult = JSON.parse(cleanResult);
        console.log(`✅ Gemini life path projection generated: ${parsedResult.projection?.length || 0} data points`);
        
        return {
          ...parsedResult,
          provider: provider,
          model: 'gemini-2.5-flash',
          timestamp: new Date()
        };
        
      } catch (parseError) {
        console.warn('JSON parsing failed for life path projection, attempting to extract:', parseError.message);
        
        // Try to extract JSON from the response if it's embedded in text (same as generateFinancialAdvice)
        const jsonMatch = result.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            const parsedResult = JSON.parse(jsonMatch[0]);
            return {
              ...parsedResult,
              provider: provider,
              model: 'gemini-2.5-flash',
              timestamp: new Date()
            };
          } catch (secondParseError) {
            console.warn('Second JSON parse attempt failed for life path:', secondParseError.message);
          }
        }
        
        // Final fallback if JSON parsing completely fails
        throw new Error('Unable to parse life path projection from Gemini response');
      }
      
    } catch (error) {
      console.error('Life path projection error:', error.message);
      
      // Check for rate limiting
      if (error.message?.includes('quota') || error.message?.includes('rate') || error.message?.includes('limit')) {
        console.log('🚨 Gemini API rate limit detected, will use fallback');
        throw new Error('RATE_LIMITED');
      }
      
      throw new Error(`Failed to generate life path projection: ${error.message}`);
    }
  }

  async calculateLifeEventImpact(userData, baselineProjection, lifeEvent, eventAge, currentAge) {
    try {
      const { model, provider } = this.getAvailableModel();
      
      const promptTemplate = PromptTemplate.fromTemplate(`
        You are a financial impact analysis expert. Calculate how a specific life event will change a person's financial trajectory.
        
        USER DATA:
        - Current Age: {currentAge}
        - Monthly Income: {monthlyIncome}
        - Monthly Expenses: {monthlyExpenses}
        - Current Savings: {currentSavings}
        - Risk Tolerance: {riskTolerance}
        
        BASELINE PROJECTION:
        {baselineProjection}
        
        LIFE EVENT:
        Event: {lifeEvent}
        Age when event occurs: {eventAge}
        
        Analyze this life event and calculate:
        1. Immediate financial impact (costs, income changes)
        2. Short-term effects (1-5 years)
        3. Long-term consequences (5+ years)
        4. Net lifetime impact on wealth
        
        Use real statistical data about life events. Common examples:
        - Education (MBA, grad school): Average costs and income boost
        - Home purchase: Down payment, mortgage, equity building, tax benefits
        - Retirement accounts: Tax benefits, compound growth
        - Children: Average costs per year, education expenses
        - Career changes: Income impact, benefits changes
        - Business ventures: Startup costs, failure/success rates
        
        Format as JSON:
        {{
          "alternativeProjection": [
            {{
              "age": number,
              "year": number,
              "netWorth": number
            }}
          ],
          "impact_analysis": {{
            "immediate_cost": number,
            "annual_ongoing_cost": number,
            "income_change": number,
            "long_term_benefit": number,
            "net_lifetime_impact": number
          }},
          "eventSources": [
            "Statistical source for this type of event",
            "Research data used in calculations"
          ],
          "risk_factors": [
            "Potential risks or variables that could affect outcomes"
          ]
        }}
        
        Be specific with calculations and cite real statistics where possible.
      `);
      
      const chain = RunnableSequence.from([
        promptTemplate,
        model,
        new StringOutputParser(),
      ]);
      
      const result = await chain.invoke({
        currentAge: currentAge,
        monthlyIncome: userData.financialProfile?.monthlyIncome || userData.monthlyIncome || 0,
        monthlyExpenses: userData.financialProfile?.monthlyExpenses || userData.monthlyExpenses || 0,
        currentSavings: userData.financialProfile?.currentSavings || userData.currentSavings || 0,
        riskTolerance: userData.onboarding?.riskTolerance || userData.riskTolerance || 'moderate',
        baselineProjection: JSON.stringify(baselineProjection.slice(0, 10)), // Send sample for context
        lifeEvent: lifeEvent,
        eventAge: eventAge
      });
      
      try {
        let cleanResult = result.trim();
        if (cleanResult.startsWith('```json')) {
          cleanResult = cleanResult.replace(/^```json\s*/, '').replace(/\s*```$/, '');
        }
        return JSON.parse(cleanResult);
      } catch (parseError) {
        console.warn('Failed to parse life event impact JSON:', parseError.message);
        throw new Error('Invalid response format from AI model');
      }
      
    } catch (error) {
      console.error('Life event impact calculation error:', error);
      throw new Error(`Failed to calculate life event impact: ${error.message}`);
    }
  }
}

module.exports = new AIFinancialAdvisor();
