import { Role, Permission, ContextualPermission } from "./types";

const roles: Record<string, Role> = {};

interface CacheEntry {
  inheritedRoles: Role[];
  permissionMap: Map<Permission, ContextualPermission>;
}

const cache: Map<string, CacheEntry> = new Map();
let cacheVersion: number = 0;

function precomputeCache(): void {
  cache.clear();
  cacheVersion++;

  for (const roleId in roles) {
    updateRoleCache(roleId);
  }
}

function updateRoleCache(roleId: string): CacheEntry {
  const role = roles[roleId];
  if (!role) return { inheritedRoles: [], permissionMap: new Map() };

  let cached = cache.get(roleId);
  if (cached) {
    return cached;
  }

  const inheritedRoles = computeInheritedRoles(role);
  const permissionMap = new Map<Permission, ContextualPermission>();

  for (const r of inheritedRoles) {
    for (const perm of r.permissions) {
      if (!permissionMap.has(perm.action)) {
        permissionMap.set(perm.action, perm);
      }
    }
  }

  cached = { inheritedRoles, permissionMap };
  cache.set(roleId, cached);
  return cached;
}

function computeInheritedRoles(role: Role): Role[] {
  const result = new Set<Role>();
  const stack = [role];

  while (stack.length) {
    const r = stack.pop()!;

    if (result.has(r)) {
      continue;
    }

    result.add(r);

    if (r.inheritsFrom) {
      for (const id of r.inheritsFrom) {
        const inheritedRole = roles[id];

        if (inheritedRole) {
          stack.push(inheritedRole);
        }
      }
    }
  }

  return [...result];
}

precomputeCache();

export function checkPermission(
  userRoles: Role[],
  action: Permission,
  context: {
    isOwner?: boolean;
    contentAgeHours?: number;
    voteSupport?: number;
  },
): boolean {
  for (const role of userRoles) {
    const { permissionMap } = cache.get(role.id) || updateRoleCache(role.id);

    const perm = permissionMap.get(action);
    if (!perm) {
      continue;
    }

    if (!perm.conditions) {
      return true;
    }

    const { ownOnly, timeLimitHours, voteThreshold } = perm.conditions;

    if (ownOnly && !context.isOwner) {
      return false;
    }

    if (
      timeLimitHours !== undefined &&
      (context.contentAgeHours ?? Infinity) > timeLimitHours
    ) {
      return false;
    }

    if (
      voteThreshold !== undefined &&
      (context.voteSupport ?? 0) < voteThreshold
    ) {
      return false;
    }

    return true;
  }

  return false;
}

export function updateRole(role: Role): void {
  roles[role.id] = role;
  updateRoleCache(role.id);

  for (const roleId in roles) {
    const r = roles[roleId];

    if (r.inheritsFrom?.includes(role.id)) {
      cache.delete(roleId);
    }
  }
}

export function deleteRole(roleId: string): void {
  delete roles[roleId];
  cache.delete(roleId);

  for (const r of Object.values(roles)) {
    if (r.inheritsFrom?.includes(roleId)) {
      cache.delete(r.id);
    }
  }
}
