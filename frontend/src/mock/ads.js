// src/mock/ads.js
export const MOCK_ADS = [
  {
    id: "ad1",
    image:
      "https://galasport.com/userdata/cache/images/storecards/02402MONO930USA/900/02402MONO930_3.jpg",
    url: "https://galasport.com",          // link do anúncio
    countries: ["BR", "PT"],               // segmentação por país
    placements: ["login", "carousel"],     // onde pode aparecer
    translations: {
      pt: {
        title: "New Galasport Carbon Pro",
        subtitle: "Leveza e potência para sua remada.",
        action: "Comprar agora"
      },
      en: {
        title: "New Galasport Carbon Pro",
        subtitle: "Lightweight power for your stroke.",
        action: "Shop now"
      }
    }
  },
  {
    id: "ad2",
    image:
      "https://hikosport.com/cdn/shop/files/ONGRAY67901SIROCCOD1.jpg?v=1692801788&width=600",
    url: "https://hikosport.com",
    countries: ["FR", "CZ", "DE", "ES"],
    placements: ["login"],              // não aparece no login
    translations: {
      pt: {
        title: "K1 JACKPOT x SIROCCO",
        subtitle: "Coleção HIKO.",
        action: "Saiba mais"
      },
      en: {
        title: "K1 JACKPOT x SIROCCO",
        subtitle: "HIKO collection.",
        action: "Learn more"
      }
    }
  },
  {
    id: "ad3",
    image: "",
    url: "",
    countries: ["BR", "US", "ES", "FR", "DE", "CZ"],
    placements: ["carousel"],
    translations: {
      pt: {
        title: "Teste",
        subtitle: "Teste Teste Teste",
        action: "Contratar"
      },
      en: {
        title: "Test",
        subtitle: "Test ad example.",
        action: "Hire now"
      }
    }
  }
];
