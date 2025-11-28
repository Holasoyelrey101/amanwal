-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Cabin" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "price" REAL NOT NULL,
    "capacity" INTEGER NOT NULL,
    "bedrooms" INTEGER,
    "bathrooms" INTEGER,
    "amenities" TEXT NOT NULL DEFAULT '[]',
    "images" TEXT NOT NULL DEFAULT '[]',
    "ownerId" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Cabin_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Cabin" ("amenities", "bathrooms", "bedrooms", "capacity", "createdAt", "description", "id", "images", "latitude", "location", "longitude", "ownerId", "price", "title", "updatedAt") SELECT "amenities", "bathrooms", "bedrooms", "capacity", "createdAt", "description", "id", "images", "latitude", "location", "longitude", "ownerId", "price", "title", "updatedAt" FROM "Cabin";
DROP TABLE "Cabin";
ALTER TABLE "new_Cabin" RENAME TO "Cabin";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
