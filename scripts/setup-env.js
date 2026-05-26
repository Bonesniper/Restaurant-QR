const fs = require("fs");
const path = require("path");

const envPath = path.join(__dirname, "..", ".env");

if (!fs.existsSync(envPath)) {
  fs.writeFileSync(
    envPath,
    [
      'DATABASE_URL="file:./dev.db"',
      'JWT_SECRET="restaurant-qr-dev-secret-change-in-production"',
    ].join("\n") + "\n"
  );
  console.log("✓ Created .env with default dev values");
}
