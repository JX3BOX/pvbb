export function getCollectionLoadError(error) {
    const code = error?.data?.code ?? error?.response?.data?.code;
    return Number(code) === 59101 ? "not-found" : "load-failed";
}
