const prisma = require('../config/prisma');
const { verifyToken } = require('../utils/jwt');

async function authenticateUser(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Authentication required. No token provided.' });
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      return res.status(401).json({ error: 'Invalid or expired authentication token.' });
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: {
          include: {
            permissions: {
              include: {
                permission: true,
              },
            },
          },
        },
        subscriptions: {
          where: {
            status: 'ACTIVE',
            currentPeriodEnd: { gte: new Date() },
          },
          include: {
            plan: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (!user || !user.isActive) {
      return res.status(403).json({ error: 'User account is inactive or not found.' });
    }

    // Attach active subscription tier to user
    const activeSub = user.subscriptions && user.subscriptions[0] ? user.subscriptions[0] : null;
    user.activeSubscription = activeSub;
    user.subscriptionTier = activeSub ? activeSub.plan.tier : 'FREE';

    req.user = user;
    next();
  } catch (error) {
    console.error('[Auth Middleware] Error:', error);
    return res.status(500).json({ error: 'Internal server error during authentication.' });
  }
}

async function optionalAuth(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      req.user = null;
      return next();
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    if (!decoded || !decoded.userId) {
      req.user = null;
      return next();
    }

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      include: {
        role: true,
        subscriptions: {
          where: {
            status: 'ACTIVE',
            currentPeriodEnd: { gte: new Date() },
          },
          include: {
            plan: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    if (user && user.isActive) {
      const activeSub = user.subscriptions && user.subscriptions[0] ? user.subscriptions[0] : null;
      user.activeSubscription = activeSub;
      user.subscriptionTier = activeSub ? activeSub.plan.tier : 'FREE';
      req.user = user;
    } else {
      req.user = null;
    }

    next();
  } catch (error) {
    req.user = null;
    next();
  }
}

module.exports = {
  authenticateUser,
  optionalAuth,
};
