document.addEventListener("DOMContentLoaded", () => {

    const CONFIG = {
        whatsapp: "6285927326555",
        minOrder: 100000,
        openHour: 9,
        closeHour: 20
    };

    const menuData = [
        { id: 1, name: "Nasi Box Ayam Bakar", price: 25000, img: "https://loremflickr.com/400/300/chicken,food", rating: 4.8 },
        { id: 2, name: "Snack Box Premium", price: 15000, img: "https://loremflickr.com/400/300/snack,cake", rating: 4.5 },
        { id: 3, name: "Tumpeng Mini", price: 300000, img: "https://loremflickr.com/400/300/tumpeng,indonesianfood", rating: 5.0 },
        { id: 4, name: "Catering Harian", price: 35000, img: "https://loremflickr.com/400/300/lunchbox,meal", rating: 4.7 }
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
            cartItems.innerHTML += `<li>${item.name} (${item.qty})</li>`;
        });

        totalPrice.textContent = total.toLocaleString();
        cartCount.textContent = count;
    }

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
});
