document.addEventListener('DOMContentLoaded', function() {
  // Set current year in footer
  document.querySelectorAll('.current-year').forEach(function(el) { el.textContent = new Date().getFullYear(); });

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
      document.body.classList.toggle('menu-open', isOpen);
      header.classList.toggle('menu-open', isOpen);
    });
    mainNav.querySelectorAll('a').forEach(function(link) {
      link.addEventListener('click', function() {
        mobileToggle.classList.remove('active');
        mainNav.classList.remove('mobile-active');
        document.body.style.overflow = '';
        document.body.classList.remove('menu-open');
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
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxClose = document.getElementById('lightboxClose');
  const lightboxPrev = document.getElementById('lightboxPrev');
  const lightboxNext = document.getElementById('lightboxNext');
  const filterBtns = document.querySelectorAll('.gallery-filter-btn');
  var lightboxImages = [];
  var lightboxIndex = 0;
  var videoLightbox = null;
  var videoLightboxPlayer = null;
  var videoLightboxTitle = null;

  function normalizeMediaUrl(url, mediaType) {
    if (!url) return '';

    var value = String(url).trim().replace(/\\/g, '/');
    if (!value) return '';

    if (/^(https?:)?\/\//i.test(value) || /^(data|blob):/i.test(value)) return value;

    value = value.replace(/^\.\//, '');
    while (value.indexOf('../') === 0) value = value.substring(3);
    value = value.replace(/^admin\//i, '');

    if (value.charAt(0) === '/') return value;
    if (/^(images|videos)\//i.test(value)) return value;
    if (/^uploads\//i.test(value)) return 'images/' + value;
    if (/^gallery\//i.test(value)) return 'images/' + value;
    if (/^video\//i.test(value)) return value.replace(/^video\//i, 'videos/');

    return (mediaType === 'video' ? 'videos/gallery/' : 'images/gallery/') + value;
  }

  function looksLikeVideoUrl(url) {
    var normalized = normalizeMediaUrl(url, 'video');
    if (!normalized) return false;
    if (/^(data|blob):/i.test(normalized)) return true;
    return /\.(mp4|webm|ogg|ogv|mov)(?:$|[?#])/i.test(normalized);
  }

  function buildMediaCandidates(url, mediaType) {
    if (!url) return [];

    var raw = String(url).trim().replace(/\\/g, '/');
    var candidates = [];

    function add(candidate) {
      if (candidate && candidates.indexOf(candidate) === -1) candidates.push(candidate);
    }

    add(normalizeMediaUrl(raw, mediaType));

    if (/^(https?:)?\/\//i.test(raw) || /^(data|blob):/i.test(raw)) return candidates;

    var stripped = raw.replace(/^\.\//, '');
    while (stripped.indexOf('../') === 0) stripped = stripped.substring(3);
    stripped = stripped.replace(/^admin\//i, '');

    add(stripped);

    if (stripped.charAt(0) === '/') add(stripped.substring(1));
    if (/^uploads\//i.test(stripped)) add('images/' + stripped);
    if (/^gallery\//i.test(stripped)) add('images/' + stripped);

    if (stripped.indexOf('/') === -1) {
      if (mediaType === 'video') {
        add('videos/gallery/' + stripped);
      } else {
        add('images/gallery/' + stripped);
        add('images/uploads/' + stripped);
      }
    }

    return candidates.filter(function(candidate) {
      return !!candidate;
    });
  }

  function applyImageSourceCandidates(imageEl, url) {
    if (!imageEl) return;

    var candidates = buildMediaCandidates(url || imageEl.getAttribute('src') || imageEl.src, 'image');
    if (candidates.indexOf('images/gallery/main.jpg') === -1) {
      candidates.push('images/gallery/main.jpg');
    }

    if (candidates.length === 0) return;

    var candidateIndex = 0;

    function cleanup() {
      imageEl.removeEventListener('error', handleError);
      imageEl.removeEventListener('load', handleLoad);
    }

    function handleLoad() {
      cleanup();
    }

    function handleError() {
      if (candidateIndex >= candidates.length) {
        cleanup();
        return;
      }
      imageEl.src = candidates[candidateIndex++];
    }

    imageEl.addEventListener('error', handleError);
    imageEl.addEventListener('load', handleLoad);
    handleError();
  }

  function applyVideoSourceCandidates(videoEl, url, onReady, onMissing) {
    if (!videoEl) return;

    var candidates = buildMediaCandidates(url, 'video');
    if (candidates.length === 0) {
      if (onMissing) onMissing();
      return;
    }

    var candidateIndex = 0;

    function cleanup() {
      videoEl.removeEventListener('loadedmetadata', handleReady);
      videoEl.removeEventListener('error', handleError);
    }

    function handleReady() {
      cleanup();
      if (onReady) onReady();
    }

    function handleError() {
      if (candidateIndex >= candidates.length) {
        cleanup();
        if (onMissing) onMissing();
        return;
      }

      videoEl.src = candidates[candidateIndex++];
      videoEl.load();
    }

    videoEl.addEventListener('loadedmetadata', handleReady);
    videoEl.addEventListener('error', handleError);
    handleError();
  }

  function configureInlineVideoPlayer(videoEl) {
    if (!videoEl) return;
    videoEl.setAttribute('playsinline', 'playsinline');
    videoEl.setAttribute('preload', 'metadata');
    videoEl.setAttribute('muted', 'muted');
    videoEl.setAttribute('disablepictureinpicture', 'disablepictureinpicture');
    videoEl.setAttribute('aria-hidden', 'true');
    videoEl.setAttribute('tabindex', '-1');
    videoEl.removeAttribute('controls');
    videoEl.removeAttribute('controlsList');
    videoEl.muted = true;
    videoEl.disablePictureInPicture = true;
  }

  function bindVideoLightboxTrigger(triggerEl, videoData, isPt) {
    if (!triggerEl) return;

    function handleOpen(event) {
      event.preventDefault();
      openVideoLightbox(videoData, isPt);
    }

    triggerEl.addEventListener('click', handleOpen);
    if (triggerEl.tagName !== 'BUTTON') {
      triggerEl.addEventListener('keydown', function(event) {
        if (event.key === 'Enter' || event.key === ' ') {
          handleOpen(event);
        }
      });
    }
  }

  function ensureVideoLightbox() {
    if (videoLightbox) return;

    videoLightbox = document.createElement('div');
    videoLightbox.className = 'video-lightbox';
    videoLightbox.innerHTML = '<div class="video-lightbox-dialog"><button type="button" class="video-lightbox-close" aria-label="Close video player"><i class="fas fa-times"></i></button><h3 class="video-lightbox-title"></h3><div class="video-lightbox-player-wrap"><video class="video-lightbox-player" controls playsinline preload="metadata" controlsList="nodownload noplaybackrate nofullscreen" disablepictureinpicture></video></div></div>';
    document.body.appendChild(videoLightbox);

    videoLightboxPlayer = videoLightbox.querySelector('.video-lightbox-player');
    videoLightboxTitle = videoLightbox.querySelector('.video-lightbox-title');
    videoLightbox.querySelector('.video-lightbox-close').addEventListener('click', closeVideoLightbox);
    videoLightbox.addEventListener('click', function(event) {
      if (event.target === videoLightbox) closeVideoLightbox();
    });
  }

  function openVideoLightbox(videoData, isPt) {
    if (!videoData || !videoData.url || !looksLikeVideoUrl(videoData.url)) return;

    ensureVideoLightbox();
    if (!videoLightbox || !videoLightboxPlayer) return;

    var title = isPt ? (videoData.titlePt || videoData.titleEn) : (videoData.titleEn || videoData.titlePt);
    if (videoLightboxTitle) {
      videoLightboxTitle.textContent = title || (isPt ? 'Vídeo do tour' : 'Tour video');
    }

    var poster = normalizeMediaUrl(videoData.poster, 'image');
    if (poster) videoLightboxPlayer.setAttribute('poster', poster);
    else videoLightboxPlayer.removeAttribute('poster');

    videoLightboxPlayer.pause();
    videoLightboxPlayer.removeAttribute('src');
    videoLightboxPlayer.load();

    applyVideoSourceCandidates(videoLightboxPlayer, videoData.url, function() {
      videoLightbox.classList.add('active');
      document.body.style.overflow = 'hidden';
    }, function() {
      closeVideoLightbox();
    });
  }

  function closeVideoLightbox() {
    if (!videoLightbox || !videoLightboxPlayer) return;
    videoLightboxPlayer.pause();
    videoLightboxPlayer.removeAttribute('src');
    videoLightboxPlayer.load();
    videoLightbox.classList.remove('active');
    document.body.style.overflow = '';
  }

  function bindGalleryFilters(galleryRoot) {
    if (!galleryRoot || filterBtns.length === 0) return;

    filterBtns.forEach(function(btn) {
      if (btn.dataset.galleryBound === 'true') return;
      btn.dataset.galleryBound = 'true';

      btn.addEventListener('click', function() {
        filterBtns.forEach(function(otherBtn) { otherBtn.classList.remove('active'); });
        btn.classList.add('active');

        var filter = btn.dataset.filter;
        galleryRoot.querySelectorAll('.gallery-page-item').forEach(function(item) {
          item.style.display = (filter === 'all' || item.dataset.category === filter) ? '' : 'none';
        });
      });
    });
  }

  function refreshGalleryLightbox(galleryRoot) {
    if (!galleryRoot) return;

    var items = Array.prototype.slice.call(galleryRoot.querySelectorAll('.gallery-page-item')).filter(function(item) {
      return !!item.querySelector('img');
    });

    lightboxImages = items.map(function(item) {
      var img = item.querySelector('img');
      return img ? (img.currentSrc || img.src || img.getAttribute('src')) : '';
    }).filter(function(src) {
      return !!src;
    });

    items.forEach(function(item, index) {
      item.onclick = function() {
        lightboxImages = items.map(function(currentItem) {
          var img = currentItem.querySelector('img');
          return img ? (img.currentSrc || img.src || img.getAttribute('src')) : '';
        }).filter(function(src) {
          return !!src;
        });

        if (lightboxImages.length === 0) return;
        openLightbox(index);
      };
    });
  }

  function prepareGalleryGrid(galleryRoot) {
    if (!galleryRoot) return;

    galleryRoot.querySelectorAll('.gallery-page-item img').forEach(function(img) {
      applyImageSourceCandidates(img, img.getAttribute('src') || img.src);
    });

    bindGalleryFilters(galleryRoot);
    refreshGalleryLightbox(galleryRoot);
  }

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
    if (videoLightbox && videoLightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeVideoLightbox();
      return;
    }
    if (lightbox && lightbox.classList.contains('active')) {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft' && lightboxPrev) lightboxPrev.click();
      if (e.key === 'ArrowRight' && lightboxNext) lightboxNext.click();
    }
  });
  prepareGalleryGrid(document.getElementById('galleryGrid'));
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
      // Load tracking scripts now that consent was given
      if (typeof applySiteData === 'function') applySiteData();
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
    // Toggle bilingual legal content blocks
    document.querySelectorAll('.lang-pt').forEach(function(el) { el.style.display = lang === 'pt' ? '' : 'none'; });
    document.querySelectorAll('.lang-en').forEach(function(el) { el.style.display = lang === 'en' ? '' : 'none'; });
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

  function esc(s) {
    if (!s) return '';
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  function extractScheduleSlots(scheduleText) {
    if (!scheduleText || String(scheduleText).indexOf(':') === -1) return [];
    return String(scheduleText)
      .split(/\s*\|\s*/)
      .map(function(part) {
        var rawPart = String(part).trim();
        var match = rawPart.match(/\d{1,2}:\d{2}/);
        if (!match) return null;
        return { time: match[0], raw: rawPart };
      })
      .filter(function(slot) {
        return !!slot;
      });
  }

  function getDefaultScheduleSlots() {
    return [
      { time: '10:00', raw: '10:00' },
      { time: '13:00', raw: '13:00' },
      { time: '15:30', raw: '15:30' },
      { time: '18:00', raw: '18:00' }
    ];
  }

  function formatScheduleTime(time, isPt) {
    var value = String(time || '').trim();
    var match = value.match(/^(\d{1,2}):(\d{2})$/);
    if (!match) return value;
    if (isPt) return value;

    var hours = parseInt(match[1], 10);
    var minutes = match[2];
    var suffix = hours >= 12 ? 'PM' : 'AM';
    var hour12 = hours % 12;
    if (hour12 === 0) hour12 = 12;

    return minutes === '00' ? (hour12 + ' ' + suffix) : (hour12 + ':' + minutes + ' ' + suffix);
  }

  function isSunsetScheduleSlot(slot, index, slots) {
    return /sunset|p[oô]r do sol/i.test(slot.raw) || (slot.time === '18:00' && index === slots.length - 1);
  }

  function buildTourScheduleSummaryText(scheduleText, isPt) {
    var sunsetLabel = isPt ? 'Pôr do Sol' : 'Sunset Tour';
    var slots = extractScheduleSlots(scheduleText);

    if (slots.length === 0) {
      slots = getDefaultScheduleSlots();
    }

    return slots.map(function(slot, index) {
      var timeLabel = formatScheduleTime(slot.time, isPt);
      if (isSunsetScheduleSlot(slot, index, slots)) {
        return timeLabel + ' - ' + sunsetLabel;
      }
      return timeLabel;
    }).join(' | ');
  }

  function buildTourBeachStopNotice(scheduleText, isPt) {
    var slots = extractScheduleSlots(scheduleText);

    if (slots.length === 0) {
      slots = getDefaultScheduleSlots();
    }

    var sunsetSlot = null;
    slots.forEach(function(slot, index) {
      if (!sunsetSlot && isSunsetScheduleSlot(slot, index, slots)) {
        sunsetSlot = slot;
      }
    });

    if (!sunsetSlot) {
      sunsetSlot = slots[slots.length - 1];
    }

    var timeLabel = formatScheduleTime(sunsetSlot.time, isPt);
    return isPt
      ? 'O tour das ' + timeLabel + ' é o Pôr do Sol e não inclui paragem na praia.'
      : 'The ' + timeLabel + ' departure is the Sunset Tour and does not include a beach stop.';
  }

  function buildTourSnorkelText(scheduleText, isPt) {
    var base = isPt
      ? 'Nos tours com paragem na praia, temos máscaras de snorkel para quem quiser aproveitar a paragem e entrar um pouco na água.'
      : 'On tours with a beach stop, we have snorkel masks available for anyone who wants to make the most of the stop and get in the water.';

    return base + ' ' + buildTourBeachStopNotice(scheduleText, isPt);
  }

  function buildTourScheduleHtml(scheduleText, isPt) {
    var label = isPt ? 'Horários' : 'Times';
    var sunsetLabel = isPt ? 'Pôr do Sol' : 'Sunset Tour';
    var slots = extractScheduleSlots(scheduleText);

    if (slots.length === 0) {
      slots = getDefaultScheduleSlots();
    }

    var rendered = slots.map(function(slot, index) {
      var timeLabel = formatScheduleTime(slot.time, isPt);
      var isSunset = isSunsetScheduleSlot(slot, index, slots);
      if (isSunset) {
        return '<span class="tour-schedule-sunset">' + esc(timeLabel) + ' &ndash; ' + esc(sunsetLabel) + '</span>';
      }
      return esc(timeLabel);
    }).join(' <span class="tour-schedule-separator">|</span> ');

    return '<span class="tour-schedule-label">' + label + '</span><span class="tour-schedule-times">' + rendered + '</span>';
  }

  if (typeof SiteData !== 'undefined') {
    SiteData.loadFromServer(function() {
      applySiteData();
    });
  }

  function applySiteData() {
    var d = SiteData.load();
    var lang = localStorage.getItem('lang_preference') || 'pt';
    var isPt = (lang === 'pt');
    function safeBr(s) { if (!s) return ''; return esc(s).replace(/&lt;br\s*\/?&gt;/gi, '<br>'); }
    function safeUrl(s) { if (!s) return ''; return /^https?:\/\//i.test(s) ? esc(s) : ''; }
    function ratingToStars(n) { var full = Math.floor(n); var half = (n - full) >= 0.3; var s = ''; for (var i = 0; i < full; i++) s += '★'; if (half) s += '★'; return s || '★★★★★'; }
    // Apply logo from settings
    var logoUrl = d.settings.logoUrl || 'images/logo.png';
    document.querySelectorAll('.logo img, .footer-logo img, .preloader-logo, .login-logo img, .sidebar-brand img').forEach(function(img) {
      if (img.src.indexOf('logo') > -1 || img.classList.contains('preloader-logo')) {
        img.src = logoUrl;
      }
    });
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
        item.querySelector('span').innerHTML = esc(d.contact.address).replace(',', ',<br>');
      } else if (icon.classList.contains('fa-phone')) {
        item.querySelector('span').innerHTML = '<a href="tel:+' + esc(d.contact.phoneRaw) + '">' + esc(d.contact.phone) + '</a>';
      } else if (icon.classList.contains('fa-envelope')) {
        item.querySelector('span').innerHTML = '<a href="mailto:' + esc(d.contact.email) + '">' + esc(d.contact.email) + '</a>';
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
      if (heroTitle) heroTitle.innerHTML = safeBr(isPt ? d.homepage.heroTitlePt : d.homepage.heroTitleEn);
      var heroSub = heroEl.querySelector('[data-i18n="hero_subtitle"]');
      if (heroSub) heroSub.innerHTML = safeBr(isPt ? d.homepage.heroSubPt : d.homepage.heroSubEn);
      var slides = heroEl.querySelectorAll('.hero-slide');
      var imgs = d.homepage.heroImages || [];
      if (imgs.length > 0) {
        var indicators = heroEl.querySelector('.hero-indicators');
        slides.forEach(function(s) { s.remove(); });
        var heroContent = heroEl.querySelector('.hero-content') || heroEl.querySelector('.container');
        imgs.forEach(function(url, i) {
          var div = document.createElement('div');
          div.className = 'hero-slide' + (i === 0 ? ' active' : '');
          div.innerHTML = '<img src="' + esc(url) + '" alt="Kayak Adventures Lagos" class="hero-slide-bg"><div class="hero-overlay"></div>';
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
      if (tourPrice) tourPrice.innerHTML = '€' + esc(String(d.tour.price)) + ' <small data-i18n="tour_price_per">' + (isPt ? '/ pessoa' : '/ person') + '</small>';
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
        function renderTestimonials(allReviews) {
          // Filter to 4+ stars only
          var filtered = allReviews.filter(function(t) { return t.rating >= 4; });
          if (filtered.length === 0) filtered = allReviews;
          testSlider.innerHTML = '';
          filtered.forEach(function(t, i) {
            var stars = '';
            for (var s = 0; s < t.rating; s++) stars += '<i class="fas fa-star"></i>';
            var initials = t.name.split(' ').map(function(w) { return w[0]; }).join('').toUpperCase().substring(0, 2);
            var text = isPt ? (t.textPt || t.text || '') : (t.textEn || t.text || '');
            var srcIcon = { tripadvisor: 'fab fa-tripadvisor', google: 'fab fa-google', facebook: 'fab fa-facebook-f' };
            var srcColor = { tripadvisor: '#00AF87', google: '#4285F4', facebook: '#1877F2' };
            var srcName = t.source ? t.source.charAt(0).toUpperCase() + t.source.slice(1) : '';
            var badge = t.source && t.source !== 'direct' ? '<span style="font-size:.7rem;color:' + (srcColor[t.source] || '#6b7280') + ';margin-top:4px;display:flex;align-items:center;gap:4px;"><i class="' + (srcIcon[t.source] || 'fas fa-comment') + '"></i> ' + esc(srcName) + (t.source === 'tripadvisor' ? ' <i class="fas fa-check-circle" style="font-size:.6rem"></i>' : '') + '</span>' : '';
            var card = document.createElement('div');
            card.className = 'testimonial-card' + (i === 0 ? ' active' : '');
            card.innerHTML = '<div class="testimonial-stars">' + stars + '</div>' +
              '<p class="testimonial-text">' + esc(text) + '</p>' +
              '<div class="testimonial-author">' +
              '<div class="testimonial-avatar"' + (t.source === 'tripadvisor' ? ' style="background:#00AF87"' : '') + '>' + esc(initials) + '</div>' +
              '<div class="testimonial-author-info"><h4>' + esc(t.name) + '</h4><span>' + esc(t.location || '') + '</span>' + badge + '</div></div>';
            testSlider.appendChild(card);
          });
          var testNav = document.querySelector('.testimonials-nav');
          if (testNav) {
            testNav.innerHTML = '';
            filtered.forEach(function(t, i) {
              var btn = document.createElement('button');
              if (i === 0) btn.classList.add('active');
              btn.dataset.testimonial = i;
              testNav.appendChild(btn);
            });
          }
          if (d.tripadvisorWidget.enabled && d.tripadvisorWidget.url) {
            var taUrl = d.tripadvisorWidget.url;
            if (/^https?:\/\//i.test(taUrl)) {
              var existingTaLink = testSlider.parentNode.querySelector('.ta-link-btn');
              if (existingTaLink) existingTaLink.remove();
              var taLink = document.createElement('div');
              taLink.className = 'ta-link-btn';
              taLink.style.cssText = 'text-align:center;margin-top:20px;';
              taLink.innerHTML = '<a href="' + esc(taUrl) + '" target="_blank" rel="noopener" class="btn btn-outline btn-sm" style="border-color:#00AF87;color:#00AF87;"><i class="fab fa-tripadvisor"></i> Ver no TripAdvisor</a>';
              testSlider.parentNode.insertBefore(taLink, testNav);
            }
          }
          reinitTestimonials();
        }

        // Try loading TripAdvisor reviews from API, merge with manual testimonials
        var manualReviews = d.testimonials.slice();
        try {
          var xhr = new XMLHttpRequest();
          xhr.open('GET', '/api/reviews.php?min_stars=4', true);
          xhr.timeout = 5000;
          xhr.onreadystatechange = function() {
            if (xhr.readyState === 4) {
              var taReviews = [];
              if (xhr.status === 200) {
                try {
                  var resp = JSON.parse(xhr.responseText);
                  if (resp.reviews && resp.reviews.length > 0) {
                    taReviews = resp.reviews.map(function(r) {
                      return { name: r.name, rating: r.rating, textPt: r.text, textEn: r.text, text: r.text, source: 'tripadvisor', location: r.location || '' };
                    });
                  }
                } catch(e) {}
              }
              // Merge: TA reviews first, then manual (avoid duplicates by name)
              var names = {};
              var merged = [];
              taReviews.forEach(function(r) { if (!names[r.name]) { names[r.name] = true; merged.push(r); } });
              manualReviews.forEach(function(r) { if (!names[r.name]) { names[r.name] = true; merged.push(r); } });
              if (merged.length === 0) merged = manualReviews;
              renderTestimonials(merged);
            }
          };
          xhr.ontimeout = function() { renderTestimonials(manualReviews); };
          xhr.send();
        } catch(e) {
          renderTestimonials(manualReviews);
        }
      }
    }
    var tourSidebar = document.querySelector('.tour-sidebar');
    if (tourSidebar) {
      var details = tourSidebar.querySelectorAll('.tour-sidebar-detail');
      details.forEach(function(det) {
        var icon = det.querySelector('i');
        var span = det.querySelector('span');
        if (!icon || !span) return;
        if (icon.classList.contains('fa-clock')) span.innerHTML = '<strong>' + (isPt ? 'Duração:' : 'Duration:') + '</strong> ' + esc(isPt ? d.tour.duration : d.tour.durationEn);
        if (icon.classList.contains('fa-map-marker-alt')) span.innerHTML = '<strong>' + (isPt ? 'Ponto de encontro:' : 'Meeting point:') + '</strong> ' + esc(isPt ? d.tour.meetingPt : d.tour.meetingEn);
        if (icon.classList.contains('fa-users')) span.innerHTML = '<strong>' + (isPt ? 'Grupo:' : 'Group:') + '</strong> ' + (isPt ? 'Máx. ' : 'Max. ') + esc(String(d.tour.maxGroup)) + (isPt ? ' pessoas' : ' people');
        if (icon.classList.contains('fa-signal')) span.innerHTML = '<strong>' + (isPt ? 'Nível:' : 'Level:') + '</strong> ' + esc(isPt ? d.tour.levelPt : d.tour.levelEn);
        if (icon.classList.contains('fa-child')) span.innerHTML = '<strong>' + (isPt ? 'Idade mínima:' : 'Min. age:') + '</strong> ' + esc(String(d.tour.minAge)) + (isPt ? ' anos' : ' years');
        if (icon.classList.contains('fa-language')) span.innerHTML = '<strong>' + (isPt ? 'Idiomas:' : 'Languages:') + '</strong> ' + esc(d.tour.languages);
        if (icon.classList.contains('fa-calendar-alt')) span.innerHTML = '<strong>' + (isPt ? 'Época:' : 'Season:') + '</strong> ' + esc(isPt ? d.tour.season : (d.tour.seasonEn || d.tour.season));
      });
      var sPrice = tourSidebar.querySelector('.tour-price');
      if (sPrice) sPrice.innerHTML = '€' + esc(String(d.tour.price)) + ' <small data-i18n="tour_price_per">' + (isPt ? '/ pessoa' : '/ person') + '</small>';
      var sSchedule = tourSidebar.querySelector('[data-i18n="tour_sidebar_schedule"]');
      if (sSchedule) sSchedule.innerHTML = buildTourScheduleHtml(d.tour.schedules, isPt);
    }
    // Apply tour description from admin to tour page
    var tourDesc = isPt ? d.tour.descPt : d.tour.descEn;
    if (tourDesc) {
      var desc1 = document.querySelector('[data-i18n="tour_desc1"]');
      if (desc1) desc1.textContent = tourDesc;
      var desc2 = document.querySelector('[data-i18n="tour_desc2"]');
      if (desc2) desc2.style.display = 'none';
      var desc3 = document.querySelector('[data-i18n="tour_desc3"]');
      if (desc3) desc3.style.display = 'none';
    }
    var snorkelText = document.querySelector('[data-i18n="tour_snorkel_text"]');
    if (snorkelText) snorkelText.textContent = buildTourSnorkelText(d.tour.schedules, isPt);
    var step4Text = document.querySelector('[data-i18n="tour_step4_text"]');
    if (step4Text) {
      var step4Base = isPt
        ? 'Paramos numa praia para um mergulho e snorkelling leve, com máscaras de snorkel incluídas nos tours com paragem na praia, antes de regressar ao ponto de partida. Nas águas claras de Lagos, junto às rochas douradas da Ponta da Piedade, este é um dos momentos favoritos dos nossos clientes.'
        : 'We stop at a beach for a quick swim and light snorkelling. Snorkel masks are included on tours with a beach stop before we return to the starting point. In Lagos\' clear waters, framed by the golden rock formations of Ponta da Piedade, this is one of our guests\' favourite moments.';
      step4Text.textContent = step4Base + ' ' + (isPt ? 'Nota: ' : 'Note: ') + buildTourBeachStopNotice(d.tour.schedules, isPt);
    }
    // Apply tour name to tour page title
    var tourPageTitle = document.querySelector('[data-i18n="tour_page_title"]');
    if (tourPageTitle) tourPageTitle.textContent = isPt ? d.tour.namePt : d.tour.nameEn;
    var aboutImg = document.querySelector('.about-image img');
    if (aboutImg && d.about.image) {
      aboutImg.src = d.about.image;
    }
    // Apply about story text from admin
    var aboutStory1 = document.querySelector('[data-i18n="about_story1"]');
    if (aboutStory1 && d.about.storyPt) {
      aboutStory1.textContent = isPt ? d.about.storyPt : (d.about.storyEn || d.about.storyPt);
      // Hide paragraphs 2 & 3 when admin provides a complete story
      var s2 = document.querySelector('[data-i18n="about_story2"]');
      var s3 = document.querySelector('[data-i18n="about_story3"]');
      if (s2) s2.style.display = 'none';
      if (s3) s3.style.display = 'none';
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
        card.innerHTML = '<div class="team-card-img"><img src="' + esc(normalizeMediaUrl(m.image, 'image')) + '" alt="' + esc(m.name) + '" loading="lazy"></div>' +
          '<div class="team-card-info"><h3>' + esc(m.name) + '</h3><span>' + esc(isPt ? m.rolePt : m.roleEn) + '</span></div>';
        teamGrid.appendChild(card);
      });
    }
    var galGrid = document.getElementById('galleryGrid');
    if (galGrid && d.gallery.length > 0) {
      galGrid.innerHTML = '';
      d.gallery.forEach(function(img) {
        var imageUrl = normalizeMediaUrl(img.url, 'image');
        if (!imageUrl) return;

        var div = document.createElement('div');
        div.className = 'gallery-page-item fade-in visible';
        div.dataset.category = img.category;
        div.innerHTML = '<img src="' + esc(imageUrl) + '" alt="' + esc(isPt ? img.captionPt : img.captionEn) + '" loading="lazy">';
        galGrid.appendChild(div);
        applyImageSourceCandidates(div.querySelector('img'), img.url);
      });
      bindGalleryFilters(galGrid);
      refreshGalleryLightbox(galGrid);
    }
    var galleryVideosSection = document.getElementById('galleryVideosSection');
    var galleryVideoGrid = document.getElementById('galleryVideoGrid');
    if (galleryVideosSection && galleryVideoGrid) {
      galleryVideoGrid.innerHTML = '';
      galleryVideosSection.hidden = true;

      (Array.isArray(d.galleryVideos) ? d.galleryVideos : []).forEach(function(video) {
        if (!video || !video.url || !looksLikeVideoUrl(video.url)) return;

        var title = isPt ? (video.titlePt || video.titleEn) : (video.titleEn || video.titlePt);
        var poster = normalizeMediaUrl(video.poster, 'image');
        var fallbackTitle = title || (isPt ? 'Momento do tour' : 'Tour moment');
        var card = document.createElement('article');
        card.className = 'gallery-video-card fade-in visible';
        card.innerHTML = '<div class="gallery-video-media" data-open-video-media role="button" tabindex="0" aria-label="' + esc((isPt ? 'Abrir vídeo: ' : 'Open video: ') + fallbackTitle) + '"><video' + (poster ? ' poster="' + esc(poster) + '"' : '') + '></video><span class="gallery-video-media-icon" aria-hidden="true"><i class="fas fa-play"></i></span></div>' +
          '<div class="gallery-video-body"><span class="gallery-video-tag"><i class="fas fa-play"></i> ' + esc(isPt ? 'Vídeo' : 'Video') + '</span><h3>' + esc(fallbackTitle) + '</h3><button type="button" class="btn btn-outline btn-sm gallery-video-action" data-open-video>' + (isPt ? '<i class="fas fa-expand"></i> Abrir player' : '<i class="fas fa-expand"></i> Open player') + '</button></div>';
        galleryVideoGrid.appendChild(card);

        var inlineVideo = card.querySelector('video');
        configureInlineVideoPlayer(inlineVideo);
        bindVideoLightboxTrigger(card.querySelector('[data-open-video-media]'), video, isPt);
        var openBtn = card.querySelector('[data-open-video]');
        bindVideoLightboxTrigger(openBtn, video, isPt);

        applyVideoSourceCandidates(inlineVideo, video.url, function() {
          card.classList.add('is-ready');
          galleryVideosSection.hidden = false;
        }, function() {
          card.remove();
        });
      });
    }
    var homeGal = document.getElementById('homeGalleryGrid');
    if (homeGal && d.gallery.length > 0) {
      homeGal.innerHTML = '';
      var maxItems = Math.min(d.gallery.length, 5);
      for (var gi = 0; gi < maxItems; gi++) {
        var gImg = d.gallery[gi];
        var thumbUrl = normalizeMediaUrl(gImg.url, 'image');
        if (!thumbUrl) continue;

        var gDiv = document.createElement('div');
        gDiv.className = 'gallery-item';
        gDiv.innerHTML = '<img src="' + esc(thumbUrl) + '" alt="' + esc(isPt ? gImg.captionPt : gImg.captionEn) + '" loading="lazy">' +
          '<div class="gallery-item-overlay"><span>' + esc(isPt ? gImg.captionPt : gImg.captionEn) + '</span></div>';
        homeGal.appendChild(gDiv);
        applyImageSourceCandidates(gDiv.querySelector('img'), gImg.url);
      }
    }
    var homeVideoWrap = document.getElementById('homeGalleryVideos');
    var homeVideoGrid = document.getElementById('homeGalleryVideoGrid');
    if (homeVideoWrap && homeVideoGrid) {
      homeVideoGrid.innerHTML = '';
      homeVideoWrap.hidden = true;

      (Array.isArray(d.galleryVideos) ? d.galleryVideos : []).filter(function(video) {
        return !!(video && video.url && looksLikeVideoUrl(video.url));
      }).slice(0, 2).forEach(function(video) {
        var title = isPt ? (video.titlePt || video.titleEn) : (video.titleEn || video.titlePt);
        var poster = normalizeMediaUrl(video.poster, 'image');
        var fallbackTitle = title || (isPt ? 'Momento do tour' : 'Tour moment');
        var card = document.createElement('article');
        card.className = 'gallery-video-card home-gallery-video-card fade-in visible';
        card.innerHTML = '<div class="gallery-video-media" data-open-video-media role="button" tabindex="0" aria-label="' + esc((isPt ? 'Abrir vídeo: ' : 'Open video: ') + fallbackTitle) + '"><video' + (poster ? ' poster="' + esc(poster) + '"' : '') + '></video><span class="gallery-video-media-icon" aria-hidden="true"><i class="fas fa-play"></i></span></div>' +
          '<div class="gallery-video-body"><span class="gallery-video-tag"><i class="fas fa-play"></i> ' + esc(isPt ? 'Vídeo' : 'Video') + '</span><h3>' + esc(fallbackTitle) + '</h3><button type="button" class="btn btn-outline btn-sm gallery-video-action" data-open-video>' + (isPt ? '<i class="fas fa-expand"></i> Abrir player' : '<i class="fas fa-expand"></i> Open player') + '</button></div>';
        homeVideoGrid.appendChild(card);

        var inlineVideo = card.querySelector('video');
        configureInlineVideoPlayer(inlineVideo);
        bindVideoLightboxTrigger(card.querySelector('[data-open-video-media]'), video, isPt);
        var openBtn = card.querySelector('[data-open-video]');
        bindVideoLightboxTrigger(openBtn, video, isPt);

        applyVideoSourceCandidates(inlineVideo, video.url, function() {
          card.classList.add('is-ready');
          homeVideoWrap.hidden = false;
        }, function() {
          card.remove();
        });
      });
    }
    var trustBar = document.getElementById('trustBar');
    if (trustBar) {
      var trustItems = trustBar.querySelectorAll('.trust-item');
      var taRating = d.about.ratingTripadvisor || d.about.statRating || '5.0';
      var gRating = d.about.ratingGoogle || d.about.statRating || '4.9';
      var gCount = d.about.googleReviewCount || d.about.statClients || 500;
      function updateTrustBar(ta, gr, gc) {
        if (trustItems[0]) {
          var taInfo = trustItems[0].querySelector('.trust-item-info strong');
          if (taInfo) taInfo.textContent = ta + ' TripAdvisor';
          var taStars = trustItems[0].querySelector('.trust-stars');
          if (taStars) taStars.textContent = ratingToStars(parseFloat(ta));
        }
        if (trustItems[1]) {
          var gInfo = trustItems[1].querySelector('.trust-item-info strong');
          if (gInfo) gInfo.textContent = gr + ' Google';
          var gStars = trustItems[1].querySelector('.trust-stars');
          if (gStars) gStars.textContent = ratingToStars(parseFloat(gr));
          var gSub = trustItems[1].querySelector('.trust-item-info span:last-child');
          if (gSub) gSub.textContent = (isPt ? 'Baseado em ' : 'Based on ') + gc + '+ reviews';
        }
      }
      updateTrustBar(taRating, gRating, gCount);
      // Try live ratings (cached 24h server-side)
      var rxhr = new XMLHttpRequest();
      rxhr.open('GET', '/api/ratings.php', true);
      rxhr.timeout = 5000;
      rxhr.onreadystatechange = function() {
        if (rxhr.readyState === 4 && rxhr.status === 200) {
          try {
            var r = JSON.parse(rxhr.responseText);
            if (r.google && r.google.rating) { gRating = r.google.rating; gCount = r.google.reviewCount || gCount; }
            if (r.tripadvisor && r.tripadvisor.rating) { taRating = r.tripadvisor.rating; }
            updateTrustBar(taRating, gRating, gCount);
          } catch(e) {}
        }
      };
      rxhr.send();
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
        // Update LocalBusiness / TouristAttraction
        var isLocalBusiness = (Array.isArray(ld['@type']) && ld['@type'].indexOf('LocalBusiness') > -1) || ld['@type'] === 'TouristAttraction';
        if (isLocalBusiness) {
          if (ld.telephone) ld.telephone = d.contact.phoneRaw || d.contact.phone;
          if (ld.email) ld.email = d.contact.email;
          if (ld.address) {
            ld.address.streetAddress = d.contact.address.split(',')[0] || d.contact.address;
          }
          // Update sameAs with social links
          var sameAs = [];
          if (d.social.facebook) sameAs.push(d.social.facebook);
          if (d.social.instagram) sameAs.push(d.social.instagram);
          if (d.social.tripadvisor) sameAs.push(d.social.tripadvisor);
          if (d.social.youtube) sameAs.push(d.social.youtube);
          if (d.social.google) sameAs.push(d.social.google);
          if (sameAs.length > 0) ld.sameAs = sameAs;
        }
        // Update Product schema
        if (ld['@type'] === 'Product') {
          ld.name = (isPt ? d.tour.namePt : d.tour.nameEn) + ' - Lagos';
          if (ld.offers) ld.offers.price = String(d.tour.price);
        }
        // Update all aggregateRatings
        if (ld.aggregateRating) {
          ld.aggregateRating.ratingValue = String(d.about.statRating);
          ld.aggregateRating.reviewCount = String(d.about.statClients);
        }
        ldScript.textContent = JSON.stringify(ld);
      } catch(e) {}
    });
    var pageHero = document.querySelector('.page-hero');
    if (pageHero && d.homepage.heroImages && d.homepage.heroImages.length > 0) {
      var randHero = d.homepage.heroImages[Math.floor(Math.random() * d.homepage.heroImages.length)];
      pageHero.style.backgroundImage = "url('" + randHero.replace(/['"()\\]/g, '') + "')";
    }
    var tourMainImg = document.querySelector('.tour-main-image img');
    if (tourMainImg && d.about.image) {
      tourMainImg.src = d.about.image;
    }
    var tourPreviewImg = document.querySelector('#tour-preview .tour-image img');
    if (tourPreviewImg && d.about.image) {
      tourPreviewImg.src = d.about.image;
    }
    var ctaSections = document.querySelectorAll('.cta-section');
    ctaSections.forEach(function(cta) {
      if (d.homepage.heroImages && d.homepage.heroImages.length > 0) {
        var randCta = d.homepage.heroImages[Math.floor(Math.random() * d.homepage.heroImages.length)];
        cta.style.backgroundImage = "url('" + randCta.replace(/['"()\\]/g, '') + "')";
      }
    });
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
          faqList.querySelectorAll('.faq-item').forEach(function(fi) {
            fi.classList.remove('active');
            var ans = fi.querySelector('.faq-answer');
            if (ans) ans.style.maxHeight = null;
          });
          if (!wasActive) {
            item.classList.add('active');
            var ans = item.querySelector('.faq-answer');
            if (ans) ans.style.maxHeight = ans.scrollHeight + 'px';
          }
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
    if (mapIframe && d.contact.mapEmbed && /^https:\/\/www\.google\.com\/maps\/embed/i.test(d.contact.mapEmbed)) {
      mapIframe.src = d.contact.mapEmbed;
    }
    // Hide video section if no video URL is set, or set YouTube thumbnail
    var videoSec = document.getElementById('videoSection');
    if (videoSec) {
      var vUrl = d.homepage.videoUrl || '';
      videoSec.style.display = vUrl ? '' : 'none';
      if (vUrl) {
        var vMatch = vUrl.match(/(?:youtube\.com\/(?:watch\?v=|embed\/)|youtu\.be\/)([\w-]{11})/);
        var vId = vMatch ? vMatch[1] : (/^[\w-]{11}$/.test(vUrl) ? vUrl : '');
        if (vId) {
          var vPlaceholder = document.getElementById('videoPlaceholder');
          if (vPlaceholder) {
            vPlaceholder.style.backgroundImage = 'url(https://img.youtube.com/vi/' + vId + '/maxresdefault.jpg)';
          }
        }
      }
    }
    // Only load tracking scripts if user accepted cookies (GDPR compliance)
    var cookieConsent = localStorage.getItem('cookie_consent');
    if (cookieConsent === 'accepted') {
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
    }
    var fhShortname = (d.tour.fareharbor || d.settings.fareharbor || '').replace(/[^a-zA-Z0-9_-]/g, '');
    var bookingUrl = d.tour.bookingUrl || '';
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
    } else if (bookingUrl && /^https?:\/\//i.test(bookingUrl)) {
      // External booking URL (GetYourGuide, Viator, Bookeo, etc.)
      document.querySelectorAll('a[href*="#booking"]').forEach(function(a) {
        a.href = bookingUrl;
        a.target = '_blank';
        a.rel = 'noopener';
      });
      var fhDiv = document.getElementById('fareharbor-booking');
      if (fhDiv) {
        fhDiv.innerHTML = '<a href="' + esc(bookingUrl) + '" target="_blank" rel="noopener" class="btn btn-secondary btn-lg" style="width:100%;justify-content:center;" data-i18n="tour_book_now">' +
          '<i class="fas fa-calendar-check"></i> ' + (isPt ? 'Reservar Agora' : 'Book Now') + '</a>';
      }
    } else if (d.contact.whatsapp) {
      // Fallback: WhatsApp booking
      var waBookUrl = 'https://wa.me/' + d.contact.whatsapp + '?text=' + encodeURIComponent(isPt ? 'Olá! Gostaria de reservar o tour de kayak.' : 'Hello! I would like to book the kayak tour.');
      var fhDiv = document.getElementById('fareharbor-booking');
      if (fhDiv) {
        fhDiv.innerHTML = '<a href="' + waBookUrl + '" target="_blank" rel="noopener" class="btn btn-secondary btn-lg" style="width:100%;justify-content:center;">' +
          '<i class="fab fa-whatsapp"></i> ' + (isPt ? 'Reservar via WhatsApp' : 'Book via WhatsApp') + '</a>';
      }
    }
    // Show/hide countdown bar based on settings
    var countdownBar = document.getElementById('countdownBar');
    if (countdownBar && d.settings.showCountdown === false) {
      countdownBar.style.display = 'none';
    }
  }
  function reinitTestimonials() {
    clearInterval(testimonialInterval);
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
      try {
        var sd = SiteData.load();
        var lang = localStorage.getItem('lang_preference') || 'pt';
        var sName = stickyCta.querySelector('.tour-name');
        if (sName && sd.tour) sName.textContent = lang === 'pt' ? sd.tour.namePt : sd.tour.nameEn;
        var sPrice = stickyCta.querySelector('.sticky-cta-price');
        if (sPrice && sd.tour) sPrice.innerHTML = '€' + esc(String(sd.tour.price)) + ' <small>' + (lang === 'pt' ? '/ pessoa' : '/ person') + '</small>';
      } catch(e) {}
    }
  }
  var countdownBar = document.getElementById('countdownBar');
  if (countdownBar) {
    try {
    // Check showCountdown setting
    var showCd = true;
    if (typeof SiteData !== 'undefined') {
      var cdData = SiteData.load();
      if (cdData.settings && cdData.settings.showCountdown === false) showCd = false;
    }
    if (!showCd) {
      countdownBar.style.display = 'none';
    } else {
      function updateCountdown() {
        var now = new Date();
        var schedules = ['10:00', '13:00', '15:30', '18:00'];
        if (typeof SiteData !== 'undefined') {
          var sd = SiteData.load();
          if (sd.tour && sd.tour.schedules && sd.tour.schedules.indexOf(':') !== -1) {
            var parsed = extractScheduleSlots(sd.tour.schedules).map(function(slot) { return slot.time; });
            if (parsed.length > 0) schedules = parsed;
          }
        }
        var nextTour = null;
        for (var i = 0; i < schedules.length; i++) {
          var parts = schedules[i].trim().split(':');
          var h = parseInt(parts[0], 10); var mn = parseInt(parts[1], 10);
          if (isNaN(h) || isNaN(mn)) continue;
          var t = new Date(now);
          t.setHours(h, mn, 0, 0);
          if (t > now) { nextTour = t; break; }
        }
        if (!nextTour) {
          var parts = schedules[0].trim().split(':');
          var h0 = parseInt(parts[0], 10) || 10; var mn0 = parseInt(parts[1], 10) || 0;
          nextTour = new Date(now);
          nextTour.setDate(nextTour.getDate() + 1);
          nextTour.setHours(h0, mn0, 0, 0);
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
      // Honest CTA instead of fake spots count
      var spotsEl = document.getElementById('spotsLeft');
      var lang = localStorage.getItem('lang_preference') || 'pt';
      if (spotsEl) spotsEl.textContent = lang === 'pt' ? 'Reserve o seu lugar!' : 'Book your spot!';
    }
    } catch(e) { console.warn('Countdown error:', e); }
  }
  var proofNotif = document.getElementById('proofNotification');
  if (proofNotif) {
    var sd = typeof SiteData !== 'undefined' ? SiteData.load() : {};
    var spEnabled = sd.settings && sd.settings.socialProof !== false;
    if (!spEnabled) { proofNotif.style.display = 'none'; }
    else {
    proofNotif.style.display = '';
    // Booking simulation notifications with random delays
    var bookingNamesPt = [
      'Maria de Lisboa', 'João do Porto', 'Ana de Faro', 'Pedro de Braga',
      'Sofia de Coimbra', 'Miguel de Setúbal', 'Inês de Aveiro', 'Tiago de Viseu',
      'Emma from London', 'James from Dublin', 'Sophie from Paris', 'Hans from Berlin',
      'Marco from Rome', 'Lars from Amsterdam', 'Sarah from New York', 'Carlos de Madrid'
    ];
    var bookingTimePt = ['há 2 minutos', 'há 5 minutos', 'há 8 minutos', 'há 12 minutos', 'há 15 minutos', 'há 20 minutos', 'há 25 minutos', 'há 30 minutos'];
    var bookingTimeEn = ['2 minutes ago', '5 minutes ago', '8 minutes ago', '12 minutes ago', '15 minutes ago', '20 minutes ago', '25 minutes ago', '30 minutes ago'];
    var proofDismissed = false;

    document.getElementById('proofClose').addEventListener('click', function() {
      proofNotif.classList.remove('show');
      proofDismissed = true;
    });

    function showProofNotif() {
      if (proofDismissed) return;
      var lang = localStorage.getItem('lang_preference') || 'pt';
      var name = bookingNamesPt[Math.floor(Math.random() * bookingNamesPt.length)];
      var time = lang === 'pt' ? bookingTimePt[Math.floor(Math.random() * bookingTimePt.length)] : bookingTimeEn[Math.floor(Math.random() * bookingTimeEn.length)];
      var initials = name.split(' ').filter(function(w){ return w.length > 2; }).map(function(w){return w[0]||'';}).join('').substring(0,2).toUpperCase();
      document.getElementById('proofAvatar').textContent = initials;
      document.getElementById('proofText').textContent = name + ' ' + (lang === 'pt' ? 'reservou um tour' : 'booked a tour');
      document.getElementById('proofTime').textContent = ' ' + time;
      proofNotif.classList.add('show');
      setTimeout(function() {
        proofNotif.classList.remove('show');
      }, 5000);
    }
    // First show after random 20-40s, then random 40-90s intervals
    setTimeout(function() {
      showProofNotif();
      function scheduleNext() {
        var delay = 40000 + Math.floor(Math.random() * 50000);
        setTimeout(function() {
          showProofNotif();
          scheduleNext();
        }, delay);
      }
      scheduleNext();
    }, 20000 + Math.floor(Math.random() * 20000));
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
        'images/gallery/ponta-da-piedade.jpg',
        'images/gallery/camilo.jpg',
        'images/gallery/dona-ana.jpg',
        'images/gallery/20190924134811.jpg',
        'images/gallery/20190301123541.jpg',
        'images/gallery/20200622104606.jpg',
        'images/gallery/secluded.jpg',
        'images/gallery/20190924135001.jpg'
      ];
    }
    var allImgs = images.concat(images);
    allImgs.forEach(function(url) {
      var item = document.createElement('div');
      item.className = 'insta-strip-item';
      item.innerHTML = '<img src="' + esc(url) + '" alt="Instagram" loading="lazy"><div class="insta-strip-overlay"><i class="fab fa-instagram"></i></div>';
      instaStrip.appendChild(item);
    });
  }

});
