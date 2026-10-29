# CodeCart v2: sell full-stack projects to students (MERN)

React (Vite) + React Three Fiber on the front end. Express, MongoDB, Passport, Multer, Nodemailer and Razorpay on the back end.

## What is new in v2
- **Google login with Passport** (`passport-google-oauth20`, stateless). Works for sign-in and sign-up, and a new Google user can pick student or seller.
- **Dark and light mode**: toggle in the navbar, remembers the choice, follows the system on first visit, no flash on load. The 3D scenes change colours with the theme.
- **Mobile responsive**: hamburger menu, scrollable category pills, touch-sized buttons, safe-area padding for notched phones.
- **Image uploads (Multer)**: cover image, up to 4 screenshots (gallery with thumbnails), and profile avatars (2 MB). Project `.zip` files stay private.
- **3D**: animated hero scene with mouse parallax, a 3D torus-knot on the login page, tilting product cards and a tilting detail image.
- **More features**: reviews and ratings (buyers only), wishlist, coupon codes, sort and search, seller earnings, admin coupon manager, Razorpay webhook backup, archive instead of delete when a project has buyers.
- Email OTP, role-based access (student, seller, admin) and real Razorpay payments are kept.

## Setup

### 1. Backend
```bash
cd server
npm install
cp .env.example .env     # fill in values
npm run seed             # creates the admin from ADMIN_EMAIL / ADMIN_PASSWORD
npm run dev              # http://localhost:5000
```

### 2. Frontend
```bash
cd client
npm install
cp .env.example .env
npm run dev              # http://localhost:5173
```

## Google login setup (Passport)
1. Google Cloud Console > **APIs & Services > OAuth consent screen**: fill in the app name and your email.
2. **Credentials > Create credentials > OAuth client ID > Web application**.
3. **Authorized redirect URIs**: `http://localhost:5000/api/auth/google/callback` (add your live API URL later).
4. Copy the Client ID and Client Secret into `server/.env` (`GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`).
5. Make sure `SERVER_URL` in `.env` matches the host in the redirect URI exactly.
6. Before launch, switch the consent screen to **In production**, otherwise only listed test users can sign in.

Flow: button opens `/api/auth/google` > Google > `/api/auth/google/callback` > redirect to `CLIENT_URL/auth/callback#token=...` > the app stores the token and loads the user.

## Other setup
- **Gmail OTP**: enable 2-step verification, create an App Password, put it in `SMTP_PASS`.
- **Razorpay**: Test keys first. Test card `4111 1111 1111 1111`, any future expiry and CVV. UPI test ID: `success@razorpay`.
- **Webhook (optional backup)**: Dashboard > Webhooks > URL `https://your-api/api/orders/webhook`, event `payment.captured`, put the secret in `RAZORPAY_WEBHOOK_SECRET`. Localhost needs a tunnel such as ngrok.

## Try it
1. Log in as the seeded admin, open **Admin > Coupons**, create `WELCOME10`.
2. **Sell** > upload a cover, a few screenshots and a zip (admin uploads go live straight away).
3. Sign in with Google as a student, open the project, apply the coupon and pay.
4. **My purchases** > download, then leave a review on the project page.
5. Toggle dark and light mode and resize the browser, or open it on your phone.

## Security notes
- Prices and coupons are calculated on the server, and payments are verified by HMAC signature (and optionally by webhook).
- Admin role can never be self-assigned. If someone signs in with Google on an email that was registered but never verified, the old password is removed so it cannot be used to take over the account.
- Project zips are only streamed to buyers, the owning seller and admins.

## Going live
- Use a long random `JWT_SECRET`, HTTPS everywhere, Razorpay Live keys, and real `CLIENT_URL` and `SERVER_URL`.
- Store uploads on S3 or Cloudinary if your host has an ephemeral disk.
- Scan uploaded zips for malware before approving them.
