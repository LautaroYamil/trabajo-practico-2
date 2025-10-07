// Sistema de Carrito de Compras
class ShoppingCart {
    constructor() {
        this.items = JSON.parse(localStorage.getItem('cart')) || [];
        this.init();
    }

    init() {
        console.log("🛒 Carrito inicializado con", this.items.length, "productos");
        this.renderCart();
        this.attachEventListeners();
        this.updateCartCounter();
    }

    // Agregar producto al carrito
    addItem(product, quantity = 1) {
        try {
            const existingItem = this.items.find(item => item.id === product.id);
            
            if (existingItem) {
                existingItem.quantity += quantity;
            } else {
                this.items.push({
                    ...product,
                    quantity: quantity
                });
            }
            
            this.saveToLocalStorage();
            this.renderCart();
            this.updateCartCounter();
            this.showNotification('✅ Producto agregado al carrito');
            
        } catch (error) {
            console.error('Error al agregar producto:', error);
            this.showNotification('❌ Error al agregar producto', 'error');
        }
    }

    // Remover producto del carrito
    removeItem(productId) {
        try {
            this.items = this.items.filter(item => item.id !== productId);
            this.saveToLocalStorage();
            this.renderCart();
            this.updateCartCounter();
            this.showNotification('🗑️ Producto removido');
        } catch (error) {
            console.error('Error al remover producto:', error);
        }
    }

    // Actualizar cantidad
    updateQuantity(productId, newQuantity) {
        try {
            if (newQuantity <= 0) {
                this.removeItem(productId);
                return;
            }

            const item = this.items.find(item => item.id === productId);
            if (item) {
                item.quantity = parseInt(newQuantity);
                this.saveToLocalStorage();
                this.renderCart();
                this.updateCartCounter();
            }
        } catch (error) {
            console.error('Error al actualizar cantidad:', error);
        }
    }

    // Calcular totales
    calculateTotals() {
        try {
            const subtotal = this.items.reduce((sum, item) => {
                const price = this.parsePrice(item.price);
                return sum + (price * item.quantity);
            }, 0);

            const shipping = subtotal > 15000 ? 0 : 1500;
            const total = subtotal + shipping;

            return { subtotal, shipping, total };
        } catch (error) {
            console.error('Error al calcular totales:', error);
            return { subtotal: 0, shipping: 0, total: 0 };
        }
    }

    // Parsear precio de string a número
    parsePrice(priceString) {
        try {
            if (!priceString) return 0;
            return parseInt(priceString.replace(/\$/g, '').replace(/\./g, '')) || 0;
        } catch (error) {
            console.error('Error al parsear precio:', priceString, error);
            return 0;
        }
    }

    // Formatear precio
    formatPrice(price) {
        return '$' + price.toLocaleString('es-AR');
    }

