var SiteData = (function() {

  var STORAGE_KEY = 'kayak_site_data';
  var DATA_VERSION = 3;

  var defaults = {
    _dataVersion: DATA_VERSION,
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
      duration: '2:30 Horas',
      durationEn: '2:30 Hours',
      maxGroup: 12,
      minAge: 4,
      schedules: '10:00 | 13:00 | 15:30 | 18:00',
      season: 'Abril - Outubro',
      seasonEn: 'April - October',
      meetingPt: 'Praia cais da solaria',
      meetingEn: 'Lagos Marina',
      levelPt: 'Fácil / Moderado',
      levelEn: 'Easy / Moderate',
      languages: 'PT, EN, ES, IT',
      descPt: 'Embarque numa aventura inesquecível de kayak pela costa mais espetacular do Algarve. O nosso tour de 2 horas e meia leva-o através das impressionantes formações rochosas da Ponta da Piedade, um dos locais mais emblemáticos de Portugal.',
      descEn: 'Embark on an unforgettable kayak adventure along the most spectacular coast in the Algarve. Our 2.5-hour tour takes you through the impressive rock formations of Ponta da Piedade, one of Portugal\'s most iconic locations.',
      fareharbor: '',
      bookingUrl: ''
    },
    homepage: {
      heroTitlePt: 'Explore as Grutas<br>de Lagos de Kayak',
      heroTitleEn: 'Explore the Caves<br>of Lagos by Kayak',
      heroSubPt: 'Descubra a magia da Ponta da Piedade e as praias secretas do Algarve numa aventura inesquecível de kayak.',
      heroSubEn: 'Discover the magic of Ponta da Piedade and the secret beaches of the Algarve on an unforgettable kayak adventure.',
      heroImages: [
        'images/gallery/main.jpg',
        'images/gallery/ponta-da-piedade.jpg',
        'images/gallery/top2.jpg'
      ],
      videoUrl: ''
    },
    about: {
      image: 'images/gallery/about-us-1.jpg',
      storyPt: 'A Kayak Adventures Lagos nasceu em 2018 da paixão de um grupo de amigos pela costa algarvia. Crescemos na região, passámos a infância a explorar as grutas e praias escondidas de Lagos, e quisemos partilhar esta magia com o mundo.',
      storyEn: 'Kayak Adventures Lagos was born in 2018 from a group of friends\' passion for the Algarve coast. We grew up in the region, spent our childhood exploring the caves and hidden beaches of Lagos, and wanted to share this magic with the world.',
      statClients: 5000,
      statYears: 7,
      statTours: 2000,
      statRating: '4.9',
      ratingTripadvisor: '5.0',
      ratingGoogle: '4.9',
      googleReviewCount: 500,
      team: [
        { name: 'Sónia Moisão', rolePt: 'Socia/Gerente', roleEn: 'Partner/Manager', image: 'images/gallery/about-us-1.jpg' },
        { name: 'Jorge Costa', rolePt: 'Guia & Instrutor', roleEn: 'Guide & Instructor', image: 'images/gallery/about-us-2.jpg' },
        { name: 'Filipe', rolePt: 'Guia & Barco de Apoio', roleEn: 'Guide & Support Boat', image: 'images/gallery/about-us-3.jpg' }
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
      { id: 1, url: 'images/gallery/ponta-da-piedade.jpg', category: 'caves', captionPt: 'Grutas da Ponta da Piedade', captionEn: 'Ponta da Piedade Caves' },
      { id: 2, url: 'images/gallery/camilo.jpg', category: 'beaches', captionPt: 'Praia do Camilo', captionEn: 'Camilo Beach' },
      { id: 3, url: 'images/gallery/dona-ana.jpg', category: 'beaches', captionPt: 'Praia Dona Ana', captionEn: 'Dona Ana Beach' },
      { id: 4, url: 'images/gallery/20190924134811.jpg', category: 'caves', captionPt: 'Interior das Grutas', captionEn: 'Inside the Caves' },
      { id: 5, url: 'images/gallery/20190301123541.jpg', category: 'adventure', captionPt: 'Aventura no Mar', captionEn: 'Sea Adventure' },
      { id: 6, url: 'images/gallery/20200622104606.jpg', category: 'adventure', captionPt: 'Kayak em Grupo', captionEn: 'Group Kayaking' },
      { id: 7, url: 'images/gallery/secluded.jpg', category: 'beaches', captionPt: 'Praia Secreta', captionEn: 'Secret Beach' },
      { id: 8, url: 'images/gallery/20190924135001.jpg', category: 'caves', captionPt: 'Formações Rochosas', captionEn: 'Rock Formations' },
      { id: 9, url: 'images/gallery/20190301124356.jpg', category: 'adventure', captionPt: 'Tour de Kayak', captionEn: 'Kayak Tour' },
      { id: 10, url: 'images/gallery/20200622104802.jpg', category: 'adventure', captionPt: 'Explorando a Costa', captionEn: 'Exploring the Coast' },
      { id: 11, url: 'images/gallery/20200622104939.jpg', category: 'adventure', captionPt: 'Costa Dourada', captionEn: 'Golden Coast' },
      { id: 12, url: 'images/gallery/20190924142240.jpg', category: 'caves', captionPt: 'Arcos Naturais', captionEn: 'Natural Arches' }
    ],
    faq: [
      { id: 1, qPt: 'Preciso de experiência em kayak?', qEn: 'Do I need kayaking experience?', aPt: 'Não! O nosso tour é adequado para todos os níveis, incluindo iniciantes completos. Antes de partirmos, damos um briefing completo com todas as técnicas necessárias. Os nossos guias estão sempre presentes para ajudar durante todo o percurso.', aEn: 'No! Our tour is suitable for all levels, including complete beginners. Before we set off, we give a full briefing with all the necessary techniques. Our guides are always present to help throughout the route.' },
      { id: 2, qPt: 'Qual é a idade mínima para participar?', qEn: 'What is the minimum age to participate?', aPt: 'A idade mínima é 4 anos, sempre acompanhados por um adulto no mesmo kayak (kayak duplo). Crianças abaixo de 12 anos devem estar acompanhadas por um tutor legal.', aEn: 'The minimum age is 4 years, always accompanied by an adult in the same kayak (double kayak). Children under 12 must be accompanied by a legal guardian.' },
      { id: 3, qPt: 'O que acontece se o tempo estiver mau?', qEn: 'What happens if the weather is bad?', aPt: 'A segurança é a nossa prioridade. Se as condições meteorológicas não forem adequadas para o tour, contactamo-lo com antecedência e oferecemos reagendamento gratuito para outra data ou reembolso total.', aEn: 'Safety is our priority. If weather conditions are not suitable for the tour, we contact you in advance and offer free rescheduling to another date or a full refund.' },
      { id: 4, qPt: 'Posso levar o meu telemóvel?', qEn: 'Can I bring my phone?', aPt: 'Sim! Fornecemos sacos estanques para proteger os seus pertences. No entanto, recomendamos utilizar uma capa à prova de água adicional. Não nos responsabilizamos por danos em dispositivos eletrónicos. O nosso fotógrafo tira fotos profissionais que são enviadas gratuitamente após o tour.', aEn: 'Yes! We provide dry bags to protect your belongings. However, we recommend using an additional waterproof case. We are not responsible for damage to electronic devices. Our photographer takes professional photos that are sent free of charge after the tour.' },
      { id: 5, qPt: 'Preciso de saber nadar?', qEn: 'Do I need to know how to swim?', aPt: 'Recomendamos que saiba nadar, embora todos os participantes usem colete salva-vidas obrigatório durante todo o tour. O kayak é muito estável e é raro alguém cair à água.', aEn: 'We recommend that you know how to swim, although all participants wear a mandatory life jacket throughout the tour. The kayak is very stable and it is rare for anyone to fall into the water.' },
      { id: 6, qPt: 'Quanto tempo dura o tour?', qEn: 'How long does the tour last?', aPt: 'O tour tem duração de aproximadamente 2 horas e meia. Pedimos que chegue 15 minutos antes do horário marcado para o check-in e briefing de segurança.', aEn: 'The tour lasts approximately 2 hours and 30 minutes. We ask you to arrive 15 minutes before the scheduled time for check-in and safety briefing.' },
      { id: 7, qPt: 'Onde é o ponto de encontro?', qEn: 'Where is the meeting point?', aPt: 'O ponto de encontro é na Praia cais da solaria. Após a reserva, enviamos as instruções detalhadas com mapa e indicações para chegar facilmente.', aEn: 'The meeting point is at Praia cais da solaria. After booking, we send detailed instructions with a map and directions for easy arrival.' },
      { id: 8, qPt: 'Qual é a política de cancelamento?', qEn: 'What is the cancellation policy?', aPt: 'Cancelamento gratuito até 24 horas antes do tour. Cancelamentos com menos de 24 horas de antecedência não são reembolsáveis, exceto por motivos meteorológicos (cancelado por nós) onde oferecem reembolso total ou reagendamento.', aEn: 'Free cancellation up to 24 hours before the tour. Cancellations less than 24 hours in advance are non-refundable, except for weather reasons (cancelled by us) where we offer a full refund or rescheduling.' },
      { id: 9, qPt: 'Os kayaks são individuais ou duplos?', qEn: 'Are the kayaks single or double?', aPt: 'Utilizamos kayaks duplos (sit-on-top) que são muito estáveis e fáceis de manobrar. São perfeitos tanto para casais como para pais com filhos.', aEn: 'We use double (sit-on-top) kayaks that are very stable and easy to manoeuvre. They are perfect for both couples and parents with children.' },
      { id: 10, qPt: 'O que devo vestir/trazer?', qEn: 'What should I wear/bring?', aPt: 'Recomendamos roupa confortável que possa molhar, fato de banho por baixo, sapatos de água ou sandálias com tira, protetor solar, chapéu e óculos de sol com cordão. Nós fornecemos tudo o resto: kayak, pagaia, colete salva-vidas e saco estanque.', aEn: 'We recommend comfortable clothing that can get wet, a swimsuit underneath, water shoes or sandals with a strap, sunscreen, a hat and sunglasses with a cord. We provide everything else: kayak, paddle, life jacket and dry bag.' }
    ],
    settings: {
      companyName: 'Kayak Adventures Lagos',
      logoUrl: 'images/logo.png',
      currency: 'EUR',
      timezone: 'Europe/Lisbon',
      googleAnalytics: '',
      facebookPixel: '',
      fareharbor: '',
      socialProof: true,
      showCountdown: true,
      googlePlaceId: '',
      googleApiKey: ''
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

  var _serverData = null;
  var _serverLoaded = false;

  function loadFromServer(callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('GET', '/api/data.php', true);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (xhr.status === 200) {
          try {
            _serverData = JSON.parse(xhr.responseText);
          } catch(e) { _serverData = null; }
        }
        _serverLoaded = true;
        if (callback) callback();
      }
    };
    xhr.send();
  }

  function load() {
    // Always use server data if available (admin saves always win)
    if (_serverData) {
      return deepMerge(defaults, _serverData);
    }
    // If server was checked but had no data, try localStorage
    if (_serverLoaded) {
      try {
        var stored = localStorage.getItem(STORAGE_KEY);
        if (stored) {
          return deepMerge(defaults, JSON.parse(stored));
        }
      } catch (e) {}
    }
    // Try localStorage before server responds
    try {
      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return deepMerge(defaults, JSON.parse(stored));
      }
    } catch (e) {}
    return deepClone(defaults);
  }

  function save(data) {
    data._dataVersion = DATA_VERSION;
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (e) {}
    _serverData = deepClone(data);
    return true;
  }

  function saveToServer(data, token, callback) {
    var xhr = new XMLHttpRequest();
    xhr.open('POST', '/api/data.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    if (token) xhr.setRequestHeader('X-Admin-Token', token);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        var ok = xhr.status === 200;
        if (ok) _serverData = deepClone(data);
        if (callback) callback(ok);
      }
    };
    xhr.send(JSON.stringify(data));
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
    _serverData = null;
    _serverLoaded = false;
  }

  function resetToServer(token, callback, csrfToken) {
    var xhr = new XMLHttpRequest();
    xhr.open('DELETE', '/api/data.php', true);
    if (token) xhr.setRequestHeader('X-Admin-Token', token);
    if (csrfToken) xhr.setRequestHeader('X-CSRF-Token', csrfToken);
    xhr.onreadystatechange = function() {
      if (xhr.readyState === 4) {
        if (callback) callback(xhr.status === 200);
      }
    };
    xhr.send();
  }

  function getDefaults() {
    return deepClone(defaults);
  }

  return {
    load: load,
    save: save,
    saveToServer: saveToServer,
    loadFromServer: loadFromServer,
    get: get,
    update: update,
    reset: reset,
    resetToServer: resetToServer,
    getDefaults: getDefaults,
    STORAGE_KEY: STORAGE_KEY
  };

})();
