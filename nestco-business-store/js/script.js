/* =========================================================
   NÉST & CO. — Interaksi toko online (Vanilla JavaScript)
   Semua data produk ada di bawah agar mudah diganti.
   Keranjang dan wishlist disimpan di localStorage browser.
   Checkout hanya simulasi front-end, belum terhubung server.
   ========================================================= */

// Data produk contoh. Ganti nama, harga, kategori, dan gambar sesuai bisnis.
const products = [
  {
    id: 1,
    name: "Sculpted Ceramic Vase",
    category: "home",
    categoryLabel: "Home & Living",
    price: 189000,
    oldPrice: 219000,
    label: "BEST SELLER",
    image: "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?auto=format&fit=crop&w=900&q=85",
    description: "Vas keramik dengan bentuk organik dan sentuhan matte. Cocok untuk mempercantik meja, rak, atau sudut favorit di rumah."
  },
  {
    id: 2,
    name: "Soft Form Table Lamp",
    category: "home",
    categoryLabel: "Home & Living",
    price: 329000,
    oldPrice: null,
    label: "NEW ARRIVAL",
    image: "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=85",
    description: "Lampu meja dengan siluet sederhana untuk menghadirkan pencahayaan hangat saat membaca, bekerja, atau bersantai."
  },
  {
    id: 3,
    name: "Everyday Canvas Tote",
    category: "accessories",
    categoryLabel: "Accessories",
    price: 99000,
    oldPrice: null,
    label: "EVERYDAY PICK",
    image: "https://images.unsplash.com/photo-1590873924823-3b5d6b7f3a1b?auto=format&fit=crop&w=900&q=85",
    description: "Tas kanvas ringan dengan ruang yang cukup untuk kebutuhan harian. Praktis dibawa ke kampus, kantor, atau akhir pekan."
  },
  {
    id: 4,
    name: "Ritual Ceramic Set",
    category: "lifestyle",
    categoryLabel: "Daily Lifestyle",
    price: 245000,
    oldPrice: 275000,
    label: "LIMITED EDITION",
    image: "https://images.unsplash.com/photo-1493857671505-72967e2e2760?auto=format&fit=crop&w=900&q=85",
    description: "Set cangkir dan piring keramik bernuansa natural untuk menemani ritual minum teh atau kopi di rumah."
  },
  {
    id: 5,
    name: "Calm Space Cushion",
    category: "home",
    categoryLabel: "Home & Living",
    price: 159000,
    oldPrice: null,
    label: "CUSTOMER LOVE",
    image: "https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?auto=format&fit=crop&w=900&q=85",
    description: "Bantal dekoratif dengan tekstur lembut yang memberi aksen nyaman pada sofa, kursi, maupun tempat tidur."
  },
  {
    id: 6,
    name: "Daily Notes Journal",
    category: "lifestyle",
    categoryLabel: "Daily Lifestyle",
    price: 79000,
    oldPrice: null,
    label: "SMALL JOY",
    image: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?auto=format&fit=crop&w=900&q=85",
    description: "Jurnal sederhana untuk mencatat ide, rencana, dan hal-hal baik yang terjadi setiap hari."
  }
];

// Konstanta toko: ambang batas gratis ongkir dan biaya simulasi.
const FREE_SHIPPING_THRESHOLD = 300000;
const DEFAULT_SHIPPING_FEE = 18000;

// Elemen DOM yang sering dipakai.
const productGrid = document.getElementById("productGrid");
const productResultCount = document.getElementById("productResultCount");
const emptyProducts = document.getElementById("emptyProducts");
const cartDrawer = document.getElementById("cartDrawer");
const pageOverlay = document.getElementById("pageOverlay");
const cartItemsContainer = document.getElementById("cartItems");
const cartSummary = document.getElementById("cartSummary");
const productModal = document.getElementById("productModal");
const checkoutModal = document.getElementById("checkoutModal");
const toastMessage = document.getElementById("toastMessage");

// Ambil data tersimpan. Try/catch mencegah halaman error jika localStorage tidak tersedia.
function readStorage(key, fallback) {
  try {
    const saved = localStorage.getItem(key);
    return saved ? JSON.parse(saved) : fallback;
  } catch (error) {
    console.warn(`Tidak dapat membaca ${key} dari localStorage:`, error);
    return fallback;
  }
}

