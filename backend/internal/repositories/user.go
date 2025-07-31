package repositories

import (
	"database/sql"
	"time"
	"viport-backend/internal/models"

	"github.com/google/uuid"
)

type UserRepository struct {
	db *sql.DB
}

func NewUserRepository(db *sql.DB) *UserRepository {
	return &UserRepository{db: db}
}

func (r *UserRepository) IsConnected() bool {
	return r.db != nil
}

func (r *UserRepository) Create(user *models.User) error {
	if !r.IsConnected() {
		return sql.ErrConnDone
	}
	
	user.ID = uuid.New().String()
	user.CreatedAt = time.Now()
	user.UpdatedAt = time.Now()

	query := `
		INSERT INTO users (
			id, username, email, password_hash, first_name, last_name, 
			display_name, bio, avatar_url, is_verified, is_creator, 
			verification_level, account_type, created_at, updated_at
		) VALUES (
			$1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15
		)`

	_, err := r.db.Exec(
		query,
		user.ID, user.Username, user.Email, user.PasswordHash,
		user.FirstName, user.LastName, user.DisplayName, user.Bio,
		user.AvatarURL, user.IsVerified, user.IsCreator,
		user.VerificationLevel, user.AccountType,
		user.CreatedAt, user.UpdatedAt,
	)

	return err
}

func (r *UserRepository) GetByEmail(email string) (*models.User, error) {
	if !r.IsConnected() {
		return nil, sql.ErrConnDone
	}
	
	user := &models.User{}
	query := `
		SELECT id, username, email, password_hash, first_name, last_name,
			   display_name, bio, avatar_url, cover_image_url, location, website_url,
			   is_verified, is_creator, verification_level, account_type,
			   created_at, updated_at, last_active_at
		FROM users WHERE email = $1`

	err := r.db.QueryRow(query, email).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.FirstName, &user.LastName, &user.DisplayName, &user.Bio,
		&user.AvatarURL, &user.CoverImageURL, &user.Location, &user.WebsiteURL,
		&user.IsVerified, &user.IsCreator, &user.VerificationLevel, &user.AccountType,
		&user.CreatedAt, &user.UpdatedAt, &user.LastActiveAt,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) GetByUsername(username string) (*models.User, error) {
	if !r.IsConnected() {
		return nil, sql.ErrConnDone
	}
	
	user := &models.User{}
	query := `
		SELECT id, username, email, password_hash, first_name, last_name,
			   display_name, bio, avatar_url, cover_image_url, location, website_url,
			   is_verified, is_creator, verification_level, account_type,
			   created_at, updated_at, last_active_at
		FROM users WHERE username = $1`

	err := r.db.QueryRow(query, username).Scan(
		&user.ID, &user.Username, &user.Email, &user.PasswordHash,
		&user.FirstName, &user.LastName, &user.DisplayName, &user.Bio,
		&user.AvatarURL, &user.CoverImageURL, &user.Location, &user.WebsiteURL,
		&user.IsVerified, &user.IsCreator, &user.VerificationLevel, &user.AccountType,
		&user.CreatedAt, &user.UpdatedAt, &user.LastActiveAt,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) GetByID(id string) (*models.User, error) {
	if !r.IsConnected() {
		return nil, sql.ErrConnDone
	}
	
	user := &models.User{}
	query := `
		SELECT id, username, email, first_name, last_name,
			   display_name, bio, avatar_url, cover_image_url, location, website_url,
			   is_verified, is_creator, verification_level, account_type,
			   created_at, updated_at, last_active_at
		FROM users WHERE id = $1`

	err := r.db.QueryRow(query, id).Scan(
		&user.ID, &user.Username, &user.Email,
		&user.FirstName, &user.LastName, &user.DisplayName, &user.Bio,
		&user.AvatarURL, &user.CoverImageURL, &user.Location, &user.WebsiteURL,
		&user.IsVerified, &user.IsCreator, &user.VerificationLevel, &user.AccountType,
		&user.CreatedAt, &user.UpdatedAt, &user.LastActiveAt,
	)

	if err != nil {
		return nil, err
	}

	return user, nil
}

func (r *UserRepository) Update(user *models.User) error {
	if !r.IsConnected() {
		return sql.ErrConnDone
	}
	
	user.UpdatedAt = time.Now()

	query := `
		UPDATE users SET
			first_name = $2, last_name = $3, display_name = $4, bio = $5,
			avatar_url = $6, cover_image_url = $7, location = $8, website_url = $9,
			updated_at = $10, last_active_at = $11
		WHERE id = $1`

	_, err := r.db.Exec(
		query,
		user.ID, user.FirstName, user.LastName, user.DisplayName, user.Bio,
		user.AvatarURL, user.CoverImageURL, user.Location, user.WebsiteURL,
		user.UpdatedAt, user.LastActiveAt,
	)

	return err
}

func (r *UserRepository) GetAll() ([]*models.User, error) {
	if !r.IsConnected() {
		return nil, sql.ErrConnDone
	}
	
	query := `
		SELECT id, username, email, first_name, last_name,
			   display_name, bio, avatar_url, cover_image_url, location, website_url,
			   is_verified, is_creator, verification_level, account_type,
			   created_at, updated_at, last_active_at
		FROM users ORDER BY created_at DESC`

	rows, err := r.db.Query(query)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	var users []*models.User
	for rows.Next() {
		user := &models.User{}
		err := rows.Scan(
			&user.ID, &user.Username, &user.Email,
			&user.FirstName, &user.LastName, &user.DisplayName, &user.Bio,
			&user.AvatarURL, &user.CoverImageURL, &user.Location, &user.WebsiteURL,
			&user.IsVerified, &user.IsCreator, &user.VerificationLevel, &user.AccountType,
			&user.CreatedAt, &user.UpdatedAt, &user.LastActiveAt,
		)
		if err != nil {
			return nil, err
		}
		users = append(users, user)
	}

	return users, nil
}