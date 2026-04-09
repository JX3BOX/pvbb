import { $node, $team, $next } from "@jx3box/jx3box-common/js/api";

const $ = $node();

export function getAdventure(id, client = "std") {
    return $.get(`/serendipity/${id}`, {
        params: { client },
    });
}

export function getSerendipityAchievementId(dwId, client = "std") {
    return $.get(`/serendipity/${dwId}/achievement`, {
        params: { client },
    });
}

export function getPet(id, client = "std") {
    return $.get(`/pet/${id}`, {
        params: { client },
    });
}

export function getPetsByIds(ids, client = "std") {
    return $.get("/pets", {
        params: {
            ids,
            client,
        },
    });
}

export function getSkillsByIds(ids, client = "std") {
    return $.get("/skills", {
        params: {
            ids,
            client,
        },
    });
}

export function getHorse(id, client = "std", type = "") {
    const params = { id, client };
    if (type) params.type = type;
    return $.get("/horse", { params });
}

export function getReputation(id, client = "std") {
    return $.get("/reputation", {
        params: { id, client },
    });
}

export function getBook(id, client = "std") {
    return $.get("/book", {
        params: { id, client },
    });
}

export function getBookList(keyword, client = "std", page = 1, pageSize = 16) {
    return $.get("/books", {
        params: {
            keyword,
            client,
            page,
            pageSize,
        },
    });
}

export function getUserRoles() {
    return $team().get("api/team/my-game-roles?nopage");
}

export function getRoleGameAchievementsByRoleAndServer(params) {
    return $next().get("/api/next2/user-achievements/by-role-and-server", {
        params,
    });
}

export function getRoleGameAchievements(jx3id) {
    return $next().get("/api/next2/user-achievements", {
        params: { jx3id },
    });
}

export function getAdventures(params, client = "std") {
    return $.get("/serendipities", {
        params: {
            ...params,
            client,
        },
    });
}

export function getAchievements(client = "std") {
    return $.get("/serendipity/achievements", {
        params: { client },
    });
}
