const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function createTestUser() {
  try {
    const email = 'testuser@example.com';
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      console.log('Un utilisateur de test existe déjà.');
      return;
    }
    const user = await prisma.user.create({
      data: {
        name: 'Test User',
        email,
        image: 'https://api.dicebear.com/7.x/identicon/svg?seed=testuser',
        isAdmin: false,
        isBanned: false,
      },
    });
    console.log('Utilisateur de test créé :', user);
  } catch (error) {
    console.error('Erreur lors de la création de l\'utilisateur de test :', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUser(); 