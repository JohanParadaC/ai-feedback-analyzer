/**
 * Elimina una cuenta de empresa y todas sus reseñas.
 *
 * Sirve para limpiar cuentas de prueba y para atender una petición de borrado
 * de datos por parte de un cliente.
 *
 * Uso:
 *   npx tsx scripts/delete-account.ts <email>              # simulación
 *   npx tsx scripts/delete-account.ts <email> --confirmar  # borra de verdad
 *
 * Por defecto solo muestra lo que borraría. Sin `--confirmar` no toca nada.
 */
import mongoose from 'mongoose';
import env from '../src/config/env.js';
import User from '../src/models/User.js';
import Feedback from '../src/models/Feedback.js';

const email = process.argv[2]?.trim().toLowerCase();
const confirmado = process.argv.includes('--confirmar');

if (!email) {
    console.error(`
Falta el email de la cuenta.

  npx tsx scripts/delete-account.ts cuenta@ejemplo.com              (simulación)
  npx tsx scripts/delete-account.ts cuenta@ejemplo.com --confirmar  (borra)
`);
    process.exit(1);
}

const run = async () => {
    await mongoose.connect(env.MONGO_URI);
    console.log(`\n🍃 Conectado a la base de datos.\n`);

    const user = await User.findOne({ email });

    if (!user) {
        console.log(`No existe ninguna cuenta con el email "${email}". No hay nada que borrar.\n`);
        return;
    }

    const feedbacks = await Feedback.find({ userId: user._id })
        .sort({ date: -1 })
        .select('text sentiment score date')
        .lean();

    console.log('Se eliminaría:');
    console.log(`  Empresa : ${user.companyName}`);
    console.log(`  Email   : ${user.email}`);
    console.log(`  ID      : ${user._id}`);
    console.log(`  Reseñas : ${feedbacks.length}\n`);

    if (feedbacks.length > 0) {
        console.log('  Reseñas asociadas:');
        feedbacks.slice(0, 10).forEach((f, i) => {
            const fecha = new Date(f.date).toLocaleDateString('es');
            const texto = f.text.length > 60 ? `${f.text.slice(0, 60)}…` : f.text;
            console.log(`    ${i + 1}. [${fecha}] ${f.sentiment} (${f.score}/10) — ${texto}`);
        });
        if (feedbacks.length > 10) {
            console.log(`    … y ${feedbacks.length - 10} más`);
        }
        console.log('');
    }

    if (!confirmado) {
        console.log('⚠️  SIMULACIÓN: no se ha borrado nada.');
        console.log('   Vuelve a ejecutarlo con --confirmar para borrarlo de verdad.\n');
        return;
    }

    // Primero las reseñas y después el usuario: si algo falla por el camino, no
    // quedan reseñas huérfanas apuntando a un usuario que ya no existe.
    const { deletedCount } = await Feedback.deleteMany({ userId: user._id });
    await User.deleteOne({ _id: user._id });

    console.log(`🗑️  Borrado: ${deletedCount} reseña(s) y la cuenta "${user.companyName}".\n`);
};

run()
    .catch((error) => {
        console.error('\n❌ Error durante el borrado:', error);
        process.exitCode = 1;
    })
    .finally(() => mongoose.disconnect());
