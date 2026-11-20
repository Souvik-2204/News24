const bcrypt = require('bcryptjs');
const prisma = require('../config/prisma');
const { generateToken } = require('../utils/jwt');

async function register(req, res) {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({ error: 'Please provide email, password, and name.' });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
    });

    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists.' });
    }

    let readerRole = await prisma.role.findUnique({ where: { name: 'READER' } });
    if (!readerRole) {
      readerRole = await prisma.role.findFirst({ where: { name: 'SUBSCRIBER' } });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await prisma.user.create({
      data: {
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        name: name.trim(),
        roleId: readerRole.id,
      },
      include: {
        role: true,
      },
    });

    const token = generateToken({ userId: newUser.id, role: newUser.role.name });

    return res.status(201).json({
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        name: newUser.name,
        role: newUser.role.name,
        subscriptionTier: 'FREE',
      },
    });
  } catch (error) {
    console.error('[Auth Register Error]:', error);
    return res.status(500).json({ error: 'Failed to create account.' });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await prisma.user.findUnique({
      where: { email: cleanEmail },
      include: {
        role: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
            currentPeriodEnd: { gte: new Date() },
          },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      // Check legacy or updated email alias
      const alternateEmail = cleanEmail.includes('@news24.com')
        ? cleanEmail.replace('@news24.com', '@vanguardnews.com')
        : cleanEmail.replace('@vanguardnews.com', '@news24.com');

      user = await prisma.user.findUnique({
        where: { email: alternateEmail },
        include: {
          role: true,
          subscriptions: {
            where: {
              status: 'ACTIVE',
              currentPeriodEnd: { gte: new Date() },
            },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    }

    if (!user) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid email or password.' });
    }

    if (!user.isActive) {
      return res.status(403).json({ error: 'This account has been deactivated.' });
    }

    const activeSub = user.subscriptions && user.subscriptions[0] ? user.subscriptions[0] : null;
    const subscriptionTier = activeSub ? activeSub.plan.tier : 'FREE';

    const token = generateToken({ userId: user.id, role: user.role.name });

    return res.json({
      message: 'Signed in successfully.',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role.name,
        assignedCategory: user.assignedCategory,
        subscriptionTier,
        activeSubscription: activeSub,
      },
    });
  } catch (error) {
    console.error('[Auth Login Error]:', error);
    return res.status(500).json({ error: 'Sign in failed.' });
  }
}

async function getMe(req, res) {
  try {
    const user = req.user;
    return res.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role.name,
        assignedCategory: user.assignedCategory,
        subscriptionTier: user.subscriptionTier,
        activeSubscription: user.activeSubscription,
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to retrieve profile.' });
  }
}

async function demoLogin(req, res) {
  try {
    const { roleKey } = req.params;

    const emailMap = {
      admin: 'admin@news24.com',
      editor: 'editor@news24.com',
      section: 'section@news24.com',
      author: 'author@news24.com',
      subscriber: 'subscriber@news24.com',
      gold: 'subscriber@news24.com',
      silver: 'silver.user@news24.com',
      bronze: 'bronze.user@news24.com',
    };

    const targetEmail = emailMap[roleKey ? roleKey.toLowerCase() : ''];
    if (!targetEmail) {
      return res.status(400).json({ error: `Unknown demo key: ${roleKey}. Available: admin, editor, section, author, subscriber, silver, bronze` });
    }

    let user = await prisma.user.findUnique({
      where: { email: targetEmail },
      include: {
        role: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
            currentPeriodEnd: { gte: new Date() },
          },
          include: { plan: true },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user) {
      // Fallback check with legacy domain if any
      const legacyEmail = targetEmail.replace('@news24.com', '@vanguardnews.com');
      user = await prisma.user.findUnique({
        where: { email: legacyEmail },
        include: {
          role: true,
          subscriptions: {
            where: {
              status: 'ACTIVE',
              currentPeriodEnd: { gte: new Date() },
            },
            include: { plan: true },
            orderBy: { createdAt: 'desc' },
            take: 1,
          },
        },
      });
    }

    if (!user) {
      return res.status(404).json({ error: 'Demo user not found. Please ensure database is seeded.' });
    }

    const activeSub = user.subscriptions && user.subscriptions[0] ? user.subscriptions[0] : null;
    const subscriptionTier = activeSub ? activeSub.plan.tier : 'FREE';

    const token = generateToken({ userId: user.id, role: user.role.name });

    return res.json({
      message: `Switched session to ${user.name} (${user.role.name})`,
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatar: user.avatar,
        bio: user.bio,
        role: user.role.name,
        assignedCategory: user.assignedCategory,
        subscriptionTier,
        activeSubscription: activeSub,
      },
    });
  } catch (error) {
    console.error('[Demo Login Error]:', error);
    return res.status(500).json({ error: 'Demo login failed.' });
  }
}

module.exports = {
  register,
  login,
  getMe,
  demoLogin,
};
