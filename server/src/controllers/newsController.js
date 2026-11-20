const prisma = require('../config/prisma');
const { filterArticleForUser } = require('../middleware/tierCheck');

async function getFeatured(req, res) {
  try {
    // 1. Lead Story
    const leadStory = await prisma.article.findFirst({
      where: {
        status: 'PUBLISHED',
        isLeadStory: true,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: 'desc' },
    });

    // 2. Breaking News
    const breakingNews = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isBreaking: true,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 4,
    });

    // 3. Live Desk Stories
    const liveStories = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        isLive: true,
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 3,
    });

    // 4. Prime Time / Top Stories (fallback if lead story isn't separate)
    const topStories = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
        id: { notIn: [leadStory ? leadStory.id : ''].filter(Boolean) },
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { publishedAt: 'desc' },
      take: 6,
    });

    // Filter tier content for lead story and cards (cards show excerpt, not full content anyway)
    const filteredLead = leadStory ? filterArticleForUser(leadStory, req.user) : null;

    return res.json({
      leadStory: filteredLead,
      breakingNews,
      liveStories,
      topStories,
    });
  } catch (error) {
    console.error('[News Featured Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch featured news.' });
  }
}

async function getTicker(req, res) {
  try {
    const tickerItems = await prisma.article.findMany({
      where: {
        status: 'PUBLISHED',
      },
      select: {
        id: true,
        title: true,
        slug: true,
        isBreaking: true,
        isLive: true,
        accessTier: true,
        publishedAt: true,
        category: {
          select: { name: true, color: true },
        },
      },
      orderBy: [
        { isBreaking: 'desc' },
        { publishedAt: 'desc' },
      ],
      take: 12,
    });

    return res.json({ ticker: tickerItems });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch news ticker.' });
  }
}

async function getLatest(req, res) {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: { status: 'PUBLISHED' },
        include: {
          category: true,
          author: { select: { id: true, name: true, avatar: true } },
          tags: { include: { tag: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.article.count({ where: { status: 'PUBLISHED' } }),
    ]);

    return res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch latest news.' });
  }
}

async function getTrending(req, res) {
  try {
    const trending = await prisma.article.findMany({
      where: { status: 'PUBLISHED' },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
      orderBy: { viewsCount: 'desc' },
      take: 6,
    });

    return res.json({ trending });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch trending stories.' });
  }
}

async function getCategories(req, res) {
  try {
    const categories = await prisma.category.findMany({
      orderBy: { displayOrder: 'asc' },
      include: {
        _count: {
          select: {
            articles: { where: { status: 'PUBLISHED' } },
          },
        },
      },
    });

    return res.json({ categories });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch categories.' });
  }
}

async function getByCategory(req, res) {
  try {
    const { slug } = req.params;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;
    const tier = req.query.tier; // Optional filter: FREE, BRONZE, SILVER, GOLD
    const sort = req.query.sort || 'latest'; // latest, popular

    const category = await prisma.category.findUnique({
      where: { slug },
    });

    if (!category) {
      return res.status(404).json({ error: 'Category not found.' });
    }

    const whereClause = {
      categoryId: category.id,
      status: 'PUBLISHED',
      ...(tier ? { accessTier: tier } : {}),
    };

    const orderBy = sort === 'popular' ? { viewsCount: 'desc' } : { publishedAt: 'desc' };

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: whereClause,
        include: {
          category: true,
          author: { select: { id: true, name: true, avatar: true } },
          tags: { include: { tag: true } },
        },
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where: whereClause }),
    ]);

    return res.json({
      category,
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Get Category News Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch category articles.' });
  }
}

async function getArticleBySlug(req, res) {
  try {
    const { slug } = req.params;

    const article = await prisma.article.findUnique({
      where: { slug },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true, bio: true } },
        tags: { include: { tag: true } },
      },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Only allow published articles for regular public viewing unless author/editor
    const isEditorialStaff = req.user && ['SUPER_ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR', 'AUTHOR'].includes(req.user.role.name);
    if (article.status !== 'PUBLISHED' && !isEditorialStaff) {
      return res.status(404).json({ error: 'Article not published.' });
    }

    // Increment views count asynchronously
    prisma.article.update({
      where: { id: article.id },
      data: { viewsCount: { increment: 1 } },
    }).catch(err => console.error('Failed to increment view:', err.message));

    // Filter article payload according to active subscription tier
    const filtered = filterArticleForUser(article, req.user);

    // Fetch related articles from same category
    const related = await prisma.article.findMany({
      where: {
        categoryId: article.categoryId,
        status: 'PUBLISHED',
        id: { not: article.id },
      },
      include: {
        category: true,
        author: { select: { id: true, name: true, avatar: true } },
      },
      take: 3,
      orderBy: { publishedAt: 'desc' },
    });

    return res.json({
      article: filtered,
      related,
    });
  } catch (error) {
    console.error('[Get Article Slug Error]:', error);
    return res.status(500).json({ error: 'Failed to retrieve article details.' });
  }
}

async function searchArticles(req, res) {
  try {
    const q = (req.query.q || '').trim();
    const categorySlug = req.query.category;
    const tier = req.query.tier;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 12;

    const whereClause = {
      status: 'PUBLISHED',
      ...(tier ? { accessTier: tier } : {}),
    };

    if (categorySlug) {
      const cat = await prisma.category.findUnique({ where: { slug: categorySlug } });
      if (cat) whereClause.categoryId = cat.id;
    }

    if (q) {
      whereClause.OR = [
        { title: { contains: q } },
        { excerpt: { contains: q } },
        { subtitle: { contains: q } },
      ];
    }

    const [articles, total] = await Promise.all([
      prisma.article.findMany({
        where: whereClause,
        include: {
          category: true,
          author: { select: { id: true, name: true, avatar: true } },
        },
        orderBy: { publishedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.article.count({ where: whereClause }),
    ]);

    return res.json({
      articles,
      query: q,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('[Search Articles Error]:', error);
    return res.status(500).json({ error: 'Search operation failed.' });
  }
}

async function subscribeNewsletter(req, res) {
  try {
    const { email } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ error: 'Valid email address is required.' });
    }

    await prisma.newsletterSubscriber.upsert({
      where: { email: email.toLowerCase().trim() },
      update: { isActive: true },
      create: { email: email.toLowerCase().trim() },
    });

    return res.json({ message: 'Subscribed to Vanguard 24 Morning Intelligence Wire successfully.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to subscribe to newsletter.' });
  }
}

module.exports = {
  getFeatured,
  getTicker,
  getLatest,
  getTrending,
  getCategories,
  getByCategory,
  getArticleBySlug,
  searchArticles,
  subscribeNewsletter,
};
