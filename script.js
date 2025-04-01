// Variables globales
let carrito = [];
let empleados = {};
let platillos = {};
let ingredientes = {};
let horarios = {};
let reservas = [];
let pedidos = [];
let ingresosDiarios = [];
let mesasDisponibles = 10;
let mesasOcupadas = {};
let transferenciaConfig = {};

// Inicialización
document.addEventListener('DOMContentLoaded', () => {
    // Verificar sesión activa
    const empleado = JSON.parse(sessionStorage.getItem('empleado'));
    if (empleado) {
        iniciarSesion(empleado);
    } else if (!window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
    }

    cargarDatosIniciales();
    setupEventListeners();
});

function cargarDatosIniciales() {
    const empleados = JSON.parse(localStorage.getItem('empleados')) || {};
    if (Object.keys(empleados).length === 0 && !window.location.pathname.endsWith('login.html')) {
        window.location.href = 'login.html';
        return;
    }
    // Cargar datos desde localStorage
    empleados = JSON.parse(localStorage.getItem('empleados')) || {};
    platillos = JSON.parse(localStorage.getItem('platillos')) || {};
    ingredientes = JSON.parse(localStorage.getItem('ingredientes')) || {};
    horarios = JSON.parse(localStorage.getItem('horarios')) || {};
    reservas = JSON.parse(localStorage.getItem('reservas')) || [];
    pedidos = JSON.parse(localStorage.getItem('pedidos')) || [];
    ingresosDiarios = JSON.parse(localStorage.getItem('ingresos')) || [];
    mesasDisponibles = parseInt(localStorage.getItem('mesasDisponibles')) || 10;
    mesasOcupadas = JSON.parse(localStorage.getItem('mesasOcupadas')) || {};
    transferenciaConfig = JSON.parse(localStorage.getItem('transferenciaConfig')) || {};

    // Actualizar interfaces
    actualizarSelectEmpleados();
    actualizarTablaEmpleados();
    actualizarMenu();
    actualizarListaPlatillosAdmin();
    actualizarSelectIngredientes();
    actualizarTablaInventario();
    actualizarTablaHorarios();
    actualizarReservas();
    actualizarHistorialIngresos();
    actualizarDetalleVentas();
    calcularIngresosDia();
    actualizarFechaActual();
    actualizarMesas();
    actualizarListaPendientes();
    actualizarConfigTransferencia();
}

function guardarDatos() {
    localStorage.setItem('empleados', JSON.stringify(empleados));
    localStorage.setItem('platillos', JSON.stringify(platillos));
    localStorage.setItem('ingredientes', JSON.stringify(ingredientes));
    localStorage.setItem('horarios', JSON.stringify(horarios));
    localStorage.setItem('reservas', JSON.stringify(reservas));
    localStorage.setItem('pedidos', JSON.stringify(pedidos));
    localStorage.setItem('ingresos', JSON.stringify(ingresosDiarios));
    localStorage.setItem('mesasDisponibles', mesasDisponibles.toString());
    localStorage.setItem('mesasOcupadas', JSON.stringify(mesasOcupadas));
    localStorage.setItem('transferenciaConfig', JSON.stringify(transferenciaConfig));
}

