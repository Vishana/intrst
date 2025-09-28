const { ChatOpenAI } = require('@langchain/openai');
const { ChatGoogleGenerativeAI } = require('@langchain/google-genai');
const { PromptTemplate } = require('@langchain/core/prompts');
const { StringOutputParser } = require('@langchain/core/output_parsers');
const { RunnableSequence } = require('@langchain/core/runnables');
// ✅ Lightweight charting with canvas
const { createCanvas } = require('canvas');
const Chart = require('chart.js/auto');

class AIFinancialAdvisor {
  constructor() {
    this.models = { openai: null, google: null, anthropic: null };
    this.initializeModels();
    this.initializeAgents();
  }

  initializeModels() {
    if (process.env.GOOGLE_API_KEY) {
      this.models.google = new ChatGoogleGenerativeAI({
        model: 'gemini-2.5-flash',
        temperature: 0.3,
        apiKey: process.env.GOOGLE_API_KEY,
      });
      console.log('✅ Google AI model initialized');
    }
    
  }

  getAvailableModel() {
    if (this.models.google) return { model: this.models.google, provider: 'google' };
    throw new Error('No AI models available. Please configure API keys in .env file.');
  }

  initializeAgents() {
    try {
      const { model } = this.getAvailableModel();
      const createAgent = (name, prompt) => RunnableSequence.from([
        PromptTemplate.fromTemplate(prompt),
        model,
        new StringOutputParser(),
      ]);

      this.agents = {
        transactionSummarizer: createAgent(
          'TransactionSummarizer',
          `You are an AI Transaction Summarizer. Input: Raw transactions in JSON. Output: Summarize spending by category and overall monthly patterns in JSON. JSON ONLY.

Input: {transactionData}

Return ONLY valid JSON in this format:
{{
  "summary": "Brief summary text",
  "categories": {{ "category": amount }},
  "total": totalAmount,
  "monthlyPattern": "pattern description"
}}`
        ),
        spendingAnalysis: createAgent(
          'SpendingAnalysis',
          `You are an AI Spending Analysis Agent. Input: User profile and summarized transactions. Output: Key insights, concerns, recommendations, and potential savings in JSON. JSON ONLY.

Profile: {profile}
Transactions: {summarizedTransactions}

Return ONLY valid JSON in this format:
{{
  "insights": ["insight1", "insight2"],
  "concerns": ["concern1", "concern2"],
  "recommendations": ["rec1", "rec2"],
  "potentialSavings": amount
}}`
        ),
        goalOptimization: createAgent(
          'GoalOptimization',
          `You are an AI Goal Optimization Agent. Input: User profile, current goals, progress data. Output: Prioritized goals, strategies, timeline adjustments, overall advice in JSON. JSON ONLY.

Profile: {profile}
Goals: {goals}
Progress: {progress}

Return ONLY valid JSON in this format:
{{
  "prioritized_goals": ["goal1", "goal2"],
  "optimization_strategies": ["strategy1", "strategy2"],
  "timeline_adjustments": {{}},
  "advice": "overall advice"
}}`
        ),
        budgetPlanner: createAgent(
          'BudgetPlanner',
          `You are an AI Budget Planner. Input: User profile, preferences, financial context. Output: Personalized budget plan with categories, percentages, recommendations in JSON. JSON ONLY.

Profile: {profile}
Preferences: {preferences}

Return ONLY valid JSON in this format:
{{
  "categories": {{ "category": {{ "amount": 0, "percentage": 0 }} }},
  "budget_method": "method name",
  "recommendations": ["rec1", "rec2"]
}}`
        ),
        chartSelector: createAgent(
          'ChartSelector',
          `You are an AI Chart Selector. Input: Summarized data and insights. Output: Recommend chart type and description in JSON. JSON ONLY.

Data: {summarizedData}
Insights: {insights}

Return ONLY valid JSON in this format:
{{
  "type": "bar",
  "description": "Chart description",
  "title": "Chart title"
}}`
        ),
        dataFormatter: createAgent(
          'DataFormatter',
          `You are an AI Data Formatter. Input: Raw summarized data for visualization. Output: Properly formatted JSON for plotting charts. JSON ONLY.

Raw Data: {rawData}

Return ONLY valid JSON array in this format:
[{{ "label": "Category", "value": 123.45 }}]`
        ),
        financialAdvisor: createAgent(
          'FinancialAdvisor',
          `You are a top-tier Financial Advisor AI. Input: User profile, financial context, summarized transactions, insights, and goals. Output: Personalized advice, actionable insights, suggestions, visualization recommendations in JSON. JSON ONLY.

Profile: {profile}
Transactions: {summarizedTransactions}
Spending Insights: {spendingInsights}
Goals: {optimizedGoals}
Budget: {budgetPlan}
Chart: {chartRecommendation}
Data: {formattedChartData}
User Query: {userQuery}

Return ONLY valid JSON in this format:
{{
  "response": "Main response text",
  "insights": ["insight1", "insight2"],
  "suggestions": ["suggestion1", "suggestion2"],
  "visualization": {{ "recommended": true, "type": "chart type" }},
  "followUpQuestions": ["question1", "question2"]
}}`
        )
      };

      console.log('🛠 Agents initialized:', Object.keys(this.agents));
    } catch (error) {
      console.error('❌ Failed to initialize agents:', error.message);
      throw error;
    }
  }

