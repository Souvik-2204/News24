const prisma = require('../config/prisma');

async function getQueue(req, res) {
  try {
    const user = req.user;
    const roleName = user.role.name;

    const whereClause = {
      status: {
        in: ['PENDING_REVIEW', 'IN_REVIEW', 'REVISIONS_REQUESTED'],
      },
    };

    // If Section Editor has an assigned category, scope queue to their desk
    if (roleName === 'SECTION_EDITOR' && user.assignedCategory) {
      const category = await prisma.category.findFirst({
        where: { name: { equals: user.assignedCategory } },
      });
      if (category) {
        whereClause.categoryId = category.id;
      }
    }

    const queue = await prisma.article.findMany({
      where: whereClause,
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true, avatar: true } },
        approvals: {
          include: {
            reviewer: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
        },
      },
      orderBy: { updatedAt: 'desc' },
    });

    return res.json({ queue });
  } catch (error) {
    console.error('[Workflow Queue Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch editorial queue.' });
  }
}

async function submitForReview(req, res) {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const userId = req.user.id;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Author can only submit their own article unless editor/admin
    if (article.authorId !== userId && !['SUPER_ADMIN', 'CHIEF_EDITOR'].includes(req.user.role.name)) {
      return res.status(403).json({ error: 'You can only submit your own articles for review.' });
    }

    const prevStatus = article.status;
    const updatedArticle = await prisma.article.update({
      where: { id },
      data: { status: 'PENDING_REVIEW' },
    });

    // Record Approval history
    await prisma.approval.create({
      data: {
        articleId: id,
        reviewerId: userId,
        action: 'SUBMITTED',
        comment: comment || 'Article submitted for editorial verification and maker-checker approval.',
        previousStatus: prevStatus,
        newStatus: 'PENDING_REVIEW',
      },
    });

    // Audit Log
    await prisma.editorialActivityLog.create({
      data: {
        userId,
        action: 'ARTICLE_SUBMITTED',
        entityType: 'ARTICLE',
        entityId: id,
        metadata: JSON.stringify({ title: article.title, author: req.user.name }),
      },
    });

    return res.json({
      message: 'Article submitted to editorial desk queue.',
      article: updatedArticle,
    });
  } catch (error) {
    console.error('[Submit For Review Error]:', error);
    return res.status(500).json({ error: 'Failed to submit article for review.' });
  }
}

