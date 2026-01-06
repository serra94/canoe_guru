// ARQUIVO: src/mock/events.js
// Categorias e Eventos (mantendo a estrutura do mock original)

export const CATEGORIES = [
    'K1 Woman', 'K1 Men', 'C1 Woman', 'C1 Men',
    'K1 Cross Woman', 'K1 Cross Men', 'K1 Cross Time Trial W', 'K1 Cross Time Trial M'
  ];
  
  export const MOCK_EVENTS = [
    {
      id: 'ev1',
      name: 'World Cup Tacen',
      date: '15-17 Jun',
      status: 'open', // upcoming, open, in_progress, finished
      image: 'river',
      categories: CATEGORIES,
      resultsAvailable: false
    },
    {
      id: 'ev2',
      name: 'World Cup Prague',
      date: '20-22 Jun',
      status: 'finished',
      image: 'stadium',
      categories: CATEGORIES,
      resultsAvailable: true,
      // Resultados Oficiais (Mockados para cálculo de pontuação)
      officialResults: {
        'K1 Woman': { first: 'a1', second: 'a3', third: 'a2', darkHorse: 'a5' }
      }
    },
    {
      id: 'ev3',
      name: 'World Championships',
      date: '20-25 Aug',
      status: 'upcoming',
      image: 'gold',
      categories: CATEGORIES,
      resultsAvailable: false
    }
  ];
  
