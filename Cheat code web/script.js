document.addEventListener('DOMContentLoaded', () => {
    // Cheat codes functionality
    const sheetURL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vRgM_UqHxgZYULQN4-96UIZHLZMECO-49QRBn0qpfD7BlE-ZE8m3e7BxeP-_fayKg8hee_5uG-led71/pub?output=csv";
    const container = document.querySelector('.cheats-container');
    const paginationBar = document.querySelector('.pagination-bar');
    const searchInput = document.getElementById('searchInput');

    const images = [
        './assets/img1.png',
        './assets/img2.png',
        './assets/img3.png',
        './assets/img4.jpg'
    ];

    function getRandomImage() {
        return images[Math.floor(Math.random() * images.length)];
    }

    let allCheats = [];
    let filteredCheats = [];
    let currentPage = 1;
    const cardsPerPage = 10;

    fetch(sheetURL)
        .then(response => response.text())
        .then(csv => {
            allCheats = parseCSV(csv);
            filteredCheats = [...allCheats];
            currentPage = 1;
            displayCards();
            renderPagination();
        })
        .catch(error => {
            console.error('Error loading cheats:', error);
            container.innerHTML = '<p>Failed to load cheat codes.</p>';
        });

    function parseCSV(csvText) {
        const rows = csvText.trim().split('\n');
        const headers = rows[0].split(',').map(h => h.trim());
        return rows.slice(1).map(row => {
            const values = row.split(',').map(v => v.trim());
            const obj = {};
            headers.forEach((header, index) => {
                obj[header] = values[index] || '';
            });
            return obj;
        });
    }

    function createCheatCard(cheat) {
        const card = document.createElement('div');
        card.className = 'cheat-card';
        const imagePath = getRandomImage();

        card.innerHTML = `
            <img src="${imagePath}" alt="Game Image" class="cheat-img">
            <h2 class="cheat-title">${cheat.Reward}</h2>
            <p class="cheat-description">${cheat.Description}</p>
            <button class="cheat-show-btn">Show Code</button>
            <div class="cheat-code-area" style="display: none;">
                <code>${cheat.Code}</code>
                <button class="cheat-copy-btn"><span class="material-symbols-outlined">content_copy</span></button>
            </div>
        `;

        const showBtn = card.querySelector('.cheat-show-btn');
        const codeArea = card.querySelector('.cheat-code-area');
        const copyBtn = card.querySelector('.cheat-copy-btn');

        showBtn.addEventListener('click', () => {
            codeArea.style.display = 'flex';
            showBtn.style.display = 'none';
        });

        copyBtn.addEventListener('click', () => {
            navigator.clipboard.writeText(cheat.Code)
                .then(() => {
                    copyBtn.innerHTML = '<span class="material-symbols-outlined">check_circle</span>';
                    setTimeout(() => {
                        copyBtn.innerHTML = '<span class="material-symbols-outlined">content_copy</span>';
                    }, 2000);
                })
                .catch(err => {
                    console.error('Failed to copy:', err);
                });
        });

        return card;
    }

    function displayCards() {
        container.innerHTML = '';
        if (filteredCheats.length === 0) {
            container.innerHTML = '<p style="text-align: center; color: #ccc;">No cheats found.</p>';
            paginationBar.innerHTML = '';
            return;
        }
        const start = (currentPage - 1) * cardsPerPage;
        const end = Math.min(start + cardsPerPage, filteredCheats.length);
        for (let i = start; i < end; i++) {
            const card = createCheatCard(filteredCheats[i]);
            container.appendChild(card);
        }
    }

    function renderPagination() {
        paginationBar.innerHTML = '';
        const totalPages = Math.ceil(filteredCheats.length / cardsPerPage);
        if (totalPages <= 1) return;

        // Previous button
        const prevBtn = document.createElement('button');
        prevBtn.className = 'pagination-btn';
        prevBtn.textContent = 'Previous';
        prevBtn.disabled = currentPage === 1;
        prevBtn.addEventListener('click', () => {
            if (currentPage > 1) {
                currentPage--;
                displayCards();
                renderPagination();
                scrollToCheats();
            }
        });
        paginationBar.appendChild(prevBtn);

        // Page numbers (max 3 at a time)
        let startPage = Math.max(1, currentPage - 1);
        let endPage = Math.min(totalPages, startPage + 2);
        if (endPage - startPage < 2) {
            startPage = Math.max(1, endPage - 2);
        }
        for (let i = startPage; i <= endPage; i++) {
            const pageBtn = document.createElement('button');
            pageBtn.className = 'pagination-page' + (i === currentPage ? ' active' : '');
            pageBtn.textContent = i;
            if (i === currentPage) pageBtn.disabled = true;
            pageBtn.addEventListener('click', () => {
                currentPage = i;
                displayCards();
                renderPagination();
                scrollToCheats();
            });
            paginationBar.appendChild(pageBtn);
        }

        // Next button
        const nextBtn = document.createElement('button');
        nextBtn.className = 'pagination-btn';
        nextBtn.textContent = 'Next';
        nextBtn.disabled = currentPage === totalPages;
        nextBtn.addEventListener('click', () => {
            if (currentPage < totalPages) {
                currentPage++;
                displayCards();
                renderPagination();
                scrollToCheats();
            }
        });
        paginationBar.appendChild(nextBtn);
    }

    function scrollToCheats() {
        // Optional: scroll to top of cheats-container on page change (for mobile usability)
        container.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }

    searchInput.addEventListener('input', () => {
        const query = searchInput.value.trim().toLowerCase();
        filteredCheats = allCheats.filter(cheat => 
            cheat.Reward.toLowerCase().includes(query)
        );
        currentPage = 1;
        displayCards();
        renderPagination();
    });

    // Image loading optimization
    const lazyImages = document.querySelectorAll('.lazy-image');
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.classList.add('loaded');
                observer.unobserve(img);
            }
        });
    }, { rootMargin: '50px' });

    lazyImages.forEach(img => imageObserver.observe(img));

    // Modal functionality
    function setupModal(cardId, modalId, closeId) {
        const card = document.getElementById(cardId);
        const modal = document.getElementById(modalId);
        const closeBtn = document.getElementById(closeId);

        if (!card || !modal || !closeBtn) return;

        card.addEventListener('click', () => {
            modal.style.display = 'block';
            document.body.style.overflow = 'hidden';
        });

        closeBtn.addEventListener('click', closeModal);
        modal.addEventListener('click', (e) => {
            if (e.target === modal) closeModal();
        });

        function closeModal() {
            modal.style.display = 'none';
            document.body.style.overflow = 'auto';
        }

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.style.display === 'block') {
                closeModal();
            }
        });
    }

    setupModal('channelCard', 'channelModal', 'closeModal');
    setupModal('howtoCard', 'howtoModal', 'closeHowtoModal');

    // Wait button functionality
    const waitBtnContainer = document.querySelector('.wait-btn');
    const waitBtn = document.getElementById('waitButton');

    if (waitBtnContainer && waitBtn) {
        waitBtnContainer.style.display = 'none';

        document.querySelectorAll('.btn:not(.show-cheats-btn)').forEach(btn => {
            btn.addEventListener('click', function (e) {
                e.preventDefault();

                window.scrollTo({
                    top: document.body.scrollHeight,
                    behavior: 'smooth'
                });

                waitBtnContainer.style.display = 'block';
                waitBtn.textContent = 'Wait 5 Seconds';
                waitBtn.removeAttribute('href');
                waitBtn.style.pointerEvents = 'none';
                waitBtn.style.background = '#666';

                let timer = 5;
                const interval = setInterval(() => {
                    timer--;
                    if (timer > 0) {
                        waitBtn.textContent = `Wait ${timer} Seconds`;
                    } else {
                        clearInterval(interval);
                        waitBtn.textContent = 'Go to Cheat Sheet';
                        waitBtn.style.pointerEvents = 'auto';
                        waitBtn.style.background = 'linear-gradient(45deg, #28a745, #20c997)';
                        waitBtn.setAttribute('href', './cheatsheet.html');
                    }
                }, 1000);
            });
        });

        waitBtn.addEventListener('click', function (e) {
            if (waitBtn.textContent.includes('Go to')) {
                e.preventDefault();
                window.open('./cheatsheet.html', '_blank');
                waitBtnContainer.style.display = 'none';
            } else {
                e.preventDefault();
            }
        });
    }

    // Image Slider
    class ImageSlider {
        constructor() {
            this.slides = document.getElementById('slideImages');
            this.images = document.querySelectorAll('.slide-images img');
            this.leftBtn = document.getElementById('leftBtn');
            this.rightBtn = document.getElementById('rightBtn');
            this.dots = document.querySelectorAll('.dot');
            this.currentCounter = document.getElementById('current');
            this.totalCounter = document.getElementById('total');
            this.progressBar = document.getElementById('progressBar');

            this.currentIndex = 0;
            this.totalImages = this.images.length;
            this.autoSlideInterval = null;
            this.autoSlideDelay = 4000;

            if (this.slides && this.totalImages > 0) {
                this.init();
            }
        }

        init() {
            this.updateCounter();
            this.setupEventListeners();
            this.startAutoSlide();
            this.updateSlider();

            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => this.updateSlider(), 100);
            });
        }

        setupEventListeners() {
            this.leftBtn?.addEventListener('click', () => this.prevSlide());
            this.rightBtn?.addEventListener('click', () => this.nextSlide());

            this.dots.forEach((dot, index) => {
                dot.addEventListener('click', () => this.goToSlide(index));
            });

            document.addEventListener('keydown', (e) => {
                if (e.key === 'ArrowLeft') this.prevSlide();
                if (e.key === 'ArrowRight') this.nextSlide();
            });

            this.setupTouchEvents();

            const slider = this.slides.parentElement;
            slider?.addEventListener('mouseenter', () => this.stopAutoSlide());
            slider?.addEventListener('mouseleave', () => this.startAutoSlide());
        }

        setupTouchEvents() {
            let startX = 0, startY = 0, endX = 0, endY = 0;

            this.slides.addEventListener('touchstart', (e) => {
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                this.stopAutoSlide();
            }, { passive: true });

            this.slides.addEventListener('touchend', (e) => {
                const touch = e.changedTouches[0];
                endX = touch.clientX;
                endY = touch.clientY;
                this.handleSwipe(startX, endX, startY, endY);
                this.startAutoSlide();
            }, { passive: true });
        }

        handleSwipe(startX, endX, startY, endY) {
            const threshold = 50;
            const diffX = startX - endX;
            const diffY = Math.abs(startY - endY);

            if (Math.abs(diffX) > threshold && diffY < threshold) {
                if (diffX > 0) {
                    this.nextSlide();
                } else {
                    this.prevSlide();
                }
            }
        }

        updateSlider() {
            if (!this.slides) return;

            const containerWidth = this.slides.parentElement.offsetWidth;
            const translateX = -this.currentIndex * containerWidth;
            this.slides.style.transform = `translateX(${translateX}px)`;

            this.dots.forEach((dot, index) => {
                dot.classList.toggle('active', index === this.currentIndex);
            });

            this.updateCounter();
        }

        updateCounter() {
            if (this.currentCounter) this.currentCounter.textContent = this.currentIndex + 1;
            if (this.totalCounter) this.totalCounter.textContent = this.totalImages;
        }

        nextSlide() {
            this.currentIndex = (this.currentIndex + 1) % this.totalImages;
            this.updateSlider();
            this.resetAutoSlide();
        }

        prevSlide() {
            this.currentIndex = (this.currentIndex - 1 + this.totalImages) % this.totalImages;
            this.updateSlider();
            this.resetAutoSlide();
        }

        goToSlide(index) {
            this.currentIndex = index;
            this.updateSlider();
            this.resetAutoSlide();
        }

        startAutoSlide() {
            this.stopAutoSlide();
            let progress = 0;

            this.autoSlideInterval = setInterval(() => {
                progress += 100;
                if (this.progressBar) {
                    this.progressBar.style.width = `${(progress / this.autoSlideDelay) * 100}%`;
                }

                if (progress >= this.autoSlideDelay) {
                    this.nextSlide();
                    progress = 0;
                    if (this.progressBar) this.progressBar.style.width = '0%';
                }
            }, 100);
        }

        stopAutoSlide() {
            if (this.autoSlideInterval) {
                clearInterval(this.autoSlideInterval);
                this.autoSlideInterval = null;
            }
            if (this.progressBar) this.progressBar.style.width = '0%';
        }

        resetAutoSlide() {
            this.stopAutoSlide();
            this.startAutoSlide();
        }
    }

    new ImageSlider();
});