let cart = readStorage("nestco_cart", []);
let wishlist = readStorage("nestco_wishlist", []);
let activeCategory = "all";
let searchKeyword = "";
let wishlistOnly = false;
let toastTimer;

// Format rupiah tanpa angka desimal.
function formatRupiah(value) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0
  }).format(value);
}

// Simpan keranjang dan wishlist setiap kali nilainya berubah.
function saveState() {
  try {
    localStorage.setItem("nestco_cart", JSON.stringify(cart));
    localStorage.setItem("nestco_wishlist", JSON.stringify(wishlist));
  } catch (error) {
    console.warn("Perubahan tidak dapat disimpan di browser:", error);
  }
}

// Pesan singkat sebagai feedback untuk setiap aksi pengguna.
function showToast(message) {
  toastMessage.textContent = message;
  toastMessage.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastMessage.classList.remove("show"), 2600);
}

// Ambil informasi produk berdasarkan ID.
function getProduct(productId) {
  return products.find((product) => product.id === Number(productId));
}

// Render katalog berdasarkan kategori, pencarian, wishlist, dan sorting.
function renderProducts() {
  let visibleProducts = products.filter((product) => {
    const matchesCategory = activeCategory === "all" || product.category === activeCategory;
    const searchableText = `${product.name} ${product.categoryLabel} ${product.description}`.toLowerCase();
    const matchesSearch = searchableText.includes(searchKeyword.toLowerCase());
    const matchesWishlist = !wishlistOnly || wishlist.includes(product.id);
    return matchesCategory && matchesSearch && matchesWishlist;
  });

  // Sorting produk dipilih melalui dropdown.
  const sortValue = document.getElementById("sortSelect").value;
  if (sortValue === "low") visibleProducts.sort((a, b) => a.price - b.price);
  if (sortValue === "high") visibleProducts.sort((a, b) => b.price - a.price);
  if (sortValue === "name") visibleProducts.sort((a, b) => a.name.localeCompare(b.name));

  productResultCount.textContent = `${visibleProducts.length} produk`;
  document.getElementById("wishlistModeLabel").textContent = wishlistOnly ? "Menampilkan wishlist kamu" : "";
  emptyProducts.classList.toggle("hidden", visibleProducts.length !== 0);
  productGrid.classList.toggle("hidden", visibleProducts.length === 0);

  productGrid.innerHTML = visibleProducts.map((product) => {
    const isFavorite = wishlist.includes(product.id);
    return `
      <article class="product-card">
        <div class="product-image-wrap">
          <img src="${product.image}" alt="${product.name}" loading="lazy" />
          <span class="product-label">${product.label}</span>
          <button class="product-heart ${isFavorite ? "active" : ""}" data-wishlist="${product.id}" aria-label="${isFavorite ? "Hapus dari" : "Tambah ke"} wishlist">${isFavorite ? "♥" : "♡"}</button>
          <button class="quick-add" data-add-cart="${product.id}">＋ Tambahkan ke keranjang</button>
        </div>
        <div class="product-info">
          <div><span class="product-category">${product.categoryLabel}</span><h3 class="product-name"><a href="#product-${product.id}" data-product-detail="${product.id}">${product.name}</a></h3></div>
          <div class="product-price">${formatRupiah(product.price)}${product.oldPrice ? `<span class="product-old-price">${formatRupiah(product.oldPrice)}</span>` : ""}</div>
        </div>
      </article>
    `;
  }).join("");
}

// Atur tab kategori aktif.
function setCategory(category) {
  activeCategory = category;
  wishlistOnly = false;
  document.querySelectorAll(".filter-button").forEach((button) => {
    button.classList.toggle("active", button.dataset.filter === category);
  });
  document.getElementById("wishlistToggle").classList.remove("is-active");
  renderProducts();
}

// Update angka counter di header.
function updateHeaderCounters() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  document.getElementById("cartCount").textContent = itemCount;
  document.getElementById("wishlistCount").textContent = wishlist.length;
  document.getElementById("drawerItemCount").textContent = `(${itemCount})`;
}

// Tambah produk ke keranjang. Jika sudah ada, kuantitas dinaikkan.
function addToCart(productId, quantity = 1) {
  const product = getProduct(productId);
  if (!product) return;

  const existingItem = cart.find((item) => item.id === product.id);
  if (existingItem) existingItem.quantity += quantity;
  else cart.push({ id: product.id, quantity });

  saveState();
  renderCart();
  updateHeaderCounters();
  showToast(`${product.name} ditambahkan ke keranjang.`);
}

