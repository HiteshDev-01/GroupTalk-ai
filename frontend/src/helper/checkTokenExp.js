export const isTokenExpired = (token) => {
    try {
        if (!token) return true;

        const base64Url = token.split('.')[1]; // Extract the payload
        if (!base64Url) return true;

        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
        const payload = JSON.parse(window.atob(base64));

        if (!payload.exp) return true; // If `exp` is missing, consider it expired

        const now = Math.floor(Date.now() / 1000); // Current timestamp in seconds
        return payload.exp < now; // Return true if token is expired
    } catch (error) {
        console.error('Error decoding token:', error);
        return true; // Consider invalid or malformed tokens as expired
    }
};

