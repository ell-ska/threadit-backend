import ogs from 'open-graph-scraper'

export const getOGImage = async (url: string) => {
  try {
    const { error, result } = await ogs({ url })

    if (error || !result?.success) {
      return undefined
    }

    return result.ogImage
  } catch (error) {
    return undefined
  }
}