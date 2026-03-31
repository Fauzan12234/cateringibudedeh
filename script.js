// script.js - Full functionality with menu pagination, cart, and gallery collage with pagination & modal
document.addEventListener('DOMContentLoaded', () => {
    // ========== 1. NAVBAR SCROLL EFFECT (HANYA UNTUK INDEX.HTML) ==========
    const nav = document.getElementById('main-nav');
    if (nav) {
        // Cek posisi awal saat load (penting jika di-refresh di tengah halaman)
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        }
        
        window.addEventListener('scroll', () => {
            if (window.scrollY > 50) {
                nav.classList.add('scrolled');
            } else {
                nav.classList.remove('scrolled');
            }
        });
    }

    // ========== 2. ACTIVE MENU LINK ==========
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const pageMap = {
        'index.html': 'index',
        'menu.html': 'menu',
        'galeri.html': 'galeri',
        'kontak.html': 'kontak'
    };
    const currentKey = pageMap[currentPage] || 'index';
    
    // Set active link untuk desktop (khusus index.html, jika ada class .nav-link)
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-page') === currentKey) {
            link.classList.add('active');
        }
    });
    // Set active link untuk mobile
    document.querySelectorAll('.nav-link-mobile').forEach(link => {
        if (link.getAttribute('data-page') === currentKey) {
            link.classList.add('active');
        }
    });

    // ========== 3. MOBILE MENU TOGGLE ==========
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const mobileMenu = document.getElementById('mobile-menu');
    if (mobileMenuBtn && mobileMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenu.classList.toggle('hidden');
        });
        // Tutup menu saat link diklik
        mobileMenu.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', () => {
                mobileMenu.classList.add('hidden');
            });
        });
    }

    // ========== 4. CART FUNCTIONALITY ==========
    let cart = [];
    function loadCart() {
        const stored = localStorage.getItem('cateringCart');
        cart = stored ? JSON.parse(stored) : [];
        updateCartUI();
    }
    function saveCart() { localStorage.setItem('cateringCart', JSON.stringify(cart)); }
    function updateCartUI() {
        const cartItemsContainer = document.getElementById('cart-items');
        const cartTotalSpan = document.getElementById('cart-total');
        const cartBadge = document.getElementById('cart-badge');
        
        if (!cartItemsContainer) return;
        
        if (cart.length === 0) {
            cartItemsContainer.innerHTML = '<p class="text-center text-on-surface-variant">Keranjang kosong</p>';
            if (cartTotalSpan) cartTotalSpan.innerText = 'Rp 0';
            if (cartBadge) { 
                cartBadge.innerText = '0'; 
                cartBadge.classList.add('hidden'); 
            }
            return;
        }
        
        let total = 0;
        let html = '';
        cart.forEach((item, idx) => {
            total += item.price * item.qty;
            html += `
                <div class="flex gap-4 items-center border-b pb-4">
                    <div class="flex-grow">
                        <h4 class="font-bold">${item.name}</h4>
                        <p class="text-sm text-on-surface-variant">Jumlah: ${item.qty}</p>
                    </div>
                    <p class="font-bold text-primary">Rp ${(item.price * item.qty).toLocaleString()}</p>
                    <button class="remove-item text-red-600" data-index="${idx}">
                        <span class="material-symbols-outlined">delete</span>
                    </button>
                </div>
            `;
        });
        
        cartItemsContainer.innerHTML = html;
        if (cartTotalSpan) cartTotalSpan.innerText = `Rp ${total.toLocaleString()}`;
        
        const totalQty = cart.reduce((sum, i) => sum + i.qty, 0);
        if (cartBadge) { 
            cartBadge.innerText = totalQty; 
            cartBadge.classList.remove('hidden'); 
        }
        
        // Bind event hapus
        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const idx = parseInt(btn.currentTarget.dataset.index);
                cart.splice(idx, 1);
                saveCart();
                updateCartUI();
            });
        });
    }

    // Success Modal
    const modal = document.getElementById('success-modal');
    const modalMessage = document.getElementById('modal-message');
    const countdownSpan = document.getElementById('countdown');
    let closeTimer = null, countdownInterval = null;
    
    function showSuccessModal(message) {
        if (!modal) return;
        modalMessage.innerText = message;
        let secondsLeft = 5;
        countdownSpan.innerText = secondsLeft;
        
        if (closeTimer) clearTimeout(closeTimer);
        if (countdownInterval) clearInterval(countdownInterval);
        
        countdownInterval = setInterval(() => {
            secondsLeft--;
            countdownSpan.innerText = secondsLeft;
            if (secondsLeft <= 0) { 
                clearInterval(countdownInterval); 
                closeModal(); 
            }
        }, 1000);
        
        closeTimer = setTimeout(() => closeModal(), 5000);
        modal.classList.add('active');
    }
    
    function closeModal() {
        if (!modal) return;
        modal.classList.remove('active');
        if (closeTimer) clearTimeout(closeTimer);
        if (countdownInterval) clearInterval(countdownInterval);
    }
    
    const closeModalBtn = document.getElementById('close-modal-btn');
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);

    // Fungsi Tambah ke Keranjang
    function addToCart(name, price) {
        const existing = cart.find(item => item.name === name);
        if (existing) existing.qty++;
        else cart.push({ name, price, qty: 1 });
        
        saveCart();
        updateCartUI();
        showSuccessModal(`${name} ditambahkan ke keranjang!`);
    }
    
    function bindAddToCartButtons() {
        document.querySelectorAll('.add-to-cart').forEach(btn => {
            btn.removeEventListener('click', addToCartHandler);
            btn.addEventListener('click', addToCartHandler);
        });
    }
    
    function addToCartHandler(e) {
        const btn = e.currentTarget;
        const name = btn.getAttribute('data-name');
        const price = parseInt(btn.getAttribute('data-price'));
        if (name && price) addToCart(name, price);
    }

    loadCart();
    bindAddToCartButtons();
    window.bindAddToCart = bindAddToCartButtons;

    // Cart Drawer Toggle
    const cartDrawer = document.getElementById('cart-drawer');
    if (cartDrawer) {
        const openCartBtns = document.querySelectorAll('.cart-toggle-btn');
        openCartBtns.forEach(btn => btn.addEventListener('click', () => cartDrawer.classList.add('active')));
        const closeDrawer = () => cartDrawer.classList.remove('active');
        document.querySelectorAll('.close-drawer, .drawer-overlay').forEach(el => el?.addEventListener('click', closeDrawer));
    }

    // Checkout via WA
    const checkoutBtn = document.getElementById('checkout-wa');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            if (cart.length === 0) { 
                alert('Keranjang masih kosong!'); 
                return; 
            }
            let message = 'Halo, saya ingin memesan:%0A';
            cart.forEach(item => message += `- ${item.name} (${item.qty} pcs) = Rp ${(item.price * item.qty).toLocaleString()}%0A`);
            const total = cart.reduce((s, i) => s + (i.price * i.qty), 0);
            message += `%0ATotal: Rp ${total.toLocaleString()}%0A%0ATerima kasih.`;
            window.open(`https://wa.me/628978613607?text=${message}`, '_blank');
        });
    }

    // ========== MENU DATA ==========
    const menuItems = [
        { name: "Paket Reguler A", category: "prasmanan", price: 41000, desc: "Nasi, Ayam Goreng/Bakar, Tahu Tempe, Lalapan, Sambel, Kerupuk", img: "media/menu/prasmanan/reguler-a.jpg" },
        { name: "Paket Reguler B", category: "prasmanan", price: 42000, desc: "Nasi, Ayam Goreng/Bakar, Capcay, Tahu Tempe, Lalapan, Sambel", img: "media/menu/prasmanan/reguler-b.jpg" },
        { name: "Paket Reguler C", category: "prasmanan", price: 50000, desc: "Nasi, Ayam Bakar/Goreng, Ikan Asin, Tahu Tempe, Lalapan, Sambel", img: "media/menu/prasmanan/reguler-c.jpg" },
        { name: "Paket Reguler D", category: "prasmanan", price: 58000, desc: "Nasi, Ayam Bakar, Ikan Asin, Tahu Tempe, Sayur Asem, Sambel", img: "media/menu/prasmanan/reguler-d.jpg" },
        { name: "Paket Platinum E", category: "prasmanan", price: 80000, desc: "Nasi, Ayam Bakakak, Ikan Nila Bakar, Tahu Tempe, Urap, Sambel", img: "media/menu/prasmanan/platinum-e.jpg" },
        { name: "Paket Platinum F", category: "prasmanan", price: 90000, desc: "Nasi, Ayam Bakakak, Ikan Gurame Bakar, Tahu Tempe, Sayur Asem, Sambel", img: "media/menu/prasmanan/platinum-f.jpg" },
        { name: "Paket Platinum G", category: "prasmanan", price: 99000, desc: "Nasi, Ayam Bakakak, Udang Bakar, Tahu Tempe, Sayur Asem, Sambel", img: "media/menu/prasmanan/platinum-g.jpg" },
        { name: "Nasi Box Kardus", category: "nasibox", price: 25000, desc: "Nasi, Ayam Bakar/Goreng, Tempe/Tahu, Lalapan, Sambel", img: "media/menu/nasibox/kardus.jpg" },
        { name: "Nasi Box Kardus Daging", category: "nasibox", price: 30000, desc: "Nasi, Daging Capcay, Kentang Balado, Sambel, Kerupuk", img: "media/menu/nasibox/kardus-daging.jpg" },
        { name: "Nasi Box Besek Premium", category: "nasibox", price: 40000, desc: "Nasi, Ayam Bakar, Tahu Tempe, Ikan Asin, Cumi, Lalapan", img: "media/menu/nasibox/besek-premium.jpg" },
        { name: "Nasi Box Besek Bambu Premium", category: "nasibox", price: 45000, desc: "Nasi Liwet Teri, Ayam Goreng, Tempe Tahu, Ikan Teri, Lalapan", img: "media/menu/nasibox/besek-bambu.jpg" },
        { name: "Nasi Box Ayam Bakar Taliwang", category: "nasibox", price: 30000, desc: "Nasi, Ayam Bakar Taliwang, Bacem Tempe, Lalapan, Sambel", img: "media/menu/nasibox/taliwang.jpg" },
        { name: "Tumpeng Reguler", category: "tumpengan", price: 300000, desc: "Tumpeng Reguler 10 pax: Rp 350.000, 20 pax: Rp 700.000", img: "media/menu/tumpengan/reguler.jpg" },
        { name: "Tumpeng Premium", category: "tumpengan", price: 400000, desc: "Tumpeng Premium 10 pax: Rp 400.000, 20 pax: Rp 800.000", img: "media/menu/tumpengan/premium.jpg" },
        { name: "Liwetan Tampah", category: "tumpengan", price: 30000, desc: "Liwetan Tampah 10 pax: Rp 400.000, 20 pax: Rp 800.000", img: "media/menu/tumpengan/liwetan.jpg" },
        { name: "Tumpeng Mini", category: "paket_unik", price: 30000, desc: "Nasi Kuning, Ayam Bakar/Goreng, Perkedel Kentang, Sambel", img: "media/menu/paket_unik/tumpeng-mini.jpg" },
        { name: "Paket Bento", category: "paket_unik", price: 25000, desc: "Nasi, Ayam Bakar, Tempe Tahu, Lalapan, Sambel", img: "media/menu/paket_unik/bento.jpg" },
        { name: "Rice Bowl Birthday", category: "paket_unik", price: 20000, desc: "Nasi Kuning, Chicken Nugget, Mie Goreng, Telur Dadar", img: "media/menu/paket_unik/rice-bowl.jpg" },
        { name: "Aqiqah Reguler Laki-Laki", category: "aqiqah", price: 4800000, desc: "2 kambing betina, 100 pax, lengkap dengan nasi box", img: "media/menu/aqiqah/reguler-laki.jpg" },
        { name: "Aqiqah Reguler Perempuan", category: "aqiqah", price: 2600000, desc: "1 kambing betina, 50 pax, lengkap dengan nasi box", img: "media/menu/aqiqah/reguler-perempuan.jpg" },
        { name: "Aqiqah Premium Laki-Laki", category: "aqiqah", price: 5500000, desc: "2 kambing betina, 100 pax, menu premium", img: "media/menu/aqiqah/premium-laki.jpg" },
        { name: "Aqiqah Premium Perempuan", category: "aqiqah", price: 3000000, desc: "1 kambing betina, 50 pax, menu premium", img: "media/menu/aqiqah/premium-perempuan.jpg" },
        { name: "Paket Snack Box", category: "snack", price: 25000, desc: "Kue basah & kering pilihan, air mineral", img: "media/menu/snack/snack-box.jpg" },
        { name: "Paket Snack Premium", category: "snack", price: 35000, desc: "Pastry, pudding, buah, jus", img: "media/menu/snack/snack-premium.jpg" },
    ];

    const categories = [...new Set(menuItems.map(item => item.category))];
    const categoryNames = {
        'prasmanan': 'Prasmanan', 'nasibox': 'Nasi Box', 'tumpengan': 'Tumpengan & Liwetan',
        'paket_unik': 'Paket Unik', 'aqiqah': 'Aqiqah', 'snack': 'Snack',
    };

    // Render filter buttons (menu.html)
    const filterContainer = document.getElementById('menu-filter-buttons');
    if (filterContainer) {
        let html = `<button data-filter="all" class="filter-btn silk-gradient text-white shadow-lg shadow-primary/20 hover:scale-105">Semua Menu</button>`;
        categories.forEach(cat => {
            html += `<button data-filter="${cat}" class="filter-btn bg-white text-on-surface-variant hover:bg-surface-container-highest transition-all shadow-sm">${categoryNames[cat] || cat}</button>`;
        });
        filterContainer.innerHTML = html;
        
        document.querySelectorAll('#menu-filter-buttons .filter-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const filter = btn.getAttribute('data-filter');
                currentFilter = filter;
                currentPageNum = 1;
                renderMenu();
                
                document.querySelectorAll('#menu-filter-buttons .filter-btn').forEach(b => {
                    if (b === btn) {
                        b.classList.add('silk-gradient', 'text-white', 'shadow-lg');
                        b.classList.remove('bg-white', 'text-on-surface-variant');
                    } else {
                        b.classList.remove('silk-gradient', 'text-white', 'shadow-lg');
                        b.classList.add('bg-white', 'text-on-surface-variant');
                    }
                });
            });
        });
    }

    let currentFilter = 'all';
    let currentPageNum = 1;
    const itemsPerPage = 6;

    function renderMenu() {
        const menuGrid = document.getElementById('menu-grid');
        if (!menuGrid) return;
        const filtered = currentFilter === 'all' ? menuItems : menuItems.filter(item => item.category === currentFilter);
        const totalPages = Math.ceil(filtered.length / itemsPerPage);
        const start = (currentPageNum - 1) * itemsPerPage;
        const paginatedItems = filtered.slice(start, start + itemsPerPage);
        
        menuGrid.innerHTML = paginatedItems.map(item => `
            <div class="menu-card">
                <div class="img-container cursor-pointer img-preview" data-img="${item.img}">
                    <img src="${item.img}" alt="${item.name}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                </div>
                <div class="card-content">
                    <div class="title-price">
                        <h3>${item.name}</h3>
                        <span class="price">Rp ${item.price.toLocaleString()}</span>
                    </div>
                    <p class="desc">${item.desc}</p>
                    <button class="add-to-cart" data-name="${item.name}" data-price="${item.price}">
                        <span class="material-symbols-outlined text-xl">add_shopping_cart</span>
                        Tambah ke Keranjang
                    </button>
                </div>
            </div>
        `).join('');
        
        bindAddToCartButtons();
        
        document.querySelectorAll('#menu-grid .img-preview').forEach(el => {
            el.addEventListener('click', () => {
                const imgSrc = el.getAttribute('data-img');
                const modalImg = document.getElementById('modal-image');
                if (modalImg) {
                    modalImg.src = imgSrc;
                    document.getElementById('image-modal').classList.add('active');
                }
            });
        });
        renderPagination(totalPages);
    }

    function renderPagination(totalPages) {
        const paginationContainer = document.getElementById('pagination-container');
        if (!paginationContainer) return;
        if (totalPages <= 1) {
            paginationContainer.innerHTML = '';
            return;
        }
        let html = '';
        for (let i = 1; i <= totalPages; i++) {
            html += `<button class="pagination-btn ${i === currentPageNum ? 'active' : ''}" data-page="${i}">${i}</button>`;
        }
        paginationContainer.innerHTML = html;
        
        document.querySelectorAll('#pagination-container .pagination-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                currentPageNum = parseInt(btn.getAttribute('data-page'));
                renderMenu();
                document.getElementById('menu-grid').scrollIntoView({ behavior: 'smooth', block: 'start' });
            });
        });
    }

    if (document.getElementById('menu-grid')) {
        renderMenu();
    }

    // ========== GALERI PAGE ==========
    const galleryGrid = document.getElementById('gallery-grid');
    if (galleryGrid) {
        const galleryItems = [
            { type: "makanan", img: "media/galeri/prasmanan-1.jpg", title: "Paket Reguler A" },
            { type: "makanan", img: "media/galeri/prasmanan-2.jpg", title: "Paket Platinum E" },
            { type: "makanan", img: "media/galeri/nasibox-1.jpg", title: "Nasi Box Kardus Daging" },
            { type: "makanan", img: "media/galeri/tumpengan-1.jpg", title: "Tumpeng Premium" },
            { type: "makanan", img: "media/galeri/paket_unik-1.jpg", title: "Tumpeng Mini" },
            { type: "makanan", img: "media/galeri/aqiqah-1.jpg", title: "Aqiqah Premium" },
            { type: "makanan", img: "media/galeri/snack-1.jpg", title: "Paket Snack Box" },
            { type: "makanan", img: "media/galeri/prasmanan-3.jpg", title: "Set Prasmanan Elegan" },
            { type: "makanan", img: "media/galeri/nasibox-2.jpg", title: "Nasi Box Besek Premium" },
            { type: "makanan", img: "media/galeri/tumpengan-2.jpg", title: "Liwetan Tampah" },
            
            { type: "event", img: "media/galeri/event-1.jpg", title: "Pernikahan Mewah" },
            { type: "event", img: "media/galeri/event-2.jpg", title: "Garden Party" },
            { type: "event", img: "media/galeri/event-3.jpg", title: "Dekorasi Prasmanan" },
            { type: "event", img: "media/galeri/event-4.jpg", title: "Acara Kantor" },
            { type: "event", img: "media/galeri/event-5.jpg", title: "Pesta Ulang Tahun" },
            { type: "event", img: "media/galeri/event-6.jpg", title: "Tumpengan Kantor" },
            { type: "event", img: "media/galeri/event-7.jpg", title: "Acara Keluarga" },
            { type: "event", img: "media/galeri/event-8.jpg", title: "Pernikahan Outdoor" },
            { type: "event", img: "media/galeri/event-9.jpg", title: "Resepsi Akad" },
            { type: "event", img: "media/galeri/event-10.jpg", title: "Syukuran Rumah" }
        ];

        const galleryFilterContainer = document.getElementById('gallery-filter-buttons');
        if (galleryFilterContainer) {
            const galleryCategories = ['all', 'makanan', 'event'];
            const galleryCategoryLabels = { all: 'Semua', makanan: 'Makanan', event: 'Acara' };
            
            function renderGalleryFilters() {
                let html = '';
                galleryCategories.forEach(cat => {
                    html += `<button data-filter="${cat}" class="filter-btn ${cat === 'all' ? 'silk-gradient text-white shadow-lg' : 'bg-white text-on-surface-variant'} transition-all hover:scale-105">${galleryCategoryLabels[cat]}</button>`;
                });
                galleryFilterContainer.innerHTML = html;
                
                document.querySelectorAll('#gallery-filter-buttons .filter-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        const filter = btn.getAttribute('data-filter');
                        currentGalleryFilter = filter;
                        currentGalleryPage = 1;
                        renderGallery();
                        
                        document.querySelectorAll('#gallery-filter-buttons .filter-btn').forEach(b => {
                            if (b === btn) {
                                b.classList.add('silk-gradient', 'text-white', 'shadow-lg');
                                b.classList.remove('bg-white', 'text-on-surface-variant');
                            } else {
                                b.classList.remove('silk-gradient', 'text-white', 'shadow-lg');
                                b.classList.add('bg-white', 'text-on-surface-variant');
                            }
                        });
                    });
                });
            }

            let currentGalleryFilter = 'all';
            let currentGalleryPage = 1;
            const galleryItemsPerPage = 10; 

            function renderGallery() {
                const filtered = currentGalleryFilter === 'all' ? galleryItems : galleryItems.filter(item => item.type === currentGalleryFilter);
                const totalPages = Math.ceil(filtered.length / galleryItemsPerPage);
                const start = (currentGalleryPage - 1) * galleryItemsPerPage;
                const paginatedItems = filtered.slice(start, start + galleryItemsPerPage);
                
                galleryGrid.innerHTML = paginatedItems.map(item => `
                    <div class="gallery-item cursor-pointer" data-img="${item.img}">
                        <img src="${item.img}" alt="${item.title}" onerror="this.src='https://placehold.co/600x400?text=No+Image'">
                        <div class="gallery-overlay">
                            <span class="text-yellow-500 font-bold uppercase tracking-wider">${item.type === 'makanan' ? 'Makanan' : 'Acara'}</span>
                            <h3 class="text-white font-headline text-lg md:text-xl">${item.title}</h3>
                        </div>
                    </div>
                `).join('');
                
                document.querySelectorAll('#gallery-grid .gallery-item').forEach(el => {
                    el.addEventListener('click', () => {
                        const imgSrc = el.getAttribute('data-img');
                        const modalImg = document.getElementById('modal-image');
                        if (modalImg) {
                            modalImg.src = imgSrc;
                            document.getElementById('image-modal').classList.add('active');
                        }
                    });
                });
                renderGalleryPagination(totalPages);
            }

            function renderGalleryPagination(totalPages) {
                const paginationContainer = document.getElementById('gallery-pagination');
                if (!paginationContainer) return;
                if (totalPages <= 1) {
                    paginationContainer.innerHTML = '';
                    return;
                }
                let html = '';
                for (let i = 1; i <= totalPages; i++) {
                    html += `<button class="pagination-btn ${i === currentGalleryPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
                }
                paginationContainer.innerHTML = html;
                
                document.querySelectorAll('#gallery-pagination .pagination-btn').forEach(btn => {
                    btn.addEventListener('click', () => {
                        currentGalleryPage = parseInt(btn.getAttribute('data-page'));
                        renderGallery();
                        document.getElementById('gallery-container').scrollIntoView({ behavior: 'smooth', block: 'start' });
                    });
                });
            }

            renderGalleryFilters();
            renderGallery();
        }
    }

    // ========== IMAGE MODAL CLOSE ==========
    const imageModal = document.getElementById('image-modal');
    const closeImgBtn = document.getElementById('close-modal-img');
    if (closeImgBtn) {
        closeImgBtn.addEventListener('click', () => imageModal.classList.remove('active'));
        imageModal.addEventListener('click', (e) => {
            if (e.target === imageModal) imageModal.classList.remove('active');
        });
    }

    // ========== CONTACT FORM ==========
    const contactForm = document.getElementById('contact-form');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const name = contactForm.querySelector('input[placeholder="Nama Lengkap Anda"]').value;
            const phone = contactForm.querySelector('input[placeholder="+62 ..."]').value;
            const message = contactForm.querySelector('textarea').value;
            const waMsg = `Halo, saya ${name} (${phone}) ingin bertanya:%0A${message}%0A%0ATerima kasih.`;
            window.open(`https://wa.me/628978613607?text=${encodeURIComponent(waMsg)}`, '_blank');
        });
    }
});