  async safeParse(raw, fallback = {}) {
    try {
      // ✅ Fixed: Better JSON cleaning
      const cleaned = raw.replace(/```json\s*|```\s*|\n/g, '').trim();
      const parsed = JSON.parse(cleaned);
      return parsed;
    } catch (err) {
      console.warn('⚠️ JSON parse failed:', err.message);
      console.log('Raw AI output (first 200 chars):', raw.substring(0, 200));
      return fallback;
    }
  }

  async generateChartImage(chartRecommendation, formattedChartData) {
    console.log('📊 Generating chart image with Chart.js...');

    // ✅ Check if canvas is available
    try {
      // Fallback if no data
      if (!Array.isArray(formattedChartData) || formattedChartData.length === 0) {
        console.warn('⚠️ No chart data available, using fallback');
        formattedChartData = [{ label: 'No Data', value: 0 }];
      }

      const width = 800;
      const height = 600;
      const canvas = createCanvas(width, height);
      const ctx = canvas.getContext('2d');

      // Chart configuration
      const config = {
        type: chartRecommendation.type === 'pie' ? 'doughnut' : chartRecommendation.type || 'bar',
        data: {
          labels: formattedChartData.map(d => d.label || 'Unknown'),
          datasets: [{
            label: 'Amount ($)',
            data: formattedChartData.map(d => parseFloat(d.value) || 0),
            backgroundColor: [
              '#FF6384', '#36A2EB', '#FFCE56', '#4BC0C0', '#9966FF',
              '#FF9F40', '#FF6B6B', '#C9CBCF', '#4ECDC4', '#45B7D1'
            ],
            borderColor: '#fff',
            borderWidth: 2
          }]
        },
        options: {
          responsive: false,
          animation: false,
          plugins: {
            title: {
              display: true,
              text: chartRecommendation.title || chartRecommendation.description || 'Financial Chart',
              font: { size: 16, weight: 'bold' }
            },
            legend: {
              display: true,
              position: 'bottom'
            }
          },
          scales: chartRecommendation.type === 'pie' ? {} : {
            y: {
              beginAtZero: true,
              title: {
                display: true,
                text: 'Amount ($)'
              }
            },
            x: {
              title: {
                display: true,
                text: 'Category'
              }
            }
          }
        }
      };

      // Create chart
      const chart = new Chart(ctx, config);

      // Get image buffer
      const imageBuffer = canvas.toBuffer('image/png');
      
      // Cleanup
      chart.destroy();

      console.log('✅ Chart image generated successfully');
      return imageBuffer;

    } catch (err) {
      console.warn('⚠️ Chart generation failed:', err.message);
      return null;
    }
  }

