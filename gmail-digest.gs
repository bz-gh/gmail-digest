// gmail-digest.gs
// Google Apps Script — Gmail Digest + Auto-Archive
//
// Sends a digest of unread inbox emails to an external address on a schedule,
// then archives everything in the inbox.
//
// See README.md for full setup instructions.

var DESTINATION_ADDRESS = "you@yourdomain.com"; // Replace with your destination email address

// ─── Entry Points ────────────────────────────────────────────────────────────

function sendDailyDigest() {
  var emails = getUnreadEmails(1);
  var subject = "Gmail Daily Digest – " + getFormattedDate(new Date());
  sendDigest(emails, subject, "past 24 hours");
  archiveInbox();
}

function sendWeeklyDigest() {
  var emails = getUnreadEmails(7);
  var subject = "Gmail Weekly Digest – " + getFormattedDate(new Date());
  sendDigest(emails, subject, "past 7 days");
  archiveInbox();
}

// ─── Core Logic ──────────────────────────────────────────────────────────────

function getUnreadEmails(days) {
  var now = new Date();
  var cutoff = new Date(now.getTime() - (days * 24 * 60 * 60 * 1000));
  var searchQuery = "in:inbox is:unread after:" + Utilities.formatDate(cutoff, Session.getScriptTimeZone(), "yyyy/MM/dd");
  var threads = GmailApp.search(searchQuery);

  var emailData = [];
  for (var i = 0; i < threads.length; i++) {
    var messages = threads[i].getMessages();
    for (var j = 0; j < messages.length; j++) {
      var message = messages[j];
      if (message.isUnread()) {
        emailData.push({
          from: message.getFrom(),
          subject: message.getSubject() || "(no subject)",
          date: Utilities.formatDate(message.getDate(), Session.getScriptTimeZone(), "EEE MMM dd, yyyy h:mm a"),
          snippet: message.getPlainBody().substring(0, 200).replace(/\s+/g, " ").trim() + "..."
        });
      }
    }
  }
  return emailData;
}

function sendDigest(emails, subject, periodLabel) {
  MailApp.sendEmail({
    to: DESTINATION_ADDRESS,
    subject: subject,
    htmlBody: emails.length > 0 ? buildDigestHtml(emails, periodLabel) : buildEmptyDigestHtml(periodLabel)
  });
}

function archiveInbox() {
  // Process in batches of 100 until the inbox is empty
  var threads;
  do {
    threads = GmailApp.getInboxThreads(0, 100);
    for (var i = 0; i < threads.length; i++) {
      threads[i].moveToArchive();
    }
  } while (threads.length === 100);
}

// ─── HTML Builders ───────────────────────────────────────────────────────────

function buildDigestHtml(emails, periodLabel) {
  var html = '<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">';
  html += '<h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Gmail Digest</h2>';
  html += '<p style="color: #666;"><strong>' + emails.length + ' unread email(s)</strong> from the ' + periodLabel + '. Everything has been archived.</p>';

  for (var i = 0; i < emails.length; i++) {
    var e = emails[i];
    html += '<div style="border: 1px solid #eee; border-radius: 6px; padding: 14px; margin-bottom: 12px;">';
    html += '<div style="font-weight: bold; color: #222; margin-bottom: 4px;">' + escapeHtml(e.subject) + '</div>';
    html += '<div style="color: #555; font-size: 13px; margin-bottom: 4px;">From: ' + escapeHtml(e.from) + '</div>';
    html += '<div style="color: #999; font-size: 12px; margin-bottom: 8px;">' + e.date + '</div>';
    html += '<div style="color: #444; font-size: 13px; font-style: italic;">' + escapeHtml(e.snippet) + '</div>';
    html += '</div>';
  }

  html += '<p style="color: #999; font-size: 12px; margin-top: 20px;">Log into Gmail to view archived emails.</p>';
  html += '</div>';
  return html;
}

function buildEmptyDigestHtml(periodLabel) {
  return '<div style="font-family: Arial, sans-serif; max-width: 700px; margin: 0 auto;">'
    + '<h2 style="color: #333; border-bottom: 2px solid #eee; padding-bottom: 10px;">Gmail Digest</h2>'
    + '<p style="color: #666;">No unread emails in the ' + periodLabel + '. Everything has been archived.</p>'
    + '</div>';
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getFormattedDate(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), "MMM dd, yyyy");
}

function escapeHtml(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
