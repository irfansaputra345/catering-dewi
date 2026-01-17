import { initializeApp } from "https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js";
import {
    getDatabase,
    ref,
    push,
    onValue,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-database.js";

const CONFIG = {
    whatsapp: "6285927326555",
    minOrder: 100000,
    openHour: 9,
    closeHour: 20,
};

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBD12ZSkKXT6-1282jbqWOUpmGty86oIXE",
    authDomain: "catring-irfan.firebaseapp.com",
    databaseURL: "https://catring-irfan-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "catring-irfan",
    storageBucket: "catring-irfan.firebasestorage.app",
    messagingSenderId: "601199637263",
    appId: "1:601199637263:web:901fefbe87be1b57f0447a",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const menuData = [
    {
        id: 1,
        name: "Nasi Box Ayam Bakar",
        price: 18000,
        img: "images/image 6.webp",
        rating: 4.8,
        desc: "Nasi putih pulen, ayam bakar bumbu rujak, lalapan segar, dan sambal terasi.",
    },
    {
        id: 2,
        name: "Mangut Ikan",
        price: 30000,
        img: "images/image 4.webp",
        rating: 4.5,
        desc: "Bisa request untuk ikanyab , ada Nila, Lele, Gurame, Dan Lain-Lain.",
    },
    {
        id: 3,
        name: "Rica-Rica",
        price: 300000,
        img: "images/image 8.webp",
        rating: 5.0,
        desc: "Rica - Rica bisa request daging ayam, daging entok, Harga bisa menyesuaikan dan bisa request sesuai budget.",
    },
    {
        id: 4,
        name: "Catering Harian",
        price: 35000,
        img: "images/image 10.webp",
        rating: 4.7,
        desc: "Menu makan siang berganti setiap hari, termasuk nasi, lauk utama, sayur, dan buah.",
    },
];

let cart = JSON.parse(localStorage.getItem("cart")) || [];

const menuList = document.getElementById("menuList");
const cartEl = document.getElementById("cart");
const cartItems = document.getElementById("cartItems");
const totalPrice = document.getElementById("totalPrice");
const cartCount = document.getElementById("cartCount");

/* RENDER MENU */
if (menuList) {
    menuData.forEach((item) => {
        menuList.innerHTML += `
                <div class="card" id="card-${item.id}">
                    <div class="card-img-wrapper">
                        <img src="${item.img}">
                        <button class="quick-add-cart-icon" onclick="window.addToCart(${item.id}); event.stopPropagation();" title="Tambah ke Keranjang">
                            <i class='bx bx-cart-add'></i>
                        </button>
                    </div>
                    <div class="content">
                        <h3>${item.name}</h3>
                        <p class="desc">${item.desc}</p>
                        <p class="rating">⭐ ${item.rating} / 5.0</p>
                        <p>Rp ${item.price.toLocaleString()}</p>
                        <div class="card-actions" id="actions-${item.id}">
                            <button class="add-to-cart-btn" data-id="${item.id}" onclick="window.addToCart(${item.id})">
                                <i class='bx bx-cart-add'></i> Tambah
                            </button>
                            <div class="card-qty-controls" style="display: none;">
                                <button class="card-ctrl-btn minus" onclick="window.updateQty(${item.id}, -1)">-</button>
                                <span class="card-qty-val">0</span>
                                <button class="card-ctrl-btn plus" onclick="window.updateQty(${item.id}, 1)">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            `;
    });
}

// Helper to update card badges based on cart state
function updateCardControls() {
    menuData.forEach((item) => {
        const actions = document.getElementById(`actions-${item.id}`);
        if (actions) {
            const addBtn = actions.querySelector(".add-to-cart-btn");
            const controls = actions.querySelector(".card-qty-controls");
            const qtyVal = actions.querySelector(".card-qty-val");

            const cartItem = cart.find((c) => c.id === item.id);

            if (cartItem && cartItem.qty > 0) {
                addBtn.style.display = "none";
                controls.style.display = "flex";
                qtyVal.innerText = cartItem.qty;
            } else {
                addBtn.style.display = "block";
                controls.style.display = "none";
                qtyVal.innerText = "0";
            }
        }
    });
}

window.addToCart = (id) => {
    const item = menuData.find((m) => m.id === id);
    const exist = cart.find((c) => c.id === id);
    exist ? exist.qty++ : cart.push({ ...item, qty: 1 });
    save();
    updateCart();
    updateCardControls();
    Swal.fire({
        title: "Ditambahkan",
        text: `${item.name}`,
        icon: "success",
        timer: 800,
        showConfirmButton: false,
    });
};

function updateCart() {
    cartItems.innerHTML = "";
    let total = 0,
        count = 0;

    cart.forEach((item) => {
        total += item.price * item.qty;
        count += item.qty;
        cartItems.innerHTML += `
            <li>
                <div class="item-info">
                    <span class="item-name">${item.name}</span>
                    <span class="item-price">@ Rp ${item.price.toLocaleString()}</span>
                </div>
                <div class="qty-controls">
                    <button class="qty-btn" onclick="window.updateQty(${item.id}, -1)">-</button>
                    <span class="qty-val">${item.qty}</span>
                    <button class="qty-btn" onclick="window.updateQty(${item.id}, 1)">+</button>
                </div>
                <button class="delete-item-btn" onclick="window.removeFromCart(${item.id})"><i class='bx bx-trash'></i></button>
            </li>`;
    });

    totalPrice.textContent = total.toLocaleString();
    cartCount.textContent = count;
}

window.updateQty = (id, change) => {
    const item = cart.find((i) => i.id === id);
    if (item) {
        item.qty += change;
        if (item.qty < 1) {
            window.removeFromCart(id); // Remove if 0
        } else {
            save();
            updateCart();
            updateCardControls();
        }
    }
};

window.removeFromCart = (id) => {
    cart = cart.filter((item) => item.id !== id);
    save();
    updateCart();
    updateCardControls();
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
            icon: "error",
            title: "Maaf, Kami Tutup",
            text: `Kami melayani pemesanan dari jam ${openHour < 10 ? "0" + openHour : openHour}:00 sampai ${closeHour}:00.`,
        });
    }

    let total = cart.reduce((s, i) => s + i.price * i.qty, 0);
    if (total < CONFIG.minOrder) {
        return Swal.fire(
            "Minimal Order",
            `Rp ${CONFIG.minOrder.toLocaleString()}`,
            "info",
        );
    }

    let msg = "*PESANAN CATERING DEWI IRFAN*\n\n";
    cart.forEach((i, n) => (msg += `${n + 1}. ${i.name} (${i.qty}x)\n`));
    msg += `\nTotal: Rp ${total.toLocaleString()}`;

    window.open(
        `https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(msg)}`,
        "_blank",
    );
    cart = [];
    save();
    updateCart();
    toggleCart();
};

