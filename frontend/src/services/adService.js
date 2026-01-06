// src/services/adService.js
import { MOCK_ADS } from "../mock/ads";

/**
 * getAds(country, placement, lang)
 *
 * country   → "BR", "FR", "CZ"
 * placement → "login" | "carousel" | null
 * lang      → "pt" | "en" | etc
 */
export async function getAds(country = "BR", placement = null, lang = "pt") {
  let ads = MOCK_ADS.filter(ad => ad.countries.includes(country));

  if (placement) {
    ads = ads.filter(ad => !ad.placements || ad.placements.includes(placement));
  }

  if (ads.length === 0) ads = MOCK_ADS;

  return ads.map(ad => {
    if (ad.translations?.[lang]) {
      const { title, subtitle, action } = ad.translations[lang];
      return { ...ad, title, subtitle, action };
    }
    return ad;
  });
}
