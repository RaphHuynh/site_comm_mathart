const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function createAdmin() {
  try {
    // Récupérer le premier utilisateur (vous devriez vous connecter d'abord)
    const users = await prisma.user.findMany({
      take: 1,
      orderBy: { createdAt: 'desc' }
    });

    if (users.length === 0) {
      console.log('Aucun utilisateur trouvé. Connectez-vous d\'abord avec Discord.');
      return;
    }

    const user = users[0];
    console.log(`Utilisateur trouvé: ${user.name} (${user.email})`);

    // Promouvoir en admin
    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: { isAdmin: true }
    });

    console.log(`✅ ${updatedUser.name} est maintenant administrateur!`);
    console.log(`Vous pouvez maintenant accéder à l'administration sur: http://localhost:3000/admin`);

  } catch (error) {
    console.error('Erreur:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createAdmin(); 