// Ubah kuantitas item dan hapus item bila jumlahnya menjadi nol.
function changeQuantity(productId, change) {
  const item = cart.find((cartItem) => cartItem.id === Number(productId));
  if (!item) return;
  item.quantity += change;
  if (item.quantity <= 0) cart = cart.filter((cartItem) => cartItem.id !== Number(productId));
  saveState();
  renderCart();
  updateHeaderCounters();
}

// Hapus satu produk dari keranjang.
function removeFromCart(productId) {
  cart = cart.filter((item) => item.id !== Number(productId));
  saveState();
  renderCart();
  updateHeaderCounters();
  showToast("Produk dihapus dari keranjang.");
}

// Hitung nilai keranjang.
function getCartTotals() {
  const subtotal = cart.reduce((total, item) => {
    const product = getProduct(item.id);
    return total + (product ? product.price * item.quantity : 0);
  }, 0);
  const shipping = subtotal === 0 || subtotal >= FREE_SHIPPING_THRESHOLD ? 0 : DEFAULT_SHIPPING_FEE;
  return { subtotal, shipping, total: subtotal + shipping };
}

// Render seluruh isi drawer keranjang.
function renderCart() {
  const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
  const { subtotal, shipping, total } = getCartTotals();
  document.getElementById("drawerItemCount").textContent = `(${itemCount})`;

  if (cart.length === 0) {
    cartItemsContainer.innerHTML = `
      <div class="cart-empty"><span>♡</span><h3>Keranjangmu masih kosong.</h3><p>Yuk, temukan sesuatu yang kamu suka.</p><button class="button button-dark" id="continueShopping">Mulai belanja</button></div>
    `;
    cartSummary.classList.add("hidden");
  } else {
    cartSummary.classList.remove("hidden");
    cartItemsContainer.innerHTML = cart.map((item) => {
      const product = getProduct(item.id);
      if (!product) return "";
      return `
        <article class="cart-item">
          <img src="${product.image}" alt="${product.name}" />
          <div class="cart-item-info">
            <strong>${product.name}</strong><small>${formatRupiah(product.price)}</small>
            <div class="quantity-control">
              <button data-quantity="${product.id}" data-change="-1" aria-label="Kurangi jumlah">−</button>
              <span>${item.quantity}</span>
              <button data-quantity="${product.id}" data-change="1" aria-label="Tambah jumlah">＋</button>
            </div>
          </div>
          <div class="cart-item-side"><strong>${formatRupiah(product.price * item.quantity)}</strong><button class="remove-item" data-remove="${product.id}">Hapus</button></div>
        </article>
      `;
    }).join("");
  }

  document.getElementById("cartSubtotal").textContent = formatRupiah(subtotal);
  document.getElementById("cartShipping").textContent = shipping === 0 && subtotal > 0 ? "GRATIS" : formatRupiah(shipping);
  document.getElementById("cartTotal").textContent = formatRupiah(total);
  document.getElementById("checkoutTotal").textContent = formatRupiah(total);

  const remaining = Math.max(0, FREE_SHIPPING_THRESHOLD - subtotal);
  document.getElementById("shippingMessage").textContent = subtotal >= FREE_SHIPPING_THRESHOLD
    ? "Yeay! Kamu mendapatkan gratis ongkir."
    : `Belanja ${formatRupiah(remaining)} lagi untuk gratis ongkir.`;
  document.getElementById("shippingProgress").style.width = `${Math.min(100, (subtotal / FREE_SHIPPING_THRESHOLD) * 100)}%`;
}

// Tambah atau hapus produk dari wishlist.
function toggleWishlist(productId) {
  const id = Number(productId);
  if (wishlist.includes(id)) {
    wishlist = wishlist.filter((savedId) => savedId !== id);
    showToast("Produk dihapus dari wishlist.");
  } else {
    wishlist.push(id);
    showToast("Produk disimpan ke wishlist.");
  }
  saveState();
  updateHeaderCounters();
  renderProducts();
}

