// auth/auth.js - Versión mejorada

/**
 * Función para login de empleados con localStorage
 * @param {string} numeroEmpleado - Número de empleado
 * @param {string} password - Contraseña del empleado
 * @returns {Promise<Object>} - Datos del empleado si el login es exitoso
 */
window.loginEmpleado = async (numeroEmpleado, password) => {
    try {
        // Validación básica
        if (!numeroEmpleado || !password) {
            throw new Error("Debe ingresar número y contraseña");
        }

        // Obtener empleados de localStorage
        const empleados = JSON.parse(localStorage.getItem('empleados')) || {};
        
        // Verificar si hay usuarios registrados
        if (Object.keys(empleados).length === 0) {
            throw new Error("No hay usuarios registrados. Recargue la página para configurar el administrador.");
        }
        
        const empleado = empleados[numeroEmpleado];
        
        if (!empleado) {
            throw new Error("Número de empleado no registrado");
        }
        
        if (empleado.password !== password) {
            throw new Error("Contraseña incorrecta");
        }
        
        if (!empleado.activo) {
            throw new Error("Cuenta desactivada");
        }
        
        // Datos para guardar en sesión
        const sessionData = {
            numero: numeroEmpleado,
            nombre: empleado.nombre,
            rol: empleado.rol,
            timestamp: new Date().getTime()
        };
        
        return sessionData;
        
    } catch (error) {
        console.error("Error en autenticación:", error);
        throw error;
    }
};

/**
 * Función para verificar si hay usuarios registrados
 * @returns {boolean} - True si hay usuarios registrados, false si no
 */
window.hayUsuariosRegistrados = () => {
    const empleados = JSON.parse(localStorage.getItem('empleados')) || {};
    return Object.keys(empleados).length > 0;
};