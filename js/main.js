document.addEventListener('DOMContentLoaded', function() {
  const preloader = document.getElementById('preloader');
  if (preloader) {
    window.addEventListener('load', function() {
      setTimeout(function() {
        preloader.classList.add('hidden');
      }, 500);
    });
    setTimeout(function() {
      preloader.classList.add('hidden');
    }, 3000);
  }
  const header = document.getElementById('header');
  function handleHeaderScroll() {
    if (window.scrollY > 50) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', handleHeaderScroll);
  handleHeaderScroll();
  const mobileToggle = document.getElementById('mobileToggle');
  const mainNav = document.getElementById('mainNav');

  if (mobileToggle && mainNav) {
    mobileToggle.addEventListener('click', function() {
      mobileToggle.classList.toggle('active');
      mainNav.classList.toggle('mobile-active');
      var isOpen = mainNav.classList.contains('mobile-active');
      document.body.style.overflow = isOpen ? 'hidden' : '';
      header.classList.toggle('menu-open', isOpen);
    });
    mainNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('mobile-active');
        document.body.style.overflow = '';
        header.classList.remove('menu-open');
      });
    });
  }
  var heroSlides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var heroIndicators = Array.prototype.slice.call(document.querySelectorAll('.hero-indicators button'));
  let currentSlide = 0;
  let slideInterval;

  function showSlide(index) {
    heroSlides.forEach(function(slide) { slide.classList.remove('active'); });
    heroIndicators.forEach(function(btn) { btn.classList.remove('active'); });

    currentSlide = index;
    if (currentSlide >= heroSlides.length) currentSlide = 0;
    if (currentSlide < 0) currentSlide = heroSlides.length - 1;

    heroSlides[currentSlide].classList.add('active');
    if (heroIndicators[currentSlide]) {
      heroIndicators[currentSlide].classList.add('active');
    }
  }

  function startSlider() {
    if (heroSlides.length > 1) {
      slideInterval = setInterval(function() {
        showSlide(currentSlide + 1);
      }, 5000);
    }
  }

  heroIndicators.forEach(function(btn) {
    btn.addEventListener('click', function() {
      clearInterval(slideInterval);
      showSlide(parseInt(this.dataset.slide));
      startSlider();
    });
  });

  if (heroSlides.length > 0) {
    startSlider();
  }
  const testimonialCards = document.querySelectorAll('.testimonial-card');
  const testimonialNav = document.querySelectorAll('.testimonials-nav button');
  let currentTestimonial = 0;
  let testimonialInterval;

  function showTestimonial(index) {
    testimonialCards.forEach(function(card) { card.classList.remove('active'); });
    testimonialNav.forEach(function(btn) { btn.classList.remove('active'); });

    currentTestimonial = index;
    if (currentTestimonial >= testimonialCards.length) currentTestimonial = 0;
    if (currentTestimonial < 0) currentTestimonial = testimonialCards.length - 1;

    testimonialCards[currentTestimonial].classList.add('active');
    if (testimonialNav[currentTestimonial]) {
      testimonialNav[currentTestimonial].classList.add('active');
    }
  }

  function startTestimonials() {
    if (testimonialCards.length > 1) {
      testimonialInterval = setInterval(function() {
        showTestimonial(currentTestimonial + 1);
      }, 6000);
    }
  }

  testimonialNav.forEach(function(btn) {
    btn.addEventListener('click', function() {
      clearInterval(testimonialInterval);
      showTestimonial(parseInt(this.dataset.testimonial));
      startTestimonials();
    });
  });

  if (testimonialCards.length > 0) {
    startTestimonials();
  }
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(function(item) {
    var question = item.querySelector('.faq-question');
    if (question) {
      question.addEventListener('click', function() {
        var isActive = item.classList.contains('active');
        faqItems.forEach(function(other) {
          other.classList.remove('active');
          var answer = other.querySelector('.faq-answer');
          if (answer) answer.style.maxHeight = null;
        });
        if (!isActive) {
          item.classList.add('active');
          var answer = item.querySelector('.faq-answer');
          if (answer) answer.style.maxHeight = answer.scrollHeight + 'px';
        }
      });
    }
  });
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  const galleryItems = document.querySelectorAll('.gallery-page-item');

  filterBtns.forEach(function(btn) {
    btn.addEventListener('click', function() {
      filterBtns.forEach(function(b) { b.classList.remove('active'); });
      btn.classList.add('active');

      var filter = btn.dataset.filter;
      galleryItems.forEach(function(item) {
        if (filter === 'all' || item.dataset.category === filter) {
          item.style.display = '';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  var lightboxImages = [];
  var lightboxIndex = 0;

  function openLightbox(index) {
    if (lightbox && lightboxImg) {
      lightboxIndex = index;
      lightboxImg.src = lightboxImages[lightboxIndex];
      lightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }
  }

  function closeLightbox() {
    if (lightbox) {
      lightbox.classList.remove('active');
      document.body.style.overflow = '';
    }
  }

  document.querySelectorAll('.gallery-page-item').forEach(function(item, i) {
    var img = item.querySelector('img');
    if (img) {
      lightboxImages.push(img.src);
      item.addEventListener('click', function() {
        openLightbox(i);
      });
    }
  });

  if (lightboxClose) {
    lightboxClose.addEventListener('click', closeLightbox);
  }
  if (lightboxPrev) {
    lightboxPrev.addEventListener('click', function() {
      lightboxIndex = (lightboxIndex - 1 + lightboxImages.length) % lightboxImages.length;
      lightboxImg.src = lightboxImages[lightboxIndex];
    });
  }
  if (lightboxNext) {
    lightboxNext.addEventListener('click', function() {
      lightboxIndex = (lightboxIndex + 1) % lightboxImages.length;
      lightboxImg.src = lightboxImages[lightboxIndex];
    });
  }
  if (lightbox) {
    lightbox.addEventListener('click', function(e) {
      if (e.target === lightbox) closeLightbox();
    });
  }
  document.addEventListener('keydown', function(e) {
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
      if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
    }
  });
  const backToTop = document.getElementById('backToTop');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      if (window.scrollY > 500) {
        backToTop.classList.add('active');
      } else {
        backToTop.classList.remove('active');
      }
    });

    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
  const cookieBanner = document.getElementById('cookieBanner');
  const cookieAccept = document.getElementById('cookieAccept');
  const cookieReject = document.getElementById('cookieReject');

  if (cookieBanner) {
    var cookieConsent = localStorage.getItem('cookie_consent');
    if (!cookieConsent) {
      setTimeout(function() {
        cookieBanner.classList.add('active');
      }, 2000);
    }
  }

  if (cookieAccept) {
    cookieAccept.addEventListener('click', function() {
      localStorage.setItem('cookie_consent', 'accepted');
      cookieBanner.classList.remove('active');
    });
  }

  if (cookieReject) {
    cookieReject.addEventListener('click', function() {
      localStorage.setItem('cookie_consent', 'rejected');
      cookieBanner.classList.remove('active');
    });
  }
  const langSwitcher = document.getElementById('langSwitcher');
  if (langSwitcher) {
    var langOptions = langSwitcher.querySelectorAll('.lang-option');
    var savedLang = localStorage.getItem('lang_preference') || 'pt';
    setLanguage(savedLang);

    langOptions.forEach(function(option) {
      option.addEventListener('click', function() {
        var lang = this.dataset.lang;
        setLanguage(lang);
        localStorage.setItem('lang_preference', lang);
        if (typeof SiteData !== 'undefined') {
          applySiteData();
        }
      });
    });
  }

  function setLanguage(lang) {
    if (!translations || !translations[lang]) return;

    document.documentElement.setAttribute('data-lang', lang);
    document.documentElement.setAttribute('lang', lang);
    document.querySelectorAll('.lang-option').forEach(function(opt) {
      opt.classList.toggle('active', opt.dataset.lang === lang);
    });
    document.querySelectorAll('[data-i18n]').forEach(function(el) {
      var key = el.getAttribute('data-i18n');
      if (translations[lang][key]) {
        el.innerHTML = translations[lang][key];
      }
    });
  }
  var animElements = document.querySelectorAll('.fade-in, .slide-left, .slide-right');

  var observerOptions = {
    threshold: 0.15,
    rootMargin: '0px 0px -50px 0px'
  };

  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    animElements.forEach(function(el) {
      observer.observe(el);
    });
  } else {
    animElements.forEach(function(el) {
      el.classList.add('visible');
    });
  }
  var statNumbers = document.querySelectorAll('.stat-number[data-count]');
  if (statNumbers.length > 0 && 'IntersectionObserver' in window) {
    var counterObserver = new IntersectionObserver(function(entries) {
      entries.forEach(function(entry) {
        if (entry.isIntersecting) {
          animateCounter(entry.target);
          counterObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    statNumbers.forEach(function(el) {
      counterObserver.observe(el);
    });
  }

  function animateCounter(el) {
    var target = parseInt(el.dataset.count);
    var duration = 2000;
    var start = 0;
    var startTime = null;

    function step(timestamp) {
      if (!startTime) startTime = timestamp;
      var progress = Math.min((timestamp - startTime) / duration, 1);
      var current = Math.floor(progress * target);
      el.textContent = current.toLocaleString() + '+';
      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        el.textContent = target.toLocaleString() + '+';
      }
    }

    requestAnimationFrame(step);
  }
  document.querySelectorAll('a[href^="#"]').forEach(function(link) {
    link.addEventListener('click', function(e) {
      var target = document.querySelector(this.getAttribute('href'));
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    });
  });
  if (typeof SiteData !== 'undefined') {
    SiteData.loadFromServer(function() {
      applySiteData();
    });
  }

  function applySiteData() {
    var d = SiteData.load();
    var lang = localStorage.getItem('lang_preference') || 'pt';
    var isPt = (lang === 'pt');
    function esc(s) { if (!s) return ''; return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
    var footerSocials = document.querySelectorAll('.footer-social');
    footerSocials.forEach(function(container) {
      var socMap = {
        'fa-facebook-f': d.social.facebook,
        'fa-instagram': d.social.instagram,
        'fa-tripadvisor': d.social.tripadvisor,
        'fa-youtube': d.social.youtube,
        'fa-tiktok': d.social.tiktok,
        'fa-google': d.social.google
      };
      container.querySelectorAll('a').forEach(function(a) {
        var icon = a.querySelector('i');
        if (!icon) return;
        var found = false;
        for (var cls in socMap) {
          if (icon.classList.contains(cls)) {
            if (socMap[cls]) { a.href = socMap[cls]; a.style.display = ''; }
            else { a.style.display = 'none'; }
            found = true;
            delete socMap[cls];
            break;
          }
        }
      });
      var missing = { 'fa-tiktok': d.social.tiktok, 'fa-google': d.social.google };
      for (var ic in missing) {
        if (missing[ic] && !container.querySelector('.' + ic)) {
          var a = document.createElement('a');
          a.href = missing[ic]; a.target = '_blank'; a.rel = 'noopener';
          a.innerHTML = '<i class="fab ' + ic + '"></i>';
          container.appendChild(a);
        }
      }
    });
    var footerContacts = document.querySelectorAll('.footer-contact-item');
    footerContacts.forEach(function(item) {
      var icon = item.querySelector('i');
      if (!icon) return;
      if (icon.classList.contains('fa-map-marker-alt')) {
        item.querySelector('span').innerHTML = d.contact.address.replace(',', ',<br>');
      } else if (icon.classList.contains('fa-phone')) {
        item.querySelector('span').innerHTML = '<a href="tel:+' + d.contact.phoneRaw + '">' + d.contact.phone + '</a>';
      } else if (icon.classList.contains('fa-envelope')) {
        item.querySelector('span').innerHTML = '<a href="mailto:' + d.contact.email + '">' + d.contact.email + '</a>';
      } else if (icon.classList.contains('fa-clock')) {
        item.querySelector('span').textContent = isPt ? d.contact.hours : d.contact.hoursEn;
      }
    });
    var waFloat = document.querySelector('.whatsapp-float');
    if (waFloat && d.contact.whatsapp) {
      waFloat.href = 'https://wa.me/' + d.contact.whatsapp + '?text=' + encodeURIComponent('Olá! Gostaria de saber mais sobre os tours de kayak.');
    }
    var heroEl = document.getElementById('hero');
    if (heroEl) {
      var heroTitle = heroEl.querySelector('[data-i18n="hero_title"]');
      if (heroTitle) heroTitle.innerHTML = isPt ? d.homepage.heroTitlePt : d.homepage.heroTitleEn;
      var heroSub = heroEl.querySelector('[data-i18n="hero_subtitle"]');
      if (heroSub) heroSub.innerHTML = isPt ? d.homepage.heroSubPt : d.homepage.heroSubEn;
      var slides = heroEl.querySelectorAll('.hero-slide');
      var imgs = d.homepage.heroImages || [];
      if (imgs.length > 0) {
        var indicators = heroEl.querySelector('.hero-indicators');
        slides.forEach(function(s) { s.remove(); });
        var heroContent = heroEl.querySelector('.hero-content') || heroEl.querySelector('.container');
        imgs.forEach(function(url, i) {
          var div = document.createElement('div');
          div.className = 'hero-slide' + (i === 0 ? ' active' : '');
          div.innerHTML = '<img src="' + url + '" alt="Kayak Adventures Lagos" class="hero-slide-bg"><div class="hero-overlay"></div>';
          heroEl.insertBefore(div, heroContent);
        });
        if (indicators) {
          indicators.innerHTML = '';
          imgs.forEach(function(url, i) {
            var btn = document.createElement('button');
            btn.dataset.slide = i;
            if (i === 0) btn.classList.add('active');
            btn.setAttribute('aria-label', 'Slide ' + (i + 1));
            indicators.appendChild(btn);
          });
        }
        var newSlides = Array.prototype.slice.call(heroEl.querySelectorAll('.hero-slide'));
        var newBtns = indicators ? Array.prototype.slice.call(indicators.querySelectorAll('button')) : [];
        clearInterval(slideInterval);
        currentSlide = 0;
        heroSlides.length = 0;
        Array.prototype.push.apply(heroSlides, newSlides);
        heroIndicators.length = 0;
        Array.prototype.push.apply(heroIndicators, newBtns);
        newBtns.forEach(function(btn) {
          btn.addEventListener('click', function() {
            clearInterval(slideInterval);
            showSlide(parseInt(this.dataset.slide));
            startSlider();
          });
        });
        if (newSlides.length > 1) startSlider();
      }
      var tourPrice = document.querySelector('#tour-preview .tour-price');
      if (tourPrice) tourPrice.innerHTML = '€' + d.tour.price + ' <small data-i18n="tour_price_per">' + (isPt ? '/ pessoa' : '/ person') + '</small>';
      var tourTitle = document.querySelector('#tour-preview [data-i18n="tour_preview_title"]');
      if (tourTitle) tourTitle.textContent = isPt ? d.tour.namePt : d.tour.nameEn;
      var tourDetails = document.querySelectorAll('#tour-preview .tour-detail');
      tourDetails.forEach(function(det) {
        var icon = det.querySelector('i');
        if (!icon) return;
        var span = det.querySelector('span');
        if (icon.classList.contains('fa-clock')) span.textContent = isPt ? d.tour.duration : d.tour.durationEn;
        if (icon.classList.contains('fa-users')) span.textContent = (isPt ? 'Máx. ' : 'Max. ') + d.tour.maxGroup + (isPt ? ' pessoas' : ' people');
        if (icon.classList.contains('fa-signal')) span.textContent = isPt ? d.tour.levelPt : d.tour.levelEn;
        if (icon.classList.contains('fa-language')) span.textContent = d.tour.languages;
      });
      var testSlider = document.querySelector('.testimonials-slider');
      if (testSlider && d.testimonials.length > 0) {
        testSlider.innerHTML = '';
        d.testimonials.forEach(function(t, i) {
          var stars = '';
          for (var s = 0; s < t.rating; s++) stars += '<i class="fas fa-star"></i>';
          var initials = t.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 2);
          var text = isPt ? t.textPt : t.textEn;
          var srcIcon = { tripadvisor: 'fab fa-tripadvisor', google: 'fab fa-google', facebook: 'fab fa-facebook-f' };
          var badge = t.source && t.source !== 'direct' ? '<span style="font-size:.7rem;color:#6b7280;margin-top:4px;display:flex;align-items:center;gap:4px;"><i class="' + (srcIcon[t.source] || 'fas fa-comment') + '"></i> ' + esc(t.source.charAt(0).toUpperCase() + t.source.slice(1)) + '</span>' : '';
          var card = document.createElement('div');
          card.className = 'testimonial-card' + (i === 0 ? ' active' : '');
          card.innerHTML = '<div class="testimonial-stars">' + stars + '</div>' +
            '<p class="testimonial-text">' + esc(text) + '</p>' +
            '<div class="testimonial-author">' +
            '<div class="testimonial-avatar">' + esc(initials) + '</div>' +
            '<div class="testimonial-author-info"><h4>' + esc(t.name) + '</h4><span>' + esc(t.location) + '</span>' + badge + '</div></div>';
          testSlider.appendChild(card);
        });
        var testNav = document.querySelector('.testimonials-nav');
        if (testNav) {
          testNav.innerHTML = '';
          d.testimonials.forEach(function(t, i) {
            var btn = document.createElement('button');
            if (i === 0) btn.classList.add('active');
            btn.dataset.testimonial = i;
            testNav.appendChild(btn);
          });
        }
        if (d.tripadvisorWidget.enabled && d.tripadvisorWidget.url) {
          var taUrl = d.tripadvisorWidget.url;
          if (/^https?:\/\//i.test(taUrl)) {
            var taLink = document.createElement('div');
            taLink.style.cssText = 'text-align:center;margin-top:20px;';
            taLink.innerHTML = '<a href="' + esc(taUrl) + '" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="border-color:#00AF87;color:#00AF87;"><i class="fab fa-tripadvisor"></i> Ver no TripAdvisor</a>';
            testSlider.parentNode.insertBefore(taLink, testNav);
          }
        }
        reinitTestimonials();
      }
    }
    var tourSidebar = document.querySelector('.tour-sidebar');
    if (tourSidebar) {
      var details = tourSidebar.querySelectorAll('.tour-sidebar-detail');
      details.forEach(function(det) {
        var icon = det.querySelector('i');
        var span = det.querySelector('span');
        if (!icon || !span) return;
        if (icon.classList.contains('fa-clock')) span.innerHTML = '<strong>' + (isPt ? 'Duração:' : 'Duration:') + '</strong> ' + (isPt ? d.tour.duration : d.tour.durationEn);
        if (icon.classList.contains('fa-map-marker-alt')) span.innerHTML = '<strong>' + (isPt ? 'Ponto de encontro:' : 'Meeting point:') + '</strong> ' + (isPt ? d.tour.meetingPt : d.tour.meetingEn);
        if (icon.classList.contains('fa-users')) span.innerHTML = '<strong>' + (isPt ? 'Grupo:' : 'Group:') + '</strong> ' + (isPt ? 'Máx. ' : 'Max. ') + d.tour.maxGroup + (isPt ? ' pessoas' : ' people');
        if (icon.classList.contains('fa-signal')) span.innerHTML = '<strong>' + (isPt ? 'Nível:' : 'Level:') + '</strong> ' + (isPt ? d.tour.levelPt : d.tour.levelEn);
        if (icon.classList.contains('fa-child')) span.innerHTML = '<strong>' + (isPt ? 'Idade mínima:' : 'Min. age:') + '</strong> ' + d.tour.minAge + (isPt ? ' anos' : ' years');
        if (icon.classList.contains('fa-language')) span.innerHTML = '<strong>' + (isPt ? 'Idiomas:' : 'Languages:') + '</strong> ' + d.tour.languages;
        if (icon.classList.contains('fa-calendar-alt')) span.innerHTML = '<strong>' + (isPt ? 'Época:' : 'Season:') + '</strong> ' + (isPt ? d.tour.season : (d.tour.seasonEn || d.tour.season));
      });
      var sPrice = tourSidebar.querySelector('.tour-price');
      if (sPrice) sPrice.innerHTML = '€' + d.tour.price + ' <small data-i18n="tour_price_per">' + (isPt ? '/ pessoa' : '/ person') + '</small>';
      var sSchedule = tourSidebar.querySelector('[data-i18n="tour_sidebar_schedule"]');
      if (sSchedule) sSchedule.textContent = (isPt ? 'Horários: ' : 'Schedules: ') + d.tour.schedules;
    }
    var aboutImg = document.querySelector('.about-image img');
    if (aboutImg && d.about.image) {
      aboutImg.src = d.about.image;
    }
    var aboutStats = document.querySelector('.about-stats');
    if (aboutStats) {
      var statCards = aboutStats.querySelectorAll('.stat-card');
      if (statCards[0]) { var n = statCards[0].querySelector('.stat-number'); if (n) { n.dataset.count = d.about.statClients; n.textContent = '0'; } }
      if (statCards[1]) { var n = statCards[1].querySelector('.stat-number'); if (n) { n.dataset.count = d.about.statYears; n.textContent = '0'; } }
      if (statCards[2]) { var n = statCards[2].querySelector('.stat-number'); if (n) { n.dataset.count = d.about.statTours; n.textContent = '0'; } }
      if (statCards[3]) { var n = statCards[3].querySelector('.stat-number'); if (n) n.textContent = d.about.statRating + '★'; }
    }
    var teamGrid = document.querySelector('.team-grid');
    if (teamGrid && d.about.team.length > 0) {
      teamGrid.innerHTML = '';
      d.about.team.forEach(function(m) {
        var card = document.createElement('div');
        card.className = 'team-card fade-in visible';
        card.innerHTML = '<div class="team-card-img"><img src="' + esc(m.image) + '" alt="' + esc(m.name) + '" loading="lazy"></div>' +
          '<div class="team-card-info"><h3>' + esc(m.name) + '</h3><span>' + esc(isPt ? m.rolePt : m.roleEn) + '</span></div>';
        teamGrid.appendChild(card);
      });
    }
    var galGrid = document.getElementById('galleryGrid');
    if (galGrid && d.gallery.length > 0) {
      galGrid.innerHTML = '';
      d.gallery.forEach(function(img) {
        var div = document.createElement('div');
        div.className = 'gallery-page-item fade-in visible';
        div.dataset.category = img.category;
        div.innerHTML = '<img src="' + esc(img.url) + '" alt="' + esc(isPt ? img.captionPt : img.captionEn) + '" loading="lazy">';
        galGrid.appendChild(div);
      });
      lightboxImages = [];
      galGrid.querySelectorAll('.gallery-page-item').forEach(function(item, i) {
        var img = item.querySelector('img');
        if (img) {
          lightboxImages.push(img.src);
          item.addEventListener('click', function() { openLightbox(i); });
        }
      });
      document.querySelectorAll('.gallery-filter-btn').forEach(function(btn) {
        btn.addEventListener('click', function() {
          document.querySelectorAll('.gallery-filter-btn').forEach(function(b) { b.classList.remove('active'); });
          btn.classList.add('active');
          var filter = btn.dataset.filter;
          galGrid.querySelectorAll('.gallery-page-item').forEach(function(item) {
            item.style.display = (filter === 'all' || item.dataset.category === filter) ? '' : 'none';
          });
        });
      });
    }
    var homeGal = document.getElementById('homeGalleryGrid');
    if (homeGal && d.gallery.length > 0) {
      homeGal.innerHTML = '';
      var maxItems = Math.min(d.gallery.length, 5);
      for (var gi = 0; gi < maxItems; gi++) {
        var gImg = d.gallery[gi];
        var gDiv = document.createElement('div');
        gDiv.className = 'gallery-item';
        gDiv.innerHTML = '<img src="' + esc(gImg.url) + '" alt="' + esc(isPt ? gImg.captionPt : gImg.captionEn) + '" loading="lazy">' +
          '<div class="gallery-item-overlay"><span>' + esc(isPt ? gImg.captionPt : gImg.captionEn) + '</span></div>';
        homeGal.appendChild(gDiv);
      }
    }
    var trustBar = document.getElementById('trustBar');
    if (trustBar) {
      var trustItems = trustBar.querySelectorAll('.trust-item');
      if (trustItems[0]) {
        var taInfo = trustItems[0].querySelector('.trust-item-info strong');
        if (taInfo) taInfo.textContent = d.about.statRating + ' TripAdvisor';
      }
      if (trustItems[1]) {
        var gInfo = trustItems[1].querySelector('.trust-item-info strong');
        if (gInfo) gInfo.textContent = d.about.statRating + ' Google';
        var gSub = trustItems[1].querySelector('.trust-item-info span:last-child');
        if (gSub) gSub.textContent = (isPt ? 'Baseado em ' : 'Based on ') + d.about.statClients + '+ reviews';
      }
    }
    var stickyMeta = document.querySelector('.sticky-cta-left .tour-meta');
    if (stickyMeta) {
      var dur = isPt ? d.tour.duration : (d.tour.durationEn || d.tour.duration);
      stickyMeta.innerHTML = '<i class="fas fa-clock"></i> ' + esc(dur) +
        ' <i class="fas fa-star" style="color:#FBBF24"></i> ' + esc(String(d.about.statRating)) +
        ' <i class="fas fa-users"></i> ' + (isPt ? 'Máx. ' : 'Max. ') + esc(String(d.tour.maxGroup));
    }
    var instaHandleEl = document.querySelector('.insta-header p[data-i18n="insta_handle"]');
    if (instaHandleEl && d.social.instagramHandle) {
      instaHandleEl.textContent = '@' + d.social.instagramHandle.replace(/^@/, '');
    }
    document.querySelectorAll('script[type="application/ld+json"]').forEach(function(ldScript) {
      try {
        var ld = JSON.parse(ldScript.textContent);
        if (ld['@type'] === 'FAQPage' && d.faq && d.faq.length > 0) {
          ld.mainEntity = d.faq.map(function(f) {
            return {'@type':'Question','name':isPt?f.qPt:f.qEn,'acceptedAnswer':{'@type':'Answer','text':isPt?f.aPt:f.aEn}};
          });
        }
        if (ld.telephone) ld.telephone = d.contact.phoneRaw || d.contact.phone;
        if (ld.address) {
          ld.address.streetAddress = d.contact.address.split(',')[0] || d.contact.address;
        }
        if (ld.aggregateRating) {
          ld.aggregateRating.ratingValue = String(d.about.statRating);
        }
        ldScript.textContent = JSON.stringify(ld);
      } catch(e) {}
    });
    var pageHero = document.querySelector('.page-hero');
    if (pageHero && d.homepage.heroImages && d.homepage.heroImages.length > 0) {
      pageHero.style.backgroundImage = "url('" + d.homepage.heroImages[0] + "')";
    }
    var tourMainImg = document.querySelector('.tour-main-image img');
    if (tourMainImg && d.about.image) {
      tourMainImg.src = d.about.image;
    }
    var tourPreviewImg = document.querySelector('#tour-preview .tour-preview-image img');
    if (tourPreviewImg && d.about.image) {
      tourPreviewImg.src = d.about.image;
    }
    var ctaSection = document.querySelector('.cta-section[style*="background-image"]');
    if (ctaSection && d.homepage.heroImages && d.homepage.heroImages.length > 0) {
      ctaSection.style.backgroundImage = "url('" + d.homepage.heroImages[0] + "')";
    }
    var faqList = document.getElementById('faqList');
    if (faqList && d.faq && d.faq.length > 0) {
      faqList.innerHTML = '';
      d.faq.forEach(function(f) {
        var item = document.createElement('div');
        item.className = 'faq-item fade-in visible';
        item.innerHTML = '<button class="faq-question"><span>' + esc(isPt ? f.qPt : f.qEn) + '</span><i class="fas fa-chevron-down"></i></button>' +
          '<div class="faq-answer"><div class="faq-answer-content">' + esc(isPt ? f.aPt : f.aEn) + '</div></div>';
        faqList.appendChild(item);
      });
      faqList.querySelectorAll('.faq-question').forEach(function(btn) {
        btn.addEventListener('click', function() {
          var item = this.parentElement;
          var wasActive = item.classList.contains('active');
          faqList.querySelectorAll('.faq-item').forEach(function(fi) { fi.classList.remove('active'); });
          if (!wasActive) item.classList.add('active');
        });
      });
    }
    var faqCtas = document.querySelectorAll('.faq-cta a, .cta-section a[href*="wa.me"], .cta-section a[href*="mailto:"]');
    faqCtas.forEach(function(a) {
      if (a.href.indexOf('wa.me') > -1) a.href = 'https://wa.me/' + d.contact.whatsapp;
      if (a.href.indexOf('mailto:') > -1) a.href = 'mailto:' + d.contact.email;
    });
    document.querySelectorAll('.legal-content p, .legal-content li').forEach(function(el) {
      var t = el.innerHTML;
      if (t.indexOf('info@kayakadventureslagos.com') > -1) {
        t = t.replace(/info@kayakadventureslagos\.com/g, esc(d.contact.email));
        el.innerHTML = t;
      }
      if (t.indexOf('+351 912 345 678') > -1) {
        t = t.replace(/\+351 912 345 678/g, esc(d.contact.phone));
        el.innerHTML = t;
      }
    });
    var mapIframe = document.querySelector('.map-wrapper iframe, .map-section iframe');
    if (mapIframe && d.contact.mapEmbed) {
      mapIframe.src = d.contact.mapEmbed;
    }
    if (d.settings.googleAnalytics && !document.getElementById('ga-script')) {
      var gaId = d.settings.googleAnalytics;
      var gaScript = document.createElement('script');
      gaScript.id = 'ga-script';
      gaScript.async = true;
      gaScript.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(gaId);
      document.head.appendChild(gaScript);
      var gaInit = document.createElement('script');
      gaInit.textContent = 'window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag("js",new Date());gtag("config","' + gaId.replace(/[^a-zA-Z0-9-]/g, '') + '");';
      document.head.appendChild(gaInit);
    }
    if (d.settings.facebookPixel && !document.getElementById('fb-pixel')) {
      var fpId = d.settings.facebookPixel.replace(/[^0-9]/g, '');
      var fpScript = document.createElement('script');
      fpScript.id = 'fb-pixel';
      fpScript.textContent = "!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','" + fpId + "');fbq('track','PageView');";
      document.head.appendChild(fpScript);
    }
    var fhShortname = (d.tour.fareharbor || d.settings.fareharbor || '').replace(/[^a-zA-Z0-9_-]/g, '');
    if (fhShortname && !document.getElementById('fh-lightframe')) {
      var fhScript = document.createElement('script');
      fhScript.id = 'fh-lightframe';
      fhScript.src = 'https://fareharbor.com/embeds/api/v1/?autolightframe=yes';
      fhScript.async = true;
      document.head.appendChild(fhScript);

      var fhBookUrl = 'https://fareharbor.com/embeds/book/' + fhShortname + '/items/?ref=website';
      document.querySelectorAll('a[href*="#booking"]').forEach(function(a) {
        a.href = fhBookUrl;
      });
      var fhDiv = document.getElementById('fareharbor-booking');
      if (fhDiv) {
        fhDiv.innerHTML = '<a href="' + fhBookUrl + '" class="btn btn-secondary btn-lg" style="width:100%;justify-content:center;" data-i18n="tour_book_now">' +
          '<i class="fas fa-calendar-check"></i> ' + (isPt ? 'Reservar Agora' : 'Book Now') + '</a>';
      }
    }
  }
  function reinitTestimonials() {
    var cards = document.querySelectorAll('.testimonial-card');
    var navBtns = document.querySelectorAll('.testimonials-nav button');
    var idx = 0;
    var iv;

    function show(i) {
      cards.forEach(function(c) { c.classList.remove('active'); });
      navBtns.forEach(function(b) { b.classList.remove('active'); });
      idx = i;
      if (idx >= cards.length) idx = 0;
      if (idx < 0) idx = cards.length - 1;
      cards[idx].classList.add('active');
      if (navBtns[idx]) navBtns[idx].classList.add('active');
    }

    function start() {
      if (cards.length > 1) iv = setInterval(function() { show(idx + 1); }, 6000);
    }

    navBtns.forEach(function(btn) {
      btn.addEventListener('click', function() {
        clearInterval(iv);
        show(parseInt(this.dataset.testimonial));
        start();
      });
    });

    start();
  }
  var stickyCta = document.getElementById('stickyCta');
  if (stickyCta) {
    var stickyTrigger = document.getElementById('tour-preview') || document.getElementById('features');
    window.addEventListener('scroll', function() {
      if (!stickyTrigger) return;
      var rect = stickyTrigger.getBoundingClientRect();
      if (rect.top < -200) {
        stickyCta.classList.add('visible');
      } else {
        stickyCta.classList.remove('visible');
      }
    });
    if (typeof SiteData !== 'undefined') {
      var sd = SiteData.load();
      var lang = localStorage.getItem('lang_preference') || 'pt';
      var sName = stickyCta.querySelector('.tour-name');
      if (sName) sName.textContent = lang === 'pt' ? sd.tour.namePt : sd.tour.nameEn;
      var sPrice = stickyCta.querySelector('.sticky-cta-price');
      if (sPrice) sPrice.innerHTML = '€' + sd.tour.price + ' <small>' + (lang === 'pt' ? '/ pessoa' : '/ person') + '</small>';
    }
  }
  var countdownBar = document.getElementById('countdownBar');
  if (countdownBar) {
    function updateCountdown() {
      var now = new Date();
      var schedules = ['09:00', '11:00', '14:00', '16:30'];
      if (typeof SiteData !== 'undefined') {
        var sd = SiteData.load();
        if (sd.tour.schedules) {
          schedules = sd.tour.schedules.split(/\s*\|\s*/).filter(function(s) { return s.trim(); });
        }
      }
      var nextTour = null;
      for (var i = 0; i < schedules.length; i++) {
        var parts = schedules[i].trim().split(':');
        var t = new Date(now);
        t.setHours(parseInt(parts[0]), parseInt(parts[1]) || 0, 0, 0);
        if (t > now) { nextTour = t; break; }
      }
      if (!nextTour) {
        var parts = schedules[0].trim().split(':');
        nextTour = new Date(now);
        nextTour.setDate(nextTour.getDate() + 1);
        nextTour.setHours(parseInt(parts[0]), parseInt(parts[1]) || 0, 0, 0);
      }
      var diff = nextTour - now;
      var h = Math.floor(diff / 3600000);
      var m = Math.floor((diff % 3600000) / 60000);
      var s = Math.floor((diff % 60000) / 1000);
      document.getElementById('cdHours').textContent = h < 10 ? '0' + h : h;
      document.getElementById('cdMins').textContent = m < 10 ? '0' + m : m;
      document.getElementById('cdSecs').textContent = s < 10 ? '0' + s : s;
    }
    updateCountdown();
    setInterval(updateCountdown, 1000);
    var spots = Math.floor(Math.random() * 6) + 3;
    var spotsEl = document.getElementById('spotsLeft');
    var lang = localStorage.getItem('lang_preference') || 'pt';
    if (spotsEl) spotsEl.textContent = lang === 'pt' ? ('Últimos ' + spots + ' lugares!') : ('Last ' + spots + ' spots!');
  }
  var proofNotif = document.getElementById('proofNotification');
  if (proofNotif) {
    var sd = typeof SiteData !== 'undefined' ? SiteData.load() : {};
    var spEnabled = sd.settings && sd.settings.socialProof !== false;
    if (!spEnabled) { proofNotif.style.display = 'none'; }
    else {
    var proofNames = [
      { name: 'Maria S.', city: 'Lisboa', avatar: 'MS' },
      { name: 'John D.', city: 'London', avatar: 'JD' },
      { name: 'Carlos F.', city: 'Madrid', avatar: 'CF' },
      { name: 'Sophie R.', city: 'Paris', avatar: 'SR' },
      { name: 'Ana M.', city: 'Porto', avatar: 'AM' },
      { name: 'Thomas K.', city: 'Berlin', avatar: 'TK' },
      { name: 'Laura B.', city: 'Barcelona', avatar: 'LB' },
      { name: 'Pedro G.', city: 'Faro', avatar: 'PG' },
      { name: 'Emma W.', city: 'Amsterdam', avatar: 'EW' },
      { name: 'Miguel R.', city: 'Braga', avatar: 'MR' }
    ];
    var proofTimes = ['há 2 minutos', 'há 5 minutos', 'há 12 minutos', 'há 18 minutos', 'há 25 minutos'];
    var proofTimesEn = ['2 minutes ago', '5 minutes ago', '12 minutes ago', '18 minutes ago', '25 minutes ago'];
    var proofIdx = 0;
    var proofDismissed = false;

    document.getElementById('proofClose').addEventListener('click', function() {
      proofNotif.classList.remove('show');
      proofDismissed = true;
    });

    function showProofNotif() {
      if (proofDismissed) return;
      var person = proofNames[proofIdx % proofNames.length];
      var lang = localStorage.getItem('lang_preference') || 'pt';
      var time = lang === 'pt' ? proofTimes[proofIdx % proofTimes.length] : proofTimesEn[proofIdx % proofTimesEn.length];
      document.getElementById('proofAvatar').textContent = person.avatar;
      document.getElementById('proofText').textContent = person.name + ' ' + (lang === 'pt' ? 'de ' : 'from ') + person.city + ' ' + (lang === 'pt' ? 'reservou um tour' : 'booked a tour');
      document.getElementById('proofTime').textContent = time;
      proofNotif.classList.add('show');
      proofIdx++;
      setTimeout(function() {
        proofNotif.classList.remove('show');
      }, 5000);
    }
    setTimeout(function() {
      showProofNotif();
      setInterval(function() {
        showProofNotif();
      }, 25000 + Math.random() * 15000);
    }, 8000);
    }
  }
  var videoPlaceholder = document.getElementById('videoPlaceholder');
  if (videoPlaceholder) {
    videoPlaceholder.addEventListener('click', function() {
      var videoUrl = '';
      if (typeof SiteData !== 'undefined') {
        var sd = SiteData.load();
        videoUrl = sd.homepage.videoUrl || '';
      }
      if (!videoUrl) return;
      var videoId = '';
      var match = videoUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
      if (match) videoId = match[1];
      else if (/^[\w-]{11}$/.test(videoUrl)) videoId = videoUrl;
      if (!videoId) return;
      var wrapper = videoPlaceholder.parentNode;
      wrapper.innerHTML = '<iframe src="https://www.youtube.com/embed/' + videoId + '?autoplay=1&rel=0&modestbranding=1" allow="autoplay; encrypted-media; fullscreen" allowfullscreen title="Kayak Adventures Lagos"></iframe>';
    });
  }
  var instaStrip = document.getElementById('instaStrip');
  if (instaStrip) {
    var images = [];
    if (typeof SiteData !== 'undefined') {
      var sd = SiteData.load();
      images = sd.gallery.slice(0, 8).map(function(g) { return g.url; });
      var instaHandleEl = document.querySelector('[data-i18n="insta_handle"]');
      if (instaHandleEl && sd.social.instagramHandle) {
        instaHandleEl.textContent = sd.social.instagramHandle;
      }
      var instaLink = sd.social.instagram;
      if (instaLink) {
        var instaHeader = document.querySelector('.insta-header');
        if (instaHeader && !instaHeader.querySelector('a')) {
          instaHeader.style.cursor = 'pointer';
          instaHeader.addEventListener('click', function() { window.open(instaLink, '_blank'); });
        }
      }
    }
    if (images.length === 0) {
      images = [
        'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&q=80',
        'https://images.unsplash.com/photo-1572111024955-76f23dec4bde?w=400&q=80',
        'https://images.unsplash.com/photo-1468956398224-6d6f66e22c35?w=400&q=80',
        'https://images.unsplash.com/photo-1604715892639-929f832ac4d0?w=400&q=80',
        'https://images.unsplash.com/photo-1530053969600-caed2596d242?w=400&q=80',
        'https://images.unsplash.com/photo-1499242165961-41c2e5b3a73b?w=400&q=80',
        'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=400&q=80',
        'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=400&q=80'
      ];
    }
    var allImgs = images.concat(images);
    allImgs.forEach(function(url) {
      var item = document.createElement('div');
      item.className = 'insta-strip-item';
      item.innerHTML = '<img src="' + url + '" alt="Instagram" loading="lazy"><div class="insta-strip-overlay"><i class="fab fa-instagram"></i></div>';
      instaStrip.appendChild(item);
    });
  }

});
