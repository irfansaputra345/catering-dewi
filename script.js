document.addEventListener("DOMContentLoaded", () => {

    const CONFIG = {
        whatsapp: "6285927326555",
        minOrder: 100000,
        openHour: 9,
        closeHour: 20
    };

    const menuData = [
        { id: 1, name: "Nasi Box Ayam Bakar", price: 25000, img: "https://loremflickr.com/400/300/chicken,food", rating: 4.8, desc: "Nasi putih pulen, ayam bakar bumbu rujak, lalapan segar, dan sambal terasi." },
        { id: 2, name: "Snack Box Premium", price: 15000, img: "https://loremflickr.com/400/300/snack,cake", rating: 4.5, desc: "Isi 3 kue basah (lemper, risoles, sus), air mineral, dan tisu." },
        { id: 3, name: "Tumpeng Mini", price: 300000, img: "https://loremflickr.com/400/300/tumpeng,indonesianfood", rating: 5.0, desc: "Tumpeng nasi kuning untuk 5-8 orang dengan 7 macam lauk pauk komplit." },
        { id: 4, name: "Catering Harian", price: 35000, img: "https://loremflickr.com/400/300/lunchbox,meal", rating: 4.7, desc: "Menu makan siang berganti setiap hari, termasuk nasi, lauk utama, sayur, dan buah." }
    ];

    let cart = JSON.parse(localStorage.getItem("cart")) || [];

    const menuList = document.getElementById("menuList");
    const cartEl = document.getElementById("cart");
    const cartItems = document.getElementById("cartItems");
    const totalPrice = document.getElementById("totalPrice");
    const cartCount = document.getElementById("cartCount");

    /* RENDER MENU */
    if (menuList) {
        menuData.forEach(item => {
            menuList.innerHTML += `
                <div class="card">
                    <img src="${item.img}">
                    <div class="content">
                        <h3>${item.name}</h3>
                        <p class="desc">${item.desc}</p>
                        <p class="rating">⭐ ${item.rating} / 5.0</p>
                        <p>Rp ${item.price.toLocaleString()}</p>
                        <button data-id="${item.id}">Tambah</button>
                    </div>
                </div>
            `;
        });

        menuList.addEventListener("click", e => {
            if (e.target.tagName === "BUTTON") {
                addToCart(Number(e.target.dataset.id));
            }
        });
    }

    function addToCart(id) {
        const item = menuData.find(m => m.id === id);
        const exist = cart.find(c => c.id === id);
        exist ? exist.qty++ : cart.push({ ...item, qty: 1 });
        save();
        updateCart();
        Swal.fire("Ditambahkan", item.name, "success");
    }

    function updateCart() {
        cartItems.innerHTML = "";
        let total = 0, count = 0;

        cart.forEach(item => {
            total += item.price * item.qty;
            count += item.qty;
            cartItems.innerHTML += `
            <li>
                <span>${item.name} (${item.qty})</span>
                <button class="delete-item-btn" onclick="removeFromCart(${item.id})"><i class='bx bx-trash'></i></button>
            </li>`;
        });

        totalPrice.textContent = total.toLocaleString();
        cartCount.textContent = count;
    }

    window.removeFromCart = (id) => {
        cart = cart.filter(item => item.id !== id);
        save();
        updateCart();
    };

    function save() {
        localStorage.setItem("cart", JSON.stringify(cart));
    }

    window.toggleCart = () => cartEl.classList.toggle("active");

    window.orderNow = () => {
        if (!cart.length) return Swal.fire("Keranjang kosong", "", "warning");

        // CHECK OPERATING HOURS
        const hour = new Date().getHours();
        const { openHour, closeHour } = CONFIG;
        if (hour < openHour || hour >= closeHour) {
            return Swal.fire({
                icon: 'error',
                title: 'Maaf, Kami Tutup',
                text: `Kami melayani pemesanan dari jam ${openHour < 10 ? '0' + openHour : openHour}:00 sampai ${closeHour}:00.`
            });
        }

        let total = cart.reduce((s, i) => s + i.price * i.qty, 0);
        if (total < CONFIG.minOrder) {
            return Swal.fire("Minimal Order", `Rp ${CONFIG.minOrder.toLocaleString()}`, "info");
        }

        let msg = "*PESANAN CATERING DEWI IRFAN*\n\n";
        cart.forEach((i, n) => msg += `${n + 1}. ${i.name} (${i.qty}x)\n`);
        msg += `\nTotal: Rp ${total.toLocaleString()}`;

        window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`, "_blank");
        cart = [];
        save();
        updateCart();
        toggleCart();
    };

    /* SIDEBAR */
    const sidebar = document.getElementById("sidebar");
    const overlay = document.getElementById("overlay");
    document.getElementById("menuToggle").onclick = () => {
        sidebar.classList.add("active");
        overlay.classList.add("active");
    };
    document.getElementById("closeSidebar").onclick = closeSidebar;
    overlay.onclick = closeSidebar;

    function closeSidebar() {
        sidebar.classList.remove("active");
        overlay.classList.remove("active");
    }

    updateCart();

    /* DARK MODE TOGGLE */
    const toggleBtn = document.getElementById("themeToggle");
    const savedTheme = localStorage.getItem("theme");

    // Helper to set icon
    const setIcon = (isDark) => {
        if (toggleBtn) toggleBtn.innerHTML = isDark ? "<i class='bx bx-sun'></i>" : "<i class='bx bx-moon'></i>";
    };

    // Set initial state
    if (savedTheme === "dark") {
        document.body.classList.add("dark-mode");
        setIcon(true);
    } else {
        setIcon(false);
    }

    if (toggleBtn) {
        toggleBtn.addEventListener("click", () => {
            document.body.classList.toggle("dark-mode");
            const isDark = document.body.classList.contains("dark-mode");
            setIcon(isDark);
            localStorage.setItem("theme", isDark ? "dark" : "light");
        });
    }
    /* MODAL LOGIC */
    const modalMarkup = `
    <div class="modal-overlay" id="menuModal">
        <div class="modal-content">
            <button class="modal-close" onclick="closeModal()"><i class='bx bx-x'></i></button>
            <img src="" alt="" class="modal-img" id="modalImg">
            <div class="modal-body">
                <h3 id="modalTitle"></h3>
                <p class="rating" id="modalRating"></p>
                <p id="modalDesc" style="margin: 15px 0; line-height: 1.6; color: #555;"></p>
                <h4 id="modalPrice" style="color: var(--primary); margin-bottom: 20px;"></h4>
                <button id="modalAddBtn" style="width: 100%; border: none; background: var(--primary); color: white; padding: 12px; border-radius: 8px; cursor: pointer;">Tambah ke Keranjang</button>
            </div>
        </div>
    </div>`;
    document.body.insertAdjacentHTML('beforeend', modalMarkup);

    const modal = document.getElementById("menuModal");
    const modalImg = document.getElementById("modalImg");
    const modalTitle = document.getElementById("modalTitle");
    const modalRating = document.getElementById("modalRating");
    const modalDesc = document.getElementById("modalDesc");
    const modalPrice = document.getElementById("modalPrice");
    const modalAddBtn = document.getElementById("modalAddBtn");

    if (menuList) {
        menuList.addEventListener("click", e => {
            // Check if clicked element is NOT a button (Add to Cart)
            if (e.target.tagName !== "BUTTON" && e.target.closest(".card")) {
                const card = e.target.closest(".card");
                const title = card.querySelector("h3").innerText;
                const item = menuData.find(m => m.name === title);
                if (item) openModal(item);
            }
        });
    }

    function openModal(item) {
        modalImg.src = item.img;
        modalTitle.innerText = item.name;
        modalRating.innerHTML = `⭐ ${item.rating} / 5.0`;
        modalDesc.innerText = item.desc;
        modalPrice.innerText = `Rp ${item.price.toLocaleString()}`;

        modalAddBtn.onclick = () => {
            addToCart(item.id);
            closeModal();
        };

        modal.classList.add("active");
    }

    window.closeModal = () => {
        modal.classList.remove("active");
    };

    modal.addEventListener("click", e => {
        if (e.target === modal) closeModal();
    });
});
