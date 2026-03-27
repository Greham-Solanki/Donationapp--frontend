# GiveAway Community — Frontend

A donation management platform where donors can list items for donation and donees can browse, connect, and chat with donors — similar to Facebook Marketplace but focused entirely on free donations.

**Backend Repo:** [Donationapp-Backend](https://github.com/Greham-Solanki/Donationapp-Backend)

**Project Demo:** [Youtube](https://youtu.be/iWrAFw4k-R8)

**AWS Infrastructure Diagram:** [Diagram](https://github.com/Greham-Solanki/Donationapp-Backend/blob/main/AWS%20Infrastructure%20Diagram.png)

---

## Features

- Donor can list donation items with images, category, and location
- Donee can browse all available donations
- Real-time chat between donor and donee using Socket.io
- JWT-based authentication (register/login)
- Profile management
- Notifications for new messages
- Fully responsive UI

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React (Create React App) |
| HTTP client | Axios |
| Real-time | Socket.io client |
| Routing | React Router v6 |
| Notifications | React Toastify |
| Auth | JWT (stored in localStorage) |
| Hosting | AWS S3 + CloudFront |
| CI/CD | GitHub Actions |

---

## Architecture

```
Browser
  │
  ▼
CloudFront (CDN + HTTPS + WAF)
  │
  ├── Static assets → S3 Bucket (private, OAC)
  │
  └── API calls → api.giveawaycommunity.dedyn.io
                      │
                      ▼
                   AWS ALB (HTTPS:443)
                      │
                      ▼
                EC2 Auto Scaling Group
                (Private Subnet, 2 AZs)
                      │
                      ▼
                 MongoDB Atlas
```

---

## CI/CD Pipeline

Every push to `main` triggers the GitHub Actions workflow:

```
git push → GitHub Actions
  │
  ├── npm install
  ├── npm run build
  ├── aws s3 sync ./build → S3
  └── CloudFront cache invalidation
```

The frontend is rebuilt and deployed automatically. No need for manual steps.

---

## Environment Variables

Create a `.env` file in the root:

```env
REACT_APP_API_URL=https://your backend API endpoint URL
```

---

## Local Development

```bash
# Clone the repo
git clone https://github.com/Greham-Solanki/Donationapp--frontend.git
cd Donationapp--frontend

# Install dependencies
npm install

# Create .env
echo "REACT_APP_API_URL=http://localhost:5000" > .env

# Start dev server
npm start
```

App runs at `http://localhost:3000`

---

## GitHub Actions Secrets Required

| Secret | Description |
|---|---|
| `AWS_ACCESS_KEY_ID` | IAM user access key |
| `AWS_SECRET_ACCESS_KEY` | IAM user secret key |
| `S3_BUCKET` | S3 bucket name for frontend |
| `CLOUDFRONT_DIST_ID` | CloudFront distribution ID |
| `CLOUDFRONT_DOMAIN` | CloudFront domain name |
| `REACT_APP_API_URL` | Backend API URL |

---

## AWS Infrastructure

| Service | Purpose |
|---|---|
| S3 | Stores built React app (private) |
| CloudFront | CDN, HTTPS termination, edge caching |
| ACM | SSL certificate for custom domain |
| WAF | Protects against SQLi, XSS, bad bots |
| Route 53 / dedyn.io | DNS — points domain to CloudFront |

---

## Project Structure

```
src/
├── components/
│   ├── Login.js
│   ├── Register.js
│   ├── DonationForm.js
│   ├── DonationList.js
│   ├── DonationDetails.js
│   ├── MyDonationList.js
│   ├── MyDonationDetails.js
│   ├── Profile.js
│   ├── Notifications.js
│   ├── ChatPage.js
│   └── Navbar.js
├── utils/
│   └── api.js
└── App.js
```

---

## Related

- [Backend Repository](https://github.com/Greham-Solanki/Donationapp-Backend)
