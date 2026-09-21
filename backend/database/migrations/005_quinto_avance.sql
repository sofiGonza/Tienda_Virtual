CREATE DATABASE IF NOT EXISTS pixel_store
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

USE pixel_store;

CREATE TABLE IF NOT EXISTS roles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NULL
);

CREATE TABLE IF NOT EXISTS permisos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    descripcion VARCHAR(255) NULL,
    rol_id INT NOT NULL,
    CONSTRAINT fk_permisos_rol
        FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL,
    apellido VARCHAR(30) NOT NULL,
    tipo_documento VARCHAR(20) NOT NULL,
    numero_documento VARCHAR(15) NOT NULL UNIQUE,
    direccion VARCHAR(100) NOT NULL,
    telefono VARCHAR(15) NOT NULL,
    correo VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol_id INT NOT NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE,
    codigo_recuperacion VARCHAR(10) NULL,
    codigo_expira DATETIME NULL,
    CONSTRAINT fk_usuarios_rol
        FOREIGN KEY (rol_id) REFERENCES roles(id)
);

CREATE TABLE IF NOT EXISTS productos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    categoria VARCHAR(100) NOT NULL,
    precio FLOAT NOT NULL,
    stock INT NOT NULL DEFAULT 0,
    marca VARCHAR(100) NOT NULL,
    imagen VARCHAR(255) NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS servicios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion VARCHAR(500) NOT NULL,
    precio FLOAT NOT NULL DEFAULT 0,
    icono VARCHAR(50) NULL,
    estado BOOLEAN NOT NULL DEFAULT TRUE
);

CREATE TABLE IF NOT EXISTS pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    total FLOAT NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    fecha DATETIME NULL,
    CONSTRAINT fk_pedidos_usuario
        FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS detalle_pedidos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    pedido_id INT NOT NULL,
    producto_id INT NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario FLOAT NOT NULL,
    subtotal FLOAT NOT NULL,
    CONSTRAINT fk_detalle_pedido
        FOREIGN KEY (pedido_id) REFERENCES pedidos(id),
    CONSTRAINT fk_detalle_producto
        FOREIGN KEY (producto_id) REFERENCES productos(id)
);

INSERT INTO roles (nombre, descripcion)
SELECT 'administrador', 'Administrador del sistema Pixel Store'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE nombre = 'administrador'
);

INSERT INTO roles (nombre, descripcion)
SELECT 'empleado', 'Empleado de Pixel Store'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE nombre = 'empleado'
);

INSERT INTO roles (nombre, descripcion)
SELECT 'cliente', 'Cliente de Pixel Store'
WHERE NOT EXISTS (
    SELECT 1 FROM roles WHERE nombre = 'cliente'
);

INSERT INTO permisos (nombre, descripcion, rol_id)
SELECT 'gestionar_usuarios', 'CRUD de usuarios', r.id
FROM roles r
WHERE r.nombre = 'administrador'
AND NOT EXISTS (
    SELECT 1 FROM permisos p
    WHERE p.nombre = 'gestionar_usuarios' AND p.rol_id = r.id
);

INSERT INTO permisos (nombre, descripcion, rol_id)
SELECT 'gestionar_productos', 'CRUD de productos', r.id
FROM roles r
WHERE r.nombre IN ('administrador', 'empleado')
AND NOT EXISTS (
    SELECT 1 FROM permisos p
    WHERE p.nombre = 'gestionar_productos' AND p.rol_id = r.id
);

INSERT INTO servicios (nombre, descripcion, precio, icono, estado)
SELECT 'Mantenimiento de computadores',
       'Realizamos mantenimiento preventivo y correctivo para mejorar el rendimiento y prolongar la vida útil de tus computadores.',
       80000, 'laptop', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM servicios WHERE nombre = 'Mantenimiento de computadores'
);

INSERT INTO servicios (nombre, descripcion, precio, icono, estado)
SELECT 'Instalación de software',
       'Instalamos y configuramos programas y herramientas necesarias para tus actividades académicas, laborales o personales.',
       50000, 'download', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM servicios WHERE nombre = 'Instalación de software'
);

INSERT INTO servicios (nombre, descripcion, precio, icono, estado)
SELECT 'Configuración de equipos',
       'Configuramos computadores y dispositivos tecnológicos para que funcionen correctamente y se adapten a tus necesidades.',
       60000, 'cog', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM servicios WHERE nombre = 'Configuración de equipos'
);

INSERT INTO servicios (nombre, descripcion, precio, icono, estado)
SELECT 'Asesoría tecnológica',
       'Te ayudamos a elegir equipos, accesorios y soluciones tecnológicas de acuerdo con tus necesidades y presupuesto.',
       40000, 'lightbulb', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM servicios WHERE nombre = 'Asesoría tecnológica'
);