// Buka dan tutup drawer keranjang.
function openCart() {
  cartDrawer.classList.add("open");
  cartDrawer.setAttribute("aria-hidden", "false");
  pageOverlay.classList.add("active");
  document.body.classList.add("no-scroll");
  renderCart();
}

function closeCart() {
  cartDrawer.classList.remove("open");
  cartDrawer.setAttribute("aria-hidden", "true");
  pageOverlay.classList.remove("active");
  document.body.classList.remove("no-scroll");
}

// Buka modal detail produk dengan informasi dari data produk.
function openProductModal(productId) {
  const product = getProduct(productId);
  if (!product) return;

  document.getElementById("productModalContent").innerHTML = `
    <div class="product-modal-layout">
      <img src="${product.image}" alt="${product.name}" />
      <div class="product-modal-copy">
        <span class="eyebrow">${product.categoryLabel} / ${product.label}</span>
        <h2 id="productModalTitle">${product.name}</h2>
        <div class="modal-price">${formatRupiah(product.price)}</div>
        <p>${product.description}</p>
        <button class="button button-dark" data-modal-add="${product.id}">Tambahkan ke keranjang <span>→</span></button>
      </div>
    </div>
  `;
  openModal(productModal);
}

// Fungsi modal bersama untuk detail dan checkout.
function openModal(modal) {
  modal.classList.add("open");
  modal.setAttribute("aria-hidden", "false");
  document.body.classList.add("no-scroll");
}

function closeModal(modal) {
  modal.classList.remove("open");
  modal.setAttribute("aria-hidden", "true");
  if (!cartDrawer.classList.contains("open")) document.body.classList.remove("no-scroll");
}

// Tampilkan area pencarian dan fokuskan input.
function openSearch() {
  const panel = document.getElementById("searchPanel");
  panel.classList.add("open");
  panel.setAttribute("aria-hidden", "false");
  setTimeout(() => document.getElementById("globalSearch").focus(), 50);
}

function closeSearch() {
  const panel = document.getElementById("searchPanel");
  panel.classList.remove("open");
  panel.setAttribute("aria-hidden", "true");
}

// Event delegation untuk tombol di dalam daftar produk.
productGrid.addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-add-cart]");
  const heartButton = event.target.closest("[data-wishlist]");
  const detailLink = event.target.closest("[data-product-detail]");

  if (addButton) addToCart(addButton.dataset.addCart);
  if (heartButton) toggleWishlist(heartButton.dataset.wishlist);
  if (detailLink) {
    event.preventDefault();
    openProductModal(detailLink.dataset.productDetail);
  }
});

// Event delegation untuk tombol kuantitas dan hapus pada drawer keranjang.
cartItemsContainer.addEventListener("click", (event) => {
  const quantityButton = event.target.closest("[data-quantity]");
  const removeButton = event.target.closest("[data-remove]");
  const continueButton = event.target.closest("#continueShopping");
  if (quantityButton) changeQuantity(quantityButton.dataset.quantity, Number(quantityButton.dataset.change));
  if (removeButton) removeFromCart(removeButton.dataset.remove);
  if (continueButton) closeCart();
});

// Event untuk tombol tambah dari modal detail produk.
document.getElementById("productModalContent").addEventListener("click", (event) => {
  const addButton = event.target.closest("[data-modal-add]");
  if (addButton) {
    addToCart(addButton.dataset.modalAdd);
    closeModal(productModal);
    openCart();
  }
});

// Event kategori produk.
document.getElementById("filterTabs").addEventListener("click", (event) => {
  const button = event.target.closest("[data-filter]");
  if (button) setCategory(button.dataset.filter);
});

// Kartu kategori mengarahkan user ke katalog dengan filter yang sesuai.
document.querySelectorAll("[data-category-link]").forEach((link) => {
  link.addEventListener("click", () => {
    setCategory(link.dataset.categoryLink);
  });
});

// Urutkan produk ulang saat pilihan berubah.
document.getElementById("sortSelect").addEventListener("change", renderProducts);

// Buka wishlist sebagai tampilan produk tersimpan.
document.getElementById("wishlistToggle").addEventListener("click", () => {
  wishlistOnly = !wishlistOnly;
  activeCategory = "all";
  document.querySelectorAll(".filter-button").forEach((button) => button.classList.toggle("active", button.dataset.filter === "all"));
  renderProducts();
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
  if (wishlistOnly && wishlist.length === 0) showToast("Wishlist kamu masih kosong. Simpan produk dengan ikon hati.");
});

