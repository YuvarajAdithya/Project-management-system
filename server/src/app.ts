import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { config } from './config/index.js';
import routes from './routes/index.js';
import { AppError, errorHandler } from './middleware/error.middleware.js';

const app = express();

app.set('trust proxy', config.trustProxy);
app.use(helmet());
app.use(cors({ origin: config.corsOrigin }));
app.use(morgan(config.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'TaskFlow API is running' });
});

app.use('/api', routes);

app.use((_req, _res, next) => next(new AppError('Route not found', 404)));
app.use(errorHandler);

export default app;
