const prisma = require('../config/prisma');

async function getAnalytics(req, res) {
  try {
    const [
      totalArticles,
      publishedArticles,
      pendingArticles,
      draftArticles,
      totalUsers,
      activeSubscriptions,
      payments,
      categories,
      recentLogs,
    ] = await Promise.all([
      prisma.article.count(),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
      prisma.article.count({ where: { status: { in: ['PENDING_REVIEW', 'IN_REVIEW'] } } }),
      prisma.article.count({ where: { status: 'DRAFT' } }),
      prisma.user.count(),
      prisma.subscription.findMany({
        where: { status: 'ACTIVE' },
        include: { plan: true },
      }),
      prisma.payment.findMany({
        where: { status: 'SUCCESS' },
        select: { amount: true, createdAt: true },
      }),
      prisma.category.findMany({
        include: { _count: { select: { articles: true } } },
      }),
      prisma.editorialActivityLog.findMany({
        include: {
          user: { select: { id: true, name: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
        take: 15,
      }),
    ]);

    // Calculate revenue
    const totalRevenue = payments.reduce((acc, curr) => acc + curr.amount, 0);

    // Tier distribution
    const tierBreakdown = {
      GOLD: 0,
      SILVER: 0,
      BRONZE: 0,
    };
    activeSubscriptions.forEach((sub) => {
      const tier = sub.plan?.tier;
      if (tier && tierBreakdown[tier] !== undefined) {
        tierBreakdown[tier] += 1;
      }
    });

    // Tier chart data for Recharts
    const subscriptionChartData = [
      { name: 'Gold', count: tierBreakdown.GOLD, fill: '#eab308' },
      { name: 'Silver', count: tierBreakdown.SILVER, fill: '#94a3b8' },
      { name: 'Bronze', count: tierBreakdown.BRONZE, fill: '#d97706' },
    ];

    // Category distribution for Recharts
    const categoryChartData = categories.map((c) => ({
      name: c.name,
      count: c._count.articles,
      color: c.color,
    }));

    // Daily views & revenue simulation points for line charts
    const dailyTrends = [
      { day: 'Mon', views: 42000, revenue: 8400 },
      { day: 'Tue', views: 51000, revenue: 11200 },
      { day: 'Wed', views: 48000, revenue: 9800 },
      { day: 'Thu', views: 64000, revenue: 14500 },
      { day: 'Fri', views: 78000, revenue: 19800 },
      { day: 'Sat', views: 89000, revenue: 23400 },
      { day: 'Sun', views: 95000, revenue: 28900 },
    ];

    return res.json({
      counts: {
        totalArticles,
        publishedArticles,
        pendingArticles,
        draftArticles,
        totalUsers,
        totalSubscribers: activeSubscriptions.length,
        totalRevenue,
      },
      subscriptionChartData,
      categoryChartData,
      dailyTrends,
      recentLogs,
    });
  } catch (error) {
    console.error('[Admin Analytics Error]:', error);
    return res.status(500).json({ error: 'Failed to compile newsroom analytics.' });
  }
}

async function getUsers(req, res) {
  try {
    const users = await prisma.user.findMany({
      include: {
        role: true,
        subscriptions: {
          where: { status: 'ACTIVE' },
          include: { plan: true },
          take: 1,
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const roles = await prisma.role.findMany({});

    return res.json({ users, roles });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch users.' });
  }
}

async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { roleId, assignedCategory, isActive } = req.body;

    const existing = await prisma.user.findUnique({ where: { id }, include: { role: true } });
    if (!existing) {
      return res.status(404).json({ error: 'User not found.' });
    }

    const updated = await prisma.user.update({
      where: { id },
      data: {
        ...(roleId ? { roleId } : {}),
        ...(assignedCategory !== undefined ? { assignedCategory } : {}),
        ...(isActive !== undefined ? { isActive: !!isActive } : {}),
      },
      include: { role: true },
    });

    await prisma.editorialActivityLog.create({
      data: {
        userId: req.user.id,
        action: 'USER_ROLE_CHANGED',
        entityType: 'USER',
        entityId: id,
        metadata: JSON.stringify({
          targetUser: existing.email,
          newRole: updated.role.name,
          assignedCategory: updated.assignedCategory,
        }),
      },
    });

    return res.json({ message: 'User role & permissions updated.', user: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update user role.' });
  }
}

async function getSubscribers(req, res) {
  try {
    const subscriptions = await prisma.subscription.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true } },
        plan: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
      orderBy: { createdAt: 'desc' },
    });

    return res.json({ subscriptions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch subscribers.' });
  }
}

async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: { select: { articles: true } },
      },
    });
    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
}

async function createCategory(req, res) {
  try {
    const { name, slug, description, color, icon, displayOrder } = req.body;
    if (!name || !description) {
      return res.status(400).json({ error: 'Name and description are required.' });
    }

    const catSlug = slug || name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');

    const created = await prisma.category.create({
      data: {
        name,
        slug: catSlug,
        description,
        color: color || '#e50914',
        icon: icon || 'newspaper',
        displayOrder: parseInt(displayOrder) || 0,
      },
    });

    await prisma.editorialActivityLog.create({
      data: {
        userId: req.user.id,
        action: 'CATEGORY_CREATED',
        entityType: 'CATEGORY',
        entityId: created.id,
        metadata: JSON.stringify({ name }),
      },
    });

    return res.status(201).json({ message: 'Category created.', category: created });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create category.' });
  }
}

async function updateCategory(req, res) {
  try {
    const { id } = req.params;
    const { name, description, color, icon, displayOrder } = req.body;

    const updated = await prisma.category.update({
      where: { id },
      data: {
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
        ...(color ? { color } : {}),
        ...(icon ? { icon } : {}),
        ...(displayOrder !== undefined ? { displayOrder: parseInt(displayOrder) } : {}),
      },
    });

    return res.json({ message: 'Category updated.', category: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update category.' });
  }
}

async function deleteCategory(req, res) {
  try {
    const { id } = req.params;
    const articlesCount = await prisma.article.count({ where: { categoryId: id } });
    if (articlesCount > 0) {
      return res.status(400).json({
        error: `Cannot delete category: contains ${articlesCount} existing articles. Reassign them first.`,
      });
    }

    await prisma.category.delete({ where: { id } });
    return res.json({ message: 'Category deleted.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete category.' });
  }
}

async function getTags(req, res) {
  try {
    const tags = await prisma.tag.findMany({
      include: { _count: { select: { articles: true } } },
      orderBy: { name: 'asc' },
    });
    return res.json({ tags });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch tags.' });
  }
}

async function createTag(req, res) {
  try {
    const { name } = req.body;
    if (!name) return res.status(400).json({ error: 'Tag name required.' });

    const slug = name.toLowerCase().replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-');
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    return res.status(201).json({ tag });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to create tag.' });
  }
}

async function updatePlan(req, res) {
  try {
    const { id } = req.params;
    const { priceMonthly, priceAnnual, description, features, isActive } = req.body;

    const updated = await prisma.subscriptionPlan.update({
      where: { id },
      data: {
        ...(priceMonthly !== undefined ? { priceMonthly: parseInt(priceMonthly) } : {}),
        ...(priceAnnual !== undefined ? { priceAnnual: parseInt(priceAnnual) } : {}),
        ...(description ? { description } : {}),
        ...(features ? { features: typeof features === 'string' ? features : JSON.stringify(features) } : {}),
        ...(isActive !== undefined ? { isActive: !!isActive } : {}),
      },
    });

    await prisma.editorialActivityLog.create({
      data: {
        userId: req.user.id,
        action: 'PLAN_UPDATED',
        entityType: 'SUBSCRIPTION',
        entityId: id,
        metadata: JSON.stringify({ name: updated.name, tier: updated.tier }),
      },
    });

    return res.json({ message: 'Subscription plan updated.', plan: updated });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to update plan.' });
  }
}

async function getActivityLogs(req, res) {
  try {
    const logs = await prisma.editorialActivityLog.findMany({
      include: {
        user: { select: { id: true, name: true, email: true, avatar: true, role: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
    return res.json({ logs });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch activity logs.' });
  }
}

module.exports = {
  getAnalytics,
  getUsers,
  updateUserRole,
  getSubscribers,
  getCategories,
  createCategory,
  updateCategory,
  deleteCategory,
  getTags,
  createTag,
  updatePlan,
  getActivityLogs,
};
