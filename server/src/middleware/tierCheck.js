const TIER_WEIGHTS = {
  FREE: 0,
  BRONZE: 1,
  SILVER: 2,
  GOLD: 3,
};

const STAFF_ROLES = ['SUPER_ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR', 'AUTHOR'];

function userHasAccessToTier(user, requiredTier) {
  // Free articles are open to everyone
  if (!requiredTier || requiredTier === 'FREE') {
    return true;
  }

  // If no user, cannot access premium
  if (!user) {
    return false;
  }

  // Newsroom staff have editorial access to all content
  if (user.role && STAFF_ROLES.includes(user.role.name)) {
    return true;
  }

  const userTier = user.subscriptionTier || 'FREE';
  const userWeight = TIER_WEIGHTS[userTier] || 0;
  const requiredWeight = TIER_WEIGHTS[requiredTier] || 0;

  return userWeight >= requiredWeight;
}

function filterArticleForUser(article, user) {
  if (!article) return null;

  const hasAccess = userHasAccessToTier(user, article.accessTier);

  if (hasAccess) {
    return {
      ...article,
      isLocked: false,
    };
  }

  // Obfuscate / strip full content to protect premium IP on the server
  return {
    ...article,
    content: null, // NEVER exposed to unauthorized clients
    contentPreview: article.excerpt,
    isLocked: true,
    requiredTier: article.accessTier,
    userTier: user ? user.subscriptionTier || 'FREE' : 'UNAUTHENTICATED',
  };
}

module.exports = {
  TIER_WEIGHTS,
  userHasAccessToTier,
  filterArticleForUser,
};
