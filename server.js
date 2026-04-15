import 'dotenv/config';
import app from './app.js';
import { sequelize } from './models/index.js';
import { verifySmtpConnection } from './src/services/email.service.js';
import logger from './src/utils/logger.js';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  try {
    // Verify DB connection and sync models
    await sequelize.authenticate();
    logger.info('Database connection established');

    await sequelize.sync({ alter: true });
    logger.info('Database models synced');

    // Verify SMTP (non-blocking)
    verifySmtpConnection();

    app.listen(PORT, () => {
      logger.info(`Server running on http://localhost:${PORT}`);
      logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    });
  } catch (err) {
    logger.error(`Failed to start server: ${err.message}`, err);
    process.exit(1);
  }
}

bootstrap();
