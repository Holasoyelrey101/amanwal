-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "bookingNumber" TEXT NOT NULL,
    "cabinId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "totalPrice" REAL NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'pending',
    "paymentToken" TEXT,
    "flowOrder" INTEGER,
    "paymentStatus" TEXT NOT NULL DEFAULT 'pending',
    "paymentDate" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Booking_cabinId_fkey" FOREIGN KEY ("cabinId") REFERENCES "Cabin" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "Booking_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Booking" ("bookingNumber", "cabinId", "checkIn", "checkOut", "createdAt", "id", "status", "totalPrice", "updatedAt", "userId") SELECT "bookingNumber", "cabinId", "checkIn", "checkOut", "createdAt", "id", "status", "totalPrice", "updatedAt", "userId" FROM "Booking";
DROP TABLE "Booking";
ALTER TABLE "new_Booking" RENAME TO "Booking";
CREATE UNIQUE INDEX "Booking_bookingNumber_key" ON "Booking"("bookingNumber");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
