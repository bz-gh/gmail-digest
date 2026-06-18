# gmail-digest

A Google Apps Script that sends a digest of unread Gmail inbox emails to any external email address on a schedule, then archives everything in the inbox. Useful for migrating away from Gmail while ensuring nothing critical gets missed during the transition.

## Features

- **Daily and weekly digests** - run both during a migration period, drop to weekly once confident
- **Auto-archive** - clears the inbox after each digest so Gmail stays clean without manual effort
- **Empty digest** - sends a digest even when there are no unread emails, so you always get a confirmation ping
- **Spam stays in Gmail** - only pulls from the inbox, so Gmail's spam filter does its job before anything is forwarded
- **Plain HTML output** - clean, readable digest with sender, subject, date, and a 200-character preview per email

## Setup

### 1. Open Google Apps Script

Go to [script.google.com](https://script.google.com) while signed into your Gmail account and create a new project.

### 2. Paste the script

Copy the contents of `gmail-digest.gs` into the editor, replacing the default `myFunction()` placeholder.

### 3. Configure your destination address

At the top of the script, replace the placeholder with your destination email address:

```js
var DESTINATION_ADDRESS = "you@yourdomain.com";
```

### 4. Authorize permissions

Run `sendDailyDigest` manually first by selecting it from the function dropdown and clicking **Run**. Google will prompt you to authorize the script to access Gmail and send email on your behalf. Repeat for `sendWeeklyDigest`.

### 5. Set up triggers

Click the **Triggers** icon (clock) in the left sidebar, then **Add Trigger** for each function:

| Function | Event source | Type | Frequency |
|---|---|---|---|
| `sendDailyDigest` | Time-driven | Day timer | Your preferred time |
| `sendWeeklyDigest` | Time-driven | Week timer | Your preferred day/time |

Once you are confident nothing critical is being missed, delete the daily trigger and rely on the weekly one only.

## Notes

- The archive function processes inbox threads in batches of 100, so even a large inbox will be fully cleared
- Archived emails remain accessible in Gmail under All Mail so nothing is deleted
- Digests are sent before archiving, so if the email send fails the archive step will not run
- The script uses your Gmail account's timezone for all date formatting

## License

MIT
