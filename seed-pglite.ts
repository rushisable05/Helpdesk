import { seed100Tickets } from './seed-100-tickets.ts';

seed100Tickets().catch((err) => {
  console.error('Seeding error:', err);
  process.exit(1);
});
