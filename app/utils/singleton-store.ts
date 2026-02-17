export const globalCache: { user: string | null } = {
    user: null,
};

// BUG: Global Singleton State in Module Scope
// In a server environment (Node.js), modules are cached.
// This `globalCache` object is shared across ALL requests to this server instance.
// If Request A sets globalCache.user = "Bob", Request B (happening at the same time) 
// might read "Bob" even if they are "Alice". 
// This is the "Singleton Pollution" bug.