/* SIDEBAR */
const sidebar = document.getElementById("sidebar");
const overlay = document.getElementById("overlay");
const menuToggle = document.getElementById("menuToggle");
if (menuToggle) {
    menuToggle.onclick = () => {
        sidebar.classList.add("active");
        overlay.classList.add("active");
    };
}
const closeSidebarBtn = document.getElementById("closeSidebar");
if (closeSidebarBtn) {
    closeSidebarBtn.onclick = closeSidebar;
}
if (overlay) {
    overlay.onclick = closeSidebar;
}

function closeSidebar() {
    sidebar.classList.remove("active");
    overlay.classList.remove("active");
}

updateCart();
updateCardControls(); // Sync badges on load

/* DARK MODE TOGGLE */
const toggleBtn = document.getElementById("themeToggle");
const savedTheme = localStorage.getItem("theme");

// Helper to set icon
const setIcon = (isDark) => {
    if (toggleBtn)
        toggleBtn.innerHTML = isDark
            ? "<i class='bx bx-sun'></i>"
            : "<i class='bx bx-moon'></i>";
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
document.body.insertAdjacentHTML("beforeend", modalMarkup);

const modal = document.getElementById("menuModal");
const modalImg = document.getElementById("modalImg");
const modalTitle = document.getElementById("modalTitle");
const modalRating = document.getElementById("modalRating");
const modalDesc = document.getElementById("modalDesc");
const modalPrice = document.getElementById("modalPrice");
const modalAddBtn = document.getElementById("modalAddBtn");

if (menuList) {
    menuList.addEventListener("click", (e) => {
        // Check if clicked element is NOT a button (Add to Cart)
        if (e.target.tagName !== "BUTTON" && e.target.closest(".card")) {
            const card = e.target.closest(".card");
            const title = card.querySelector("h3").innerText;
            const item = menuData.find((m) => m.name === title);
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
        window.addToCart(item.id);
        window.closeModal();
    };

    modal.classList.add("active");
}

window.closeModal = () => {
    modal.classList.remove("active");
};

modal.addEventListener("click", (e) => {
    if (e.target === modal) window.closeModal();
});

/* TESTIMONIALS LOGIC WITH FIREBASE */
const staticTestimonials = [
    {
        text: "Makanannya enak banget, bumbunya meresap sampai ke tulang! Recommended buat acara kantor.",
        name: "Budi Santoso",
        rating: "⭐⭐⭐⭐⭐",
    },
    {
        text: "Pesan tumpeng mini buat ultah anak, hiasannya cantik dan rasanya juara.",
        name: "Siti Aminah",
        rating: "⭐⭐⭐⭐⭐",
    },
    {
        text: "Pelayanan ramah dan pengiriman selalu tepat waktu. Langganan catering harian di sini.",
        name: "Rina Marlina",
        rating: "⭐⭐⭐⭐½",
    },
];

let testimonialsData = [...staticTestimonials];

// Fetch Reviews from Firebase
function fetchReviews() {
    const reviewsRef = ref(db, "reviews");
    onValue(reviewsRef, (snapshot) => {
        const data = snapshot.val();
        if (data) {
            const firebaseReviews = Object.values(data).reverse();
            testimonialsData = [...firebaseReviews, ...staticTestimonials];
        }
    });
}
fetchReviews();

const testModalMarkup = `
    <div class="modal-overlay" id="testModal">
        <div class="modal-content" style="max-width: 600px;">
            <button class="modal-close" onclick="closeTestModal()"><i class='bx bx-x'></i></button>
            <div class="modal-body" style="text-align: center;">
                <h3 style="margin-bottom: 20px; color: var(--primary);">Apa Kata Mereka?</h3>
                <div id="testModalContainer" style="display: flex; flex-direction: column; gap: 15px; max-height: 60vh; overflow-y: auto;">
                    <!-- Items injected here -->
                </div>
            </div>
        </div>
    </div>`;
document.body.insertAdjacentHTML("beforeend", testModalMarkup);

const testModal = document.getElementById("testModal");
const testContainer = document.getElementById("testModalContainer");

// Function to show testimonials (for sidebar link)
window.openTestimonialsModal = (e) => {
    if (e) e.preventDefault();

    testContainer.innerHTML = "";
    testimonialsData.forEach((t) => {
        testContainer.innerHTML += `
                <div class="testimonial-card" style="background: #f9f9f9; padding: 15px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    <p style="font-style: italic; color: #555;">"${t.text}"</p>
                    <h5 style="margin-top: 10px; color: var(--text-color); font-weight: 600;">- ${t.name} ${t.rating}</h5>
                </div>
            `;
    });

    testModal.classList.add("active");
};

// Function to open review form (for header icon)
window.openReviewForm = async (e) => {
    if (e) e.preventDefault();

    const { value: formValues } = await Swal.fire({
        title:
            '<div style="color: #2e7d32; font-size: 1.8rem; margin-bottom: 10px; font-weight: 700;">✍️ Tulis Ulasan Anda</div>',
        html: `
                <div style="text-align: left; padding: 20px; background: linear-gradient(135deg, #e8f5e9 0%, #f1f8e9 100%); border-radius: 15px; box-shadow: inset 0 2px 10px rgba(0,0,0,0.05);">
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1b5e20; font-size: 0.95rem;">
                            <i class='bx bx-user' style="margin-right: 5px; color: #2e7d32;"></i>Nama Anda
                        </label>
                        <input id="swal-input1" class="swal2-input" placeholder="Masukkan nama Anda" 
                            style="margin: 0; width: 95%; border: 2px solid #66bb6a; border-radius: 10px; padding: 12px; font-size: 0.95rem; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05);">
                    </div>
                    
                    <div style="margin-bottom: 20px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1b5e20; font-size: 0.95rem;">
                            <i class='bx bx-star' style="margin-right: 5px; color: #ff9800;"></i>Rating Makanan
                        </label>
                        <select id="swal-input2" class="swal2-input" 
                            style="margin: 0; width: calc(100% - 4px); padding: 12px 15px; border: 2px solid #66bb6a; border-radius: 10px; font-size: 0.95rem; background: white; cursor: pointer; box-shadow: 0 2px 5px rgba(0,0,0,0.05); appearance: auto;">
                            <option value="" style="color: #999;">-- Pilih Rating Anda --</option>
                            <option value="5">⭐⭐⭐⭐⭐ Sangat Puas</option>
                            <option value="4">⭐⭐⭐⭐ Puas</option>
                            <option value="3">⭐⭐⭐ Cukup Puas</option>
                            <option value="2">⭐⭐ Kurang Puas</option>
                            <option value="1">⭐ Tidak Puas</option>
                        </select>
                    </div>
                    
                    <div style="margin-bottom: 10px;">
                        <label style="display: block; margin-bottom: 8px; font-weight: 600; color: #1b5e20; font-size: 0.95rem;">
                            <i class='bx bx-message-square-detail' style="margin-right: 5px; color: #2e7d32;"></i>Ulasan Anda
                        </label>
                        <textarea id="swal-input3" class="swal2-textarea" 
                            placeholder="Ceritakan pengalaman Anda dengan makanan kami..." 
                            style="margin: 0; width: 95%; height: 130px; resize: vertical; border: 2px solid #66bb6a; border-radius: 10px; padding: 12px; font-size: 0.95rem; background: white; box-shadow: 0 2px 5px rgba(0,0,0,0.05); font-family: 'Poppins', sans-serif;"></textarea>
                    </div>
                </div>
            `,
        width: "650px",
        padding: "2.5em",
        background: "#fff",
        focusConfirm: false,
        showCancelButton: true,
        confirmButtonText: "📤 Kirim",
        cancelButtonText: "✕ Batal",
        confirmButtonColor: "#2e7d32",
        cancelButtonColor: "#999",
        buttonsStyling: true,
        customClass: {
            popup: "review-popup-custom",
            confirmButton: "review-confirm-btn",
            cancelButton: "review-cancel-btn",
        },
        preConfirm: () => {
            return [
                document.getElementById("swal-input1").value,
                document.getElementById("swal-input2").value,
                document.getElementById("swal-input3").value,
            ];
        },
    });

    if (formValues) {
        const [name, rating, review] = formValues;
        if (!name || !rating || !review) {
            return Swal.fire({
                title: "⚠️ Data Belum Lengkap",
                html: '<p style="font-size: 1rem; color: #666;">Harap isi semua kolom (Nama, Rating, dan Ulasan)</p>',
                icon: "warning",
                confirmButtonColor: "#2e7d32",
                confirmButtonText: "OK, Mengerti",
            });
        }

        // Push to Firebase
        const stars = "⭐".repeat(rating);
        const newReview = {
            text: review,
            name: name,
            rating: stars,
            timestamp: Date.now(),
        };

        const reviewsRef = ref(db, "reviews");
        push(reviewsRef, newReview)
            .then(() => {
                Swal.fire({
                    title: "🙏 Terima Kasih!",
                    html: `<p style="font-size: 1.1rem; color: #555; line-height: 1.6;">Ulasan Anda telah berhasil disimpan!<br>Terima kasih atas feedback Anda 💚</p>`,
                    icon: "success",
                    timer: 2500,
                    showConfirmButton: false,
                    timerProgressBar: true,
                });
            })
            .catch((error) => {
                console.error("Firebase Error:", error);
                Swal.fire("Error", "Gagal menyimpan ulasan ke database.", "error");
            });
    }
};

window.closeTestModal = () => {
    testModal.classList.remove("active");
};

testModal.addEventListener("click", (e) => {
    if (e.target === testModal) window.closeTestModal();
});
