import 'dotenv/config';
import app from './app';

const PORT = parseInt(process.env.PORT || '5000', 10);
const IP = process.env.IP || '0.0.0.0';

app.listen(PORT, IP, () => {
  console.log(`Server is running on http://${IP}:${PORT}`);
});

process.on('unhandledRejection', (err: any) => {
  console.error('Unhandled Rejection:', err);
});

process.on('uncaughtException', (err: any) => {
  console.error('Uncaught Exception:', err);
});
