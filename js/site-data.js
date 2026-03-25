/* ============================================
   Kayak Adventures Lagos - Site Data Manager
   Stores/loads all editable content via localStorage
   ============================================ */

var SiteData = (function() {

  var STORAGE_KEY = 'kayak_site_data';

  var defaults = {
    contact: {
      phone: '+351 912 345 678',
      phoneRaw: '351912345678',
      email: 'info@kayakadventureslagos.com',
      whatsapp: '351912345678',
      address: 'Marina de Lagos, 8600 Lagos, Algarve',
      hours: 'Todos os dias: 08:00 - 19:00 (Abr - Out)',
      hoursEn: 'Daily: 08:00 - 19:00 (Apr - Oct)',
      mapEmbed: ''
    },
    social: {
      facebook: '',
      instagram: '',
      tripadvisor: '',
      youtube: '',
      tiktok: '',
      google: '',
      instagramHandle: '@kayakadventureslagos'
    },
    tour: {
      namePt: 'Tour Kayak Grutas da Ponta da Piedade',
      nameEn: 'Kayak Tour Ponta da Piedade Caves',
      price: 35,
      duration: '2 Horas',
      durationEn: '2 Hours',
      maxGroup: 12,
      minAge: 6,
      schedules: '09:00 | 11:00 | 14:00 | 16:30',
      season: 'Abril - Outubro',
      seasonEn: 'April - October',
      meetingPt: 'Marina de Lagos',
      meetingEn: 'Lagos Marina',
      levelPt: 'Fácil / Moderado',
      levelEn: 'Easy / Moderate',
      languages: 'PT, EN, ES',
      descPt: 'Embarque numa aventura inesquecível de kayak pela costa mais espetacular do Algarve. O nosso tour de 2 horas leva-o através das impressionantes formações rochosas da Ponta da Piedade, um dos locais mais emblemáticos de Portugal.',
      descEn: 'Embark on an unforgettable kayak adventure along the most spectacular coast in the Algarve. Our 2-hour tour takes you through the impressive rock formations of Ponta da Piedade, one of Portugal\'s most iconic locations.',
      fareharbor: ''
    },
    homepage: {
      heroTitlePt: 'Explore as Grutas<br>de Lagos de Kayak',
      heroTitleEn: 'Explore the Caves<br>of Lagos by Kayak',
      heroSubPt: 'Descubra a magia da Ponta da Piedade e as praias secretas do Algarve numa aventura inesquecível de kayak.',
      heroSubEn: 'Discover the magic of Ponta da Piedade and the secret beaches of the Algarve on an unforgettable kayak adventure.',
      heroImages: [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=1920&q=80',
        'https://images.unsplash.com/photo-1572111024955-76f23dec4bde?w=1920&q=80',
        'https://images.unsplash.com/photo-1468956398224-6d6f66e22c35?w=1920&q=80'
      ],
      videoUrl: ''
    },
    about: {
      storyPt: 'A Kayak Adventures Lagos nasceu em 2018 da paixão de um grupo de amigos pela costa algarvia. Crescemos na região, passámos a infância a explorar as grutas e praias escondidas de Lagos, e quisemos partilhar esta magia com o mundo.',
      storyEn: 'Kayak Adventures Lagos was born in 2018 from a group of friends\' passion for the Algarve coast. We grew up in the region, spent our childhood exploring the caves and hidden beaches of Lagos, and wanted to share this magic with the world.',
      statClients: 5000,
      statYears: 7,
      statTours: 2000,
      statRating: '4.9',
      team: [
        { name: 'Marco Silva', rolePt: 'Fundador & Guia Principal', roleEn: 'Founder & Head Guide', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80' },
        { name: 'Inês Costa', rolePt: 'Guia & Instrutora', roleEn: 'Guide & Instructor', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&q=80' },
        { name: 'Pedro Santos', rolePt: 'Guia & Fotógrafo', roleEn: 'Guide & Photographer', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&q=80' }
      ]
    },
    testimonials: [
      {
        id: 1,
        name: 'Sofia Mendes',
        location: 'Lisboa, Portugal',
        rating: 5,
        textPt: 'Uma experiência absolutamente incrível! Os guias foram fantásticos, as grutas são de tirar o fôlego e sentimo-nos sempre seguros. Recomendo a 100%!',
        textEn: 'An absolutely incredible experience! The guides were fantastic, the caves are breathtaking and we always felt safe. I recommend 100%!',
        source: 'google',
        sourceUrl: ''
      },
      {
        id: 2,
        name: 'James Wilson',
        location: 'London, UK',
        rating: 5,
        textPt: 'A melhor experiência no Algarve! As grutas são impressionantes e os guias tornaram tudo muito divertido e informativo. Vale cada cêntimo!',
        textEn: 'Best experience in the Algarve! The caves are stunning and the guides made it really fun and informative. Worth every penny. A must-do!',
        source: 'tripadvisor',
        sourceUrl: ''
      },
      {
        id: 3,
        name: 'Ana Rodrigues',
        location: 'Porto, Portugal',
        rating: 5,
        textPt: 'Fizemos o tour ao pôr do sol e foi mágico! As cores nas rochas, a água cristalina... um dos melhores momentos das nossas férias no Algarve.',
        textEn: 'We did the sunset tour and it was magical! The colours on the rocks, the crystal clear water... one of the best moments of our Algarve holiday.',
        source: 'tripadvisor',
        sourceUrl: ''
      }
    ],
    tripadvisorWidget: {
      enabled: false,
      url: '',
      widgetCode: ''
    },
    gallery: [
      { id: 1, url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=800&q=80', category: 'caves', captionPt: 'Grutas da Ponta da Piedade', captionEn: 'Ponta da Piedade Caves' },
      { id: 2, url: 'https://images.unsplash.com/photo-1572111024955-76f23dec4bde?w=800&q=80', category: 'beaches', captionPt: 'Costa Dourada de Lagos', captionEn: 'Golden Coast of Lagos' },
      { id: 3, url: 'https://images.unsplash.com/photo-1468956398224-6d6f66e22c35?w=800&q=80', category: 'sunset', captionPt: 'Pôr do Sol na Costa', captionEn: 'Coastal Sunset' },
      { id: 4, url: 'https://images.unsplash.com/photo-1604715892639-929f832ac4d0?w=800&q=80', category: 'caves', captionPt: 'Arcos Naturais', captionEn: 'Natural Arches' },
      { id: 5, url: 'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=800&q=80', category: 'adventure', captionPt: 'Aventura no Mar', captionEn: 'Sea Adventure' },
      { id: 6, url: 'https://images.unsplash.com/photo-1499242165961-41c2e5b3a73b?w=800&q=80', category: 'adventure', captionPt: 'Kayak em Grupo', captionEn: 'Group Kayaking' },
      { id: 7, url: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=800&q=80', category: 'sunset', captionPt: 'Tour ao Pôr do Sol', captionEn: 'Sunset Tour' },
      { id: 8, url: 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=800&q=80', category: 'caves', captionPt: 'Interior das Grutas', captionEn: 'Inside the Caves' },
      { id: 9, url: 'https://images.unsplash.com/photo-1509023464722-18d996393ca8?w=800&q=80', category: 'beaches', captionPt: 'Praia Secreta', captionEn: 'Secret Beach' },
      { id: 10, url: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=800&q=80', category: 'beaches', captionPt: 'Águas Cristalinas', captionEn: 'Crystal Clear Waters' },
      { id: 11, url: 'https://images.unsplash.com/photo-1519451241324-20b4ea2c4220?w=800&q=80', category: 'adventure', captionPt: 'Explorando a Costa', captionEn: 'Exploring the Coast' },
      { id: 12, url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=800&q=80', category: 'sunset', captionPt: 'Final do Dia', captionEn: 'End of Day' }
    ],
    settings: {
      companyName: 'Kayak Adventures Lagos',
      currency: 'EUR',
      timezone: 'Europe/Lisbon',
      googleAnalytics: '',
      facebookPixel: '',
      fareharbor: ''
    }
  };

  function deepClone(obj) {
    return JSON.parse(JSON.stringify(obj));
  }

  function deepMerge(target, source) {
    var result = deepClone(target);
    for (var key in source) {
      if (source.hasOwnProperty(key)) {
        if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key]) && target[key] && typeof target[key] === 'object' && !Array.isArray(target[key])) {
          result[key] = deepMerge(target[key], source[key]);
        } else {
          result[key] = deepClone(source[key]);
        }
      }
    }
    return result;
  }

  function load() {
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        var parsed = JSON.parse(stored);
        return deepMerge(defaults, parsed);
      }
    } catch (e) {
      console.warn('SiteData: Could not load from localStorage', e);
    }
    return deepClone(defaults);
  }

  function save(data) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
      return true;
    } catch (e) {
      console.error('SiteData: Could not save to localStorage', e);
      return false;
    }
  }

  function get(section) {
    var data = load();
    if (section) return data[section] || null;
    return data;
  }

  function update(section, newValues) {
    var data = load();
    if (typeof newValues === 'object' && !Array.isArray(newValues) && data[section] && typeof data[section] === 'object' && !Array.isArray(data[section])) {
      for (var k in newValues) {
        if (newValues.hasOwnProperty(k)) {
          data[section][k] = newValues[k];
        }
      }
    } else {
      data[section] = newValues;
    }
    return save(data);
  }

  function reset() {
    localStorage.removeItem(STORAGE_KEY);
  }

  function getDefaults() {
    return deepClone(defaults);
  }

  return {
    load: load,
    save: save,
    get: get,
    update: update,
    reset: reset,
    getDefaults: getDefaults,
    STORAGE_KEY: STORAGE_KEY
  };

})();
