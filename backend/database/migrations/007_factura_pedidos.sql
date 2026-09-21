-- 007_factura_pedidos.sql
-- Permite que una factura se vincule a un pedido (idempotente para MySQL 8).
USE pixel_store;

ALTER TABLE facturas MODIFY COLUMN venta_id INT NULL;

SET @existe_pedido = (
  SELECT COUNT(*) FROM information_schema.COLUMNS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'facturas' AND COLUMN_NAME = 'pedido_id'
);
SET @sql = IF(@existe_pedido = 0,
  'ALTER TABLE facturas ADD COLUMN pedido_id INT NULL UNIQUE AFTER venta_id',
  'SELECT 1');
PREPARE stmt FROM @sql; EXECUTE stmt; DEALLOCATE PREPARE stmt;

SET @existe_fk = (
  SELECT COUNT(*) FROM information_schema.TABLE_CONSTRAINTS
  WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'facturas' AND CONSTRAINT_NAME = 'fk_facturas_pedido'
);
SET @sql2 = IF(@existe_fk = 0,
  'ALTER TABLE facturas ADD CONSTRAINT fk_facturas_pedido FOREIGN KEY (pedido_id) REFERENCES pedidos(id)',
  'SELECT 1');
PREPARE stmt FROM @sql2; EXECUTE stmt; DEALLOCATE PREPARE stmt;
