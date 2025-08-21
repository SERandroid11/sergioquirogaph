// Esperar a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // --- NAVEGACIÓN SPA (Single Page Application) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    function showSection(targetId) {
        sections.forEach(section => {
            if (section.id === targetId) {
                section.style.display = 'block';
                void section.offsetWidth; 
                section.classList.add('fade-in');
            } else {
                section.style.display = 'none';
                section.classList.remove('fade-in');
            }
        });
        window.scrollTo(0, 0);
        mobileMenu.classList.add('hidden');
    }

    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            showSection(targetId);
        });
    });

    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // --- SECCIÓN INICIO: SLIDER ---
    const sliderContainer = document.getElementById('slider-container');
    const ctaPortafolio = document.getElementById('cta-portafolio');
    
    const sliderImages = [
        'img/boda.png',
        'img/retrato.png',
        'img/futbol.png',
        'img/cumpleaños.png',
        'img/bautismo.png'
    ];
    let currentSlideIndex = 0;

    function createSlider() {
        if (!sliderContainer) return;
        sliderImages.forEach((src, index) => {
            const slide = document.createElement('div');
            slide.className = 'slide';
            slide.style.backgroundImage = `url(${src})`;
            if (index === 0) slide.classList.add('active');
            sliderContainer.prepend(slide);
        });
    }

    function nextSlide() {
        if (!sliderContainer) return;
        const slides = document.querySelectorAll('.slide');
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides[currentSlideIndex].classList.add('active');
    }

    createSlider();
    if (sliderContainer) {
        setInterval(nextSlide, 5000); 
    }

    if(ctaPortafolio) {
        ctaPortafolio.addEventListener('click', () => showSection('portafolio'));
    }

    // --- SECCIÓN PORTAFOLIO: FILTRADO ---
    const portfolioGrid = document.getElementById('portfolio-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    const portfolioItems = [
        { src: 'img/sesion1.png', category: 'sesiones' },
        { src: 'img/boda1.png', category: 'bodas' },
        { src: 'img/futbol2.png', category: 'futbol' },
        { src: 'img/cumple1.png', category: 'cumpleanos' },
        { src: 'img/cumple2.png', category: 'cumpleanos' },
        { src: 'img/cumple3.png', category: 'cumpleanos' },
        { src: 'img/sesion2.png', category: 'sesiones' },
        { src: 'img/sesion3.png', category: 'sesiones' },
        { src: 'img/boda2.png', category: 'bodas' },
        { src: 'img/sesion4.png', category: 'sesiones' },
        { src: 'img/futbol3.png', category: 'futbol' },
        { src: 'img/futbol1.png', category: 'futbol' },
    ];

    function renderPortfolio() {
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = '';
        portfolioItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'portfolio-item group cursor-pointer overflow-hidden rounded-lg shadow-md';
            div.setAttribute('data-category', item.category);
            div.innerHTML = `<img src="${item.src}" alt="${item.category}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">`;
            portfolioGrid.appendChild(div);
        });
    }
    
    function filterPortfolio(filter) {
        const items = document.querySelectorAll('.portfolio-item');
        items.forEach(item => {
            const category = item.getAttribute('data-category');
            if (filter === 'all' || filter === category) {
                item.classList.remove('hidden');
            } else {
                item.classList.add('hidden');
            }
        });
    }

    if (portfolioGrid) {
        renderPortfolio();
        filterBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                filterBtns.forEach(b => b.classList.remove('active', 'bg-gray-800', 'text-white'));
                e.currentTarget.classList.add('active', 'bg-gray-800', 'text-white');
                const filter = e.currentTarget.getAttribute('data-filter');
                filterPortfolio(filter);
            });
        });
    }

    // ===================================================================
    // === INICIO: LÓGICA DE GALERÍA DE CLIENTES CON GOOGLE DRIVE Y LIGHTBOX ===
    // ===================================================================
    const clientLoginView = document.getElementById('client-login-view');
    const clientGalleryView = document.getElementById('client-gallery-view');
    const clientLoginForm = document.getElementById('client-login-form');
    const albumCodeInput = document.getElementById('album-code');
    const loginError = document.getElementById('login-error');
    const galleryTitle = document.getElementById('gallery-title');
    const clientPhotoGrid = document.getElementById('client-photo-grid');
    const logoutBtn = document.getElementById('logout-btn');
    const downloadInfo = document.getElementById('download-info');
    const favoritesList = document.getElementById('favorites-list');
    const noFavorites = document.getElementById('no-favorites');
    const downloadAllBtn = document.getElementById('download-all-btn');
    const loadingOverlay = document.getElementById('loading-overlay');
    const notifyBtn = document.getElementById('notify-photographer-btn');
    const notificationSuccessMsg = document.getElementById('notification-success');
    
    const lightbox = document.getElementById('lightbox');
    const lightboxImage = document.getElementById('lightbox-image');
    const lightboxCaption = document.getElementById('lightbox-caption');
    const lightboxCloseBtn = document.getElementById('lightbox-close');
    const lightboxPrevBtn = document.getElementById('lightbox-prev');
    const lightboxNextBtn = document.getElementById('lightbox-next');
    let currentImageIndex = 0;

    let currentAlbum = {
        id: null,
        title: '',
        photos: [],
        favorites: [],
        allowDownload: false
    };

    clientLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const folderId = albumCodeInput.value.trim();
        if (!folderId) return;

        loadingOverlay.classList.remove('hidden');
        loginError.classList.add('hidden');

        try {
            const response = await fetch(`http://localhost/fotografia-api/get_drive_images.php?folderId=${folderId}`);
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'No se pudo encontrar el álbum.');
            }
            const albumData = await response.json();
            currentAlbum = {
                id: folderId,
                title: albumData.title,
                photos: albumData.photos,
                favorites: [],
                allowDownload: albumData.allowDownload
            };
            loadClientGallery();
        } catch (error) {
            console.error('Error al cargar el álbum:', error);
            loginError.textContent = error.message;
            loginError.classList.remove('hidden');
        } finally {
            loadingOverlay.classList.add('hidden');
        }
    });

    logoutBtn.addEventListener('click', () => {
        clientGalleryView.style.display = 'none';
        clientLoginView.style.display = 'block';
        clientLoginView.classList.add('fade-in');
        albumCodeInput.value = '';
        currentAlbum = { id: null, title: '', photos: [], favorites: [], allowDownload: false };
        notifyBtn.classList.add('hidden');
        notificationSuccessMsg.classList.add('hidden');
    });

    function loadClientGallery() {
        clientLoginView.style.display = 'none';
        clientGalleryView.style.display = 'block';
        clientGalleryView.classList.add('fade-in');
        galleryTitle.textContent = currentAlbum.title;
        clientPhotoGrid.innerHTML = '';
        downloadInfo.textContent = currentAlbum.allowDownload 
            ? 'Las descargas están habilitadas. Puedes descargar fotos individualmente o el álbum completo.'
            : 'Las descargas no están habilitadas para este álbum. Contacta al fotógrafo si necesitas los archivos.';
        if (currentAlbum.allowDownload) {
            downloadAllBtn.classList.remove('hidden');
        } else {
            downloadAllBtn.classList.add('hidden');
        }
        currentAlbum.photos.forEach((photo, index) => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'relative group rounded-lg overflow-hidden cursor-pointer';
            const isFavorited = currentAlbum.favorites.includes(photo.id);
            const downloadUrl = `http://localhost/fotografia-api/download_image.php?fileId=${photo.id}`;

            photoDiv.innerHTML = `
                <img src="${photo.thumbnailUrl}" alt="${photo.name}" class="w-full h-full object-cover" referrerpolicy="no-referrer">
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button class="favorite-icon ${isFavorited ? 'favorited' : ''}" data-photo-id="${photo.id}" title="Marcar como favorita">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="${isFavorited ? '#facc15' : 'none'}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                    ${currentAlbum.allowDownload ? `
                    <a href="${downloadUrl}" download="${photo.name}" title="Descargar foto" class="text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </a>
                    ` : ''}
                </div>
            `;
            photoDiv.addEventListener('click', (e) => {
                if (!e.target.closest('button') && !e.target.closest('a')) {
                    openLightbox(index);
                }
            });
            clientPhotoGrid.appendChild(photoDiv);
        });
        updateFavoritesList();
    }
    
    function openLightbox(index) {
        if (!lightbox) return;
        currentImageIndex = index;
        const photo = currentAlbum.photos[currentImageIndex];
        const highQualityUrl = photo.url.replace(/=w\d+.*$/, '') + '=w1920-h1080';
        lightboxImage.src = highQualityUrl;
        lightboxCaption.textContent = photo.name;
        lightbox.classList.remove('hidden');
        document.body.style.overflow = 'hidden';
    }

    function closeLightbox() {
        if (!lightbox) return;
        lightbox.classList.add('hidden');
        document.body.style.overflow = 'auto';
    }

    function showNextImage() {
        currentImageIndex = (currentImageIndex + 1) % currentAlbum.photos.length;
        openLightbox(currentImageIndex);
    }

    function showPrevImage() {
        currentImageIndex = (currentImageIndex - 1 + currentAlbum.photos.length) % currentAlbum.photos.length;
        openLightbox(currentImageIndex);
    }

    if (lightbox) {
        lightboxCloseBtn.addEventListener('click', closeLightbox);
        lightboxNextBtn.addEventListener('click', showNextImage);
        lightboxPrevBtn.addEventListener('click', showPrevImage);
        lightbox.addEventListener('click', (e) => {
            if (e.target === lightbox) {
                closeLightbox();
            }
        });
    }

    document.addEventListener('keydown', (e) => {
        if (lightbox && !lightbox.classList.contains('hidden')) {
            if (e.key === 'Escape') closeLightbox();
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPrevImage();
        }
    });

    clientPhotoGrid.addEventListener('click', (e) => {
        const favoriteBtn = e.target.closest('.favorite-icon');
        if (favoriteBtn) {
            const photoId = favoriteBtn.dataset.photoId;
            toggleFavorite(photoId);
            const isFavorited = currentAlbum.favorites.includes(photoId);
            const svgIcon = favoriteBtn.querySelector('svg');
            svgIcon.setAttribute('fill', isFavorited ? '#facc15' : 'none');
            updateFavoritesList();
        }
    });

    function toggleFavorite(photoId) {
        const favIndex = currentAlbum.favorites.indexOf(photoId);
        if (favIndex > -1) {
            currentAlbum.favorites.splice(favIndex, 1);
        } else {
            currentAlbum.favorites.push(photoId);
        }
    }

    function updateFavoritesList() {
        favoritesList.innerHTML = '';
        if (currentAlbum.favorites.length === 0) {
            noFavorites.style.display = 'block';
            notifyBtn.classList.add('hidden');
        } else {
            noFavorites.style.display = 'none';
            if (notificationSuccessMsg.classList.contains('hidden')) {
                notifyBtn.classList.remove('hidden');
            }
            currentAlbum.favorites.forEach(favId => {
                const photo = currentAlbum.photos.find(p => p.id === favId);
                if (photo) {
                    const img = document.createElement('img');
                    img.src = photo.thumbnailUrl;
                    img.setAttribute('referrerpolicy', 'no-referrer');
                    img.className = 'w-24 h-24 object-cover rounded-md shadow-md';
                    favoritesList.appendChild(img);
                }
            });
        }
    }

    notifyBtn.addEventListener('click', async () => {
        if (!currentAlbum.id || currentAlbum.favorites.length === 0) {
            alert("Por favor, selecciona al menos una foto como favorita.");
            return;
        }
        notifyBtn.textContent = 'Enviando...';
        notifyBtn.disabled = true;
        try {
            const response = await fetch('http://localhost/fotografia-api/notify.php', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    albumCode: `${currentAlbum.title} (ID: ${currentAlbum.id})`,
                    favorites: currentAlbum.favorites
                }),
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Hubo un problema al enviar la notificación.');
            }
            await response.json();
            notificationSuccessMsg.classList.remove('hidden');
            notifyBtn.classList.add('hidden');
        } catch (error) {
            console.error('Error:', error);
            alert(error.message || 'No se pudo enviar la notificación. Por favor, inténtalo de nuevo.');
            notifyBtn.textContent = 'Finalizar y Notificar al Fotógrafo';
            notifyBtn.disabled = false;
        }
    });

    downloadAllBtn.addEventListener('click', async () => {
        if (currentAlbum.id && currentAlbum.allowDownload) {
            await downloadAllPhotos();
        }
    });

    async function downloadAllPhotos() {
        loadingOverlay.classList.remove('hidden');
        const zip = new JSZip();
        
        for (const photo of currentAlbum.photos) {
            try {
                const response = await fetch(`http://localhost/fotografia-api/download_image.php?fileId=${photo.id}`);
                if (!response.ok) {
                    console.error(`Error al descargar ${photo.name}: Servidor respondió con estado ${response.status}`);
                    continue;
                }
                const blob = await response.blob();
                zip.file(photo.name, blob);
            } catch (error) {
                console.error(`Error de red al descargar ${photo.name}:`, error);
            }
        }

        if (Object.keys(zip.files).length > 0) {
            try {
                const zipFile = await zip.generateAsync({ type: "blob" });
                saveAs(zipFile, `${currentAlbum.title}.zip`);
            } catch (error) {
                console.error("Error al generar el archivo .zip:", error);
                alert("Hubo un error al generar el archivo .zip.");
            }
        } else {
            alert("No se pudo descargar ninguna foto. Por favor, revisa la consola de desarrollador (F12) para ver los errores.");
        }

        loadingOverlay.classList.add('hidden');
    }
});