// Tombol header, drawer, overlay, dan panel pencarian.
document.getElementById("cartToggle").addEventListener("click", openCart);
document.getElementById("closeCart").addEventListener("click", closeCart);
pageOverlay.addEventListener("click", closeCart);
document.getElementById("checkoutButton").addEventListener("click", () => {
  if (cart.length === 0) return showToast("Keranjang masih kosong.");
  closeCart();
  renderCart();
  openModal(checkoutModal);
});
document.getElementById("searchToggle").addEventListener("click", openSearch);
document.getElementById("closeSearch").addEventListener("click", closeSearch);
document.getElementById("globalSearch").addEventListener("input", (event) => {
  searchKeyword = event.target.value.trim();
  wishlistOnly = false;
  setCategory("all");
  renderProducts();
  document.getElementById("shop").scrollIntoView({ behavior: "smooth" });
});

// Tombol reset filter saat produk tidak ditemukan.
document.getElementById("resetFilters").addEventListener("click", () => {
  searchKeyword = "";
  document.getElementById("globalSearch").value = "";
  document.getElementById("sortSelect").value = "featured";
  setCategory("all");
});

// Tutup modal dengan tombol close, klik latar, atau tombol Escape.
document.querySelectorAll("[data-close-modal]").forEach((button) => {
  button.addEventListener("click", () => {
    closeModal(productModal);
    closeModal(checkoutModal);
  });
});
[productModal, checkoutModal].forEach((modal) => {
  modal.addEventListener("click", (event) => {
    if (event.target === modal) closeModal(modal);
  });
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeCart();
    closeModal(productModal);
    closeModal(checkoutModal);
    closeSearch();
    document.getElementById("mainNav").classList.remove("open");
    document.getElementById("mobileMenuButton").setAttribute("aria-expanded", "false");
  }
});

// Menu navigasi mobile.
const mobileMenuButton = document.getElementById("mobileMenuButton");
const mainNav = document.getElementById("mainNav");
mobileMenuButton.addEventListener("click", () => {
  const isOpen = mainNav.classList.toggle("open");
  mobileMenuButton.setAttribute("aria-expanded", String(isOpen));
});
mainNav.querySelectorAll("a").forEach((link) => {
  link.addEventListener("click", () => {
    mainNav.classList.remove("open");
    mobileMenuButton.setAttribute("aria-expanded", "false");
  });
});

// Checkout demo: validasi HTML5 lalu buat nomor pesanan contoh.
document.getElementById("checkoutForm").addEventListener("submit", (event) => {
  event.preventDefault();
  if (!event.currentTarget.reportValidity()) return;

  const formData = new FormData(event.currentTarget);
  const customerName = formData.get("name").trim();
  const orderCode = `NST-${Date.now().toString().slice(-7)}`;
  const { total } = getCartTotals();
  const orderSummary = {
    orderCode,
    customerName,
    email: formData.get("email"),
    phone: formData.get("phone"),
    address: formData.get("address"),
    payment: formData.get("payment"),
    total,
    items: cart.map((item) => ({ ...item }))
  };

  // Data pesanan hanya ditampilkan pada browser sebagai contoh integrasi.
  console.info("Contoh data pesanan NÉST & CO.:", orderSummary);
  closeModal(checkoutModal);
  event.currentTarget.reset();
  cart = [];
  saveState();
  renderCart();
  updateHeaderCounters();
  showToast(`Terima kasih, ${customerName}! Pesanan demo ${orderCode} berhasil dibuat.`);
});

// Newsletter demo: belum mengirim email ke layanan mailing list.
document.getElementById("newsletterForm").addEventListener("submit", (event) => {
  event.preventDefault();
  const emailInput = document.getElementById("newsletterEmail");
  if (!emailInput.reportValidity()) return;
  showToast("Terima kasih sudah bergabung dengan NÉST & CO.!");
  event.currentTarget.reset();
});

// Back-to-top muncul setelah halaman digulir.
const backToTop = document.getElementById("backToTop");
window.addEventListener("scroll", () => {
  backToTop.classList.toggle("visible", window.scrollY > 500);
});
backToTop.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

// Kondisi awal: render katalog, keranjang, dan badge wishlist.
renderProducts();
renderCart();
updateHeaderCounters();
