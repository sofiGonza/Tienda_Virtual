-- 008_pedidos_servicios.sql
-- Permite que un detalle de pedido sea un servicio con horas (idempotente MySQL 8).
USE pixel_store;

ALTER TABLE detalle_pedidos MODIFY COLUMN producto_id INT NULL;

SET @existe_servicio = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'detalle_pedidos' AND COLUMN_NAME = 'servicio_id'
);
SET @sql1 = IF(@existe_servicio = 0,
  'ALTER TABLE detalle_pedidos ADD COLUMN servicio_id INT NULL AFTER producto_id',
  'SELECT 1');
PREPARE stmt FROM @sql1; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe_horas = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'detalle_pedidos' AND COLUMN_NAME = 'horas'
);
SET @sql2 = IF(@existe_horas = 0,
  'ALTER TABLE detalle_pedidos ADD COLUMN horas INT NULL AFTER cantidad',
  'SELECT 1');
PREPARE stmt FROM @sql2; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe_fk = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'detalle_pedidos' AND CONSTRAINT_NAME = 'fk_detalle_pedidos_servicio'
);
SET @sql3 = IF(@existe_fk = 0,
  'ALTER TABLE detalle_pedidos ADD CONSTRAINT fk_detalle_pedidos_servicio FOREIGN KEY (servicio_id) REFERENCES servicios(id)',
  'SELECT 1');
PREPARE stmt FROM @sql3; EXECUTE stmt; DEALLOCATE PREPARE stmt;