async function approveArticle(req, res) {
  try {
    const { id } = req.params;
    const { comment, immediatePublish } = req.body;
    const user = req.user;

    const article = await prisma.article.findUnique({
      where: { id },
      include: { category: true },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // MAKER-CHECKER RULE: Authors CANNOT approve their own articles!
    if (article.authorId === user.id) {
      return res.status(403).json({
        error: 'Maker-Checker Policy Violation: Authors are strictly prohibited from approving their own articles.',
      });
    }

    // Section Editor check: If category assigned, must match article
    if (user.role.name === 'SECTION_EDITOR' && user.assignedCategory) {
      if (article.category.name.toLowerCase() !== user.assignedCategory.toLowerCase()) {
        return res.status(403).json({
          error: `Section Editor scope limited to '${user.assignedCategory}' desk.`,
        });
      }
    }

    const prevStatus = article.status;
    const canPublish = ['SUPER_ADMIN', 'CHIEF_EDITOR'].includes(user.role.name) && immediatePublish;
    const nextStatus = canPublish ? 'PUBLISHED' : 'APPROVED';

    const updated = await prisma.article.update({
      where: { id },
      data: {
        status: nextStatus,
        ...(canPublish && !article.publishedAt ? { publishedAt: new Date() } : {}),
      },
    });

    await prisma.approval.create({
      data: {
        articleId: id,
        reviewerId: user.id,
        action: canPublish ? 'PUBLISHED' : 'APPROVED',
        comment: comment || 'Article approved following editorial and factual verification.',
        previousStatus: prevStatus,
        newStatus: nextStatus,
      },
    });

    await prisma.editorialActivityLog.create({
      data: {
        userId: user.id,
        action: canPublish ? 'ARTICLE_PUBLISHED' : 'ARTICLE_APPROVED',
        entityType: 'ARTICLE',
        entityId: id,
        metadata: JSON.stringify({
          title: article.title,
          approvedBy: user.name,
          role: user.role.name,
        }),
      },
    });

    return res.json({
      message: canPublish ? 'Article approved and published live!' : 'Article approved. Ready for Chief Editor publishing.',
      article: updated,
    });
  } catch (error) {
    console.error('[Approve Article Error]:', error);
    return res.status(500).json({ error: 'Failed to approve article.' });
  }
}

async function rejectArticle(req, res) {
  try {
    const { id } = req.params;
    const { comment } = req.body;
    const user = req.user;

    if (!comment || comment.trim().length < 5) {
      return res.status(400).json({
        error: 'Mandatory Policy: A substantive rejection reason is required explaining what corrections the author must make.',
      });
    }

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Maker-checker rule: Author cannot reject their own article as a reviewer
    if (article.authorId === user.id) {
      return res.status(403).json({ error: 'You cannot perform review actions on your own submission.' });
    }

    const prevStatus = article.status;
    const updated = await prisma.article.update({
      where: { id },
      data: { status: 'REJECTED' },
    });

    await prisma.approval.create({
      data: {
        articleId: id,
        reviewerId: user.id,
        action: 'REJECTED',
        comment: comment.trim(),
        previousStatus: prevStatus,
        newStatus: 'REJECTED',
      },
    });

    await prisma.editorialActivityLog.create({
      data: {
        userId: user.id,
        action: 'ARTICLE_REJECTED',
        entityType: 'ARTICLE',
        entityId: id,
        metadata: JSON.stringify({
          title: article.title,
          rejectedBy: user.name,
          reason: comment.trim(),
        }),
      },
    });

    return res.json({
      message: 'Article rejected with feedback provided to author.',
      article: updated,
    });
  } catch (error) {
    console.error('[Reject Article Error]:', error);
    return res.status(500).json({ error: 'Failed to reject article.' });
  }
}

async function publishArticle(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Only Chief Editor or Super Admin can publish
    if (!['SUPER_ADMIN', 'CHIEF_EDITOR'].includes(user.role.name)) {
      return res.status(403).json({ error: 'Only Chief Editor or Super Admin can issue final publication.' });
    }

    const prevStatus = article.status;
    const updated = await prisma.article.update({
      where: { id },
      data: {
        status: 'PUBLISHED',
        publishedAt: article.publishedAt || new Date(),
      },
    });

    await prisma.approval.create({
      data: {
        articleId: id,
        reviewerId: user.id,
        action: 'PUBLISHED',
        comment: 'Official broadcast authorization granted.',
        previousStatus: prevStatus,
        newStatus: 'PUBLISHED',
      },
    });

    await prisma.editorialActivityLog.create({
      data: {
        userId: user.id,
        action: 'ARTICLE_PUBLISHED',
        entityType: 'ARTICLE',
        entityId: id,
        metadata: JSON.stringify({ title: article.title, publisher: user.name }),
      },
    });

    return res.json({
      message: 'Article is now live across Vanguard 24 broadcast channels.',
      article: updated,
    });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to publish article.' });
  }
}

async function getArticleHistory(req, res) {
  try {
    const { id } = req.params;

    const [approvals, revisions] = await Promise.all([
      prisma.approval.findMany({
        where: { articleId: id },
        include: {
          reviewer: { select: { id: true, name: true, email: true, avatar: true, role: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.articleRevision.findMany({
        where: { articleId: id },
        include: {
          editor: { select: { id: true, name: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return res.json({ approvals, revisions });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch article workflow history.' });
  }
}

module.exports = {
  getQueue,
  submitForReview,
  approveArticle,
  rejectArticle,
  publishArticle,
  getArticleHistory,
};
