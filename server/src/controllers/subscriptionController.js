const prisma = require('../config/prisma');
const { keyId, razorpayInstance, verifyPaymentSignature, verifyWebhookSignature } = require('../utils/razorpay');

async function getPlans(req, res) {
  try {
    const plans = await prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { priceMonthly: 'asc' },
    });

    // Parse features JSON safely
    const formatted = plans.map(p => ({
      ...p,
      features: typeof p.features === 'string' ? JSON.parse(p.features) : p.features,
    }));

    return res.json({ plans: formatted, razorpayKeyId: keyId });
  } catch (error) {
    console.error('[Get Plans Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch subscription plans.' });
  }
}

async function createOrder(req, res) {
  try {
    const user = req.user;
    const { planId, billingCycle = 'MONTHLY' } = req.body;

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ error: 'Selected subscription plan not found.' });
    }

    const price = billingCycle === 'ANNUAL' ? plan.priceAnnual : plan.priceMonthly;
    const amountInPaise = price * 100;

    let orderId = `order_sim_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    // If Razorpay SDK is configured with valid test keys, create official order
    if (razorpayInstance && !keyId.includes('test_vanguard_key')) {
      try {
        const rzpOrder = await razorpayInstance.orders.create({
          amount: amountInPaise,
          currency: 'INR',
          receipt: `rcpt_${user.id.slice(-6)}_${Date.now().toString().slice(-4)}`,
          notes: {
            userId: user.id,
            planId: plan.id,
            planTier: plan.tier,
            billingCycle,
          },
        });
        orderId = rzpOrder.id;
      } catch (err) {
        console.warn('[Razorpay Order Fallback to simulation]:', err.message);
      }
    }

    return res.json({
      orderId,
      amount: amountInPaise,
      currency: 'INR',
      keyId,
      plan: {
        id: plan.id,
        name: plan.name,
        tier: plan.tier,
        price,
        billingCycle,
      },
      user: {
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('[Create Order Error]:', error);
    return res.status(500).json({ error: 'Failed to initiate subscription order.' });
  }
}

async function verifyPayment(req, res) {
  try {
    const user = req.user;
    const {
      planId,
      billingCycle = 'MONTHLY',
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      paymentMethod = 'UPI/Card',
    } = req.body;

    if (!planId || !razorpayOrderId || !razorpayPaymentId) {
      return res.status(400).json({ error: 'Missing required payment verification parameters.' });
    }

    // Verify signature
    const isValid = verifyPaymentSignature({
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature: razorpaySignature || `simulated_signature_${Date.now()}`,
    });

    if (!isValid) {
      return res.status(400).json({ error: 'Invalid payment signature. Verification failed.' });
    }

    const plan = await prisma.subscriptionPlan.findUnique({ where: { id: planId } });
    if (!plan) {
      return res.status(404).json({ error: 'Plan not found.' });
    }

    const price = billingCycle === 'ANNUAL' ? plan.priceAnnual : plan.priceMonthly;

    // Calculate period dates
    const startDate = new Date();
    const periodDays = billingCycle === 'ANNUAL' ? 365 : 30;
    const currentPeriodEnd = new Date(startDate.getTime() + periodDays * 24 * 60 * 60 * 1000);

    // Deactivate previous active subscriptions for user
    await prisma.subscription.updateMany({
      where: { userId: user.id, status: 'ACTIVE' },
      data: { status: 'EXPIRED' },
    });

    // Create new active subscription
    const newSubscription = await prisma.subscription.create({
      data: {
        userId: user.id,
        planId: plan.id,
        billingCycle,
        status: 'ACTIVE',
        startDate,
        currentPeriodStart: startDate,
        currentPeriodEnd,
        razorpaySubscriptionId: razorpayPaymentId,
      },
      include: { plan: true },
    });

    // Create Payment record
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;
    const payment = await prisma.payment.create({
      data: {
        userId: user.id,
        subscriptionId: newSubscription.id,
        amount: price,
        currency: 'INR',
        status: 'SUCCESS',
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: razorpaySignature || 'simulated',
        invoiceNumber,
        paymentMethod,
      },
    });

    // Record PaymentEvent
    await prisma.paymentEvent.create({
      data: {
        paymentId: payment.id,
        eventType: 'payment.captured',
        eventPayload: JSON.stringify({
          amount: price,
          invoiceNumber,
          plan: plan.name,
          tier: plan.tier,
          orderId: razorpayOrderId,
          paymentId: razorpayPaymentId,
        }),
      },
    });

    // Update user role to SUBSCRIBER if currently READER
    if (user.role.name === 'READER') {
      const subRole = await prisma.role.findUnique({ where: { name: 'SUBSCRIBER' } });
      if (subRole) {
        await prisma.user.update({
          where: { id: user.id },
          data: { roleId: subRole.id },
        });
      }
    }

    // Log Activity
    await prisma.editorialActivityLog.create({
      data: {
        userId: user.id,
        action: 'SUBSCRIPTION_ACTIVATED',
        entityType: 'SUBSCRIPTION',
        entityId: newSubscription.id,
        metadata: JSON.stringify({ plan: plan.name, tier: plan.tier, amount: price }),
      },
    });

    return res.json({
      message: `Congratulations! Your ${plan.name} (${plan.tier}) membership is now active.`,
      subscription: newSubscription,
      invoiceNumber,
    });
  } catch (error) {
    console.error('[Verify Payment Error]:', error);
    return res.status(500).json({ error: 'Failed to verify payment and activate subscription.' });
  }
}

async function cancelSubscription(req, res) {
  try {
    const user = req.user;

    const activeSub = await prisma.subscription.findFirst({
      where: {
        userId: user.id,
        status: 'ACTIVE',
      },
      include: { plan: true },
    });

    if (!activeSub) {
      return res.status(404).json({ error: 'No active subscription found to cancel.' });
    }

    const updated = await prisma.subscription.update({
      where: { id: activeSub.id },
      data: {
        status: 'CANCELLED',
        cancelAtPeriodEnd: true,
        cancelledAt: new Date(),
      },
      include: { plan: true },
    });

    await prisma.editorialActivityLog.create({
      data: {
        userId: user.id,
        action: 'SUBSCRIPTION_CANCELLED',
        entityType: 'SUBSCRIPTION',
        entityId: activeSub.id,
        metadata: JSON.stringify({ plan: activeSub.plan.name }),
      },
    });

    return res.json({
      message: 'Your subscription has been cancelled. You retain full access until the end of your current billing period.',
      subscription: updated,
    });
  } catch (error) {
    console.error('[Cancel Subscription Error]:', error);
    return res.status(500).json({ error: 'Failed to cancel subscription.' });
  }
}

async function getMyStatus(req, res) {
  try {
    const user = req.user;

    const [activeSubscription, payments] = await Promise.all([
      prisma.subscription.findFirst({
        where: {
          userId: user.id,
          status: 'ACTIVE',
          currentPeriodEnd: { gte: new Date() },
        },
        include: { plan: true },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.payment.findMany({
        where: { userId: user.id },
        include: { subscription: { include: { plan: true } } },
        orderBy: { createdAt: 'desc' },
        take: 20,
      }),
    ]);

    return res.json({
      activeSubscription,
      tier: activeSubscription ? activeSubscription.plan.tier : 'FREE',
      payments,
    });
  } catch (error) {
    console.error('[My Status Error]:', error);
    return res.status(500).json({ error: 'Failed to retrieve subscriber status.' });
  }
}

async function handleWebhook(req, res) {
  try {
    const signature = req.headers['x-razorpay-signature'];
    const payload = JSON.stringify(req.body);

    const isValid = verifyWebhookSignature(payload, signature);
    if (!isValid && process.env.NODE_ENV === 'production') {
      return res.status(400).json({ error: 'Invalid webhook signature.' });
    }

    const event = req.body.event;
    console.log('[Razorpay Webhook Event Received]:', event);

    await prisma.paymentEvent.create({
      data: {
        eventType: event || 'generic.webhook',
        eventPayload: payload,
      },
    });

    return res.json({ status: 'ok' });
  } catch (error) {
    console.error('[Webhook Error]:', error);
    return res.status(500).json({ error: 'Webhook processing failed.' });
  }
}

module.exports = {
  getPlans,
  createOrder,
  verifyPayment,
  cancelSubscription,
  getMyStatus,
  handleWebhook,
};
