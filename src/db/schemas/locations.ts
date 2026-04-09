import { sqliteTable, text, real } from 'drizzle-orm/sqlite-core';

import { timeEntries } from './time-entries';

export const locations = sqliteTable('locations', {
  id: text('id').primaryKey(),
  timeEntryId: text('time_entry_id').notNull().unique().references(() => timeEntries.id),
  latitudeIn: real('latitude_in'),
  longitudeIn: real('longitude_in'),
  latitudeOut: real('latitude_out'),
  longitudeOut: real('longitude_out'),
  addressIn: text('address_in'),
  addressOut: text('address_out'),
});
