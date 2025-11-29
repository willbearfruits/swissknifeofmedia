// Helper to resolve paths correctly on GitHub Pages
export const resolvePath = (path: string) => {
  // Remove leading slash if present to avoid double slashes when joining
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${import.meta.env.BASE_URL}${cleanPath}`;
};
