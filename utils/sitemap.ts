// utils/sitemap.ts

export type SitemapEntry = {
  loc: string
  last_mod: string
}

type SitemapReturn = {
  loc: string
  lastmod: string
}

export type ApiResponse = {
  success: boolean
  data: SitemapEntry[]
}

export async function fetchSitemap(): Promise<SitemapReturn[] | []> {
  try {
    const res = await fetch(`${process.env.NUXT_PUBLIC_API_BASE_URL}/sitemap/`)
    if (!res.ok) {
      return generateError()
    }

    const data: ApiResponse = await res.json()

    if (!data.success) return []

    return data.data.map((p) => ({
      loc: p.loc,
      lastmod: p.last_mod,
    }))
  } catch (err) {
    return generateError(err)
  }
}

function generateError(err?: any) {
  console.error('❌ Ошибка при запросе sitemap:', err)
  return []
}