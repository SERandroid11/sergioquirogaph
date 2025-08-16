// Esperar a que el DOM esté completamente cargado antes de ejecutar el script
document.addEventListener('DOMContentLoaded', () => {

    // --- NAVEGACIÓN SPA (Single Page Application) ---
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('main > section');
    const mobileMenu = document.getElementById('mobile-menu');
    const mobileMenuButton = document.getElementById('mobile-menu-button');
    
    // Función para mostrar la sección seleccionada y ocultar las demás
    function showSection(targetId) {
        sections.forEach(section => {
            if (section.id === targetId) {
                section.style.display = 'block';
                // Forzamos un reflow para que la animación se reinicie
                void section.offsetWidth; 
                section.classList.add('fade-in');
            } else {
                section.style.display = 'none';
                section.classList.remove('fade-in');
            }
        });
        window.scrollTo(0, 0);
        mobileMenu.classList.add('hidden'); // Ocultar menú móvil al navegar
    }

    // Agregar listeners a los enlaces de navegación
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = e.currentTarget.getAttribute('data-target');
            showSection(targetId);
        });
    });

    // Listener para el botón del menú móvil
    mobileMenuButton.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
    });

    // --- SECCIÓN INICIO: SLIDER ---
    const sliderContainer = document.getElementById('slider-container');
    const ctaPortafolio = document.getElementById('cta-portafolio');
    
    // URLs de las imágenes del slider (usando placeholders)
    const sliderImages = [
        'img/boda.png',
        'img/retrato.png',
        'img/futbol.png',
        'img/cumpleaños.png',
        'img/bautismo.png'
    ];
    let currentSlideIndex = 0;

    // Crear dinámicamente los elementos del slider
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

    // Cambiar a la siguiente imagen del slider
    function nextSlide() {
        if (!sliderContainer) return;
        const slides = document.querySelectorAll('.slide');
        slides[currentSlideIndex].classList.remove('active');
        currentSlideIndex = (currentSlideIndex + 1) % slides.length;
        slides[currentSlideIndex].classList.add('active');
    }

    createSlider();
    // Iniciar el cambio automático de diapositivas si el contenedor existe
    if (sliderContainer) {
        setInterval(nextSlide, 5000); 
    }

    // Listener para el botón de "Ver Portafolio"
    if(ctaPortafolio) {
        ctaPortafolio.addEventListener('click', () => showSection('portafolio'));
    }

    // --- SECCIÓN PORTAFOLIO: FILTRADO ---
    const portfolioGrid = document.getElementById('portfolio-grid');
    const filterBtns = document.querySelectorAll('.filter-btn');

    // Datos simulados del portafolio (usando placeholders)
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

    // Renderizar los elementos del portafolio
    function renderPortfolio() {
        if (!portfolioGrid) return;
        portfolioGrid.innerHTML = '';
        portfolioItems.forEach(item => {
            const div = document.createElement('div');
            div.className = 'portfolio-item group cursor-pointer overflow-hidden rounded-lg shadow-md';
            div.setAttribute('data-category', item.category);
            div.innerHTML = `
                <img src="${item.src}" alt="${item.category}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
            `;
            portfolioGrid.appendChild(div);
        });
    }
    
    // Función para filtrar los elementos del portafolio
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

    // Iniciar el renderizado del portafolio y los listeners
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

    // --- SECCIÓN GALERÍA DE CLIENTES: LÓGICA ---
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
    // --- ELEMENTOS AÑADIDOS PARA NOTIFICACIÓN ---
    const notifyBtn = document.getElementById('notify-photographer-btn');
    const notificationSuccessMsg = document.getElementById('notification-success');
    let currentAlbumCode = null; // Variable para guardar el código del álbum actual

    // Simulación de base de datos de clientes y sus álbumes
    const clientAlbums = {
        'BODA-JUANYMARIA': {
            title: 'Boda de Juan y María',
            allowDownload: true,
            favorites: [],
            photos: [
                { id: 'boda1', url: 'https://placehold.co/1200x800/fecaca/991b1b?text=Foto+1' },
                { id: 'boda2', url: 'https://placehold.co/1200x800/fecaca/991b1b?text=Foto+2' },
                { id: 'boda3', url: 'https://placehold.co/1200x800/fecaca/991b1b?text=Foto+3' },
                { id: 'boda4', url: 'https://placehold.co/1200x800/fecaca/991b1b?text=Foto+4' },
                { id: 'boda5', url: 'https://placehold.co/1200x800/fecaca/991b1b?text=Foto+5' },
                { id: 'boda6', url: 'https://placehold.co/1200x800/fecaca/991b1b?text=Foto+6' },
            ]
        },
        'CUMPLE-SOFIA': {
            title: 'Cumpleaños de Sofía',
            allowDownload: false,
            favorites: [],
            photos: [
                { id: 'cumple1', url: 'https://placehold.co/1200x800/dbeafe/1e3a8a?text=Foto+A' },
                { id: 'cumple2', url: 'https://placehold.co/1200x800/dbeafe/1e3a8a?text=Foto+B' },
                { id: 'cumple3', url: 'https://placehold.co/1200x800/dbeafe/1e3a8a?text=Foto+C' },
            ]
        }
    };

    // Manejar el envío del formulario de inicio de sesión
    clientLoginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const code = albumCodeInput.value.trim().toUpperCase();
        if (clientAlbums[code]) {
            loginError.classList.add('hidden');
            clientLoginView.style.display = 'none';
            clientGalleryView.style.display = 'block';
            clientGalleryView.classList.add('fade-in');
            loadClientGallery(code);
        } else {
            loginError.classList.remove('hidden');
        }
    });

    // Manejar el botón de "Salir" de la galería
    logoutBtn.addEventListener('click', () => {
        clientGalleryView.style.display = 'none';
        clientLoginView.style.display = 'block';
        clientLoginView.classList.add('fade-in');
        albumCodeInput.value = '';
        currentAlbumCode = null; // Limpiar el código del álbum al salir
        // Ocultar elementos de notificación al salir
        notifyBtn.classList.add('hidden');
        notificationSuccessMsg.classList.add('hidden');
    });

    // Función para cargar la galería de un cliente
    function loadClientGallery(code) {
        currentAlbumCode = code; // Guardamos el código del álbum actual
        const album = clientAlbums[code];
        galleryTitle.textContent = album.title;
        clientPhotoGrid.innerHTML = '';
        
        downloadInfo.textContent = album.allowDownload 
            ? 'Las descargas están habilitadas. Puedes descargar fotos individualmente o el álbum completo.'
            : 'Las descargas no están habilitadas para este álbum. Contacta al fotógrafo si necesitas los archivos.';

        // Mostrar u ocultar el botón de descarga completa según la configuración del álbum
        if (album.allowDownload) {
            downloadAllBtn.classList.remove('hidden');
        } else {
            downloadAllBtn.classList.add('hidden');
        }

        album.photos.forEach(photo => {
            const photoDiv = document.createElement('div');
            photoDiv.className = 'relative group rounded-lg overflow-hidden';
            
            const isFavorited = album.favorites.includes(photo.id);

            photoDiv.innerHTML = `
                <img src="${photo.url}" alt="Foto de cliente" class="w-full h-full object-cover">
                <div class="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                    <button class="favorite-icon ${isFavorited ? 'favorited' : ''}" data-photo-id="${photo.id}" data-album-code="${code}" title="Marcar como favorita">
                       <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="${isFavorited ? '#facc15' : 'none'}" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-star"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
                    </button>
                    ${album.allowDownload ? `
                    <a href="${photo.url}" download="${photo.id}.jpg" title="Descargar foto" class="text-white">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-download"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
                    </a>
                    ` : ''}
                </div>
            `;
            clientPhotoGrid.appendChild(photoDiv);
        });
        updateFavoritesList(code);
    }
    
    // Listener para marcar/desmarcar fotos como favoritas (VERSIÓN CORREGIDA)
    clientPhotoGrid.addEventListener('click', (e) => {
        const favoriteBtn = e.target.closest('.favorite-icon');
        
        if (favoriteBtn) {
            const photoId = favoriteBtn.dataset.photoId;
            const albumCode = favoriteBtn.dataset.albumCode; 
            
            // 1. Cambia el estado
            toggleFavorite(albumCode, photoId);

            // 2. Obtén el nuevo estado
            const album = clientAlbums[albumCode];
            const isFavorited = album.favorites.includes(photoId);

            // 3. Actualiza el icono de la estrella
            const svgIcon = favoriteBtn.querySelector('svg');
            svgIcon.setAttribute('fill', isFavorited ? '#facc15' : 'none');
            
            // 4. Actualiza la lista de miniaturas
            updateFavoritesList(albumCode);
        }
    });

    // Añadir o quitar una foto de la lista de favoritos
    function toggleFavorite(albumCode, photoId) {
        const album = clientAlbums[albumCode];
        const favIndex = album.favorites.indexOf(photoId);

        if (favIndex > -1) {
            album.favorites.splice(favIndex, 1); // Quitar de favoritos
        } else {
            album.favorites.push(photoId); // Añadir a favoritos
        }
        
        console.log(`Favoritos para ${albumCode}:`, album.favorites);
    }

    // Actualizar la lista de miniaturas de fotos favoritas (MODIFICADA)
    function updateFavoritesList(albumCode) {
        const album = clientAlbums[albumCode];
        favoritesList.innerHTML = '';

        if (album.favorites.length === 0) {
            noFavorites.style.display = 'block';
            notifyBtn.classList.add('hidden'); // Ocultar botón si no hay favoritos
        } else {
            noFavorites.style.display = 'none';
            // Solo mostrar el botón si la notificación aún no se ha enviado
            if (notificationSuccessMsg.classList.contains('hidden')) {
                notifyBtn.classList.remove('hidden'); // Mostrar botón si hay favoritos
            }
            album.favorites.forEach(favId => {
                const photo = album.photos.find(p => p.id === favId);
                if (photo) {
                    const img = document.createElement('img');
                    img.src = photo.url;
                    img.className = 'w-24 h-24 object-cover rounded-md shadow-md';
                    favoritesList.appendChild(img);
                }
            });
        }
    }

    // --- LÓGICA AÑADIDA PARA NOTIFICACIÓN ---
    notifyBtn.addEventListener('click', async () => {
        if (!currentAlbumCode) return;

        const album = clientAlbums[currentAlbumCode];
        const favorites = album.favorites;

        if (favorites.length === 0) {
            alert("Por favor, selecciona al menos una foto como favorita.");
            return;
        }

        // Deshabilitar botón para evitar múltiples envíos
        notifyBtn.textContent = 'Enviando...';
        notifyBtn.disabled = true;

        try {
            // ¡CAMBIO IMPORTANTE! AHORA APUNTA A TU SCRIPT PHP EN XAMPP, CAMBIAR CUANDO SE SUBE EN HOSTING
            const response = await fetch('http://localhost/fotografia-api/notify.php', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    albumCode: currentAlbumCode,
                    favorites: favorites
                }),
            });

            if (!response.ok) {
                throw new Error('Hubo un problema al enviar la notificación.');
            }

            await response.json();
            
            // Mostrar mensaje de éxito
            notificationSuccessMsg.classList.remove('hidden');
            notifyBtn.classList.add('hidden');

        } catch (error) {
            console.error('Error:', error);
            alert('No se pudo enviar la notificación. Por favor, inténtalo de nuevo.');
            // Reactivar el botón si hay un error
            notifyBtn.textContent = 'Finalizar y Notificar al Fotógrafo';
            notifyBtn.disabled = false;
        }
    });

    // --- FUNCIONALIDAD: DESCARGAR TODAS LAS FOTOS ---
    downloadAllBtn.addEventListener('click', async () => {
        // En lugar de usar albumCodeInput.value, usamos la variable que ya tenemos
        if (currentAlbumCode && clientAlbums[currentAlbumCode]) {
            await downloadAllPhotos(currentAlbumCode);
        }
    });

    /**
     * Descarga todas las fotos de un álbum de cliente en un solo archivo .zip.
     * @param {string} albumCode El código único del álbum.
     */
    async function downloadAllPhotos(albumCode) {
        const album = clientAlbums[albumCode];
        if (!album || !album.allowDownload) {
            console.error("Descarga no permitida para este álbum.");
            return;
        }

        // Mostrar el overlay de carga
        loadingOverlay.classList.remove('hidden');

        // Inicializar JSZip
        const zip = new JSZip();
        
        const photoPromises = album.photos.map(async (photo) => {
            try {
                const response = await fetch(photo.url);
                if (!response.ok) {
                    throw new Error(`Error al obtener la imagen ${photo.id}: ${response.statusText}`);
                }
                const blob = await response.blob();
                const filename = `${photo.id}.jpg`;
                zip.file(filename, blob, { base64: true });
                console.log(`Imagen ${filename} agregada al .zip`);
            } catch (error) {
                console.error(`No se pudo descargar la imagen ${photo.id}:`, error);
            }
        });

        // Esperar a que todas las imágenes se descarguen y agreguen al zip
        await Promise.all(photoPromises);

        // Generar y guardar el archivo .zip
        try {
            const zipFile = await zip.generateAsync({ type: "blob" });
            saveAs(zipFile, `${albumCode}.zip`);
            console.log("Archivo ZIP generado y guardado.");
        } catch (error) {
            console.error("Error al generar el archivo .zip:", error);
        } finally {
            // Ocultar el overlay de carga
            loadingOverlay.classList.add('hidden');
        }
    }
});