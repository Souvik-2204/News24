const prisma = require('../config/prisma');

function generateSlug(title) {
  const base = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${base}-${Date.now().toString().slice(-4)}`;
}

async function getCmsArticles(req, res) {
  try {
    const user = req.user;
    const { status, categoryId, tier, search, mine } = req.query;

    const whereClause = {};

    // Authors see their own articles or all if looking at published
    if (user.role.name === 'AUTHOR' && mine === 'true') {
      whereClause.authorId = user.id;
    }

    if (status && status !== 'ALL') {
      whereClause.status = status;
    }

    if (categoryId && categoryId !== 'ALL') {
      whereClause.categoryId = categoryId;
    }

    if (tier && tier !== 'ALL') {
      whereClause.accessTier = tier;
    }

    if (search) {
      whereClause.OR = [
        { title: { contains: search } },
        { excerpt: { contains: search } },
      ];
    }

    const articles = await prisma.article.findMany({
      where: whereClause,
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true, avatar: true } },
        tags: { include: { tag: true } },
      },
      orderBy: { updatedAt: 'desc' },
      take: 50,
    });

    return res.json({ articles });
  } catch (error) {
    console.error('[CMS Articles List Error]:', error);
    return res.status(500).json({ error: 'Failed to fetch CMS articles.' });
  }
}

async function getCmsArticleById(req, res) {
  try {
    const { id } = req.params;

    const article = await prisma.article.findUnique({
      where: { id },
      include: {
        category: true,
        author: { select: { id: true, name: true, email: true, avatar: true } },
        tags: { include: { tag: true } },
        approvals: {
          include: {
            reviewer: { select: { id: true, name: true, role: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
        revisions: {
          include: {
            editor: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    return res.json({ article });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch article details.' });
  }
}

async function createCmsArticle(req, res) {
  try {
    const user = req.user;
    const {
      title,
      subtitle,
      excerpt,
      content,
      featuredImage,
      imageCaption,
      categoryId,
      accessTier,
      isBreaking,
      isLeadStory,
      isLive,
      readTimeMinutes,
      seoTitle,
      seoDescription,
      scheduledAt,
      tagIds,
      submitImmediately,
    } = req.body;

    if (!title || !excerpt || !content || !categoryId) {
      return res.status(400).json({
        error: 'Title, excerpt, content, and category are required fields.',
      });
    }

    const slug = generateSlug(title);
    const initialStatus = submitImmediately ? 'PENDING_REVIEW' : 'DRAFT';

    const defaultImg = featuredImage || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1200&q=80';

    const article = await prisma.article.create({
      data: {
        title,
        slug,
        subtitle,
        excerpt,
        content,
        featuredImage: defaultImg,
        imageCaption,
        categoryId,
        authorId: user.id,
        status: initialStatus,
        accessTier: accessTier || 'FREE',
        isBreaking: !!isBreaking,
        isLeadStory: !!isLeadStory,
        isLive: !!isLive,
        readTimeMinutes: parseInt(readTimeMinutes) || 4,
        seoTitle: seoTitle || title,
        seoDescription: seoDescription || excerpt,
        scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
      },
    });

    // Attach tags
    if (Array.isArray(tagIds) && tagIds.length > 0) {
      for (const tagId of tagIds) {
        await prisma.articleTag.create({
          data: { articleId: article.id, tagId },
        }).catch(() => {});
      }
    }

    // Activity Log
    await prisma.editorialActivityLog.create({
      data: {
        userId: user.id,
        action: submitImmediately ? 'ARTICLE_CREATED_AND_SUBMITTED' : 'ARTICLE_CREATED_DRAFT',
        entityType: 'ARTICLE',
        entityId: article.id,
        metadata: JSON.stringify({ title, status: initialStatus }),
      },
    });

    if (submitImmediately) {
      await prisma.approval.create({
        data: {
          articleId: article.id,
          reviewerId: user.id,
          action: 'SUBMITTED',
          comment: 'Submitted for editorial desk maker-checker review upon creation.',
          previousStatus: 'DRAFT',
          newStatus: 'PENDING_REVIEW',
        },
      });
    }

    return res.status(201).json({
      message: submitImmediately ? 'Article created and submitted for review.' : 'Draft article saved.',
      article,
    });
  } catch (error) {
    console.error('[Create Article Error]:', error);
    return res.status(500).json({ error: 'Failed to create article.' });
  }
}

async function updateCmsArticle(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;
    const {
      title,
      subtitle,
      excerpt,
      content,
      featuredImage,
      imageCaption,
      categoryId,
      accessTier,
      isBreaking,
      isLeadStory,
      isLive,
      readTimeMinutes,
      seoTitle,
      seoDescription,
      scheduledAt,
      tagIds,
      changeSummary,
    } = req.body;

    const existing = await prisma.article.findUnique({
      where: { id },
      include: { revisions: true },
    });

    if (!existing) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    // Permissions: Authors can only edit own articles
    if (user.role.name === 'AUTHOR' && existing.authorId !== user.id) {
      return res.status(403).json({ error: 'You are only authorized to edit your own articles.' });
    }

    // Maker-Checker Rule: Material changes to published articles requiring mandatory approval must trigger a new review
    const isCurrentlyPublished = existing.status === 'PUBLISHED';
    const isMaterialChange = (title && title !== existing.title) || (content && content !== existing.content);

    let nextStatus = existing.status;
    if (isCurrentlyPublished && isMaterialChange && !['SUPER_ADMIN', 'CHIEF_EDITOR'].includes(user.role.name)) {
      // Revert to PENDING_REVIEW for mandatory re-approval
      nextStatus = 'PENDING_REVIEW';
    }

    // Record revision history if content/title changed
    if (isMaterialChange) {
      const versionNumber = (existing.revisions?.length || 0) + 1;
      await prisma.articleRevision.create({
        data: {
          articleId: id,
          editorId: user.id,
          version: versionNumber,
          title: existing.title,
          excerpt: existing.excerpt,
          content: existing.content,
          changeSummary: changeSummary || `Revision v${versionNumber} by ${user.name}`,
        },
      });
    }

    const updated = await prisma.article.update({
      where: { id },
      data: {
        ...(title ? { title } : {}),
        ...(subtitle !== undefined ? { subtitle } : {}),
        ...(excerpt ? { excerpt } : {}),
        ...(content ? { content } : {}),
        ...(featuredImage ? { featuredImage } : {}),
        ...(imageCaption !== undefined ? { imageCaption } : {}),
        ...(categoryId ? { categoryId } : {}),
        ...(accessTier ? { accessTier } : {}),
        ...(isBreaking !== undefined ? { isBreaking: !!isBreaking } : {}),
        ...(isLeadStory !== undefined ? { isLeadStory: !!isLeadStory } : {}),
        ...(isLive !== undefined ? { isLive: !!isLive } : {}),
        ...(readTimeMinutes ? { readTimeMinutes: parseInt(readTimeMinutes) } : {}),
        ...(seoTitle !== undefined ? { seoTitle } : {}),
        ...(seoDescription !== undefined ? { seoDescription } : {}),
        ...(scheduledAt !== undefined ? { scheduledAt: scheduledAt ? new Date(scheduledAt) : null } : {}),
        status: nextStatus,
      },
    });

    // Update tags if provided
    if (Array.isArray(tagIds)) {
      await prisma.articleTag.deleteMany({ where: { articleId: id } });
      for (const tagId of tagIds) {
        await prisma.articleTag.create({ data: { articleId: id, tagId } }).catch(() => {});
      }
    }

    // Log activity
    await prisma.editorialActivityLog.create({
      data: {
        userId: user.id,
        action: 'ARTICLE_UPDATED',
        entityType: 'ARTICLE',
        entityId: id,
        metadata: JSON.stringify({
          title: updated.title,
          status: updated.status,
          reApprovalTriggered: isCurrentlyPublished && isMaterialChange,
        }),
      },
    });

    return res.json({
      message: isCurrentlyPublished && isMaterialChange && nextStatus === 'PENDING_REVIEW'
        ? 'Material updates saved. Article submitted for mandatory re-approval.'
        : 'Article updated successfully.',
      article: updated,
    });
  } catch (error) {
    console.error('[Update Article Error]:', error);
    return res.status(500).json({ error: 'Failed to update article.' });
  }
}

async function deleteCmsArticle(req, res) {
  try {
    const { id } = req.params;
    const user = req.user;

    const article = await prisma.article.findUnique({ where: { id } });
    if (!article) {
      return res.status(404).json({ error: 'Article not found.' });
    }

    if (user.role.name === 'AUTHOR' && article.authorId !== user.id) {
      return res.status(403).json({ error: 'You cannot delete articles authored by others.' });
    }

    await prisma.article.delete({ where: { id } });

    await prisma.editorialActivityLog.create({
      data: {
        userId: user.id,
        action: 'ARTICLE_DELETED',
        entityType: 'ARTICLE',
        entityId: id,
        metadata: JSON.stringify({ title: article.title }),
      },
    });

    return res.json({ message: 'Article permanently deleted from system.' });
  } catch (error) {
    return res.status(500).json({ error: 'Failed to delete article.' });
  }
}

module.exports = {
  getCmsArticles,
  getCmsArticleById,
  createCmsArticle,
  updateCmsArticle,
  deleteCmsArticle,
};
