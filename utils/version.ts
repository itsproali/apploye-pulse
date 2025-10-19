import packageJson from "../package.json"

export const VERSION = packageJson.version
export const DISPLAY_NAME = packageJson.displayName || packageJson.name
export const AUTHOR = packageJson.author
export const HOMEPAGE = packageJson.homepage
