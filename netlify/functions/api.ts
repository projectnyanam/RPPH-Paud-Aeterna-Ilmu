import serverless from 'serverless-http';
import { apiApp } from '../../server';

export const handler = serverless(apiApp);
