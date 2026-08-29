import xfMap from "@jx3box/jx3box-data/data/xf/xf.json";

// 幽罗引（无相楼）可以由所有门派角色申报；后续新增通用心法时只需扩展此集合。
export const UNIVERSAL_TEAM_MOUNT_IDS = new Set([10821]);

export function normalizeTeamMounts(value) {
    const values = Array.isArray(value) ? value : typeof value === "string" ? value.split(",") : [value];
    return [...new Set(values.map(Number).filter((mount) => mount > 0 && getTeamMountInfo(mount)))];
}

export function getTeamMountInfo(mount) {
    const mountId = Number(mount);
    return Object.values(xfMap).find((item) => Number(item.id) === mountId);
}

export function getRoleSchool(roleMount) {
    const mountId = Number(roleMount);
    return Number(getTeamMountInfo(mountId)?.school) || mountId || 0;
}

export function getRoleMountOptions(roleMount, client = "std") {
    const school = getRoleSchool(roleMount);
    return Object.values(xfMap).filter(
        (item) =>
            item.client.includes(client) &&
            Number(item.id) > 0 &&
            (Number(item.school) === school || UNIVERSAL_TEAM_MOUNT_IDS.has(Number(item.id)))
    );
}

export function mergeRoleMountPreferences(roles, preferences) {
    const mountsByRole = new Map(
        (preferences || []).map((item) => [String(item.role_id), normalizeTeamMounts(item.mounts)])
    );
    return (roles || []).map((role) => {
        const mounts = mountsByRole.get(String(role.ID));
        return mounts ? { ...role, mounts } : role;
    });
}
