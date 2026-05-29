package config

import (
	"errors"
	"fmt"
	"strings"
)

// ValidateConfig checks cfg for invalid or missing values.
// It collects all errors and returns them as a single joined error.
func ValidateConfig(cfg *ServerConfig) error {
	var errs []string

	if strings.TrimSpace(cfg.Map) == "" {
		errs = append(errs, "map is required")
	}
	if strings.TrimSpace(cfg.Name) == "" {
		errs = append(errs, "server name is required")
	}
	if strings.TrimSpace(cfg.AdminPassword) == "" {
		errs = append(errs, "admin password is required")
	}

	if err := validatePort("game port", cfg.GamePort); err != nil {
		errs = append(errs, err.Error())
	}
	if err := validatePort("query port", cfg.QueryPort); err != nil {
		errs = append(errs, err.Error())
	}
	if cfg.RCONEnabled {
		if err := validatePort("RCON port", cfg.RCONPort); err != nil {
			errs = append(errs, err.Error())
		}
	}

	if cfg.MaxPlayers < 1 || cfg.MaxPlayers > 255 {
		errs = append(errs, "max players must be between 1 and 255")
	}

	// Ports must be distinct
	ports := map[int]string{
		cfg.GamePort:  "game port",
		cfg.QueryPort: "query port",
	}
	if cfg.RCONEnabled {
		for p, name := range ports {
			if p == cfg.RCONPort {
				errs = append(errs, fmt.Sprintf("RCON port conflicts with %s (%d)", name, p))
			}
		}
	}
	if cfg.GamePort == cfg.QueryPort {
		errs = append(errs, fmt.Sprintf("game port and query port must differ (%d)", cfg.GamePort))
	}

	if len(errs) == 0 {
		return nil
	}
	return errors.New(strings.Join(errs, "; "))
}

func validatePort(name string, port int) error {
	if port < 1 || port > 65535 {
		return fmt.Errorf("%s must be between 1 and 65535 (got %d)", name, port)
	}
	return nil
}
