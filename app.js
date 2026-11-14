/**
 * AUREX - High-Performance Video Production & Creative Systems
 * Interactive Application Logic & Systems
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Mobile Menu Centered Modal Controller
  const mobileMenuBtn = document.getElementById('mobileMenuBtn');
  const mobileMenu = document.getElementById('mobileMenu');
  const menuIcon = document.getElementById('menuIcon');
  const closeIcon = document.getElementById('closeIcon');
  const modalCloseBtn = document.getElementById('modalCloseBtn');
  const mobileMenuBackdrop = document.getElementById('mobileMenuBackdrop');

  function setMenuState(open) {
    if (!mobileMenu) return;
    if (open) {
      mobileMenu.classList.remove('hidden');
      document.body.style.overflow = 'hidden';
      if (menuIcon) menuIcon.classList.add('hidden');
      if (closeIcon) closeIcon.classList.remove('hidden');
    } else {
      mobileMenu.classList.add('hidden');
      document.body.style.overflow = '';
      if (menuIcon) menuIcon.classList.remove('hidden');
      if (closeIcon) closeIcon.classList.add('hidden');
    }
  }

  let isMenuToggling = false;
  window.toggleMobileMenu = function (e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (isMenuToggling) return;
    isMenuToggling = true;
    setTimeout(() => { isMenuToggling = false; }, 200);

    if (!mobileMenu) return;
    const isOpen = !mobileMenu.classList.contains('hidden');
    setMenuState(!isOpen);
  };

  if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
      window.toggleMobileMenu(e);
    });

    if (modalCloseBtn) {
      modalCloseBtn.addEventListener('click', (e) => {
        if (e) e.stopPropagation();
        setMenuState(false);
      });
    }

    if (mobileMenuBackdrop) {
      mobileMenuBackdrop.addEventListener('click', () => setMenuState(false));
    }

    mobileMenu.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => setMenuState(false));
    });

    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && !mobileMenu.classList.contains('hidden')) {
        setMenuState(false);
      }
    });
  }

  // 1.1 Dynamic Real-Time Local Clock (XOT Studio Style)
  const localClockEl = document.getElementById('localClock');
  if (localClockEl) {
    function updateLocalClock() {
      const now = new Date();
      const h = String(now.getHours()).padStart(2, '0');
      const m = String(now.getMinutes()).padStart(2, '0');
      const s = String(now.getSeconds()).padStart(2, '0');
      localClockEl.textContent = `${h}:${m}:${s}`;
    }
    updateLocalClock();
    setInterval(updateLocalClock, 1000);
  }

  // 2. Hero Vertical Trust Ticker
  const ticker = document.getElementById('verticalSwipeTicker');
  if (ticker) {
    let currentSlide = 0;
    const totalSlides = 4;
    setInterval(() => {
      currentSlide = (currentSlide + 1) % totalSlides;
      const translateY = - (currentSlide * 44); // 44px per slide height
      ticker.style.transform = `translateY(${translateY}px)`;
    }, 3200);
  }

  // 3. Before / After Thumbnail Section (Static High-Res Showcase)


  // 4. Portfolio Category Filter Tabs
  const filterBtns = document.querySelectorAll('.tab-btn');
  const projectCards = document.querySelectorAll('.project-card-item');

  function applyCategoryFilter(filter) {
    let visibleCount = 0;
    projectCards.forEach(card => {
      const type = card.getAttribute('data-type') || 'video';
      const category = card.getAttribute('data-category') || '';
      const categories = category.split(' ');

      let shouldShow = false;
      if (filter === 'all') {
        // All Works: show all works from thumbnails, long-form videos, and short-form reels
        shouldShow = true;
      } else if (filter === 'thumbnails') {
        // High-CTR Thumbnail section
        shouldShow = (type === 'thumbnail');
      } else if (filter === 'longform') {
        // YouTube Long-Form videos only
        shouldShow = (type === 'video') && categories.includes('longform');
      } else {
        // Category filters for videos (sports, documentary, commercial)
        shouldShow = (type === 'video') && categories.includes(filter);
      }

      if (shouldShow) {
        visibleCount++;
        card.style.display = 'block';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.96)';
        setTimeout(() => {
          card.style.transition = 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)';
          card.style.opacity = '1';
          card.style.transform = 'scale(1)';
        }, 30);
      } else {
        card.style.display = 'none';
      }
    });

    const emptyState = document.getElementById('projectsEmptyState');
    if (emptyState) {
      if (visibleCount === 0) {
        emptyState.classList.remove('hidden');
        emptyState.style.display = 'flex';
      } else {
        emptyState.classList.add('hidden');
        emptyState.style.display = 'none';
      }
    }
  }

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const filter = btn.getAttribute('data-filter') || 'all';
      applyCategoryFilter(filter);
    });
  });

  // Initialize active tab on load
  const initialActiveBtn = document.querySelector('.tab-btn.active');
  if (initialActiveBtn) {
    const initFilter = initialActiveBtn.getAttribute('data-filter') || 'all';
    applyCategoryFilter(initFilter);
  }

  // 5. Fullscreen Video Modal Player (Supports YouTube Embeds & Local Videos)
  const videoModal = document.getElementById('videoModal');
  const modalVideoPlayer = document.getElementById('modalVideoPlayer');
  const modalTitle = document.getElementById('modalVideoTitle');
  const modalCategory = document.getElementById('modalVideoCategory');
  const closeVideoModalBtn = document.getElementById('closeVideoModal');
  const modalHeaderInfo = document.getElementById('modalVideoHeaderInfo');
  const modalYouTubeLink = document.getElementById('modalYouTubeLink');
  const modalChannelLink = document.getElementById('modalChannelLink');
  const modalChannelName = document.getElementById('modalChannelName');

  function extractYouTubeId(urlOrId) {
    if (!urlOrId) return null;
    if (/^[a-zA-Z0-9_-]{11}$/.test(urlOrId)) return urlOrId;
    const match = urlOrId.match(/(?:youtu\.be\/|(?:[a-zA-Z0-9-]+\.)?youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/);
    return match ? match[1] : null;
  }

  window.openVideoModal = function (videoSource, title = '', category = '', channelName = '', channelUrl = '') {
    if (!videoModal) return;

    const modalBox = videoModal.querySelector('.modal-box');
    const modalWrapper = document.getElementById('modalVideoWrapper');

    // Reset modes
    if (modalBox) modalBox.classList.remove('vertical-reel-mode');
    if (modalWrapper) {
      modalWrapper.classList.remove('aspect-[9/16]', 'max-h-[80vh]');
      modalWrapper.classList.add('aspect-video');
    }

    const isReel = Boolean(
      (videoSource && (videoSource.includes('reel') || videoSource.includes('Short') || videoSource.includes('short') || videoSource.includes('/shorts/'))) ||
      (category && (category.includes('short') || category.includes('reel') || category.includes('Vertical')))
    );

    if (isReel) {
      if (modalBox) modalBox.classList.add('vertical-reel-mode');
      if (modalWrapper) {
        modalWrapper.classList.remove('aspect-video');
        modalWrapper.classList.add('aspect-[9/16]', 'max-h-[80vh]');
      }
    }

    const ytId = extractYouTubeId(videoSource);

    if (ytId) {
      // 1. YouTube Mode: Stream directly from YouTube
      if (modalVideoPlayer) {
        modalVideoPlayer.pause();
        modalVideoPlayer.removeAttribute('src');
        modalVideoPlayer.classList.add('hidden');
      }

      let ytIframe = document.getElementById('modalYouTubePlayer');
      if (!ytIframe && modalWrapper) {
        ytIframe = document.createElement('iframe');
        ytIframe.id = 'modalYouTubePlayer';
        ytIframe.className = 'w-full h-full';
        ytIframe.setAttribute('frameborder', '0');
        ytIframe.setAttribute('allow', 'accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share');
        ytIframe.setAttribute('allowfullscreen', 'true');
        modalWrapper.appendChild(ytIframe);
      }

      if (ytIframe) {
        ytIframe.classList.remove('hidden');
        ytIframe.src = `https://www.youtube-nocookie.com/embed/${ytId}?autoplay=1&rel=0&modestbranding=1`;
      }

      if (modalHeaderInfo) {
        modalHeaderInfo.style.display = 'flex';
      }

      if (modalYouTubeLink) {
        modalYouTubeLink.href = (isReel || (videoSource && videoSource.includes('shorts')))
          ? `https://www.youtube.com/shorts/${ytId}`
          : `https://www.youtube.com/watch?v=${ytId}`;
        modalYouTubeLink.classList.remove('hidden');
        modalYouTubeLink.classList.add('inline-flex');
      }

      if (modalChannelLink) {
        modalChannelLink.classList.add('hidden');
        modalChannelLink.classList.remove('inline-flex');
      }
    } else {
      // 2. Local Video Mode (e.g. 6th video.mp4, short reels)
      const ytIframe = document.getElementById('modalYouTubePlayer');
      if (ytIframe) {
        ytIframe.src = '';
        ytIframe.classList.add('hidden');
      }

      if (modalHeaderInfo) modalHeaderInfo.style.display = 'none';
      if (modalYouTubeLink) {
        modalYouTubeLink.classList.add('hidden');
        modalYouTubeLink.classList.remove('inline-flex');
      }
      if (modalChannelLink) {
        modalChannelLink.classList.add('hidden');
        modalChannelLink.classList.remove('inline-flex');
      }

      if (modalVideoPlayer) {
        modalVideoPlayer.classList.remove('hidden');
        const isReel = Boolean(videoSource && (videoSource.includes('reel') || videoSource.includes('Short') || videoSource.includes('short')));

        if (isReel) {
          if (modalBox) modalBox.classList.add('vertical-reel-mode');
          if (modalWrapper) {
            modalWrapper.classList.remove('aspect-video');
            modalWrapper.classList.add('aspect-[9/16]', 'max-h-[80vh]');
          }
        }

        modalVideoPlayer.src = videoSource;
        modalVideoPlayer.load();

        modalVideoPlayer.onloadedmetadata = function () {
          if (modalVideoPlayer.videoHeight > modalVideoPlayer.videoWidth) {
            if (modalBox) modalBox.classList.add('vertical-reel-mode');
            if (modalWrapper) {
              modalWrapper.classList.remove('aspect-video');
              modalWrapper.classList.add('aspect-[9/16]', 'max-h-[80vh]');
            }
          }
        };

        modalVideoPlayer.play().catch(() => {});
      }
    }

    videoModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeVideoModal() {
    if (!videoModal) return;

    const ytIframe = document.getElementById('modalYouTubePlayer');
    if (ytIframe) {
      ytIframe.src = '';
      ytIframe.classList.add('hidden');
    }

    if (modalVideoPlayer) {
      modalVideoPlayer.pause();
      modalVideoPlayer.removeAttribute('src');
      modalVideoPlayer.load();
    }

    const modalBox = videoModal.querySelector('.modal-box');
    const modalWrapper = document.getElementById('modalVideoWrapper');
    if (modalBox) modalBox.classList.remove('vertical-reel-mode');
    if (modalWrapper) {
      modalWrapper.classList.remove('aspect-[9/16]', 'max-h-[80vh]');
      modalWrapper.classList.add('aspect-video');
    }

    if (modalHeaderInfo) modalHeaderInfo.style.display = 'none';
    if (modalYouTubeLink) {
      modalYouTubeLink.classList.add('hidden');
      modalYouTubeLink.classList.remove('inline-flex');
    }
    if (modalChannelLink) {
      modalChannelLink.classList.add('hidden');
      modalChannelLink.classList.remove('inline-flex');
    }

    videoModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // 3-Reel Showcase Hover Previews (Left, Center, Right)
  [
    { card: 'reelCardLeft', video: 'previewLeft' },
    { card: 'reelCardCenter', video: 'previewCenter' },
    { card: 'reelCardRight', video: 'previewRight' }
  ].forEach(({ card, video }) => {
    const cardEl = document.getElementById(card);
    const videoEl = document.getElementById(video);
    if (cardEl && videoEl) {
      cardEl.addEventListener('mouseenter', () => {
        videoEl.currentTime = 0;
        const playPromise = videoEl.play();
        if (playPromise !== undefined) {
          playPromise.then(() => {
            videoEl.style.opacity = '1';
          }).catch(() => { });
        }
      });
      cardEl.addEventListener('mouseleave', () => {
        videoEl.pause();
        videoEl.style.opacity = '0';
      });
    }
  });

  if (closeVideoModalBtn) closeVideoModalBtn.addEventListener('click', closeVideoModal);
  if (videoModal) {
    videoModal.addEventListener('click', (e) => {
      if (e.target === videoModal) closeVideoModal();
    });
  }

  // 6. Image Lightbox Modal (For High-Res Thumbnail Inspection)
  const imageModal = document.getElementById('imageModal');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const closeImageModalBtn = document.getElementById('closeImageModal');

  window.openImageModal = function (imgSrc, title = '') {
    if (!imageModal || !lightboxImg) return;
    lightboxImg.src = imgSrc;
    if (lightboxTitle) lightboxTitle.textContent = '';
    const headerInfo = document.getElementById('imageModalHeaderInfo');
    if (headerInfo) headerInfo.style.display = 'none';
    imageModal.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  function closeImageModal() {
    if (!imageModal) return;
    imageModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  if (closeImageModalBtn) closeImageModalBtn.addEventListener('click', closeImageModal);
  if (imageModal) {
    imageModal.addEventListener('click', (e) => {
      if (e.target === imageModal) closeImageModal();
    });
  }

  // Global Escape Key Listener for Modals
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeVideoModal();
      closeImageModal();
      closeLegalModal();
    }
  });

  // 7. Interactive Spotlight Cards (Mouse tracking for radial glow)
  const immersiveCards = document.querySelectorAll('.immersive-card');
  immersiveCards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty('--mouse-x', `${x}px`);
      card.style.setProperty('--mouse-y', `${y}px`);
    });
  });

  // 9. FAQ Accordion Controller
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const trigger = item.querySelector('.faq-trigger');
    const content = item.querySelector('.faq-content');
    const icon = item.querySelector('.faq-icon');

    if (trigger && content) {
      trigger.addEventListener('click', () => {
        const isOpen = content.style.maxHeight && content.style.maxHeight !== '0px';

        // Close all other items
        faqItems.forEach(otherItem => {
          const otherContent = otherItem.querySelector('.faq-content');
          const otherIcon = otherItem.querySelector('.faq-icon');
          if (otherContent) otherContent.style.maxHeight = '0px';
          if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
          otherItem.classList.remove('border-white', 'shadow-[0_0_30px_rgba(168,85,247,0.4)]');
        });

        if (!isOpen) {
          content.style.maxHeight = content.scrollHeight + 'px';
          if (icon) icon.style.transform = 'rotate(45deg)';
          item.classList.add('border-white', 'shadow-[0_0_30px_rgba(168,85,247,0.4)]');
        }
      });
    }
  });

  // ==========================================================================
  // 10. Web3Forms Live Transmission Engine & Order Form Controller
  // ==========================================================================
  // NOTE FOR DEVELOPER:
  // To receive client submissions directly in your email inbox:
  // 1. Visit https://web3forms.com (100% free, no password/signup required)
  // 2. Enter your email and click "Create Access Key"
  // 3. Paste the received access key below replacing "YOUR_ACCESS_KEY_HERE"
  const WEB3FORMS_ACCESS_KEY = "46aae5d9-193d-4353-8618-82af2c4b964d";


  const orderSection = document.getElementById('order');
  const orderScannerBeam = document.getElementById('orderScannerBeam');
  const orderForm = document.getElementById('orderFormCard');

  // Trigger beam animation when user navigates to #order
  function checkOrderHash() {
    if (window.location.hash === '#order' && orderScannerBeam) {
      orderScannerBeam.classList.remove('scanner-beam-sweep');
      void orderScannerBeam.offsetWidth; // Trigger reflow
      orderScannerBeam.classList.add('scanner-beam-sweep');
    }
  }
  window.addEventListener('hashchange', checkOrderHash);
  checkOrderHash();

  document.querySelectorAll('a[href="#order"]').forEach(btn => {
    btn.addEventListener('click', () => {
      setTimeout(() => {
        if (orderScannerBeam) {
          orderScannerBeam.classList.remove('scanner-beam-sweep');
          void orderScannerBeam.offsetWidth;
          orderScannerBeam.classList.add('scanner-beam-sweep');
        }
      }, 350);
    });
  });

  // Interactive Order Form Estimator
  if (orderForm) {
    const serviceCheckboxes = orderForm.querySelectorAll('input[name="services[]"]');
    const estimatorOutput = document.getElementById('estimatedTurnaroundBadge');

    function updateScopeFeedback() {
      const selected = Array.from(serviceCheckboxes).filter(cb => cb.checked).length;
      if (estimatorOutput) {
        if (selected === 0) {
          estimatorOutput.textContent = 'Select services to estimate scale';
        } else if (selected === 1) {
          estimatorOutput.textContent = 'Standard Turnaround: 24–48 Hours';
        } else {
          estimatorOutput.textContent = `Multi-Asset Engine: ${selected} Core Deliverables`;
        }
      }
    }

    serviceCheckboxes.forEach(cb => cb.addEventListener('change', updateScopeFeedback));

    orderForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const submitBtn = orderForm.querySelector('button[type="submit"]');
      const orderStatusToast = document.getElementById('orderStatusToast');
      const orderErrorToast = document.getElementById('orderErrorToast');
      const orderErrorMessage = document.getElementById('orderErrorMessage');
      const originalBtnHtml = submitBtn ? submitBtn.innerHTML : 'Submit Project Order ➔';

      // Hide prior alert toasts
      if (orderStatusToast) orderStatusToast.classList.add('hidden');
      if (orderErrorToast) orderErrorToast.classList.add('hidden');

      // Check if access key is still unconfigured placeholder
      if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
        console.warn("[AUREX] Web3Forms access key not configured. Obtain your free key at https://web3forms.com");
        if (orderErrorToast && orderErrorMessage) {
          orderErrorMessage.innerHTML = 'Web3Forms Access Key is not configured yet. Open <code>app.js</code> and paste your free key from <a href="https://web3forms.com" target="_blank" class="underline text-white font-bold hover:text-[#FA6352]">web3forms.com</a> into <code>WEB3FORMS_ACCESS_KEY</code>.';
          orderErrorToast.classList.remove('hidden');
          orderErrorToast.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        return;
      }

      // Enter active cyber transmitting state
      if (submitBtn) {
        submitBtn.disabled = true;
        submitBtn.classList.add('opacity-80', 'cursor-not-allowed');
        submitBtn.innerHTML = `
          <span class="inline-flex items-center gap-2">
            <svg class="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"></path>
            </svg>
            Transmitting Order via Secure Uplink...
          </span>
        `;
      }

      try {
        const formData = new FormData(orderForm);
        const clientName = (formData.get('client_name') || 'Valued Client').toString().trim();
        const clientEmail = (formData.get('client_email') || '').toString().trim();
        const contactNumber = (formData.get('contact_number') || '').toString().trim();
        const channelUrl = (formData.get('channel_url') || 'N/A').toString().trim();
        const projectDescription = (formData.get('project_description') || '').toString().trim();
        const referenceLinks = (formData.get('reference_links') || 'N/A').toString().trim();
        const botcheck = formData.get('botcheck');

        const selectedServices = Array.from(orderForm.querySelectorAll('input[name="services[]"]:checked'))
          .map(cb => cb.value);
        const servicesList = selectedServices.length > 0 ? selectedServices.join(', ') : 'None specified';

        const payload = {
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `[AUREX Order] New Project from ${clientName} (${servicesList})`,
          from_name: "AUREX Client Uplink",
          name: clientName,
          email: clientEmail,
          contact_number: contactNumber,
          channel_or_company: channelUrl,
          services_requested: servicesList,
          project_vision_and_raw_footage: projectDescription,
          footage_and_reference_links: referenceLinks
        };
        if (botcheck) payload.botcheck = botcheck;

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (orderStatusToast) {
            orderStatusToast.classList.remove('hidden');
            orderStatusToast.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
          if (submitBtn) {
            submitBtn.disabled = false;
            submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            submitBtn.classList.add('bg-emerald-500', 'border-emerald-400', 'text-white');
            submitBtn.innerHTML = `<span>✓ Order Transmitted Successfully</span>`;
            setTimeout(() => {
              submitBtn.classList.remove('bg-emerald-500', 'border-emerald-400', 'text-white');
              submitBtn.innerHTML = originalBtnHtml;
            }, 4500);
          }
          orderForm.reset();
          if (typeof updateScopeFeedback === 'function') updateScopeFeedback();
        } else {
          throw new Error(result.message || 'Transmission could not be completed.');
        }
      } catch (err) {
        console.error('[AUREX Order Error]', err);
        if (orderErrorToast && orderErrorMessage) {
          orderErrorMessage.textContent = err.message || 'Network error. Please check your connection and try again.';
          orderErrorToast.classList.remove('hidden');
          orderErrorToast.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
        if (submitBtn) {
          submitBtn.disabled = false;
          submitBtn.classList.remove('opacity-80', 'cursor-not-allowed');
          submitBtn.innerHTML = originalBtnHtml;
        }
      }
    });
  }

  // 11. Quick Pre-Footer Contact Form
  const quickForm = document.getElementById('footerDirectTouchForm');
  if (quickForm) {
    quickForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const quickBtn = document.getElementById('quickSubmitBtn');
      const statusDiv = document.getElementById('quickFormStatus');
      const originalBtnText = quickBtn ? quickBtn.innerHTML : 'Send Direct Inquiry ➔';

      if (!WEB3FORMS_ACCESS_KEY || WEB3FORMS_ACCESS_KEY === "YOUR_ACCESS_KEY_HERE") {
        console.warn("[AUREX] Web3Forms access key not configured.");
        if (statusDiv) {
          statusDiv.classList.remove('hidden');
          statusDiv.className = 'p-3 rounded-none text-xs font-bold text-center mt-3 bg-amber-500/20 border border-amber-400 text-amber-300';
          statusDiv.innerHTML = 'Web3Forms key required. Open <code>app.js</code> and configure <code>WEB3FORMS_ACCESS_KEY</code>.';
        }
        return;
      }

      const formData = new FormData(quickForm);
      const email = (formData.get('email') || '').toString().trim();
      const channelName = (formData.get('channel_name') || 'N/A').toString().trim();
      const botcheck = formData.get('botcheck');

      if (quickBtn) {
        quickBtn.disabled = true;
        quickBtn.classList.add('opacity-80', 'cursor-not-allowed');
        quickBtn.innerHTML = `<span>Transmitting Inquiry...</span>`;
      }

      try {
        const payload = {
          access_key: WEB3FORMS_ACCESS_KEY,
          subject: `[AUREX Inquiry] Quick Review Request from ${channelName || email}`,
          from_name: "AUREX Pre-Footer Uplink",
          email: email,
          channel_or_brand: channelName
        };
        if (botcheck) payload.botcheck = botcheck;

        const response = await fetch('https://api.web3forms.com/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const result = await response.json();

        if (response.ok && result.success) {
          if (statusDiv) {
            statusDiv.classList.remove('hidden');
            statusDiv.className = 'p-3 rounded-none text-xs font-bold text-center mt-3 bg-emerald-500/20 border border-emerald-400 text-emerald-300';
            statusDiv.textContent = 'Inquiry received! An AUREX creative director will contact you within 2 hours.';
          }
          if (quickBtn) {
            quickBtn.disabled = false;
            quickBtn.classList.remove('opacity-80', 'cursor-not-allowed');
            quickBtn.innerHTML = `<span>Inquiry Sent Successfully ✓</span>`;
            setTimeout(() => {
              quickBtn.innerHTML = originalBtnText;
            }, 4000);
          }
          quickForm.reset();
        } else {
          throw new Error(result.message || 'Inquiry submission failed.');
        }
      } catch (err) {
        console.error('[AUREX Quick Inquiry Error]', err);
        if (statusDiv) {
          statusDiv.classList.remove('hidden');
          statusDiv.className = 'p-3 rounded-none text-xs font-bold text-center mt-3 bg-red-500/20 border border-red-500 text-red-200';
          statusDiv.textContent = err.message || 'Transmission failed. Please check your connection and try again.';
        }
        if (quickBtn) {
          quickBtn.disabled = false;
          quickBtn.classList.remove('opacity-80', 'cursor-not-allowed');
          quickBtn.innerHTML = originalBtnText;
        }
      }
    });
  }

  // 12. Legal Modals (Privacy & Terms)
  const privacyModal = document.getElementById('privacyModal');
  const termsModal = document.getElementById('termsModal');
  const openPrivacyBtn = document.getElementById('openPrivacyModal');
  const openTermsBtn = document.getElementById('openTermsModal');
  const closePrivacyBtn = document.getElementById('closePrivacyModal');
  const closeTermsBtn = document.getElementById('closeTermsModal');

  function openLegalModal(modal) {
    if (!modal) return;
    modal.classList.remove('opacity-0', 'pointer-events-none');
    document.body.style.overflow = 'hidden';
  }

  function closeLegalModal() {
    if (privacyModal) privacyModal.classList.add('opacity-0', 'pointer-events-none');
    if (termsModal) termsModal.classList.add('opacity-0', 'pointer-events-none');
    document.body.style.overflow = '';
  }

  if (openPrivacyBtn) openPrivacyBtn.addEventListener('click', () => openLegalModal(privacyModal));
  if (openTermsBtn) openTermsBtn.addEventListener('click', () => openLegalModal(termsModal));
  if (closePrivacyBtn) closePrivacyBtn.addEventListener('click', closeLegalModal);
  if (closeTermsBtn) closeTermsBtn.addEventListener('click', closeLegalModal);

  [privacyModal, termsModal].forEach(m => {
    if (m) {
      m.addEventListener('click', (e) => {
        if (e.target === m) closeLegalModal();
      });
    }
  });

  // ==========================================================================
  // 13. Dynamic Flowing Liquid Silk WebGL Shader (Black & Dark Orange Gradient)
  // Sreedesigns.com inspired organic liquid wave physics in WebGL2
  // ==========================================================================
  function initHeroSilk() {
    const canvas = document.getElementById('heroSilkCanvas');
    if (!canvas) return;

    const gl = canvas.getContext('webgl2', { antialias: false, premultipliedAlpha: false, powerPreference: 'high-performance' });
    if (!gl) {
      console.warn('WebGL2 not supported — falling back to CSS dark orange ambient aura.');
      return null;
    }

    const vsSource = `#version 300 es
    precision highp float;
    in vec2 a_position;
    in vec2 a_texCoord;
    out vec2 v_uv;
    void main() {
      v_uv = a_texCoord;
      gl_Position = vec4(a_position, 0.0, 1.0);
    }`;

    const fsSource = `#version 300 es
    precision highp float;

    in vec2 v_uv;
    out vec4 fragColor;

    #define NUM_COLORS 8

    uniform vec4 u_colors[NUM_COLORS];
    uniform int u_colors_length;
    uniform float u_seed;
    uniform float u_speed;
    uniform float u_loop;
    uniform float u_scale;
    uniform float u_turbAmp;
    uniform float u_turbFreq;
    uniform float u_turbIter;
    uniform float u_waveFreq;
    uniform float u_distBias;
    uniform float u_jellify;
    uniform float u_ditherMode;
    uniform float u_dither;
    uniform float u_exposure;
    uniform float u_contrast;
    uniform float u_saturation;
    uniform float u_time;
    uniform vec2 u_resolution;
    uniform float u_pixelRatio;

    const float GOLDEN_ANGLE = 2.3999632;
    const float TAU = 6.28318530;

    uvec3 hash3(uvec3 v) {
      v = v * 1664525u + 1013904223u;
      v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
      v ^= v >> 16u;
      v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
      return v;
    }
    vec3 seedRandom(float s) {
      uvec3 u = uvec3(floatBitsToUint(s), floatBitsToUint(s * 1.5 + 7.31), floatBitsToUint(s * 2.7 + 13.37));
      u = hash3(u);
      return vec3(u) / float(0xFFFFFFFFu);
    }
    vec3 toLinear(vec3 c) { return pow(c, vec3(2.2)); }
    vec3 toSrgb(vec3 c)  { return pow(clamp(c, 0.0, 1.0), vec3(0.4545)); }

    vec3 linearToOklab(vec3 c) {
      float l = 0.4122214708 * c.r + 0.5363325363 * c.g + 0.0514459929 * c.b;
      float m = 0.2119034982 * c.r + 0.6806995451 * c.g + 0.1073969566 * c.b;
      float s = 0.0883024619 * c.r + 0.2817188376 * c.g + 0.6299787005 * c.b;
      l = pow(max(l, 0.0), 1.0 / 3.0);
      m = pow(max(m, 0.0), 1.0 / 3.0);
      s = pow(max(s, 0.0), 1.0 / 3.0);
      return vec3(
        0.2104542553 * l + 0.7936177850 * m - 0.0040720468 * s,
        1.9779984951 * l - 2.4285922050 * m + 0.4505937099 * s,
        0.0259040371 * l + 0.7827717662 * m - 0.8086757660 * s
      );
    }
    vec3 oklabToLinear(vec3 c) {
      float l = c.x + 0.3963377774 * c.y + 0.2158037573 * c.z;
      float m = c.x - 0.1055613458 * c.y - 0.0638541728 * c.z;
      float s = c.x - 0.0894841775 * c.y - 1.2914855480 * c.z;
      l = l * l * l; m = m * m * m; s = s * s * s;
      return vec3(
        4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
        -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
        -0.0041960863 * l - 0.7034186147 * m + 1.7076147010 * s
      );
    }
    vec3 oklabToLch(vec3 lab) { return vec3(lab.x, length(lab.yz), atan(lab.z, lab.y)); }
    vec3 lchToOklab(vec3 lch) { return vec3(lch.x, lch.y * cos(lch.z), lch.y * sin(lch.z)); }
    vec3 mixLch(vec3 lab0, vec3 lab1, float t) {
      vec3 lch0 = oklabToLch(lab0);
      vec3 lch1 = oklabToLch(lab1);
      if (lch0.y < 0.05) lch0.z = lch1.z;
      if (lch1.y < 0.05) lch1.z = lch0.z;
      float dh = lch1.z - lch0.z;
      if (dh > 3.14159265) dh -= 6.28318530;
      if (dh < -3.14159265) dh += 6.28318530;
      return lchToOklab(vec3(mix(lch0.x, lch1.x, t), mix(lch0.y, lch1.y, t), lch0.z + dh * t));
    }

    vec3 getColor(int idx) {
      if (u_colors_length < 1) return vec3(0.0);
      int safeIdx = clamp(idx, 0, u_colors_length - 1);
      return u_colors[safeIdx].rgb;
    }
    vec3 paletteN(float t, int count) {
      if (count < 1) return vec3(0.0);
      if (count < 2) return toLinear(getColor(0));
      float seg = 1.0 / float(count - 1);
      t = clamp(t, 0.0, 1.0);
      int idx = min(int(floor(t / seg)), count - 2);
      float localT = clamp((t - float(idx) * seg) / seg, 0.0, 1.0);
      vec3 lab0 = linearToOklab(toLinear(getColor(idx)));
      vec3 lab1 = linearToOklab(toLinear(getColor(idx + 1)));
      return oklabToLinear(mixLch(lab0, lab1, localT));
    }

    vec3 softGamutMap(vec3 c) {
      float maxC = max(c.r, max(c.g, c.b));
      float minC = min(c.r, min(c.g, c.b));
      if (minC >= 0.0 && maxC <= 1.0) return c;
      vec3 lab = linearToOklab(max(c, 0.0));
      float L = clamp(lab.x, 0.0, 1.0);
      float C = length(lab.yz);
      float h = atan(lab.z, lab.y);
      float maxChroma = 0.4 * (1.0 - pow(abs(2.0 * L - 1.0), 2.0));
      if (C > maxChroma * 0.7) {
        float knee = maxChroma * 0.7;
        C = knee + (maxChroma - knee) * tanh((C - knee) / (maxChroma - knee + 0.001));
      }
      return clamp(oklabToLinear(vec3(L, C * cos(h), C * sin(h))), 0.0, 1.0);
    }
    vec3 applyContrastSaturation(vec3 c, float contrast, float saturation) {
      vec3 lab = linearToOklab(c);
      float C = length(lab.yz);
      float h = atan(lab.z, lab.y);
      lab.x = clamp((lab.x - 0.5) * contrast + 0.5, 0.0, 1.0);
      C *= saturation;
      lab.y = C * cos(h);
      lab.z = C * sin(h);
      return oklabToLinear(lab);
    }

    void main() {
      vec2 fragCoord = v_uv * u_resolution;
      vec2 r = u_resolution;
      vec2 p = (fragCoord * 2.0 - r) / r.y;

      int colorCount = u_colors_length;
      if (colorCount < 1) { fragColor = vec4(0.0, 0.0, 0.0, 1.0); return; }

      float t = u_time * 0.3;

      float looping = step(0.5, u_loop);
      float phase = TAU * u_time / max(u_loop, 0.01);
      float radius = u_loop * u_speed * 0.3 / TAU;
      float tA = sin(phase) * radius;
      float tB = (1.0 - cos(phase)) * radius;

      vec3 seedOffset  = seedRandom(u_seed);
      vec3 seedOffset2 = seedRandom(u_seed + 100.0);

      float seedAngle = u_seed * GOLDEN_ANGLE;
      vec2 seedPhase = (seedOffset2.xy - 0.5) * TAU;

      float cs = cos(seedAngle);
      float sn = sin(seedAngle);
      p = mat2(cs, -sn, sn, cs) * p;

      float totalVal = 0.0;
      float totalWeight = 0.0;
      int turbIter = int(u_turbIter);
      float freq = 1.0 / max(u_turbFreq, 0.01);

      for (float i = 0.0; i < 4.0; i++) {
        float eph = i / 4.0;
        vec2 q = p * u_scale;
        float sq = eph * eph;
        if (u_jellify > 0.5) q.yx *= mix(1.0, 0.5, 1.0 - exp(-sq));

        float a = seedPhase.x;
        float d = seedPhase.y;
        for (int j = 2; j < 13; j++) {
          if (j >= turbIter) break;
          float fj = float(j);
          float t1 = mix(t * u_speed, tA, looping);
          float t2 = mix(t * u_speed, tB, looping);
          q += u_turbAmp * sin(q.yx / freq * fj + t1 + vec2(a, d) + seedOffset.xy * fj) / fj;
          a += cos(fj + d * 1.2 + q.x * 2.0 - t1 + seedOffset2.z + t2 * 0.3 * looping);
          d += sin(fj * q.y + a + seedOffset.z + t1 + seedOffset2.y + t2 * 0.3 * looping);
        }
        float v = 0.5 + 0.5 * sin(length(q.yx + vec2(a, d) * 0.2) * u_waveFreq + i * i + seedOffset.x);
        float weight = smoothstep(0.0, 0.5, eph) * smoothstep(1.0, 0.5, eph);
        totalVal += v * weight;
        totalWeight += weight;
      }

      float val = totalVal / totalWeight;
      val = clamp((val - 0.3) / 0.4, 0.0, 1.0);
      val = pow(val, exp(-u_distBias));
      val = clamp(val, 0.0, 1.0);

      // Silk base interpolation in Oklab space
      vec3 col = paletteN(val, colorCount);
      col *= u_exposure;
      col = applyContrastSaturation(col, u_contrast, u_saturation);
      col = softGamutMap(col);
      col = toSrgb(col);

      // Liquid sheen — soft warm specular pooling on wave peaks
      float sheen = smoothstep(0.40, 0.96, val);
      col = 1.0 - (1.0 - col) * (1.0 - vec3(1.0, 0.65, 0.35) * sheen * 0.18);

      // Warm glint travelling across the folds
      float foldSpec = pow(smoothstep(0.48, 1.0, val), 2.4);
      float sweepPos = mix(-0.35, 1.35, fract(u_time / 14.0));
      float sweepBand = exp(-pow((v_uv.x + (1.0 - v_uv.y) * 0.3 - sweepPos) * 3.5, 2.0));
      float glint = foldSpec * (0.12 + 0.45 * sweepBand);
      col = 1.0 - (1.0 - col) * (1.0 - vec3(1.0, 0.55, 0.25) * glint);

      // Soft atmospheric dusk transition towards the top
      col = mix(col, vec3(0.02, 0.008, 0.004), smoothstep(0.50, 1.0, v_uv.y) * 0.14);

      fragColor = vec4(col, 1.0);
    }`;

    function compileShader(type, src) {
      const shader = gl.createShader(type);
      gl.shaderSource(shader, src);
      gl.compileShader(shader);
      if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        const info = gl.getShaderInfoLog(shader);
        gl.deleteShader(shader);
        throw new Error('Shader compilation failed: ' + info);
      }
      return shader;
    }

    let program;
    try {
      const vs = compileShader(gl.VERTEX_SHADER, vsSource);
      const fs = compileShader(gl.FRAGMENT_SHADER, fsSource);
      program = gl.createProgram();
      gl.attachShader(program, vs);
      gl.attachShader(program, fs);
      gl.linkProgram(program);
      if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
        throw new Error('Program link error: ' + gl.getProgramInfoLog(program));
      }
    } catch (err) {
      console.warn('Hero silk WebGL compilation failed:', err);
      return null;
    }

    gl.useProgram(program);

    // Quad geometry (covers entire canvas)
    const buffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      new Float32Array([
        -1, -1, 0, 0,
        1, -1, 1, 0,
        -1, 1, 0, 1,
        -1, 1, 0, 1,
        1, -1, 1, 0,
        1, 1, 1, 1
      ]),
      gl.STATIC_DRAW
    );

    const aPos = gl.getAttribLocation(program, 'a_position');
    const aTex = gl.getAttribLocation(program, 'a_texCoord');
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 16, 0);
    gl.enableVertexAttribArray(aTex);
    gl.vertexAttribPointer(aTex, 2, gl.FLOAT, false, 16, 8);

    const getU = name => gl.getUniformLocation(program, name);
    const uniforms = {
      colors: getU('u_colors'),
      colorsLength: getU('u_colors_length'),
      seed: getU('u_seed'),
      speed: getU('u_speed'),
      loop: getU('u_loop'),
      scale: getU('u_scale'),
      turbAmp: getU('u_turbAmp'),
      turbFreq: getU('u_turbFreq'),
      turbIter: getU('u_turbIter'),
      waveFreq: getU('u_waveFreq'),
      distBias: getU('u_distBias'),
      jellify: getU('u_jellify'),
      ditherMode: getU('u_ditherMode'),
      dither: getU('u_dither'),
      exposure: getU('u_exposure'),
      contrast: getU('u_contrast'),
      saturation: getU('u_saturation'),
      time: getU('u_time'),
      resolution: getU('u_resolution'),
      pixelRatio: getU('u_pixelRatio')
    };

    // Black and Dark Orange Harmonic Palette
    const silkConfig = {
      colors: new Float32Array([
        // Stop 0: Pitch Obsidian Black
        0.008, 0.005, 0.012, 1.0,
        // Stop 1: Dark Obsidian Charcoal
        0.045, 0.018, 0.009, 1.0,
        // Stop 2: Dark Burnt Mahogany Amber
        0.160, 0.045, 0.014, 1.0,
        // Stop 3: Deep Burnt Dark Orange
        0.380, 0.115, 0.025, 1.0,
        // Stop 4: Rich Dark Orange
        0.620, 0.205, 0.045, 1.0,
        // Stop 5: Radiant Dark Orange
        0.840, 0.310, 0.090, 1.0,
        // Stop 6: Aurex Vibrant Warm Coral Accent
        0.980, 0.400, 0.320, 1.0,
        // Stop 7: Pad
        0.0, 0.0, 0.0, 0.0
      ]),
      colorsLength: 7,
      seed: 689,
      speed: 0.72,
      loop: 0,
      scale: 0.28,
      turbAmp: 0,
      turbFreq: 2.0,
      turbIter: 9,
      waveFreq: 2.5,
      distBias: 0,
      jellify: 0,
      ditherMode: 1,
      dither: 0.1,
      exposure: 1.05,
      contrast: 1.15,
      saturation: 1.15
    };

    gl.uniform4fv(uniforms.colors, silkConfig.colors);
    gl.uniform1i(uniforms.colorsLength, silkConfig.colorsLength);
    gl.uniform1f(uniforms.seed, silkConfig.seed);
    gl.uniform1f(uniforms.speed, silkConfig.speed);
    gl.uniform1f(uniforms.loop, silkConfig.loop);
    gl.uniform1f(uniforms.scale, silkConfig.scale);
    gl.uniform1f(uniforms.turbAmp, silkConfig.turbAmp);
    gl.uniform1f(uniforms.turbFreq, silkConfig.turbFreq);
    gl.uniform1f(uniforms.turbIter, silkConfig.turbIter);
    gl.uniform1f(uniforms.waveFreq, silkConfig.waveFreq);
    gl.uniform1f(uniforms.distBias, silkConfig.distBias);
    gl.uniform1f(uniforms.jellify, silkConfig.jellify);
    gl.uniform1f(uniforms.ditherMode, silkConfig.ditherMode);
    gl.uniform1f(uniforms.dither, silkConfig.dither);
    gl.uniform1f(uniforms.exposure, silkConfig.exposure);
    gl.uniform1f(uniforms.contrast, silkConfig.contrast);
    gl.uniform1f(uniforms.saturation, silkConfig.saturation);

    let dpr = Math.min(window.devicePixelRatio || 1, 2);
    let curW = 0, curH = 0;
    let needsResize = true;

    function resize() {
      if (!needsResize) return;
      needsResize = false;
      const rect = canvas.getBoundingClientRect();
      const w = Math.max(1, Math.floor(rect.width * dpr));
      const h = Math.max(1, Math.floor(rect.height * dpr));
      if (w !== curW || h !== curH) {
        curW = w;
        curH = h;
        canvas.width = w;
        canvas.height = h;
        gl.viewport(0, 0, w, h);
        gl.uniform2f(uniforms.resolution, w, h);
        gl.uniform1f(uniforms.pixelRatio, dpr);
      }
    }

    if (window.ResizeObserver) {
      new ResizeObserver(() => { needsResize = true; }).observe(canvas);
    }
    window.addEventListener('resize', () => {
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      if (nextDpr !== dpr) {
        dpr = nextDpr;
        curW = curH = 0;
      }
      needsResize = true;
    });

    const startTime = performance.now();
    let isVisible = true;
    let lastTime = 0;
    const targetFpsMs = 1000 / 60;

    function render(now) {
      if (isVisible) {
        if (now - lastTime >= targetFpsMs - 1) {
          lastTime = now;
          resize();
          gl.uniform1f(uniforms.time, (now - startTime) / 1000);
          gl.drawArrays(gl.TRIANGLES, 0, 6);
        }
        requestAnimationFrame(render);
      }
    }
    requestAnimationFrame(render);

    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver(([entry]) => {
        const wasVisible = isVisible;
        isVisible = entry.isIntersecting;
        if (isVisible && !wasVisible) {
          lastTime = 0;
          requestAnimationFrame(render);
        }
      }, { threshold: 0 });
      observer.observe(canvas);
    }
  }

  // Auto-initialize Hero Silk
  initHeroSilk();

  // ==========================================================================
  // 14. Parthh.in Inspired Monumental Hero Intro Animation & Mouse Parallax
  // Powered by GSAP expo.out easing, staggered blur reveals & dynamic letter-spacing
  // ==========================================================================
  function initParthHeroIntroAnimation() {
    const nameContainer = document.querySelector(".name-container");
    const heroSection = document.getElementById("heroSection");
    if (!nameContainer || !heroSection) return;

    const isCoarse = window.matchMedia("(pointer: coarse)").matches;
    const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof gsap !== "undefined") {
      // Create master entrance timeline with signature parthh.in expo.out easing
      const tl = gsap.timeline({
        defaults: { ease: "expo.out" },
        onComplete: () => {
          document.querySelectorAll(".name-container, .tagline-part, .hero-top-pill-wrap, .gsap-hero-bottom").forEach(el => {
            el.classList.add("gsap-animated");
          });
        }
      });

      // 1. Top status pill entrance (from top with fade)
      tl.fromTo(".hero-top-pill-wrap",
        { y: -35, opacity: 0, scale: 0.95 },
        { y: 0, opacity: 1, scale: 1, duration: 1.4, delay: 0.15 }
      );

      // 2. Monumental Title (AUREX MEDIA) - rises from below with smooth expo deceleration
      tl.fromTo(".name-container",
        { y: 110, opacity: 0, scale: 0.94 },
        { y: 0, opacity: 1, scale: 1, duration: 2.2 },
        "-=1.1"
      );

      // 3. Staggered taglines with blur clearing (matching parthh.in)
      if (isCoarse || prefersReduced) {
        tl.fromTo(".tagline-part",
          { y: 24, opacity: 0 },
          { y: 0, opacity: 1, stagger: 0.22, duration: 1.3 },
          "-=1.3"
        );
      } else {
        tl.fromTo(".tagline-part",
          { y: 24, opacity: 0, filter: "blur(10px)" },
          {
            y: 0, opacity: 1, filter: "blur(0px)", stagger: 0.22, duration: 1.6, onComplete: () => {
              gsap.set(".tagline-part", { clearProps: "filter" });
            }
          },
          "-=1.3"
        );
      }

      // 4. Bottom Global Presence Bar entrance
      tl.fromTo(".gsap-hero-bottom",
        { y: 25, opacity: 0 },
        { y: 0, opacity: 1, duration: 1.4 },
        "-=1.1"
      );

      // 5. Signature parthh.in Interactive Dynamic Letter-Spacing Parallax
      if (!prefersReduced && !isCoarse) {
        const titleEl = document.querySelector(".name-container");
        if (titleEl) {
          const setLetterSpacing = gsap.quickSetter(titleEl, "letterSpacing", "em");
          let rafId = null;
          const onMouseMove = (e) => {
            if (!rafId) {
              rafId = requestAnimationFrame(() => {
                const ratio = (e.clientX / window.innerWidth) - 0.5;
                // Modulates between -0.02em and +0.055em based on horizontal cursor distance
                const targetSpacing = -0.02 + Math.abs(ratio) * 0.075;
                setLetterSpacing(targetSpacing);
                rafId = null;
              });
            }
          };
          window.addEventListener("mousemove", onMouseMove, { passive: true });
        }
      }
    } else {
      // Fallback if GSAP is unavailable
      nameContainer.style.opacity = '1';
      nameContainer.style.transform = 'translateY(0)';
      document.querySelectorAll(".tagline-part, .hero-top-pill-wrap, .gsap-hero-bottom").forEach(el => {
        el.style.opacity = '1';
      });
    }
  }

  // Auto-initialize Hero Intro Animation
  initParthHeroIntroAnimation();
});