  async getRelevantAgents(query) {
    const { model } = this.getAvailableModel(); // ✅ Fixed: Use getAvailableModel instead of direct access
    if (!model) {
      console.warn('⚠️ No model available, falling back to all agents.');
      return ['transactionSummarizer', 'spendingAnalysis', 'goalOptimization', 'budgetPlanner', 'financialAdvisor', 'chartSelector', 'dataFormatter'];
    }

    const availableAgents = ['transactionSummarizer', 'spendingAnalysis', 'goalOptimization', 'budgetPlanner'];
    const agentList = availableAgents.map(name => `- ${name}`).join('\n');

    const prompt = `
You are an expert AI selecting the most relevant financial subagents for a user's query.
Query: "${query}"

Available subagents:
${agentList}

Return only the top 2 subagents most relevant to this query in a JSON array, like:
["spendingAnalysis", "budgetPlanner"]

IMPORTANT: Return ONLY the JSON array, no other text.
`;

    let top2 = ['spendingAnalysis', 'budgetPlanner']; // Default fallback
    try {
      // ✅ Fixed: Added await and correct property access
      const response = await model.invoke(prompt);
      const responseText = response.content || response; // ✅ Fixed: Use content property
      const parsed = JSON.parse(responseText.trim());
      if (Array.isArray(parsed)) {
        top2 = parsed.filter(agent => availableAgents.includes(agent));
      }
    } catch (err) {
      console.warn('⚠️ Agent selection failed, using defaults:', err.message);
    }

    // Always append required agents
    const finalAgents = [...new Set([...top2, 'financialAdvisor', 'chartSelector', 'dataFormatter'])];
    console.log('📌 Selected agents:', finalAgents.join(', '));
    return finalAgents;
  }

  async summarizeTransactions(transactions) {
    console.log('📥 Summarizing transactions...');
    try {
      const raw = await this.agents.transactionSummarizer.invoke({ 
        transactionData: JSON.stringify(transactions) 
      });
      const result = await this.safeParse(raw, { 
        summary: 'No transactions to summarize', 
        categories: {},
        total: 0,
        monthlyPattern: 'No pattern available'
      });
      console.log('✅ Transaction summary complete');
      return result;
    } catch (error) {
      console.error('❌ Transaction summarization failed:', error.message);
      return { summary: 'Failed to summarize', categories: {}, total: 0 };
    }
  }

  async analyzeSpending(userProfile, summarizedTransactions) {
    console.log('📊 Analyzing spending...');
    try {
      const raw = await this.agents.spendingAnalysis.invoke({
        profile: JSON.stringify(userProfile),
        summarizedTransactions: JSON.stringify(summarizedTransactions)
      });
      const result = await this.safeParse(raw, { 
        insights: [], 
        concerns: [], 
        recommendations: [],
        potentialSavings: 0
      });
      console.log('✅ Spending analysis complete');
      return result;
    } catch (error) {
      console.error('❌ Spending analysis failed:', error.message);
      return { insights: [], concerns: [], recommendations: [] };
    }
  }

  async optimizeGoals(userProfile, goals, progress) {
    console.log('🎯 Optimizing goals...');
    try {
      const raw = await this.agents.goalOptimization.invoke({
        profile: JSON.stringify(userProfile),
        goals: JSON.stringify(goals),
        progress: JSON.stringify(progress)
      });
      const result = await this.safeParse(raw, { 
        prioritized_goals: [], 
        optimization_strategies: [],
        timeline_adjustments: {},
        advice: 'No advice available'
      });
      console.log('✅ Goal optimization complete');
      return result;
    } catch (error) {
      console.error('❌ Goal optimization failed:', error.message);
      return { prioritized_goals: [], optimization_strategies: [] };
    }
  }

  async generateBudgetPlan(userProfile, preferences = {}) {
    console.log('💰 Generating budget plan...');
    try {
      const raw = await this.agents.budgetPlanner.invoke({
        profile: JSON.stringify(userProfile),
        preferences: JSON.stringify(preferences)
      });
      const result = await this.safeParse(raw, { 
        categories: {}, 
        budget_method: 'default',
        recommendations: []
      });
      console.log('✅ Budget plan generated');
      return result;
    } catch (error) {
      console.error('❌ Budget planning failed:', error.message);
      return { categories: {}, budget_method: 'default' };
    }
  }

  async selectChart(summarizedData, insights) {
    console.log('📈 Selecting chart...');
    try {
      const raw = await this.agents.chartSelector.invoke({
        summarizedData: JSON.stringify(summarizedData),
        insights: JSON.stringify(insights)
      });
      const result = await this.safeParse(raw, { 
        type: 'bar', 
        description: 'Financial overview chart',
        title: 'Financial Summary'
      });
      console.log('✅ Chart selection complete');
      return result;
    } catch (error) {
      console.error('❌ Chart selection failed:', error.message);
      return { type: 'bar', description: 'Chart unavailable' };
    }
  }

