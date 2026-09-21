-- 006_cuenta_bancaria.sql
-- Añade los campos de cuenta bancaria al cliente (idempotente).
-- Ejecutar en bases existentes del cuarto/quinto avance.

USE pixel_store;

ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS cuenta_bancaria VARCHAR(40) NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS banco VARCHAR(60) NULL;
ALTER TABLE usuarios ADD COLUMN IF NOT EXISTS titular_cuenta VARCHAR(60) NULL;
