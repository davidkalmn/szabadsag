-- Create activity_logs table for SQLite
CREATE TABLE activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    action VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    target_type VARCHAR(255) NULL,
    target_id INTEGER NULL,
    ip_address VARCHAR(255) NULL,
    user_agent TEXT NULL,
    created_at DATETIME NULL,
    updated_at DATETIME NULL,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Create indexes for better performance
CREATE INDEX idx_activity_logs_user_id_created_at ON activity_logs(user_id, created_at);
CREATE INDEX idx_activity_logs_action_created_at ON activity_logs(action, created_at);
CREATE INDEX idx_activity_logs_target_type_target_id ON activity_logs(target_type, target_id);
