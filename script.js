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
let configTransferencia = {};

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
    configTransferencia = JSON.parse(localStorage.getItem('configTransferencia')) || {};
    
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
    localStorage.setItem('configTransferencia', JSON.stringify(configTransferencia));
}

function setupEventListeners() {
    // Logout
    document.getElementById('logoutButton')?.addEventListener('click', logout);

    // Admin: Finalizar día
    document.getElementById('finalizarDia')?.addEventListener('click', finalizarDia);

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
    
    // Admin: Configuración de transferencia
    document.getElementById('formConfigTransferencia')?.addEventListener('submit', (e) => {
        e.preventDefault();
        configTransferencia = {
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

    // Registrar hora de entrada
    const hoy = new Date().toLocaleDateString();
    if (!horarios[empleado.numero]) {
        horarios[empleado.numero] = {
            empleadoId: empleado.numero,
            nombre: empleado.nombre,
            fecha: hoy,
            entrada: new Date().toLocaleTimeString(),
            salida: null
        };
    } else if (horarios[empleado.numero].fecha !== hoy) {
        horarios[empleado.numero] = {
            empleadoId: empleado.numero,
            nombre: empleado.nombre,
            fecha: hoy,
            entrada: new Date().toLocaleTimeString(),
            salida: null
        };
    }
    
    guardarDatos();
    actualizarTablaHorarios();

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
    const empleado = JSON.parse(sessionStorage.getItem('empleado'));
    if (empleado && horarios[empleado.numero]) {
        horarios[empleado.numero].salida = new Date().toLocaleTimeString();
        guardarDatos();
    }
    
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
    
    const ingresoId = 'ing' + Date.now();
    ingresosDiarios.push({
        id: ingresoId,
        fecha: hoy,
        total,
        pedidos: pedidos.length,
        detalles: pedidos.map(p => ({
            id: p.id,
            total: p.total,
            mesero: p.meseroNombre
        }))
    });
    
    guardarDatos();
    actualizarHistorialIngresos();
    mostrarModal('Día Finalizado', `Se registró un ingreso total de $${total.toFixed(2)}`);
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

function editarEmpleado(numero) {
    const empleado = empleados[numero];
    if (!empleado) return;

    mostrarModal('Editar Empleado', `
        <form id="formEditarEmpleado">
            <div class="mb-3">
                <label class="form-label">Número de Empleado</label>
                <input type="number" class="form-control" id="editNumeroEmpleado" value="${numero}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Nombre</label>
                <input type="text" class="form-control" id="editNombreEmpleado" value="${empleado.nombre}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Nueva Contraseña (dejar vacío para no cambiar)</label>
                <input type="password" class="form-control" id="editPasswordEmpleado">
            </div>
            <div class="mb-3">
                <label class="form-label">Rol</label>
                <select class="form-select" id="editRolEmpleado" required>
                    <option value="mesero" ${empleado.rol === 'mesero' ? 'selected' : ''}>Mesero</option>
                    <option value="admin" ${empleado.rol === 'admin' ? 'selected' : ''}>Administrador</option>
                </select>
            </div>
        </form>
    `, () => {
        const nuevoNumero = document.getElementById('editNumeroEmpleado').value;
        const nombre = document.getElementById('editNombreEmpleado').value;
        const password = document.getElementById('editPasswordEmpleado').value;
        const rol = document.getElementById('editRolEmpleado').value;

        if (nuevoNumero && nombre && rol) {
            // Si cambió el número, eliminamos el antiguo
            if (nuevoNumero !== numero) {
                delete empleados[numero];
            }
            
            empleados[nuevoNumero] = {
                nombre,
                password: password || empleado.password,
                rol,
                activo: true
            };
            
            guardarDatos();
            actualizarTablaEmpleados();
            actualizarSelectEmpleados();
        }
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
                <button class="btn btn-primary btn-sm" onclick="editarEmpleado('${numero}')">Editar</button>
                <button class="btn btn-danger btn-sm ms-1" onclick="eliminarEmpleado('${numero}')">Eliminar</button>
            </td>
        `;
        tbody.appendChild(tr);
    });
}y

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
                    <h6>${fecha} - ${ingreso.nombreCliente || 'Cliente no registrado'}</h6>
                    <small>${ingreso.metodoPago} - $${ingreso.total.toFixed(2)} (Propina: $${ingreso.propina?.toFixed(2) || '0.00'})</small>
                    <div class="mt-2">
                        <button class="btn btn-sm btn-info" onclick="verDetalleIngreso('${ingreso.id}')">Ver Detalle</button>
                        <button class="btn btn-sm btn-primary ms-1" onclick="imprimirTicketAdmin('${ingreso.pedidoId}')">Imprimir Ticket</button>
                    </div>
                </div>
                <div>
                    <strong>$${ingreso.totalConPropina?.toFixed(2) || ingreso.total.toFixed(2)}</strong>
                </div>
            </div>
        `;
        container.appendChild(div);
    });
}

function verDetalleIngreso(ingresoId) {
    const ingreso = ingresosDiarios.find(i => i.id === ingresoId);
    if (!ingreso) return;
    
    const pedido = pedidos.find(p => p.id === ingreso.pedidoId);
    
    let mensaje = `<h5>Detalle de Ingreso</h5>
        <p><strong>Fecha:</strong> ${new Date(ingreso.fecha).toLocaleString()}</p>
        <p><strong>Cliente:</strong> ${ingreso.nombreCliente || 'No registrado'}</p>
        <p><strong>Mesa:</strong> ${ingreso.mesa}</p>
        <p><strong>Método de pago:</strong> ${ingreso.metodoPago}</p>
        <p><strong>Total:</strong> $${ingreso.total.toFixed(2)}</p>
        <p><strong>Propina:</strong> $${ingreso.propina?.toFixed(2) || '0.00'}</p>
        <p><strong>Total con propina:</strong> $${ingreso.totalConPropina?.toFixed(2) || ingreso.total.toFixed(2)}</p>
        <p><strong>Mesero:</strong> ${ingreso.meseroNombre}</p>`;
    
    if (pedido) {
        mensaje += `
            <p><strong>Hora de atención:</strong> ${pedido.horaAtendido}</p>
            <p><strong>Hora de entrega:</strong> ${pedido.horaEntrega || 'No entregado'}</p>
            <p><strong>Hora de cobro:</strong> ${ingreso.fechaPago ? new Date(ingreso.fechaPago).toLocaleTimeString() : 'No cobrado'}</p>
        `;
    }
    
    mensaje += `<hr><h6>Productos:</h6><ul>`;
    
    ingreso.productos.forEach(p => {
        mensaje += `<li>${p.nombre} x${p.cantidad} - $${(p.precio * p.cantidad).toFixed(2)}</li>`;
    });
    
    mensaje += `</ul>`;
    
    if (ingreso.pagado) {
        mensaje += `<button class="btn btn-primary mt-2" onclick="imprimirTicketAdmin('${ingreso.pedidoId}')">Reimprimir Ticket</button>`;
    } else {
        mensaje += `<button class="btn btn-success mt-2" onclick="marcarComoPagado('${ingreso.id}')">Marcar como Pagado</button>`;
    }
    
    document.getElementById('modalTitle').textContent = 'Detalle de Ingreso';
    document.getElementById('modalBody').innerHTML = mensaje;
    document.getElementById('modalConfirm').style.display = 'none';
    
    const modal = new bootstrap.Modal(document.getElementById('confirmModal'));
    modal.show();
}

function marcarComoPagado(ingresoId) {
    const ingreso = ingresosDiarios.find(i => i.id === ingresoId);
    if (!ingreso) return;
    
    ingreso.pagado = true;
    ingreso.fechaPago = new Date();
    
    const pedido = pedidos.find(p => p.id === ingreso.pedidoId);
    if (pedido) {
        pedido.pagado = true;
        pedido.fechaPago = new Date();
        mesasOcupadas[pedido.mesa] = false;
    }
    
    guardarDatos();
    actualizarHistorialIngresos();
    actualizarMesas();
    
    mostrarModal('Éxito', 'El ingreso ha sido marcado como pagado');
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
                    <ul class="mb-1">
                        ${pedido.productos.map(p => 
                            `<li>${p.nombre} x${p.cantidad} ($${p.precio.toFixed(2)})</li>`
                        ).join('')}
                    </ul>
                </div>
                <strong>$${pedido.total.toFixed(2)}</strong>
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
    document.getElementById('ingresosHoy').textContent = `$${total.toFixed(2)}`;
}

function actualizarConfigTransferencia() {
    const container = document.getElementById('configTransferenciaContainer');
    if (!container) return;
    
    container.innerHTML = `
        <form id="formConfigTransferencia">
            <div class="mb-3">
                <label class="form-label">Nombre de la Cuenta</label>
                <input type="text" class="form-control" id="nombreCuenta" value="${configTransferencia.nombreCuenta || ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Nombre del Banco</label>
                <input type="text" class="form-control" id="nombreBanco" value="${configTransferencia.nombreBanco || ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">Número de Cuenta</label>
                <input type="text" class="form-control" id="numeroCuenta" value="${configTransferencia.numeroCuenta || ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">CLABE Interbancaria</label>
                <input type="text" class="form-control" id="clabe" value="${configTransferencia.clabe || ''}" required>
            </div>
            <div class="mb-3">
                <label class="form-label">RFC</label>
                <input type="text" class="form-control" id="rfc" value="${configTransferencia.rfc || ''}" required>
            </div>
            <button type="submit" class="btn btn-primary">Guardar Configuración</button>
        </form>
    `;
}

// ======== FUNCIONES PARA MESERO ======== //
function generarMesas() {
    const container = document.getElementById('mesasContainer');
    if (!container) return;
    
    container.innerHTML = '';
    
    // Generar mesas
    for (let i = 1; i <= mesasDisponibles; i++) {
        const estado = mesasOcupadas[i] || 'libre';
        const pedido = pedidos.find(p => p.mesa === i && !p.pagado);
        
        let claseColor = '';
        let botones = '';
        
        if (estado === 'libre') {
            claseColor = 'mesa-libre';
            botones = `<button class="btn btn-sm btn-success" onclick="seleccionarMesa(${i})">Seleccionar</button>`;
        } else if (estado === 'preparacion') {
            claseColor = 'mesa-preparacion';
            botones = `
                <button class="btn btn-sm btn-warning" onclick="marcarComoEntregado(${i})">Entregar Pedido</button>
                <button class="btn btn-sm btn-info" onclick="verPedidoMesa(${i})">Ver Pedido</button>
            `;
        } else if (estado === 'ocupada') {
            claseColor = 'mesa-ocupada';
            botones = `
                <button class="btn btn-sm btn-primary" onclick="procesarPagoMesa(${i})">Pagar</button>
                <button class="btn btn-sm btn-info" onclick="verPedidoMesa(${i})">Ver Pedido</button>
            `;
        }
        
        const div = document.createElement('div');
        div.className = 'col-md-3 mb-4';
        div.innerHTML = `
            <div class="card text-center">
                <div class="card-body">
                    <div class="mesa-circle ${claseColor}">
                        <h5 class="mesa-numero">${i}</h5>
                    </div>
                    <div class="mt-2">
                        ${botones}
                    </div>
                    ${pedido ? `<small class="text-muted">Atendido: ${pedido.horaAtendido}</small>` : ''}
                </div>
            </div>
        `;
        container.appendChild(div);
    }
}

function marcarComoEntregado(numeroMesa) {
    const pedido = pedidos.find(p => p.mesa === numeroMesa && !p.pagado);
    if (pedido) {
        pedido.horaEntrega = new Date().toLocaleTimeString();
        mesasOcupadas[numeroMesa] = 'ocupada';
        guardarDatos();
        actualizarMesas();
        mostrarModal('Éxito', 'Pedido marcado como entregado');
    }
}

function procesarPagoMesa(numeroMesa) {
    const pedido = pedidos.find(p => p.mesa === numeroMesa && !p.pagado);
    if (pedido) {
        mostrarDetallePago(pedido.id);
        const tab = new bootstrap.Tab(document.querySelector('#meseroTabs a[href="#pagos"]'));
        tab.show();
    }
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

    // Mostrar carrito en tiempo real
    const carritoContainer = document.createElement('div');
    carritoContainer.className = 'col-12 mt-4';
    carritoContainer.innerHTML = `
        <div class="card">
            <div class="card-header">
                <h5>Carrito de Compras</h5>
            </div>
            <div class="card-body" id="carritoMenu">
                ${carrito.length === 0 ? '<p class="text-muted">No hay items en el carrito</p>' : ''}
            </div>
            ${carrito.length > 0 ? `
            <div class="card-footer">
                <button class="btn btn-success" onclick="document.querySelector('#meseroTabs a[href=\'#carrito\']').click()">Ver Carrito Completo</button>
            </div>
            ` : ''}
        </div>
    `;
    container.appendChild(carritoContainer);
    actualizarCarritoMenu();
}

function actualizarCarritoMenu() {
    const container = document.getElementById('carritoMenu');
    if (!container) return;
    
    container.innerHTML = '';
    
    if (carrito.length === 0) {
        container.innerHTML = '<p class="text-muted">No hay items en el carrito</p>';
        return;
    }
    
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
                <button class="btn btn-danger btn-sm ms-2" onclick="eliminarDelCarrito(${index}); actualizarMenu()">X</button>
            </div>
        `;
        container.appendChild(div);
    });
    
    const totalDiv = document.createElement('div');
    totalDiv.className = 'd-flex justify-content-between mt-3 fw-bold';
    totalDiv.innerHTML = `
        <div>Total:</div>
        <div>$${total.toFixed(2)}</div>
    `;
    container.appendChild(totalDiv);
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
            pagado: false,
            horaAtendido: new Date().toLocaleTimeString(),
            horaEntrega: null,
            horaCobro: null
        };
        
        // Actualizar inventario
        const cambios = actualizarInventario(nuevoPedido);
        
        pedidos.push(nuevoPedido);
        mesasOcupadas[numeroMesa] = 'preparacion'; // Cambiado para el nuevo sistema de colores
        
        guardarDatos();
        
        carrito = [];
        actualizarCarrito();
        actualizarMesas();
        actualizarListaPendientes();
        actualizarMenu(); // Añadido para actualizar el carrito en tiempo real
        
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
                <div class="card-header">
                    Datos para Transferencia
                </div>
                <div class="card-body">
                    <p><strong>Banco:</strong> ${configTransferencia.nombreBanco || 'No configurado'}</p>
                    <p><strong>Nombre:</strong> ${configTransferencia.nombreCuenta || 'No configurado'}</p>
                    <p><strong>CLABE:</strong> ${configTransferencia.clabe || 'No configurado'}</p>
                    <p><strong>RFC:</strong> ${configTransferencia.rfc || 'No configurado'}</p>
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
        const metodo = this.value;
        document.getElementById('efectivoContainer').style.display = 
            metodo === 'efectivo' ? 'block' : 'none';
        document.getElementById('transferenciaContainer').style.display = 
            metodo === 'transferencia' ? 'block' : 'none';
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
        totalConPropina: totalConPropina,
        pedidoId: pedido.id,
        nombreCliente: pedido.nombreCliente,
        mesa: pedido.mesa,
        metodoPago,
        propina,
        productos: pedido.productos,
        pagado: true
    });
    
    guardarDatos();
    actualizarListaPendientes();
    actualizarMesas();
    actualizarHistorialIngresos();
    
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

function imprimirTicketAdmin(pedidoId) {
    const pedido = pedidos.find(p => p.id === pedidoId);
    if (!pedido) return;
    
    const ventana = window.open('', '_blank');
    ventana.document.write(`
        <html>
        <head>
            <title>Ticket Admin #${pedido.id}</title>
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
                    <p>Ticket Admin #${pedido.id}</p>
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
                    <span>$${pedido.propina?.toFixed(2) || '0.00'}</span>
                </div>
                <div class="item total">
                    <span>Total:</span>
                    <span>$${pedido.totalConPropina?.toFixed(2) || pedido.total.toFixed(2)}</span>
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
                <div class="footer">
                    <p>Ticket generado el ${new Date().toLocaleString()}</p>
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
window.imprimirTicketAdmin = imprimirTicketAdmin;
window.verDetalleIngreso = verDetalleIngreso;
window.marcarComoPagado = marcarComoPagado;