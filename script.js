// script.js - Full functionality with menu pagination, cart, and gallery collage with pagination & modal
document.addEventListener('DOMContentLoaded', () => {
    // ========== 1. NAVBAR SCROLL EFFECT ==========
    const nav = document.getElementById('main-nav');
    if (nav) {
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
    
    document.querySelectorAll('.nav-link').forEach(link => {
        if (link.getAttribute('data-page') === currentKey) {
            link.classList.add('active');
        }
    });
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

    // ========== MENU DATA (DIPERBARUI MENDUKUNG 2 GAMBAR SLIDER) ==========
    const menuItems = [
        // Prasmanan (Tanpa detail)
        { name: "Paket Reguler A", category: "prasmanan", price: 41000, desc: "Nasi, Ayam Goreng/Bakar, Tahu Tempe, Lalapan, Sambel, Kerupuk", imgMain: "media/menu/prasmanan/reguler-a.jpg", imgDetail: null },
        { name: "Paket Reguler B", category: "prasmanan", price: 42000, desc: "Nasi, Ayam Goreng/Bakar, Capcay, Tahu Tempe, Lalapan, Sambel", imgMain: "media/menu/prasmanan/reguler-b.jpg", imgDetail: null },
        { name: "Paket Reguler C", category: "prasmanan", price: 50000, desc: "Nasi, Ayam Bakar/Goreng, Ikan Asin, Tahu Tempe, Lalapan, Sambel", imgMain: "media/menu/prasmanan/reguler-c.jpg", imgDetail: null },
        { name: "Paket Reguler D", category: "prasmanan", price: 58000, desc: "Nasi, Ayam Bakar, Ikan Asin, Tahu Tempe, Sayur Asem, Sambel", imgMain: "media/menu/prasmanan/reguler-d.jpg", imgDetail: null },
        { name: "Paket Platinum E", category: "prasmanan", price: 80000, desc: "Nasi, Ayam Bakakak, Ikan Nila Bakar, Tahu Tempe, Urap, Sambel", imgMain: "media/menu/prasmanan/platinum-e.jpg", imgDetail: null },
        { name: "Paket Platinum F", category: "prasmanan", price: 90000, desc: "Nasi, Ayam Bakakak, Ikan Gurame Bakar, Tahu Tempe, Sayur Asem, Sambel", imgMain: "media/menu/prasmanan/platinum-f.jpg", imgDetail: null },
        { name: "Paket Platinum G", category: "prasmanan", price: 99000, desc: "Nasi, Ayam Bakakak, Udang Bakar, Tahu Tempe, Sayur Asem, Sambel", imgMain: "media/menu/prasmanan/platinum-g.jpg", imgDetail: null },
        
        // Nasi Box (Diperbarui dengan detail)
        { name: "Paket Hemat Styrofoam", category: "nasibox", price: 22000, desc: "Nasi, Ayam bakar/goreng, Tempe, Lalapan, Sambel", imgMain: "media/menu/nasibox/hemat-styrofoam.jpg", imgDetail: "media/menu/nasibox/hemat-styrofoam-detail.png" },
        { name: "Nasi Box Reguler Paket 2", category: "nasibox", price: 27000, desc: "Nasi liwet bakar, Ayam Bakar, tempe/tahu, Lalapan, Sambel", imgMain: "media/menu/nasibox/reguler-2.jpg", imgDetail: "media/menu/nasibox/reguler-2-detail.png" },
        { name: "Nasi Box Reguler Paket 3", category: "nasibox", price: 30000, desc: "Nasi, Daging capcay, kentang balado, Sambel, Kerupuk", imgMain: "media/menu/nasibox/reguler-3.jpg", imgDetail: "media/menu/nasibox/reguler-3-detail.png" },
        { name: "Nasi Besek Premium Paket 1", category: "nasibox", price: 30000, desc: "Nasi Putih, Ayam Bakar, Tempe, Tahu, Lalapan, Sambel", imgMain: "media/menu/nasibox/besek-premium-1.jpg", imgDetail: "media/menu/nasibox/besek-premium-1-detail.jpg" },
        { name: "Nasi Besek Premium Paket 2", category: "nasibox", price: 35000, desc: "Nasi Bakar, Ayam Bakar, Tempe, Tahu, Lalapan, Sambel, Kerupuk", imgMain: "media/menu/nasibox/besek-premium-2.jpg", imgDetail: "media/menu/nasibox/besek-premium-2-detail.jpg" },
        { name: "Nasi Besek Premium Paket 3", category: "nasibox", price: 40000, desc: "Nasi, Ayam Bakar, Tempe, Tahu, Ikan Asin cumi, Lalapan, Sambel", imgMain: "media/menu/nasibox/besek-premium-3.jpg", imgDetail: "media/menu/nasibox/besek-premium-3-detail.jpg" },
        { name: "Nasi Besek Premium Paket 4", category: "nasibox", price: 40000, desc: "Nasi liwet teri, Ayam Goreng, Tempe, Tahu, Ikan teri balado, Telur asin, Lalapan, Sambel", imgMain: "media/menu/nasibox/besek-premium-4.jpg", imgDetail: "media/menu/nasibox/besek-premium-4-detail.jpg" },
        
        // Tumpengan (Diperbarui dengan detail)
        { name: "Paket Tumpeng Reguler", category: "tumpengan", price: 350000, desc: "10 pax: Rp 350.000 | 20 pax: Rp 650.000 | 30 pax: Rp 950.000", imgMain: "media/menu/tumpengan/reguler-1.jpg", imgDetail: "media/menu/tumpengan/reguler-1-detail.png" },
        { name: "Tumpeng Premium Paket 1", category: "tumpengan", price: 400000, desc: "10 pax: Rp 400.000 | 20 pax: Rp 800.000 | 30 pax: Rp 1.150.000", imgMain: "media/menu/tumpengan/premium-1.jpg", imgDetail: "media/menu/tumpengan/premium-1-detail.jpg" },
        { name: "Tumpeng Premium Paket 2", category: "tumpengan", price: 400000, desc: "10 pax: Rp 400.000 | 20 pax: Rp 800.000 | 30 pax: Rp 1.150.000", imgMain: "media/menu/tumpengan/premium-2.jpg", imgDetail: "media/menu/tumpengan/premium-2-detail.jpg" },
        { name: "Tumpeng Premium Paket 3", category: "tumpengan", price: 400000, desc: "10 pax: Rp 400.000 | 20 pax: Rp 800.000 | 30 pax: Rp 1.150.000", imgMain: "media/menu/tumpengan/premium-3.jpg", imgDetail: "media/menu/tumpengan/premium-3-detail.jpg" },
        { name: "Liwetan Tampah Paket 1", category: "tumpengan", price: 400000, desc: "10 pax: Rp 400.000 | 20 pax: Rp 800.000 | 30 pax: Rp 1.200.000", imgMain: "media/menu/tumpengan/liwetan-1.jpg", imgDetail: "media/menu/tumpengan/liwetan-1-detail.png" },
        { name: "Liwetan Tampah Paket 2", category: "tumpengan", price: 400000, desc: "10 pax: Rp 400.000 | 20 pax: Rp 800.000 | 30 pax: Rp 1.200.000", imgMain: "media/menu/tumpengan/liwetan-2.jpg", imgDetail: "media/menu/tumpengan/liwetan-2-detail.png" },
        
        // Paket Unik (Diperbarui dengan detail)
        { name: "Paket Tumpeng Mini", category: "paket_unik", price: 30000, desc: "Nasi kuning, Ayam Bakar/Goreng, Perkedel kentang, Telur balado, Kering tempe, Mie goreng", imgMain: "media/menu/paket_unik/tumpeng-mini.jpg", imgDetail: "media/menu/paket_unik/tumpeng-mini-detail.png" },
        
        // Aqiqah (Tanpa detail)
        { name: "Aqiqah Reguler Laki-Laki", category: "aqiqah", price: 4800000, desc: "2 kambing betina, 100 pax, lengkap dengan nasi box", imgMain: "media/menu/aqiqah/reguler-laki.jpg", imgDetail: null },
        { name: "Aqiqah Reguler Perempuan", category: "aqiqah", price: 2600000, desc: "1 kambing betina, 50 pax, lengkap dengan nasi box", imgMain: "media/menu/aqiqah/reguler-perempuan.jpg", imgDetail: null },
        { name: "Aqiqah Premium Laki-Laki", category: "aqiqah", price: 5500000, desc: "2 kambing betina, 100 pax, menu premium", imgMain: "media/menu/aqiqah/premium-laki.jpg", imgDetail: null },
        { name: "Aqiqah Premium Perempuan", category: "aqiqah", price: 3000000, desc: "1 kambing betina, 50 pax, menu premium", imgMain: "media/menu/aqiqah/premium-perempuan.jpg", imgDetail: null },
        
        // Snack (Tanpa detail)
        { name: "Paket Snack Box", category: "snack", price: 25000, desc: "Kue basah & kering pilihan, air mineral", imgMain: "media/menu/snack/snack-box.jpg", imgDetail: null },
        { name: "Paket Snack Premium", category: "snack", price: 35000, desc: "Pastry, pudding, buah, jus", imgMain: "media/menu/snack/snack-premium.jpg", imgDetail: null },
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
        
        menuGrid.innerHTML = paginatedItems.map((item, idx) => {
            // Setup slider elements if imgDetail exists
            const imageContent = `
                <div class="flex overflow-x-auto snap-x snap-mandatory h-full w-full no-scrollbar scroll-smooth" id="slider-${idx}">
                    <div class="w-full h-full flex-shrink-0 snap-center relative img-preview cursor-pointer" data-img="${item.imgMain}">
                        <img src="${item.imgMain}" alt="${item.name}" onerror="this.src='https://placehold.co/600x400?text=Foto+Menu'" class="w-full h-full object-cover">
                        ${item.imgDetail ? `
                            <button onclick="document.getElementById('slider-${idx}').scrollBy({left: 300, behavior: 'smooth'}); event.stopPropagation();" class="absolute top-1/2 right-2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full hover:bg-black/60 z-10 hidden md:block"><span class="material-symbols-outlined text-sm">chevron_right</span></button>
                            <div class="absolute bottom-2 right-2 bg-black/60 text-white text-[10px] px-2 py-0.5 rounded-md pointer-events-none">Lihat Detail &raquo;</div>
                        ` : ''}
                    </div>
                    
                    ${item.imgDetail ? `
                    <div class="w-full h-full flex-shrink-0 snap-center relative img-preview cursor-pointer bg-surface-container-low" data-img="${item.imgDetail}">
                        <img src="${item.imgDetail}" alt="Detail ${item.name}" onerror="this.src='https://placehold.co/600x400?text=Katalog+Detail'" class="w-full h-full object-contain p-2">
                        <button onclick="document.getElementById('slider-${idx}').scrollBy({left: -300, behavior: 'smooth'}); event.stopPropagation();" class="absolute top-1/2 left-2 -translate-y-1/2 bg-black/40 text-white p-1 rounded-full hover:bg-black/60 z-10 hidden md:block"><span class="material-symbols-outlined text-sm">chevron_left</span></button>
                    </div>
                    ` : ''}
                </div>
            `;

            return `
            <div class="menu-card">
                <div class="img-container relative group">
                    ${imageContent}
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
            `;
        }).join('');
        
        bindAddToCartButtons();
        
        // Bind Modal Previews
        document.querySelectorAll('#menu-grid .img-preview').forEach(el => {
            el.addEventListener('click', (e) => {
                // Prevent clicking buttons from triggering modal
                if(e.target.tagName.toLowerCase() === 'button' || e.target.closest('button')) return;
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
