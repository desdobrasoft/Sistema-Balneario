import { PrismaPg } from '@prisma/adapter-pg';
import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';
import { ALL_MODULE_KEYS } from '../src/common/constants/app-modules';
import { PrismaClient } from '../src/generated/prisma/client';

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding database...');

  const adminUser = process.env.ADMIN_USER || 'admin';
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  console.log(`Ensuring admin user '${adminUser}' exists...`);

  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { username: adminUser },
  });

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt();
    const passwordHash = await bcrypt.hash(adminPassword, salt);

    await prisma.user.create({
      data: {
        username: adminUser,
        email: 'admin@techwall.com.br',
        fullName: 'Administrador',
        passwordHash,
        isActive: true,
      },
    });

    console.log(`Admin user '${adminUser}' created successfully!`);
  } else {
    console.log(`Admin user '${adminUser}' already exists. Skipping.`);
  }

  // Insert standard Roles if they don't exist
  const standardRoles = [
    {
      role: 'admin',
      permissions: ALL_MODULE_KEYS,
    },
  ];

  for (const roleData of standardRoles) {
    const role = await prisma.role.findUnique({
      where: { role: roleData.role },
    });

    if (!role) {
      await prisma.role.create({
        data: roleData,
      });
      console.log(`Role '${roleData.role}' created with full permissions.`);
    } else {
      // Opcional: Atualiza as permissões da role admin já existente
      await prisma.role.update({
        where: { id: role.id },
        data: { permissions: roleData.permissions },
      });
      console.log(`Role '${roleData.role}' permissions updated.`);
    }
  }

  // Assign admin role to the admin user
  const admin = await prisma.user.findUnique({
    where: { username: adminUser },
  });
  const adminRole = await prisma.role.findUnique({ where: { role: 'admin' } });

  if (admin && adminRole) {
    const userRole = await prisma.userRole.findUnique({
      where: {
        userId_roleId: {
          userId: admin.id,
          roleId: adminRole.id,
        },
      },
    });

    if (!userRole) {
      await prisma.userRole.create({
        data: {
          userId: admin.id,
          roleId: adminRole.id,
        },
      });
      console.log(`Admin role assigned to user '${adminUser}'.`);
    }
  }

  // Insert Default Materia Prima
  const defaultMateriais = [
    { item: 'Cimento', unidade: 'kg' },
    { item: 'EPS', unidade: 'kg' },
    { item: 'Aditivo', unidade: 'l' },
  ];

  for (const mat of defaultMateriais) {
    const existing = await prisma.materiaPrima.findFirst({
      where: { item: mat.item },
    });
    if (!existing) {
      await prisma.materiaPrima.create({
        data: {
          item: mat.item,
          unidade: mat.unidade,
          quantidade: 0,
          estoqueMinimo: 0,
        },
      });
      console.log(`Materia Prima '${mat.item}' criada.`);
    }
  }

  console.log('Database seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
