require("dotenv").config();
const express = require("express");
const mysql = require("mysql2");
const bodyParser = require("body-parser");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const PORT = process.env.PORT || 5000;

// Create Express app
const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Database connection
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: process.env.DB_NAME || "CWSMS",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

const db = pool.promise();

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ error: "Authentication failed: No token provided" });
    }
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "your-secret-key"
    );
    req.userData = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Authentication failed" });
  }
};

// Routes
app.get('/api/counts', async (req, res) => {
  try {
    const [[carCount]] = await db.query("SELECT COUNT(*) AS count FROM car");
    const [[packageCount]] = await db.query("SELECT COUNT(*) AS count FROM package");
    const [[serviceCount]] = await db.query("SELECT COUNT(*) AS count FROM servicepackage");

    res.json({
      cars: carCount.count,
      packages: packageCount.count,
      services: serviceCount.count,
    });
  } catch (error) {
    console.error('Error fetching counts:', error);
    res.status(500).json({ message: "Internal server error" });
  }
});


passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: process.env.GOOGLE_CALLBACK
}, async (accessToken, refreshToken, profile, done) => {
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [profile.emails[0].value]);
  if (rows.length === 0) {
    const [result] = await db.execute("INSERT INTO users (full_name, email) VALUES (?, ?)", [profile.displayName, profile.emails[0].value]);
    return done(null, { id: result.insertId, full_name: profile.displayName, email: profile.emails[0].value });
  }
  return done(null, rows[0]);
}));

