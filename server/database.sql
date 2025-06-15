-- Create driving_licenses table
CREATE TABLE IF NOT EXISTS driving_licenses (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL,
    license_name VARCHAR(255) NOT NULL,
    license_number VARCHAR(50) NOT NULL,
    license_valid_till DATE NOT NULL,
    license_uploaded BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
); 