    // Renderizar carrito
    renderCart() {
        try {
            const cartItems = document.getElementById('cartItems');
            if (!cartItems) {
                console.error('No se encontró el elemento cartItems');
                return;
            }

            const { subtotal, shipping, total } = this.calculateTotals();

            if (this.items.length === 0) {
                cartItems.innerHTML = `
                    <div class="empty-cart-message">
                        <div class="empty-cart-icon">🛒</div>
                        <p>Tu carrito está vacío</p>
                        <a href="productos.html" class="btn">Descubrir productos</a>
                    </div>
                `;
            } else {
                cartItems.innerHTML = this.items.map(item => {
                    const itemTotal = this.parsePrice(item.price) * item.quantity;
                    return `
                    <div class="cart-item" data-id="${item.id}">
                        <div class="cart-item-image">
                            <img src="${item.mainImage || 'assets/placeholder.jpg'}" alt="${item.title}" onerror="this.src='data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAiIGhlaWdodD0iODAiIHZpZXdCb3g9IjAgMCA4MCA4MCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHJlY3Qgd2lkdGg9IjgwIiBoZWlnaHQ9IjgwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik00MCA0MEM0Mi43NjE0IDQwIDQ1IDM3Ljc2MTQgNDUgMzVDNDUgMzIuMjM4NiA0Mi43NjE0IDMwIDQwIDMwQzM3LjIzODYgMzAgMzUgMzIuMjM4NiAzNSAzNUMzNSAzNy43NjE0IDM3LjIzODYgNDAgNDAgNDBaIiBmaWxsPSIjOTlBQUFCIi8+CjxwYXRoIGQ9Ik0yNSA1MEg1NVY1NUgyNVY1MFoiIGZpbGw9IiM5OUFBQUIiLz4KPC9zdmc+'">
                        </div>
                        <div class="cart-item-details">
                            <h4 class="cart-item-title">${item.title}</h4>
                            <p class="cart-item-price">${item.price}</p>
                        </div>
                        <div class="cart-item-controls">
                            <div class="quantity-controls">
                                <button class="quantity-btn minus" data-id="${item.id}">-</button>
                                <input type="number" class="quantity-input" value="${item.quantity}" min="1" data-id="${item.id}">
                                <button class="quantity-btn plus" data-id="${item.id}">+</button>
                            </div>
                            <button class="remove-item" data-id="${item.id}" aria-label="Eliminar producto">
                                🗑️
                            </button>
                        </div>
                        <div class="cart-item-total">
                            ${this.formatPrice(itemTotal)}
                        </div>
                    </div>
                    `;
                }).join('');
            }

            // Actualizar totales
            const subtotalElement = document.getElementById('subtotal');
            const shippingElement = document.getElementById('shipping');
            const totalElement = document.getElementById('total');

            if (subtotalElement) subtotalElement.textContent = this.formatPrice(subtotal);
            if (shippingElement) shippingElement.textContent = shipping === 0 ? 'GRATIS' : this.formatPrice(shipping);
            if (totalElement) totalElement.innerHTML = `<strong>${this.formatPrice(total)}</strong>`;

            // Mostrar/ocultar mensaje de envío gratis
            this.updateShippingNotice(subtotal);

        } catch (error) {
            console.error('Error al renderizar carrito:', error);
        }
    }

    // Actualizar mensaje de envío
    updateShippingNotice(subtotal) {
        const shippingNotice = document.querySelector('.shipping-notice');
        if (!shippingNotice) return;

        if (subtotal < 15000) {
            const remaining = 15000 - subtotal;
            shippingNotice.innerHTML = `
                <p>🚚 <strong>¡Envío gratis!</strong> Te faltan ${this.formatPrice(remaining)} para envío gratuito</p>
            `;
        } else {
            shippingNotice.innerHTML = `
                <p>🎉 <strong>¡Felicitaciones!</strong> Tienes envío gratis</p>
            `;
        }
    }

