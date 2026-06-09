export function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle('dark', dark)
}

export function isDarkTheme(): boolean {
  return document.documentElement.classList.contains('dark')
}