function setupEventListeners() {
    // Logout
    document.getElementById('logoutButton')?.addEventListener('click', logout);

    // Admin: Finalizar día
    document.getElementById('finalizarDia')?.addEventListener('click', finalizarDia);

    // Admin: Resetear datos
    document.getElementById('resetDataButton')?.addEventListener('click', resetData);

    // Admin: Inventario
    document.getElementById('formAgregarInventario')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const ingredienteId = document.getElementById('selectIngrediente').value;
        const cantidad = parseFloat(document.getElementById('cantidadAgregar').value);

        if (ingredienteId && cantidad > 0 && ingredientes[ingredienteId]) {
            ingredientes[ingredienteId].cantidad += cantidad;
            guardarDatos();
            actualizarTablaInventario();
            e.target.reset();
            mostrarModal('Éxito', 'Inventario actualizado correctamente');
        } else {
            mostrarModal('Error', 'Datos inválidos');
        }
    });

    // Admin: Horarios
    document.getElementById('formHorario')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const empleadoId = document.getElementById('selectEmpleadoHorario').value;
        const entrada = document.getElementById('horaEntrada').value;
        const salida = document.getElementById('horaSalida').value;

        if (empleadoId && entrada && salida && empleados[empleadoId]) {
            horarios[empleadoId] = {
                empleadoId,
                nombre: empleados[empleadoId].nombre,
                entrada,
                salida
            };
            guardarDatos();
            actualizarTablaHorarios();
            e.target.reset();
            mostrarModal('Éxito', 'Horario guardado correctamente');
        } else {
            mostrarModal('Error', 'Datos inválidos');
        }
    });

    // Admin: Empleados
    document.getElementById('formNuevoEmpleado')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const numero = document.getElementById('numeroEmpleado').value;
        const nombre = document.getElementById('nombreEmpleado').value;
        const password = document.getElementById('passwordEmpleado').value;
        const rol = document.getElementById('rolEmpleado').value;

        if (numero && nombre && password && rol) {
            empleados[numero] = { nombre, password, rol, activo: true };
            guardarDatos();
            actualizarSelectEmpleados();
            actualizarTablaEmpleados();
            e.target.reset();
            mostrarModal('Éxito', 'Empleado agregado correctamente');
        } else {
            mostrarModal('Error', 'Complete todos los campos');
        }
    });

    // Admin: Platillos
    document.getElementById('agregarIngrediente')?.addEventListener('click', agregarCampoIngrediente);
    document.getElementById('formNuevoPlatillo')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombrePlatillo').value;
        const descripcion = document.getElementById('descripcionPlatillo').value;
        const precio = parseFloat(document.getElementById('precioPlatillo').value);
        const imagen = document.getElementById('imagenPlatillo').value;

        const ingredientesPlatillo = {};
        const inputs = document.querySelectorAll('#ingredientesContainer input');
        for (let i = 0; i < inputs.length; i += 2) {
            const id = inputs[i].value;
            const cantidad = parseFloat(inputs[i+1].value);
            if (id && cantidad > 0) {
                ingredientesPlatillo[id] = cantidad;
            }
        }

        if (nombre && descripcion && precio > 0 && imagen) {
            const platilloId = 'plat' + Date.now();
            platillos[platilloId] = {
                id: platilloId,
                nombre,
                descripcion,
                precio,
                imagen,
                ingredientes: ingredientesPlatillo,
                activo: true
            };
            guardarDatos();
            actualizarMenu();
            actualizarListaPlatillosAdmin();
            e.target.reset();
            document.getElementById('ingredientesContainer').innerHTML = '';
            mostrarModal('Éxito', 'Platillo agregado correctamente');
        } else {
            mostrarModal('Error', 'Complete todos los campos');
        }
    });
    
    // Admin: Config Transferencia
    document.getElementById('formTransferencia')?.addEventListener('submit', (e) => {
        e.preventDefault();
        transferenciaConfig = {
            nombreCuenta: document.getElementById('nombreCuenta').value,
            nombreBanco: document.getElementById('nombreBanco').value,
            numeroCuenta: document.getElementById('numeroCuenta').value,
            clabe: document.getElementById('clabe').value,
            rfc: document.getElementById('rfc').value
        };
        guardarDatos();
        mostrarModal('Éxito', 'Configuración de transferencia actualizada');
    });
    
    // Mesero: Reservas
    document.getElementById('formReserva')?.addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombreReserva').value;
        const personas = parseInt(document.getElementById('personasReserva').value);
        const fecha = new Date(document.getElementById('fechaReserva').value);

        if (nombre && personas > 0 && fecha) {
            const reservaId = 'res' + Date.now();
            reservas.push({
                id: reservaId,
                nombre,
                personas,
                fecha,
                estado: 'confirmada'
            });
            guardarDatos();
            actualizarReservas();
            e.target.reset();
            mostrarModal('Éxito', 'Reserva registrada correctamente');
        } else {
            mostrarModal('Error', 'Datos inválidos');
        }
    });

    // Mesero: Confirmar pedido
    document.getElementById('confirmarPedido')?.addEventListener('click', confirmarPedido);
}

// ======== FUNCIONES DE AUTENTICACIÓN ======== //
function iniciarSesion(empleado) {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainContent').style.display = 'block';
    document.getElementById('userInfo').textContent = `${empleado.nombre} (${empleado.numero})`;

    if (empleado.rol === 'admin') {
        document.getElementById('adminPanel').style.display = 'block';
        document.getElementById('meseroMenu').style.display = 'none';
    } else {
        document.getElementById('meseroMenu').style.display = 'block';
        document.getElementById('adminPanel').style.display = 'none';
        generarMesas();
    }
}

function logout() {
    sessionStorage.removeItem('empleado');
    document.getElementById('mainContent').style.display = 'none';
    document.getElementById('loginScreen').style.display = 'flex';
    carrito = [];
    window.location.href = 'login.html';
}

// ======== FUNCIONES DE AYUDA ======== //
function mostrarModal(titulo, mensaje, confirmCallback = null) {
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    const btnConfirm = document.getElementById('modalConfirm');
    
    document.getElementById('modalTitle').textContent = titulo;
    document.getElementById('modalBody').textContent = mensaje;
    
    if (confirmCallback) {
        btnConfirm.style.display = 'block';
        // Limpiar eventos previos
        btnConfirm.onclick = null;
        // Configurar nuevo evento
        btnConfirm.onclick = () => {
            confirmCallback();
            modal.hide();
        };
    } else {
        btnConfirm.style.display = 'none';
    }
    
    modal.show();
}

// ======== FUNCIONES PARA ADMIN ======== //
function actualizarFechaActual() {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('fechaActual').textContent = new Date().toLocaleDateString('es-MX', options);
}

function finalizarDia() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const total = pedidos.reduce((sum, pedido) => sum + pedido.total, 0);
    const totalPropina = pedidos.reduce((sum, pedido) => sum + (pedido.propina || 0), 0);
    
    const ingresoId = 'ing' + Date.now();
    ingresosDiarios.push({
        id: ingresoId,
        fecha: hoy,
        total,
        propina: totalPropina,
        pedidos: pedidos.length,
        detalles: pedidos.map(p => ({
            id: p.id,
            total: p.total,
            propina: p.propina || 0,
            mesero: p.meseroNombre,
            metodoPago: p.metodoPago
        }))
    });
    
    guardarDatos();
    actualizarHistorialIngresos();
    mostrarModal('Día Finalizado', `Se registró un ingreso total de $${total.toFixed(2)} (Propinas: $${totalPropina.toFixed(2)})`);
}

