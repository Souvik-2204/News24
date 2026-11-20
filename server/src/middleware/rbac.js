function requireRole(allowedRoles) {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({ error: 'Authentication required.' });
    }

    const userRoleName = req.user.role.name;

    // Super Admin always bypasses role checks
    if (userRoleName === 'SUPER_ADMIN') {
      return next();
    }

    if (Array.isArray(allowedRoles)) {
      if (allowedRoles.includes(userRoleName)) {
        return next();
      }
    } else if (allowedRoles === userRoleName) {
      return next();
    }

    return res.status(403).json({
      error: `Access denied. Requires one of roles: ${Array.isArray(allowedRoles) ? allowedRoles.join(', ') : allowedRoles}. Current role: ${userRoleName}`,
    });
  };
}

function requireStaff(req, res, next) {
  const staffRoles = ['SUPER_ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR', 'AUTHOR'];
  if (!req.user || !staffRoles.includes(req.user.role.name)) {
    return res.status(403).json({ error: 'Access restricted to newsroom editorial staff.' });
  }
  next();
}

function requireEditorOrAdmin(req, res, next) {
  const editorRoles = ['SUPER_ADMIN', 'CHIEF_EDITOR', 'SECTION_EDITOR'];
  if (!req.user || !editorRoles.includes(req.user.role.name)) {
    return res.status(403).json({ error: 'Access restricted to editorial review desk.' });
  }
  next();
}

function requireChiefOrAdmin(req, res, next) {
  const chiefRoles = ['SUPER_ADMIN', 'CHIEF_EDITOR'];
  if (!req.user || !chiefRoles.includes(req.user.role.name)) {
    return res.status(403).json({ error: 'Access restricted to Chief Editor or Super Admin.' });
  }
  next();
}

module.exports = {
  requireRole,
  requireStaff,
  requireEditorOrAdmin,
  requireChiefOrAdmin,
};
