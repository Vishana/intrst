const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

class StripeService {
  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      console.warn('⚠️  STRIPE_SECRET_KEY not found in environment variables');
    } else {
      console.log('✅ Stripe service initialized');
    }
  }

  // Create payment intent for betting stakes
  async createPaymentIntent(amount, metadata = {}) {
    try {
      const paymentIntent = await stripe.paymentIntents.create({
        amount: Math.round(amount * 100), // Convert to cents
        currency: 'usd',
        metadata: {
          type: 'bet_stake',
          ...metadata
        },
        description: `Financial bet stake: ${metadata.betTitle || 'Unnamed bet'}`,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      console.log(`💳 Payment intent created: ${paymentIntent.id} for $${amount}`);
      return paymentIntent;

    } catch (error) {
      console.error('Stripe payment intent creation error:', error);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  // Confirm payment intent
  async confirmPaymentIntent(paymentIntentId, paymentMethodId) {
    try {
      const paymentIntent = await stripe.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentMethodId,
      });

      console.log(`✅ Payment confirmed: ${paymentIntentId}`);
      return paymentIntent;

    } catch (error) {
      console.error('Stripe payment confirmation error:', error);
      throw new Error(`Payment confirmation failed: ${error.message}`);
    }
  }

  // Get payment intent status
  async getPaymentIntent(paymentIntentId) {
    try {
      const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
      return paymentIntent;

    } catch (error) {
      console.error('Stripe payment intent retrieval error:', error);
      throw new Error(`Failed to retrieve payment: ${error.message}`);
    }
  }

  // Create refund for successful bets
  async createRefund(paymentIntentId, amount = null, reason = 'requested_by_customer') {
    try {
      const refundData = {
        payment_intent: paymentIntentId,
        reason: reason
      };

      if (amount !== null) {
        refundData.amount = Math.round(amount * 100); // Convert to cents
      }

      const refund = await stripe.refunds.create(refundData);

      console.log(`💰 Refund created: ${refund.id} for payment ${paymentIntentId}`);
      return refund;

    } catch (error) {
      console.error('Stripe refund creation error:', error);
      throw new Error(`Refund processing failed: ${error.message}`);
    }
  }

  // Create payout to charity for failed bets
  async createCharityTransfer(amount, charityAccountId, metadata = {}) {
    try {
      // In a real implementation, you'd need to set up Stripe Connect
      // For now, we'll simulate charity donation
      console.log(`🏥 Simulated charity donation: $${amount} to ${charityAccountId}`);
      
      return {
        id: `transfer_${Date.now()}`,
        amount: Math.round(amount * 100),
        destination: charityAccountId,
        metadata: {
          type: 'charity_donation',
          ...metadata
        },
        status: 'succeeded'
      };

    } catch (error) {
      console.error('Stripe charity transfer error:', error);
      throw new Error(`Charity transfer failed: ${error.message}`);
    }
  }

  // Create customer for recurring betting
  async createCustomer(email, name, metadata = {}) {
    try {
      const customer = await stripe.customers.create({
        email,
        name,
        metadata: {
          type: 'betting_user',
          ...metadata
        }
      });

      console.log(`👤 Stripe customer created: ${customer.id}`);
      return customer;

    } catch (error) {
      console.error('Stripe customer creation error:', error);
      throw new Error(`Customer creation failed: ${error.message}`);
    }
  }

  // Get customer payment methods
  async getCustomerPaymentMethods(customerId) {
    try {
      const paymentMethods = await stripe.paymentMethods.list({
        customer: customerId,
        type: 'card',
      });

      return paymentMethods.data;

    } catch (error) {
      console.error('Stripe payment methods retrieval error:', error);
      throw new Error(`Failed to retrieve payment methods: ${error.message}`);
    }
  }

  // Process bet completion (refund for success, donate for failure)
  async processBetCompletion(bet, outcome) {
    try {
      const paymentIntentId = bet.payment.stripePaymentIntentId;
      
      if (!paymentIntentId) {
        throw new Error('No payment intent found for this bet');
      }

      if (outcome === 'success') {
        // Refund the stake amount for successful bets
        const refund = await this.createRefund(
          paymentIntentId,
          bet.stakeAmount,
          'Bet completed successfully'
        );
        
        return {
          type: 'refund',
          id: refund.id,
          amount: bet.stakeAmount,
          message: 'Congratulations! Your stake has been refunded.'
        };

      } else if (outcome === 'failure') {
        // Donate to charity for failed bets
        const donation = await this.createCharityTransfer(
          bet.stakeAmount,
          bet.selectedCharity.ein || 'default_charity',
          {
            betId: bet._id,
            betTitle: bet.title,
            userId: bet.userId
          }
        );
        
        return {
          type: 'donation',
          id: donation.id,
          amount: bet.stakeAmount,
          charity: bet.selectedCharity.name || 'Selected Charity',
          message: 'Your stake has been donated to charity as agreed.'
        };

      } else {
        throw new Error('Invalid bet outcome');
      }

    } catch (error) {
      console.error('Bet completion processing error:', error);
      throw error;
    }
  }

  // Create setup intent for saving payment methods
  async createSetupIntent(customerId, metadata = {}) {
    try {
      const setupIntent = await stripe.setupIntents.create({
        customer: customerId,
        usage: 'off_session',
        metadata: {
          type: 'save_payment_method',
          ...metadata
        }
      });

      console.log(`🔧 Setup intent created: ${setupIntent.id}`);
      return setupIntent;

    } catch (error) {
      console.error('Stripe setup intent creation error:', error);
      throw new Error(`Setup intent creation failed: ${error.message}`);
    }
  }

  // Webhook handler for Stripe events
  constructWebhookEvent(body, signature, webhookSecret) {
    try {
      const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
      return event;

    } catch (error) {
      console.error('Stripe webhook signature verification failed:', error);
      throw new Error('Webhook signature verification failed');
    }
  }

  // Get account balance
  async getAccountBalance() {
    try {
      const balance = await stripe.balance.retrieve();
      return balance;

    } catch (error) {
      console.error('Stripe balance retrieval error:', error);
      throw new Error(`Failed to retrieve account balance: ${error.message}`);
    }
  }
}

module.exports = new StripeService();
