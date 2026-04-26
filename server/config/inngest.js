import { Inngest } from 'inngest';
import nodemailer from 'nodemailer';

export const inngest = new Inngest({ id: 'cinebook', eventKey: process.env.INNGEST_EVENT_KEY });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS },
});

const sendMail = (to, subject, html) =>
  transporter.sendMail({ from: `CineBook <${process.env.EMAIL_USER}>`, to, subject, html });

// ── Booking Confirmation Email ────────────────────────────────────────────────
export const sendBookingConfirmation = inngest.createFunction(
  { id: 'send-booking-confirmation' },
  { event: 'booking/confirmed' },
  async ({ event }) => {
    const { userEmail, userName, bookingRef, movie, showTime, seats, totalAmount } = event.data;
    const seatList = seats.map(s => s.seatNumber).join(', ');
    const showDate = new Date(showTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

    await sendMail(userEmail, `🎬 Booking Confirmed - ${bookingRef}`, `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#e50914,#b0060f);padding:32px;text-align:center;">
          <h1 style="margin:0;font-size:28px;">🎬 CineBook</h1>
          <p style="margin:8px 0 0;opacity:0.9;">Booking Confirmed!</p>
        </div>
        <div style="padding:32px;">
          <p style="font-size:18px;">Hi ${userName}! Your booking is confirmed.</p>
          <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin:20px 0;">
            <p><strong>Booking Ref:</strong> ${bookingRef}</p>
            <p><strong>Seats:</strong> ${seatList}</p>
            <p><strong>Show:</strong> ${showDate}</p>
            <p><strong>Total Paid:</strong> ₹${totalAmount}</p>
          </div>
          <p style="opacity:0.7;font-size:14px;">Please arrive 15 minutes before the show. Enjoy your movie! 🍿</p>
        </div>
      </div>
    `);
    return { sent: true };
  }
);

// ── Seat Lock Release (runs after 10 min) ────────────────────────────────────
export const releaseSeatLocks = inngest.createFunction(
  { id: 'release-seat-locks', concurrency: { limit: 10 } },
  { event: 'seats/locked' },
  async ({ event, step }) => {
    await step.sleep('wait-10-minutes', '10m');

    await step.run('release-expired-locks', async () => {
      const { default: Show } = await import('../models/Show.js');
      const { showId, seatNumbers, userId } = event.data;
      const show = await Show.findById(showId);
      if (!show) return;

      let released = 0;
      const now = new Date();
      show.seats.forEach(seat => {
        if (seatNumbers.includes(seat.seatNumber) && seat.status === 'locked' && seat.lockedBy === userId) {
          const age = now - new Date(seat.lockedAt);
          if (age >= 10 * 60 * 1000) {
            seat.status = 'available';
            seat.lockedBy = undefined;
            seat.lockedAt = undefined;
            released++;
          }
        }
      });

      if (released > 0) await show.save();
      return { released };
    });
  }
);

// ── Show Reminder Email ───────────────────────────────────────────────────────
export const sendShowReminder = inngest.createFunction(
  { id: 'send-show-reminder' },
  { event: 'show/reminder' },
  async ({ event }) => {
    const { userEmail, userName, bookingRef, showTime, theaterName, city } = event.data;
    const showDate = new Date(showTime).toLocaleString('en-IN', { dateStyle: 'full', timeStyle: 'short' });

    await sendMail(userEmail, `⏰ Reminder: Your show is tomorrow!`, `
      <div style="font-family:sans-serif;max-width:600px;margin:auto;background:#0a0a0a;color:#fff;border-radius:12px;overflow:hidden;">
        <div style="background:linear-gradient(135deg,#e50914,#b0060f);padding:32px;text-align:center;">
          <h1>⏰ Show Reminder</h1>
        </div>
        <div style="padding:32px;">
          <p>Hi ${userName}! Don't forget your movie tomorrow.</p>
          <div style="background:#1a1a1a;border-radius:8px;padding:20px;margin:20px 0;">
            <p><strong>Ref:</strong> ${bookingRef}</p>
            <p><strong>When:</strong> ${showDate}</p>
            <p><strong>Where:</strong> ${theaterName}, ${city}</p>
          </div>
        </div>
      </div>
    `);
    return { sent: true };
  }
);

export const inngestFunctions = [sendBookingConfirmation, releaseSeatLocks, sendShowReminder];
