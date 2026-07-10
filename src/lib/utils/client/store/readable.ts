import { DateTime } from 'luxon';
import { readable } from 'svelte/store';

export const dateTimeJSTBase = readable<string>(
    `<p>The date/time is shown in your local time (Time Zone: <span class="console_contents_note">${DateTime.local().zoneName}</span>). This field must be set in your local time.</p><hr /><p>- The date/time is converted to UTC and stored in the database and used in the game as UTC+9 (Japan Standard Time).</p><p>- The converted date actually used in the game is displayed as the "True date."</p>`,
);
export const dateTimeUTCBase = readable<string>(
    `<p>The date/time is shown in your local time (Time Zone: <span class="console_contents_note">${DateTime.local().zoneName}</span>). This field must be set in your local time.</p><hr /><p>- The date/time is converted to UTC and stored in the database.</p><p>- When displaying information (launcher or website), each date/time is converted based on each user's timezone.</p>`,
);
export const sortId = readable<string>('Sort by ascending/descending order.');