// Signup
app.post('/signup', async (req, res) => {
  const { full_name, email, phone, password } = req.body;
  const hashed = await bcrypt.hash(password, 10);
  try {
    const [existing] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (existing.length > 0) return res.status(400).json({ msg: 'User already exists' });
    await db.execute("INSERT INTO users (full_name, email, phone, password) VALUES (?, ?, ?, ?)", [full_name, email, phone, hashed]);
    res.json({ msg: 'User registered' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Login
app.post('/login', async (req, res) => {
  const { email, password } = req.body;
  const [rows] = await db.execute("SELECT * FROM users WHERE email = ?", [email]);
  if (rows.length === 0) return res.status(401).json({ msg: 'Invalid credentials' });

  const valid = await bcrypt.compare(password, rows[0].password);
  if (!valid) return res.status(401).json({ msg: 'Invalid credentials' });

  const token = jwt.sign({ id: rows[0].id, email }, process.env.JWT_SECRET);
  res.json({ token });
});

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback',
  passport.authenticate('google', { session: false }),
  (req, res) => {
    const token = jwt.sign({ id: req.user.id, email: req.user.email }, process.env.JWT_SECRET);
    res.redirect(`http://localhost:3000/dashboard?token=${token}`);
  }
);


// ======================= LOGIN =======================
app.post("/api/login", (req, res) => {
  const { email, password } = req.body;
  db.query("SELECT * FROM users WHERE email = ?", [email], async (err, results) => {
    if (err) return res.status(500).json({ error: "DB error" });
    if (results.length === 0) return res.status(401).json({ error: "Invalid credentials" });

    const user = results[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(401).json({ error: "Invalid credentials" });

    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });

    res.json({ message: "Login successful", token, role: user.role });
  });
});



// Package Routes
app.get("/api/packages", async (req, res) => {
  try {
    const [packages] = await db.query("SELECT * FROM Package");
    res.json(packages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch packages" });
  }
});

app.get("/api/packages/:id", async (req, res) => {
  try {
    const [packages] = await db.query(
      "SELECT * FROM Package WHERE PackageNumber = ?",
      [req.params.id]
    );
    if (packages.length === 0) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json(packages[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch package" });
  }
});

app.post("/api/packages",  async (req, res) => {
  try {
    const { PackageName, PackageDescription, PackagePrice } = req.body;

    const [result] = await db.query(
      "INSERT INTO Package (PackageName, PackageDescription, PackagePrice) VALUES (?, ?, ?)",
      [PackageName, PackageDescription, PackagePrice]
    );

    res.status(201).json({
      PackageNumber: result.insertId,
      PackageName,
      PackageDescription,
      PackagePrice,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create package" });
  }
});



app.put("/api/packages/:PackageNumber", async (req, res) => {
  try {
    const { PackageName, PackageDescription, PackagePrice } = req.body;

     const [result] = await db.query(
      "UPDATE Package SET PackageName = ?, PackageDescription = ?, PackagePrice = ? WHERE PackageNumber = ?",
      [PackageName, PackageDescription, PackagePrice, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Package not found" });
    }

     res.json({
      PackageNumber: req.params.id,
      PackageName,
      PackageDescription,
      PackagePrice,
    });
  } catch (error) {
    console.error("Update failed:", error); 

    res.status(500).json({
      error: "Failed to update Package",
      message: error.message,  
    });
  }
})















// Delete package
app.delete("/api/packages/:PackageNumber", (req, res) => {
  const { packageNumber} = req.params;
  db.query("DELETE FROM Package WHERE PackageNumber = ?", [packageNumber], (err) => {
    if (err) return res.status(500).json({ message: "Error deleting Package" });
    res.json({ message: "Package deleted successfully" });
  });
});


// Car Routes
app.get("/api/car", async (req, res) => {
  try {
    const [cars] = await db.query("SELECT * FROM Car");
    res.json(cars);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch cars" });
  }
});

app.get("/api/car/:plateNumber", async (req, res) => {
  try {
    const [cars] = await db.query("SELECT * FROM Car WHERE PlateNumber = ?", [
      req.params.plateNumber,
    ]);
    if (cars.length === 0) {
      return res.status(404).json({ error: "Car not found" });
    }
    res.json(cars[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch car" });
  }
});
// Create Car (with duplicate check)
app.post("/api/Car", async (req, res) => {
  const { PlateNumber, CarType, CarSize, DriverName, PhoneNumber } = req.body;
  console.log("Received:", req.body);

  try {
    // Check if the car already exists
    const [existing] = await db.query("SELECT * FROM Car WHERE PlateNumber = ?", [PlateNumber]);
    if (existing.length > 0) {
      return res.status(400).json({ error: "Car with this PlateNumber already exists" });
    }

    // Insert new car
    const sql = `INSERT INTO Car (PlateNumber, CarType, CarSize, DriverName, PhoneNumber) VALUES (?, ?, ?, ?, ?)`;
    await db.query(sql, [PlateNumber, CarType, CarSize, DriverName, PhoneNumber]);

    res.status(201).json({ message: "Car added successfully!" });
  } catch (error) {
    console.error("Insert error:", error.message);
    res.status(500).json({ error: "Failed to add Car" });
  }
});

// Update Car
app.put("/api/car/:plateNumber", async (req, res) => {
  try {
    const { CarType, CarSize, DriverName, PhoneNumber } = req.body;

    const [result] = await db.query(
      "UPDATE Car SET CarType = ?, CarSize = ?, DriverName = ?, PhoneNumber = ? WHERE PlateNumber = ?",
      [CarType, CarSize, DriverName, PhoneNumber, req.params.plateNumber]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Car not found" });
    }

    res.json({
      PlateNumber: req.params.plateNumber,
      CarType,
      CarSize,
      DriverName,
      PhoneNumber,
    });
  } catch (error) {
    console.error("Update failed:", error);
    res.status(500).json({
      error: "Failed to update car record",
      message: error.message,
    });
  }
});

// Delete Car (fix missing forward slash)
app.delete("/api/car/:plateNumber", (req, res) => {
  const { plateNumber } = req.params;
  db.query("DELETE FROM Car WHERE PlateNumber = ?", [plateNumber], (err, result) => {
    if (err) return res.status(500).json({ message: "Error deleting Car" });

    if (result.affectedRows === 0) {
      return res.status(404).json({ message: "Car not found" });
    }

    res.json({ message: "Car deleted successfully" });
  });
});

// Service Routes
app.get("/api/services", async (req, res) => {
  try {
    const query = `
            SELECT sp.*, p.PackageName, p.PackagePrice, c.CarType, c.DriverName
            FROM ServicePackage sp
            JOIN Package p ON sp.PackageNumber = p.PackageNumber
            JOIN Car c ON sp.PlateNumber = c.PlateNumber
        `;
    const [services] = await db.query(query);
    res.json(services);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch service records" });
  }
});

app.get("/api/services/:id", async (req, res) => {
  try {
    const query = `
            SELECT sp.*, p.PackageName, p.PackagePrice, c.CarType, c.DriverName
            FROM ServicePackage sp
            JOIN Package p ON sp.PackageNumber = p.PackageNumber
            JOIN Car c ON sp.PlateNumber = c.PlateNumber
            WHERE sp.RecordNumber = ?
        `;
    const [services] = await db.query(query, [req.params.id]);

    if (services.length === 0) {
      return res.status(404).json({ error: "Service record not found" });
    }

    res.json(services[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch service record" });
  }
});
// ✅ UPDATE service record
app.put("/api/services/:id", async (req, res) => {
  try {
    const { ServiceDate, PlateNumber, PackageNumber } = req.body;

    const [result] = await db.query(
      "UPDATE servicepackage SET ServiceDate = ?, PlateNumber = ?, PackageNumber = ? WHERE RecordNumber = ?",
      [ServiceDate, PlateNumber, PackageNumber, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({
      RecordNumber: req.params.id,
      ServiceDate,
      PlateNumber,
      PackageNumber,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update service record" });
  }
});

// ✅ DELETE service record
app.delete("/api/services/:id", async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM servicepackage WHERE RecordNumber = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Record not found" });
    }

    res.json({ message: "Record deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete service record" });
  }
});

// Payment Routes
app.get("/api/payments", async (req, res) => {
  try {
    const query = `
            SELECT p.*, sp.ServiceDate, c.PlateNumber, c.DriverName, pk.PackageName, pk.PackagePrice
            FROM Payment p
            JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
            JOIN Car c ON sp.PlateNumber = c.PlateNumber
            JOIN Package pk ON sp.PackageNumber = pk.PackageNumber
        `;
    const [payments] = await db.query(query);
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payments" });
  }
});

app.get("/api/payments/:id", async (req, res) => {
  try {
    const query = `
            SELECT p.*, sp.ServiceDate, c.PlateNumber, c.DriverName, pk.PackageName, pk.PackagePrice
            FROM Payment p
            JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
            JOIN Car c ON sp.PlateNumber = c.PlateNumber
            JOIN Package pk ON sp.PackageNumber = pk.PackageNumber
            WHERE p.PaymentNumber = ?
        `;
    const [payments] = await db.query(query, [req.params.id]);

    if (payments.length === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json(payments[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to fetch payment" });
  }
});

app.post("/api/payments", authenticate, async (req, res) => {
  try {
    const { AmountPaid, PaymentDate, RecordNumber } = req.body;

    const [services] = await db.query(
      "SELECT * FROM ServicePackage WHERE RecordNumber = ?",
      [RecordNumber]
    );
    if (services.length === 0) {
      return res.status(404).json({ error: "Service record not found" });
    }

    const [result] = await db.query(
      "INSERT INTO Payment (AmountPaid, PaymentDate, RecordNumber) VALUES (?, ?, ?)",
      [AmountPaid, PaymentDate, RecordNumber]
    );

    res.status(201).json({
      PaymentNumber: result.insertId,
      AmountPaid,
      PaymentDate,
      RecordNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to create payment" });
  }
});

app.put("/api/payments/:id", authenticate, async (req, res) => {
  try {
    const { AmountPaid, PaymentDate, RecordNumber } = req.body;

    const [services] = await db.query(
      "SELECT * FROM ServicePackage WHERE RecordNumber = ?",
      [RecordNumber]
    );
    if (services.length === 0) {
      return res.status(404).json({ error: "Service record not found" });
    }

    const [result] = await db.query(
      "UPDATE Payment SET AmountPaid = ?, PaymentDate = ?, RecordNumber = ? WHERE PaymentNumber = ?",
      [AmountPaid, PaymentDate, RecordNumber, req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({
      PaymentNumber: req.params.id,
      AmountPaid,
      PaymentDate,
      RecordNumber,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to update payment" });
  }
});

app.delete("/api/payments/:id", authenticate, async (req, res) => {
  try {
    const [result] = await db.query(
      "DELETE FROM Payment WHERE PaymentNumber = ?",
      [req.params.id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "Payment not found" });
    }

    res.json({ message: "Payment deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to delete payment" });
  }
});

app.get("/api/payments/report/date-range", authenticate, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const query = `
            SELECT p.*, sp.ServiceDate, c.PlateNumber, c.DriverName, pk.PackageName, pk.PackagePrice
            FROM Payment p
            JOIN ServicePackage sp ON p.RecordNumber = sp.RecordNumber
            JOIN Car c ON sp.PlateNumber = c.PlateNumber
            JOIN Package pk ON sp.PackageNumber = pk.PackageNumber
            WHERE p.PaymentDate BETWEEN ? AND ?
            ORDER BY p.PaymentDate
        `;

    const [payments] = await db.query(query, [startDate, endDate]);
    res.json(payments);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Failed to generate payment report" });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: "Something went wrong!" });
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});
