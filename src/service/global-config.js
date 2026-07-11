import { getGlobalConfig } from "@jx3box/jx3box-ui/service/header";
import { DEFAULT_RANDOM_COVER_MAX, normalizeRandomCoverMax } from "@/utils/random-cover";

export function getRandomCoverMax() {
    return getGlobalConfig()
        .then((config) => normalizeRandomCoverMax(config?.random_cover_max))
        .catch(() => DEFAULT_RANDOM_COVER_MAX);
}