INSERT INTO servicios (nombre, descripcion, precio, icono, estado)
SELECT 'Soporte técnico',
       'Ofrecemos asistencia para solucionar problemas de software, configuración y funcionamiento de tus dispositivos.',
       55000, 'tools', TRUE
WHERE NOT EXISTS (
    SELECT 1 FROM servicios WHERE nombre = 'Soporte técnico'
);

-- Quinto avance: gestión comercial, facturación, PQR y chatbot.
CREATE TABLE IF NOT EXISTS ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    cliente_id INT NOT NULL,
    operador_id INT NULL,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
    impuestos DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'registrada',
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX ix_ventas_cliente (cliente_id),
    INDEX ix_ventas_operador (operador_id),
    INDEX ix_ventas_fecha (fecha),
    INDEX ix_ventas_estado (estado),
    CONSTRAINT fk_ventas_cliente FOREIGN KEY (cliente_id) REFERENCES usuarios(id),
    CONSTRAINT fk_ventas_operador FOREIGN KEY (operador_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS detalle_ventas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL,
    producto_id INT NULL,
    servicio_id INT NULL,
    nombre_item VARCHAR(150) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    descuento DECIMAL(12,2) NOT NULL DEFAULT 0,
    subtotal DECIMAL(12,2) NOT NULL,
    INDEX ix_detalle_ventas_venta (venta_id),
    INDEX ix_detalle_ventas_producto (producto_id),
    INDEX ix_detalle_ventas_servicio (servicio_id),
    CONSTRAINT fk_detalle_ventas_venta FOREIGN KEY (venta_id) REFERENCES ventas(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_ventas_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
    CONSTRAINT fk_detalle_ventas_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id),
    CONSTRAINT ck_detalle_ventas_item CHECK ((producto_id IS NOT NULL AND servicio_id IS NULL) OR (producto_id IS NULL AND servicio_id IS NOT NULL)),
    CONSTRAINT ck_detalle_ventas_cantidad CHECK (cantidad > 0)
);

CREATE TABLE IF NOT EXISTS facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    venta_id INT NOT NULL UNIQUE,
    numero VARCHAR(40) NOT NULL UNIQUE,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    subtotal DECIMAL(12,2) NOT NULL DEFAULT 0,
    impuestos DECIMAL(12,2) NOT NULL DEFAULT 0,
    total DECIMAL(12,2) NOT NULL DEFAULT 0,
    estado VARCHAR(30) NOT NULL DEFAULT 'emitida',
    INDEX ix_facturas_fecha (fecha),
    INDEX ix_facturas_estado (estado),
    CONSTRAINT fk_facturas_venta FOREIGN KEY (venta_id) REFERENCES ventas(id)
);

CREATE TABLE IF NOT EXISTS detalle_facturas (
    id INT AUTO_INCREMENT PRIMARY KEY,
    factura_id INT NOT NULL,
    producto_id INT NULL,
    servicio_id INT NULL,
    descripcion VARCHAR(150) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(12,2) NOT NULL,
    subtotal DECIMAL(12,2) NOT NULL,
    INDEX ix_detalle_facturas_factura (factura_id),
    CONSTRAINT fk_detalle_facturas_factura FOREIGN KEY (factura_id) REFERENCES facturas(id) ON DELETE CASCADE,
    CONSTRAINT fk_detalle_facturas_producto FOREIGN KEY (producto_id) REFERENCES productos(id),
    CONSTRAINT fk_detalle_facturas_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)
);

CREATE TABLE IF NOT EXISTS pqr (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    asunto VARCHAR(150) NOT NULL,
    tipo VARCHAR(30) NOT NULL DEFAULT 'peticion',
    descripcion TEXT NOT NULL,
    respuesta TEXT NULL,
    estado VARCHAR(30) NOT NULL DEFAULT 'pendiente',
    fecha_creacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX ix_pqr_usuario (usuario_id),
    INDEX ix_pqr_estado (estado),
    INDEX ix_pqr_fecha (fecha_creacion),
    CONSTRAINT fk_pqr_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS conversaciones (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario_id INT NOT NULL,
    titulo VARCHAR(150) NULL,
    creada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    actualizada_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX ix_conversaciones_usuario (usuario_id),
    CONSTRAINT fk_conversaciones_usuario FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
);

CREATE TABLE IF NOT EXISTS mensajes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    conversacion_id INT NOT NULL,
    rol VARCHAR(20) NOT NULL,
    contenido TEXT NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX ix_mensajes_conversacion (conversacion_id),
    INDEX ix_mensajes_creado (creado_en),
    CONSTRAINT fk_mensajes_conversacion FOREIGN KEY (conversacion_id) REFERENCES conversaciones(id) ON DELETE CASCADE
);
