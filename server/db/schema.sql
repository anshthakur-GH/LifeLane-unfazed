-- Create users table if not exists
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  name VARCHAR(255) NOT NULL,
  vehicle_number VARCHAR(20) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create activation_codes table
CREATE TABLE IF NOT EXISTS activation_codes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    code VARCHAR(10) NOT NULL UNIQUE,
    used BOOLEAN DEFAULT FALSE,
    assigned_to INT,
    assigned_at TIMESTAMP NULL,
    FOREIGN KEY (assigned_to) REFERENCES users(id)
);

-- Insert the 100 activation codes
INSERT INTO activation_codes (code) VALUES
("A1B2#"), ("C3D4#"), ("1A2B#"), ("B4C3#"), ("D1C2#"), ("3B2A#"), ("4D1A#"), ("B3C1#"), ("C2D3#"), ("A3B4#"),
("1B2C#"), ("D4A1#"), ("2C1D#"), ("3A4B#"), ("B1C2#"), ("C4D1#"), ("4B3A#"), ("D2C1#"), ("A2B3#"), ("3C1D#"),
("1C2A#"), ("B2D3#"), ("C3A1#"), ("D1B2#"), ("A4C3#"), ("2D1B#"), ("3B2D#"), ("C1A4#"), ("D3C2#"), ("B4A1#"),
("A1D2#"), ("C2B3#"), ("3A1C#"), ("D4B2#"), ("B3A2#"), ("C1D4#"), ("2A3B#"), ("D3C1#"), ("A2C3#"), ("B1D4#"),
("1A3D#"), ("C4B1#"), ("2B1A#"), ("D2C4#"), ("3D2A#"), ("A3B1#"), ("C1D3#"), ("B4C2#"), ("1D4B#"), ("A2B1#"),
("B2C3#"), ("D1A3#"), ("3C2B#"), ("A4D1#"), ("C3B4#"), ("D2A1#"), ("B1C4#"), ("2A4D#"), ("C2D3#"), ("B3A1#"),
("1B3D#"), ("A3C2#"), ("C1B2#"), ("D4A3#"), ("2D3B#"), ("B4C1#"), ("A1B3#"), ("C3D2#"), ("D2B4#"), ("3A2C#"),
("B1D3#"), ("C4A1#"), ("A2C4#"), ("D1B3#"), ("4B2A#"), ("C1A3#"), ("D3B1#"), ("A4C2#"), ("2C3B#"), ("B2D1#"),
("A3B2#"), ("C2D4#"), ("D4C1#"), ("B3A4#"), ("1C4D#"), ("A1D3#"), ("C3B2#"), ("D2A4#"), ("B4D3#"), ("C1B3#"),
("2A1C#"), ("D4C3#"), ("A2B4#"), ("B1C3#"), ("C4A2#"), ("D3A1#"), ("3B1C#"), ("A4D2#"), ("B3C4#"), ("C2A1#"); 