function resetData() {
    mostrarModal('Confirmar', '¿Está seguro que desea eliminar TODOS los datos? Esta acción no se puede deshacer.', () => {
        localStorage.clear();
        sessionStorage.clear();
        window.location.href = 'login.html';
    });
}

function actualizarSelectEmpleados() {
    const select = document.getElementById('selectEmpleadoHorario');
    if (!select) return;
    
    select.innerHTML = '<option value="" selected disabled>Seleccione empleado</option>';
    
    Object.keys(empleados).forEach(numero => {
        const option = document.createElement('option');
        option.value = numero;
        option.textContent = `${numero} - ${empleados[numero].nombre}`;
        select.appendChild(option);
    });
}

function actualizarTablaEmpleados() {
    const tbody = document.getElementById('tablaEmpleados');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    Object.keys(empleados).forEach(numero => {
        const empleado = empleados[numero];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${numero}</td>
            <td>${empleado.nombre}</td>
            <td>${empleado.rol}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="eliminarEmpleado('${numero}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function eliminarEmpleado(numero) {
    mostrarModal('Confirmar', `¿Eliminar empleado ${numero}?`, () => {
        delete empleados[numero];
        guardarDatos();
        actualizarTablaEmpleados();
        actualizarSelectEmpleados();
    });
}

function actualizarSelectIngredientes() {
    const select = document.getElementById('selectIngrediente');
    if (!select) return;
    
    select.innerHTML = '<option value="" selected disabled>Seleccione ingrediente</option>';
    
    Object.keys(ingredientes).forEach(id => {
        const ingrediente = ingredientes[id];
        const option = document.createElement('option');
        option.value = id;
        option.textContent = `${ingrediente.nombre} (${ingrediente.unidad})`;
        select.appendChild(option);
    });
}

function actualizarTablaInventario() {
    const tbody = document.getElementById('tablaInventario');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    Object.keys(ingredientes).forEach(id => {
        const ingrediente = ingredientes[id];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${ingrediente.nombre}</td>
            <td>${ingrediente.cantidad}</td>
            <td>${ingrediente.unidad}</td>
        `;
        tbody.appendChild(tr);
    });
}

function actualizarTablaHorarios() {
    const tbody = document.getElementById('tablaHorarios');
    if (!tbody) return;
    
    tbody.innerHTML = '';
    
    Object.keys(horarios).forEach(id => {
        const horario = horarios[id];
        const tr = document.createElement('tr');
        tr.innerHTML = `
            <td>${horario.nombre}</td>
            <td>${horario.entrada}</td>
            <td>${horario.salida}</td>
            <td>
                <button class="btn btn-danger btn-sm" onclick="eliminarHorario('${id}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}

function eliminarHorario(id) {
    mostrarModal('Confirmar', '¿Eliminar este horario?', () => {
        delete horarios[id];
        guardarDatos();
        actualizarTablaHorarios();
    });
}

function agregarCampoIngrediente() {
    const container = document.getElementById('ingredientesContainer');
    const div = document.createElement('div');
    div.className = 'row g-2 mb-2';
    div.innerHTML = `
        <div class="col-md-6">
            <select class="form-select" required>
                <option value="" selected disabled>Seleccione ingrediente</option>
                ${Object.keys(ingredientes).map(id => 
                    `<option value="${id}">${ingredientes[id].nombre} (${ingredientes[id].unidad})</option>`
                ).join('')}
            </select>
        </div>
        <div class="col-md-4">
            <input type="number" class="form-control" placeholder="Cantidad" min="0.01" step="0.01" required>
        </div>
        <div class="col-md-2">
            <button type="button" class="btn btn-danger btn-sm w-100" onclick="this.parentElement.parentElement.remove()">X</button>
        </div>
    `;
    container.appendChild(div);
}

function actualizarListaPlatillosAdmin() {
    const container = document.getElementById('listaPlatillosAdmin');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.keys(platillos).forEach(id => {
        const platillo = platillos[id];
        const div = document.createElement('div');
        div.className = 'col';
        div.innerHTML = `
            <div class="card h-100">
                <img src="${platillo.imagen}" class="card-img-top" style="height: 150px; object-fit: cover;">
                <div class="card-body">
                    <h5 class="card-title">${platillo.nombre}</h5>
                    <p class="card-text">${platillo.descripcion}</p>
                    <p class="h5 text-primary">$${platillo.precio.toFixed(2)}</p>
                    <button class="btn btn-danger btn-sm" onclick="eliminarPlatillo('${id}')">Eliminar</button>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function eliminarPlatillo(id) {
    mostrarModal('Confirmar', '¿Eliminar este platillo?', () => {
        delete platillos[id];
        guardarDatos();
        actualizarListaPlatillosAdmin();
        actualizarMenu();
    });
}

function actualizarConfigTransferencia() {
    if (!document.getElementById('nombreCuenta')) return;
    
    document.getElementById('nombreCuenta').value = transferenciaConfig.nombreCuenta || '';
    document.getElementById('nombreBanco').value = transferenciaConfig.nombreBanco || '';
    document.getElementById('numeroCuenta').value = transferenciaConfig.numeroCuenta || '';
    document.getElementById('clabe').value = transferenciaConfig.clabe || '';
    document.getElementById('rfc').value = transferenciaConfig.rfc || '';
}

function actualizarHistorialIngresos() {
    const container = document.getElementById('historialIngresos');
    if (!container) return;
    
    container.innerHTML = '';
    
    ingresosDiarios.forEach(ingreso => {
        const fecha = new Date(ingreso.fecha).toLocaleDateString('es-MX');
        const div = document.createElement('div');
        div.className = 'list-group-item';
        div.innerHTML = `
            <div class="d-flex justify-content-between">
                <div>
                    <h6>${fecha}</h6>
                    <small>${ingreso.detalles.length} pedidos - $${ingreso.total.toFixed(2)} (Propina: $${ingreso.propina?.toFixed(2) || '0.00'})</small>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-info" onclick="verDetalleIngreso('${ingreso.id}')">Ver Detalle</button>
                    </div>
                </div>
                <div>
                    <strong>$${(ingreso.total + (ingreso.propina || 0)).toFixed(2)}</strong>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function verDetalleIngreso(ingresoId) {
    const ingreso = ingresosDiarios.find(i => i.id === ingresoId);
    if (!ingreso) return;
    
    let mensaje = `<h5>Detalle de Ingreso</h5>
        <p><strong>Fecha:</strong> ${new Date(ingreso.fecha).toLocaleString()}</p>
        <p><strong>Total:</strong> $${ingreso.total.toFixed(2)}</p>
        <p><strong>Propina:</strong> $${ingreso.propina?.toFixed(2) || '0.00'}</p>
        <hr>
        <h6>Detalle de Pedidos:</h6>
        <table class="table">
            <thead>
                <tr>
                    <th>ID</th>
                    <th>Mesero</th>
                    <th>Total</th>
                    <th>Propina</th>
                    <th>Método</th>
                </tr>
            </thead>
            <tbody>
                ${ingreso.detalles.map(d => `
                    <tr>
                        <td>${d.id}</td>
                        <td>${d.mesero}</td>
                        <td>$${d.total.toFixed(2)}</td>
                        <td>$${d.propina?.toFixed(2) || '0.00'}</td>
                        <td>${d.metodoPago}</td>
                    </tr>
                `).join('')}
            </tbody>
        </table>`;
    
    document.getElementById('modalTitle').textContent = 'Detalle de Ingreso';
    document.getElementById('modalBody').innerHTML = mensaje;
    document.getElementById('modalConfirm').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

function actualizarDetalleVentas() {
    const container = document.getElementById('detalleVentas');
    if (!container) return;
    
    container.innerHTML = '';
    
    pedidos.forEach(pedido => {
        const fecha = new Date(pedido.fecha).toLocaleTimeString('es-MX');
        const div = document.createElement('div');
        div.className = 'list-group-item';
        div.innerHTML = `
            <div class="d-flex justify-content-between">
                <div>
                    <h6>${fecha} - ${pedido.meseroNombre}</h6>
                    <small>Mesa ${pedido.mesa} - ${pedido.nombreCliente}</small>
                    <ul class="mb-1">
                        ${pedido.productos.map(p => 
                            `<li>${p.nombre} x${p.cantidad} ($${p.precio.toFixed(2)})</li>`
                        ).join('')}
                    </ul>
                </div>
                <div>
                    <strong>$${pedido.total.toFixed(2)}</strong>
                    ${pedido.propina ? `<div class="text-success">+$${pedido.propina.toFixed(2)} propina</div>` : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function calcularIngresosDia() {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    const pedidosHoy = pedidos.filter(p => {
        const fechaPedido = new Date(p.fecha);
        fechaPedido.setHours(0, 0, 0, 0);
        return fechaPedido.getTime() === hoy.getTime();
    });
    
    const total = pedidosHoy.reduce((sum, pedido) => sum + pedido.total, 0);
    const totalPropina = pedidosHoy.reduce((sum, pedido) => sum + (pedido.propina || 0), 0);
    document.getElementById('ingresosHoy').textContent = `$${total.toFixed(2)} (Propina: $${totalPropina.toFixed(2)})`;
}

// ======== FUNCIONES PARA MESERO ======== //
function generarMesas() {
    const container = document.getElementById('mesasContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Botón para agregar mesas (solo admin)
    const empleado = JSON.parse(sessionStorage.getItem('empleado'));
    if (empleado.rol === 'admin') {
        container.innerHTML += `
            <div class="col-md-12 mb-4">
                <div class="card">
                    <div class="card-body">
                        <h5>Administrar Mesas</h5>
                        <div class="input-group">
                            <input type="number" class="form-control" id="nuevoNumeroMesas" min="1" value="1">
                            <button class="btn btn-primary" onclick="agregarMesas()">Agregar Mesas</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
    
    // Generar mesas
    for (let i = 1; i <= mesasDisponibles; i++) {
        const ocupada = mesasOcupadas[i] || false;
        const div = document.createElement('div');
        div.className = 'col-md-3 mb-4';
        div.innerHTML = `
            <div class="card text-center">
                <div class="card-body">
                    <div class="mesa-circle ${ocupada ? 'mesa-ocupada' : 'mesa-libre'}">
                        <h5 class="mesa-numero">${i}</h5>
                    </div>
                    <div class="mt-2">
                        ${ocupada ? 
                            `<button class="btn btn-sm btn-warning" onclick="verPedidoMesa(${i})">Ver Pedido</button>` : 
                            `<button class="btn btn-sm btn-success" onclick="seleccionarMesa(${i})">Seleccionar</button>`
                        }
                        ${empleado.rol === 'admin' ? 
                            `<button class="btn btn-sm btn-danger ms-1" onclick="eliminarMesa(${i})">Eliminar</button>` : 
                            ''
                        }
                    </div>
                </div>
            </div>
        `;
        container.appendChild(div);
    }
}

function agregarMesas() {
    const cantidad = parseInt(document.getElementById('nuevoNumeroMesas').value) || 1;
    mesasDisponibles += cantidad;
    guardarDatos();
    actualizarMesas();
}

function eliminarMesa(numeroMesa) {
    if (mesasOcupadas[numeroMesa]) {
        mostrarModal('Error', 'No se puede eliminar una mesa ocupada');
        return;
    }
    
    mostrarModal('Confirmar', `¿Eliminar la mesa ${numeroMesa}?`, () => {
        mesasDisponibles--;
        // Reorganizar números de mesa si es necesario
        guardarDatos();
        actualizarMesas();
    });
}

function seleccionarMesa(numeroMesa) {
    document.getElementById('numeroMesa').value = numeroMesa;
    // Mostrar pestaña de carrito
    const tab = new bootstrap.Tab(document.querySelector('#meseroTabs a[href="#carrito"]'));
    tab.show();
}

function verPedidoMesa(numeroMesa) {
    const pedido = pedidos.find(p => p.mesa === numeroMesa && !p.pagado);
    if (pedido) {
        mostrarDetallePago(pedido.id);
        // Mostrar pestaña de pagos
        const tab = new bootstrap.Tab(document.querySelector('#meseroTabs a[href="#pagos"]'));
        tab.show();
    } else {
        mostrarModal('Información', 'La mesa no tiene pedidos pendientes');
    }
}

function actualizarMesas() {
    // Actualizar estado de mesas según pedidos
    mesasOcupadas = {};
    pedidos.filter(p => !p.pagado).forEach(p => {
        mesasOcupadas[p.mesa] = true;
    });
    
    guardarDatos();
    generarMesas();
}

function actualizarMenu() {
    const container = document.getElementById('menuPlatillos');
    if (!container) return;
    
    container.innerHTML = '';
    
    Object.keys(platillos).forEach(id => {
        const platillo = platillos[id];
        if (platillo.activo) {
            const div = document.createElement('div');
            div.className = 'col';
            div.innerHTML = `
                <div class="card h-100">
                    <img src="${platillo.imagen}" class="card-img-top" style="height: 150px; object-fit: cover;">
                    <div class="card-body">
                        <h5 class="card-title">${platillo.nombre}</h5>
                        <p class="card-text">${platillo.descripcion}</p>
                        <p class="h5 text-primary">$${platillo.precio.toFixed(2)}</p>
                        <div class="input-group">
                            <input type="number" class="form-control" value="1" min="1">
                            <button class="btn btn-primary" onclick="agregarAlCarrito('${id}')">Agregar</button>
                        </div>
                    </div>
                </div>
            `;
            container.appendChild(div);
        }
    });
}

function agregarAlCarrito(platilloId) {
    const platillo = platillos[platilloId];
    const cantidad = parseInt(event.target.parentElement.querySelector('input').value);
    
    carrito.push({
        id: platilloId,
        nombre: platillo.nombre,
        precio: platillo.precio,
        cantidad
    });
    
    actualizarCarrito();
}

function actualizarCarrito() {
    const container = document.getElementById('detallePedido');
    if (!container) return;
    
    container.innerHTML = `
        <div class="mb-3">
            <label for="nombreCliente" class="form-label">Nombre del Cliente</label>
            <input type="text" class="form-control" id="nombreCliente" required>
        </div>
        <div class="mb-3">
            <label for="numeroMesa" class="form-label">Número de Mesa</label>
            <select class="form-select" id="numeroMesa" required>
                ${Array.from({length: mesasDisponibles}, (_, i) => 
                    `<option value="${i+1}" ${mesasOcupadas[i+1] ? 'disabled' : ''}>Mesa ${i+1} ${mesasOcupadas[i+1] ? '(Ocupada)' : ''}</option>`
                ).join('')}
            </select>
        </div>
        <div class="mb-3">
            <label class="form-label">Fecha y Hora</label>
            <input type="text" class="form-control" value="${new Date().toLocaleString('es-MX')}" readonly>
        </div>
        <hr>
        <h5>Detalle del Pedido</h5>
    `;
    
    let total = 0;
    
    carrito.forEach((item, index) => {
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        
        const div = document.createElement('div');
        div.className = 'd-flex justify-content-between mb-2';
        div.innerHTML = `
            <div>
                ${item.nombre} x${item.cantidad}
                <small class="text-muted">($${item.precio.toFixed(2)} c/u)</small>
            </div>
            <div>
                <strong>$${subtotal.toFixed(2)}</strong>
                <button class="btn btn-danger btn-sm ms-2" onclick="eliminarDelCarrito(${index})">X</button>
            </div>
        `;
        container.appendChild(div);
    });
    
    document.getElementById('totalPedido').textContent = `$${total.toFixed(2)}`;
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

// ======== FUNCIONES DE INVENTARIO ======== //
function verificarInventarioSuficiente(pedido) {
    const faltantes = [];
    
    pedido.productos.forEach(item => {
        const platillo = platillos[item.id];
        if (platillo && platillo.ingredientes) {
            Object.keys(platillo.ingredientes).forEach(ingredienteId => {
                const cantidadNecesaria = platillo.ingredientes[ingredienteId] * item.cantidad;
                if (ingredientes[ingredienteId] && ingredientes[ingredienteId].cantidad < cantidadNecesaria) {
                    faltantes.push({
                        ingrediente: ingredientes[ingredienteId].nombre,
                        necesario: cantidadNecesaria,
                        disponible: ingredientes[ingredienteId].cantidad,
                        unidad: ingredientes[ingredienteId].unidad
                    });
                }
            });
        }
    });
    
    return faltantes;
}

function actualizarInventario(pedido) {
    let cambiosInventario = [];
    
    pedido.productos.forEach(item => {
        const platillo = platillos[item.id];
        if (platillo && platillo.ingredientes) {
            Object.keys(platillo.ingredientes).forEach(ingredienteId => {
                const cantidadUsada = platillo.ingredientes[ingredienteId] * item.cantidad;
                if (ingredientes[ingredienteId]) {
                    ingredientes[ingredienteId].cantidad -= cantidadUsada;
                    cambiosInventario.push({
                        ingrediente: ingredientes[ingredienteId].nombre,
                        cantidadUsada: cantidadUsada,
                        nuevoTotal: ingredientes[ingredienteId].cantidad,
                        unidad: ingredientes[ingredienteId].unidad
                    });
                }
            });
        }
    });
    
    guardarDatos();
    return cambiosInventario;
}

function confirmarPedido() {
    if (carrito.length === 0) {
        mostrarModal('Error', 'El carrito está vacío');
        return;
    }

    const nombreCliente = document.getElementById('nombreCliente').value;
    const numeroMesa = parseInt(document.getElementById('numeroMesa').value);
    
    if (!nombreCliente || !numeroMesa) {
        mostrarModal('Error', 'Complete todos los campos');
        return;
    }

    const empleado = JSON.parse(sessionStorage.getItem('empleado'));
    const total = carrito.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);
    
    // Verificar inventario antes de confirmar
    const pedidoTemporal = { productos: [...carrito] };
    const faltantes = verificarInventarioSuficiente(pedidoTemporal);
    
    if (faltantes.length > 0) {
        let mensajeError = 'No hay suficiente inventario para:\n';
        faltantes.forEach(f => {
            mensajeError += `- ${f.ingrediente}: Necesario ${f.necesario}${f.unidad}, Disponible ${f.disponible}${f.unidad}\n`;
        });
        mostrarModal('Error de Inventario', mensajeError);
        return;
    }
    
    mostrarModal('Confirmar Pedido', `¿Confirmar pedido por $${total.toFixed(2)}?`, () => {
        const pedidoId = 'ped' + Date.now();
        const nuevoPedido = {
            id: pedidoId,
            meseroId: empleado.numero,
            meseroNombre: empleado.nombre,
            nombreCliente,
            mesa: numeroMesa,
            productos: [...carrito],
            total,
            fecha: new Date(),
            estado: 'pendiente',
            pagado: false
        };
        
        // Actualizar inventario
        const cambios = actualizarInventario(nuevoPedido);
        
        pedidos.push(nuevoPedido);
        mesasOcupadas[numeroMesa] = true;
        
        guardarDatos();
        
        carrito = [];
        actualizarCarrito();
        actualizarMesas();
        actualizarListaPendientes();
        
        // Mostrar resumen
        let mensaje = 'Pedido registrado correctamente\n\n';
        mensaje += `Mesa: ${numeroMesa}\n`;
        mensaje += `Cliente: ${nombreCliente}\n`;
        mensaje += `Total: $${total.toFixed(2)}\n\n`;
        mensaje += 'Inventario actualizado:\n';
        cambios.forEach(cambio => {
            mensaje += `- ${cambio.ingrediente}: -${cambio.cantidadUsada}${cambio.unidad}\n`;
        });
        
        mostrarModal('Éxito', mensaje);
    });
}

function actualizarReservas() {
    const container = document.getElementById('listaReservas');
    if (!container) return;
    
    container.innerHTML = '';
    
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    
    reservas
        .filter(reserva => new Date(reserva.fecha) >= hoy && reserva.estado === 'confirmada')
        .sort((a, b) => new Date(a.fecha) - new Date(b.fecha))
        .forEach(reserva => {
            const fecha = new Date(reserva.fecha).toLocaleString('es-MX');
            const div = document.createElement('div');
            div.className = 'list-group-item';
            div.innerHTML = `
                <div class="d-flex justify-content-between">
                    <div>
                        <h6>${reserva.nombre}</h6>
                        <small>${fecha} - ${reserva.personas} personas</small>
                    </div>
                    <button class="btn btn-danger btn-sm" onclick="cancelarReserva('${reserva.id}')">Cancelar</button>
                </div>
            `;
            container.appendChild(div);
        });
}

function cancelarReserva(id) {
    mostrarModal('Confirmar', '¿Cancelar esta reserva?', () => {
        const reserva = reservas.find(r => r.id === id);
        if (reserva) {
            reserva.estado = 'cancelada';
            guardarDatos();
            actualizarReservas();
        }
    });
}

// ======== FUNCIONES DE PAGOS ======== //
function actualizarListaPendientes() {
    const container = document.getElementById('listaPendientes');
    if (!container) return;
    
    container.innerHTML = '';
    
    pedidos.filter(p => !p.pagado).forEach(pedido => {
        const div = document.createElement('div');
        div.className = 'list-group-item';
        div.innerHTML = `
            <div class="d-flex justify-content-between align-items-center">
                <div>
                    <h6>Mesa ${pedido.mesa} - ${pedido.nombreCliente}</h6>
                    <small>${new Date(pedido.fecha).toLocaleString()}</small>
                </div>
                <button class="btn btn-primary btn-sm" onclick="mostrarDetallePago('${pedido.id}')">Pagar</button>
            </div>
        `;
        container.appendChild(div);
    });
}

function mostrarDetallePago(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    const container = document.getElementById('detallePago');
    container.innerHTML = `
        <h5>Detalle de Pago</h5>
        <p><strong>Cliente:</strong> ${pedido.nombreCliente}</p>
        <p><strong>Mesa:</strong> ${pedido.mesa}</p>
        <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
        <hr>
        <h6>Productos:</h6>
        <ul class="mb-3">
            ${pedido.productos.map(p => 
                `<li>${p.nombre} x${p.cantidad} - $${(p.precio * p.cantidad).toFixed(2)}</li>`
            ).join('')}
        </ul>
        <p><strong>Subtotal:</strong> $${pedido.total.toFixed(2)}</p>
        
        <div class="mb-3">
            <label class="form-label">Propina</label>
            <input type="number" class="form-control" id="propina" min="0" value="0" step="10">
        </div>
        
        <div class="mb-3">
            <label class="form-label">Método de Pago</label>
            <select class="form-select" id="metodoPago">
                <option value="efectivo">Efectivo</option>
                <option value="transferencia">Transferencia</option>
            </select>
        </div>
        
        <div class="mb-3" id="efectivoContainer">
            <label class="form-label">Efectivo Recibido</label>
            <input type="number" class="form-control" id="efectivoRecibido" min="${pedido.total}" value="${pedido.total}">
        </div>
        
        <div id="transferenciaContainer" style="display: none;">
            <div class="card mb-3">
                <div class="card-body">
                    <h6>Datos para Transferencia</h6>
                    <p><strong>Nombre:</strong> ${transferenciaConfig.nombreCuenta || 'No configurado'}</p>
                    <p><strong>Banco:</strong> ${transferenciaConfig.nombreBanco || 'No configurado'}</p>
                    <p><strong>Número de Cuenta:</strong> ${transferenciaConfig.numeroCuenta || 'No configurado'}</p>
                    <p><strong>CLABE:</strong> ${transferenciaConfig.clabe || 'No configurado'}</p>
                    <p><strong>RFC:</strong> ${transferenciaConfig.rfc || 'No configurado'}</p>
                </div>
            </div>
        </div>
        
        <div class="mb-3">
            <button class="btn btn-success w-100" onclick="procesarPago('${pedidoId}')">Procesar Pago</button>
        </div>
        
        <div id="resultadoPago"></div>
    `;
    
    // Mostrar/ocultar secciones según método de pago
    document.getElementById('metodoPago').addEventListener('change', function() {
        document.getElementById('efectivoContainer').style.display = 
            this.value === 'efectivo' ? 'block' : 'none';
        document.getElementById('transferenciaContainer').style.display = 
            this.value === 'transferencia' ? 'block' : 'none';
    });
}

function procesarPago(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    const metodoPago = document.getElementById('metodoPago').value;
    const propina = parseFloat(document.getElementById('propina').value) || 0;
    const efectivoRecibido = parseFloat(document.getElementById('efectivoRecibido').value) || 0;
    
    // Calcular total con propina
    const totalConPropina = pedido.total + propina;
    
    // Verificar si el efectivo es suficiente
    if (metodoPago === 'efectivo' && efectivoRecibido < totalConPropina) {
        document.getElementById('resultadoPago').innerHTML = `
            <div class="alert alert-danger">Efectivo insuficiente</div>
        `;
        return;
    }
    
    // Calcular cambio
    const cambio = metodoPago === 'efectivo' ? efectivoRecibido - totalConPropina : 0;
    
    // Marcar como pagado
    pedido.pagado = true;
    pedido.metodoPago = metodoPago;
    pedido.propina = propina;
    pedido.totalConPropina = totalConPropina;
    pedido.fechaPago = new Date();
    pedido.efectivoRecibido = efectivoRecibido;
    
    // Liberar mesa
    mesasOcupadas[pedido.mesa] = false;
    
    // Agregar a ingresos
    const ingresoId = 'ing' + Date.now();
    ingresosDiarios.push({
        id: ingresoId,
        fecha: new Date(),
        total: pedido.total,
        propina: propina,
        pedidoId: pedido.id,
        mesa: pedido.mesa,
        metodoPago,
        productos: pedido.productos,
        pagado: true
    });
    
    guardarDatos();
    actualizarListaPendientes();
    actualizarMesas();
    actualizarHistorialIngresos();
    actualizarDetalleVentas();
    
    // Mostrar resumen
    document.getElementById('resultadoPago').innerHTML = `
        <div class="alert alert-success">
            <h5>Pago procesado</h5>
            <p><strong>Total con propina:</strong> $${totalConPropina.toFixed(2)}</p>
            ${metodoPago === 'efectivo' ? `<p><strong>Cambio:</strong> $${cambio.toFixed(2)}</p>` : ''}
            <button class="btn btn-primary mt-2" onclick="imprimirTicket('${pedidoId}')">Imprimir Ticket</button>
        </div>
    `;
}

function imprimirTicket(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html>
        <head>
            <title>Ticket #${pedido.id}</title>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .ticket { width: 300px; margin: 0 auto; }
                .header { text-align: center; margin-bottom: 15px; }
                .item { display: flex; justify-content: space-between; margin: 5px 0; }
                .total { font-weight: bold; border-top: 1px dashed #000; padding-top: 5px; margin-top: 10px; }
                .footer { text-align: center; margin-top: 15px; font-size: 12px; }
            </style>
        </head>
        <body>
            <div class="ticket">
                <div class="header">
                    <h3>Restaurante La Buena Mesa</h3>
                    <p>Ticket #${pedido.id}</p>
                </div>
                <p><strong>Fecha:</strong> ${new Date(pedido.fecha).toLocaleString()}</p>
                <p><strong>Mesa:</strong> ${pedido.mesa}</p>
                <p><strong>Cliente:</strong> ${pedido.nombreCliente}</p>
                <p><strong>Mesero:</strong> ${pedido.meseroNombre}</p>
                <hr>
                ${pedido.productos.map(p => `
                    <div class="item">
                        <span>${p.nombre} x${p.cantidad}</span>
                        <span>$${(p.precio * p.cantidad).toFixed(2)}</span>
                    </div>
                `).join('')}
                <div class="item">
                    <span>Subtotal:</span>
                    <span>$${pedido.total.toFixed(2)}</span>
                </div>
                <div class="item">
                    <span>Propina:</span>
                    <span>$${pedido.propina.toFixed(2)}</span>
                </div>
                <div class="item total">
                    <span>Total:</span>
                    <span>$${pedido.totalConPropina.toFixed(2)}</span>
                </div>
                <p><strong>Método de pago:</strong> ${pedido.metodoPago}</p>
                ${pedido.metodoPago === 'efectivo' ? `
                    <div class="item">
                        <span>Efectivo recibido:</span>
                        <span>$${pedido.efectivoRecibido.toFixed(2)}</span>
                    </div>
                    <div class="item">
                        <span>Cambio:</span>
                        <span>$${(pedido.efectivoRecibido - pedido.totalConPropina).toFixed(2)}</span>
                    </div>
                ` : ''}
                ${pedido.metodoPago === 'transferencia' ? `
                    <div class="card mt-3">
                        <div class="card-body">
                            <h6>Datos para Transferencia</h6>
                            <p><strong>Nombre:</strong> ${transferenciaConfig.nombreCuenta || 'No configurado'}</p>
                            <p><strong>Banco:</strong> ${transferenciaConfig.nombreBanco || 'No configurado'}</p>
                            <p><strong>Número de Cuenta:</strong> ${transferenciaConfig.numeroCuenta || 'No configurado'}</p>
                            <p><strong>CLABE:</strong> ${transferenciaConfig.clabe || 'No configurado'}</p>
                            <p><strong>RFC:</strong> ${transferenciaConfig.rfc || 'No configurado'}</p>
                        </div>
                    </div>
                ` : ''}
                <div class="footer">
                    <p>¡Gracias por su visita!</p>
                    <p>${new Date().toLocaleString()}</p>
                </div>
            </div>
        </body>
        </html>
    `);
    ventana.document.close();
    ventana.print();
}

// ======== FUNCIONES GLOBALES ======== //
window.eliminarEmpleado = eliminarEmpleado;
window.eliminarHorario = eliminarHorario;
window.eliminarPlatillo = eliminarPlatillo;
window.eliminarIngreso = eliminarIngreso;
window.cambiarEstadoMesa = cambiarEstadoMesa;
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
window.cancelarReserva = cancelarReserva;
window.agregarMesas = agregarMesas;
window.eliminarMesa = eliminarMesa;
window.seleccionarMesa = seleccionarMesa;
window.verPedidoMesa = verPedidoMesa;
window.mostrarDetallePago = mostrarDetallePago;
window.procesarPago = procesarPago;
window.imprimirTicket = imprimirTicket;
window.verDetalleIngreso = verDetalleIngreso;
window.marcarComoPagado = marcarComoPagado;
window.resetData = resetData;