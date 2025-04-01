// auth/auth.js - Versión local

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
        const empleado = empleados[numeroEmpleado];
        
        if (!empleado) {
            throw new Error("Número de empleado no registrado");
        }
        
        if (empleado.password !== password) {
            throw new Error("Contraseña incorrecta");
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