function decodeData(code) {
    try {
        return JSON.parse(atob(code));
    } catch (e) {
        return {};
    }
}