  async formatChartData(rawData) {
    console.log('🖌 Formatting chart data...');
    try {
      const raw = await this.agents.dataFormatter.invoke({ 
        rawData: JSON.stringify(rawData) 
      });
      const result = await this.safeParse(raw, []);
      
      // ✅ Fixed: Ensure we always return array format
      if (!Array.isArray(result)) {
        // Convert categories object to array format
        if (rawData && rawData.categories) {
          return Object.entries(rawData.categories).map(([label, value]) => ({ 
            label, 
            value: parseFloat(value) || 0 
          }));
        }
        return [];
      }
      
      console.log('✅ Chart data formatted');
      return result;
    } catch (error) {
      console.error('❌ Chart data formatting failed:', error.message);
      return [];
    }
  }

  async generateFinancialAdvice(userProfile, financialData = {}, userQuery = '') {
    const queryText = typeof userQuery === 'string'
      ? userQuery
      : userQuery?.content || '';

    console.log('💬 Generating financial advice for query:', queryText);

    try {
      const summarized = await this.summarizeTransactions(financialData.recentTransactions || []);
      
      // ✅ Fixed: This was already correct but added error handling
      const relevantAgents = await this.getRelevantAgents(queryText);
      console.log('📌 Agents selected based on query:', relevantAgents.join(', '));

      let spendingInsights = {};
      let optimizedGoals = {};
      let budgetPlan = {};
      let chartRecommendation = {};
      let formattedChartData = [];

      // ✅ Added: Parallel execution for better performance
      const promises = [];
      
      if (relevantAgents.includes('spendingAnalysis')) {
        promises.push(this.analyzeSpending(userProfile, summarized));
      }
      if (relevantAgents.includes('goalOptimization')) {
        promises.push(this.optimizeGoals(
          userProfile, 
          financialData.currentGoals || [], 
          financialData.goalProgress || {}
        ));
      }
      if (relevantAgents.includes('budgetPlanner')) {
        promises.push(this.generateBudgetPlan(userProfile, financialData.preferences || {}));
      }

      // Execute relevant agents in parallel
      const results = await Promise.allSettled(promises);
      let resultIndex = 0;
      
      if (relevantAgents.includes('spendingAnalysis')) {
        spendingInsights = results[resultIndex].status === 'fulfilled' 
          ? results[resultIndex].value 
          : {};
        resultIndex++;
      }
      if (relevantAgents.includes('goalOptimization')) {
        optimizedGoals = results[resultIndex].status === 'fulfilled' 
          ? results[resultIndex].value 
          : {};
        resultIndex++;
      }
      if (relevantAgents.includes('budgetPlanner')) {
        budgetPlan = results[resultIndex].status === 'fulfilled' 
          ? results[resultIndex].value 
          : {};
      }

      // Chart generation
      if (relevantAgents.includes('chartSelector')) {
        chartRecommendation = await this.selectChart(summarized, spendingInsights);
        formattedChartData = await this.formatChartData(summarized);
      }

      console.log('📌 Invoking FinancialAdvisor agent with all data...');

      const raw = await this.agents.financialAdvisor.invoke({
        profile: JSON.stringify(userProfile),
        summarizedTransactions: JSON.stringify(summarized),
        spendingInsights: JSON.stringify(spendingInsights),
        optimizedGoals: JSON.stringify(optimizedGoals),
        budgetPlan: JSON.stringify(budgetPlan),
        chartRecommendation: JSON.stringify(chartRecommendation),
        formattedChartData: JSON.stringify(formattedChartData),
        userQuery
      });

      const result = await this.safeParse(raw, {
        response: 'Could not generate advice',
        insights: [],
        suggestions: [],
        visualization: {},
        followUpQuestions: []
      });

      console.log('✅ Financial advice generated');

      // Generate chart image if applicable
      if (chartRecommendation && Array.isArray(formattedChartData) && formattedChartData.length > 0) {
        try {
          const chartImageBuffer = await this.generateChartImage(chartRecommendation, formattedChartData);
          if (chartImageBuffer) {
            result.visualization.imageBuffer = chartImageBuffer;
            console.log('✅ Chart image generated and attached');
          }
        } catch (err) {
          console.warn('⚠️ Chart generation failed:', err.message);
        }
      }

      return result;
    } catch (error) {
      console.error('❌ Financial advice generation failed:', error.message);
      return {
        response: 'Sorry, I encountered an error generating advice. Please try again.',
        insights: [],
        suggestions: [],
        visualization: {},
        followUpQuestions: []
      };
    }
  }
}

module.exports = new AIFinancialAdvisor();