    // Attach event listeners
    attachEventListeners() {
        // Delegación de eventos para los controles del carrito
        document.addEventListener('click', (e) => {
            try {
                if (e.target.classList.contains('remove-item')) {
                    const productId = parseInt(e.target.getAttribute('data-id'));
                    this.removeItem(productId);
                }

                if (e.target.classList.contains('quantity-btn')) {
                    const productId = parseInt(e.target.getAttribute('data-id'));
                    const isPlus = e.target.classList.contains('plus');
                    const item = this.items.find(item => item.id === productId);
                    
                    if (item) {
                        const newQuantity = isPlus ? item.quantity + 1 : item.quantity - 1;
                        this.updateQuantity(productId, newQuantity);
                    }
                }
            } catch (error) {
                console.error('Error en event listener:', error);
            }
        });

        // Input de cantidad
        document.addEventListener('change', (e) => {
            try {
                if (e.target.classList.contains('quantity-input')) {
                    const productId = parseInt(e.target.getAttribute('data-id'));
                    const newQuantity = parseInt(e.target.value);
                    if (!isNaN(newQuantity)) {
                        this.updateQuantity(productId, newQuantity);
                    }
                }
            } catch (error) {
                console.error('Error en input change:', error);
            }
        });

        // Formulario de checkout
        const checkoutForm = document.getElementById('checkoutForm');
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processCheckout();
            });
        }
    }

    // Procesar checkout
    processCheckout() {
        try {
            if (this.items.length === 0) {
                this.showNotification('❌ Tu carrito está vacío', 'error');
                return;
            }

            // Validar formulario
            const form = document.getElementById('checkoutForm');
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            const formData = new FormData(form);
            const orderData = {
                customer: {
                    name: formData.get('name'),
                    email: formData.get('email'),
                    phone: formData.get('phone'),
                    address: formData.get('address'),
                    province: formData.get('province')
                },
                payment: formData.get('payment'),
                notes: formData.get('notes'),
                items: [...this.items], // Copia de los items
                totals: this.calculateTotals(),
                orderDate: new Date().toLocaleString('es-AR'),
                orderId: 'ORD-' + Date.now()
            };

            // Mostrar loading
            this.showLoading(true);
            
            // Simular procesamiento
            setTimeout(() => {
                this.showLoading(false);
                this.showOrderConfirmation(orderData);
            }, 1500);

        } catch (error) {
            console.error('Error en checkout:', error);
            this.showNotification('❌ Error al procesar el pedido', 'error');
            this.showLoading(false);
        }
    }

    // Mostrar confirmación de pedido
    showOrderConfirmation(orderData) {
        try {
            // Guardar pedido en localStorage
            const orders = JSON.parse(localStorage.getItem('orders')) || [];
            orders.push(orderData);
            localStorage.setItem('orders', JSON.stringify(orders));

            // Limpiar carrito
            this.clearCart();

            // Mostrar mensaje de éxito
            this.showSuccessMessage(orderData);

        } catch (error) {
            console.error('Error en confirmación:', error);
            this.showNotification('❌ Error al confirmar pedido', 'error');
        }
    }

    // Mostrar mensaje de éxito personalizado
    showSuccessMessage(orderData) {
        // Cerrar teclado virtual si está abierto
        if (document.activeElement && typeof document.activeElement.blur === 'function') {
            document.activeElement.blur();
        }

        // Bloquear scroll del fondo
        document.body.style.overflow = 'hidden';

        const successModal = document.createElement('div');
        successModal.className = 'success-modal-overlay';
        successModal.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 10000;
            animation: fadeIn 0.3s ease;
        `;

        successModal.innerHTML = `
            <div class="success-modal-content" style="
                background: white;
                padding: 40px 20px;
                border-radius: 15px;
                text-align: center;
                max-width: 500px;
                width: 94vw;
                box-sizing: border-box;
                animation: slideUp 0.3s ease;
            ">
                <div style="font-size: 4rem; margin-bottom: 20px;">🎉</div>
                <h2 style="color: var(--brand-primary); margin-bottom: 15px;">¡Compra Realizada con Éxito!</h2>
                <p style="margin-bottom: 20px; line-height: 1.6;">
                    <strong>¡Gracias por tu compra, ${orderData.customer.name}!</strong><br>
                    Tu pedido <strong>${orderData.orderId}</strong> ha sido procesado correctamente.
                </p>
                <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
                    <p><strong>Total:</strong> ${this.formatPrice(orderData.totals.total)}</p>
                    <p><strong>Método de pago:</strong> ${this.getPaymentMethodName(orderData.payment)}</p>
                    <p><strong>Envío a:</strong> ${orderData.customer.address}</p>
                </div>
                <p style="color: #666; margin-bottom: 25px; font-size: 0.9rem;">
                    Nos contactaremos al <strong>${orderData.customer.phone}</strong> dentro de las próximas 24 horas para coordinar el pago y envío.
                </p>
                <button id="closeSuccessModalBtn"
                        style="background: var(--brand-primary); color: white; border: none; padding: 12px 30px; border-radius: 8px; cursor: pointer; font-size: 1rem; font-weight: 600;">
                    ¡Entendido!
                </button>
            </div>
        `;

        document.body.appendChild(successModal);

        // Cerrar modal al hacer clic fuera
        successModal.addEventListener('click', (e) => {
            if (e.target === successModal) {
                successModal.remove();
                document.body.style.overflow = '';
                window.location.href = 'index.html';
            }
        });

        // Cerrar modal al hacer clic en el botón
        const closeBtn = document.getElementById('closeSuccessModalBtn');
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                successModal.remove();
                document.body.style.overflow = '';
                window.location.href = 'index.html';
            });
        }

        // Redirigir automáticamente después de 10 segundos
        setTimeout(() => {
            if (document.body.contains(successModal)) {
                successModal.remove();
                document.body.style.overflow = '';
                window.location.href = 'index.html';
            }
        }, 10000);
    }

    // Obtener nombre del método de pago
    getPaymentMethodName(paymentKey) {
        const methods = {
            'mercado-pago': 'Mercado Pago',
            'transferencia': 'Transferencia Bancaria',
            'tarjeta': 'Tarjeta de Crédito/Débito',
            'efectivo': 'Efectivo'
        };
        return methods[paymentKey] || paymentKey;
    }

    // Mostrar/ocultar loading
    showLoading(show) {
        const btn = document.getElementById('checkoutBtn');
        if (!btn) return;

        const btnText = btn.querySelector('.btn-text');
        const btnLoading = btn.querySelector('.btn-loading');

        if (show) {
            btnText.style.display = 'none';
            btnLoading.style.display = 'inline';
            btn.disabled = true;
            btn.style.opacity = '0.7';
        } else {
            btnText.style.display = 'inline';
            btnLoading.style.display = 'none';
            btn.disabled = false;
            btn.style.opacity = '1';
        }
    }

    // Actualizar contador en el navbar
    updateCartCounter() {
        try {
            const totalItems = this.items.reduce((sum, item) => sum + item.quantity, 0);
            
            const cartLinks = document.querySelectorAll('a[href="carrito.html"]');
            cartLinks.forEach(link => {
                let counter = link.querySelector('.cart-counter');
                if (!counter) {
                    counter = document.createElement('span');
                    counter.className = 'cart-counter';
                    link.appendChild(counter);
                }
                
                if (totalItems > 0) {
                    counter.textContent = totalItems > 99 ? '99+' : totalItems;
                    counter.style.display = 'inline-flex';
                } else {
                    counter.style.display = 'none';
                }
            });
        } catch (error) {
            console.error('Error al actualizar contador:', error);
        }
    }

    // Mostrar notificaciones
    showNotification(message, type = 'info') {
        try {
            const notification = document.createElement('div');
            notification.className = 'cart-notification';
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${type === 'error' ? '#dc2626' : type === 'success' ? '#2a6d47' : 'var(--brand-primary)'};
                color: white;
                padding: 15px 20px;
                border-radius: 8px;
                z-index: 10000;
                box-shadow: var(--shadow-hover);
                animation: slideIn 0.3s ease;
                max-width: 300px;
                font-weight: 500;
            `;
            notification.textContent = message;
            
            document.body.appendChild(notification);
            
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.parentNode.removeChild(notification);
                }
            }, 3000);
        } catch (error) {
            console.error('Error mostrando notificación:', error);
        }
    }

    // Guardar en localStorage
    saveToLocalStorage() {
        try {
            localStorage.setItem('cart', JSON.stringify(this.items));
        } catch (error) {
            console.error('Error guardando en localStorage:', error);
        }
    }

    // Limpiar carrito
    clearCart() {
        this.items = [];
        this.saveToLocalStorage();
        this.renderCart();
        this.updateCartCounter();
    }

    // Obtener número de items
    getItemCount() {
        return this.items.reduce((sum, item) => sum + item.quantity, 0);
    }

    // Obtener total
    getTotal() {
        return this.calculateTotals().total;
    }
}

// Inicializar carrito cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    try {
        window.cart = new ShoppingCart();
        console.log('🛒 Carrito inicializado correctamente');
    } catch (error) {
        console.error('❌ Error inicializando carrito:', error);
    }
});