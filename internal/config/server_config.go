package config

import (
	"fmt"
	"os"
	"path/filepath"
	"runtime"
	"strconv"
	"strings"
)

// MapEntry pairs an ARK:SA map ID with a human-readable display name.
type MapEntry struct {
	ID   string
	Name string
}

// OfficialMaps lists all official ARK:SA maps.
var OfficialMaps = []MapEntry{
	{ID: "TheIsland_WP", Name: "The Island"},
	{ID: "ScorchedEarth_WP", Name: "Scorched Earth"},
	{ID: "Aberration_WP", Name: "Aberration"},
	{ID: "TheCenter_WP", Name: "The Center"},
	{ID: "Svartalfheim_WP", Name: "Svartalfheim"},
	{ID: "BobsMissions_WP", Name: "Club ARK"},
}

// ServerConfig holds all configurable ARK:SA server parameters.
type ServerConfig struct {
	// Identity
	Name string

	// Map is the ARK:SA map identifier (e.g. "TheIsland_WP").
	Map string

	// Network
	GamePort    int
	QueryPort   int
	RCONPort    int
	RCONEnabled bool

	// Access
	ServerPassword string
	AdminPassword  string

	// Session
	MaxPlayers int

	// Platform — enables Epic+Steam crossplay via -ServerPlatform=EpicAndSteam.
	Crossplay bool

	// Mods contains Steam Workshop mod IDs (numeric strings).
	Mods []string

	// NoBattlEye disables BattlEye anti-cheat. Automatically true on Linux.
	NoBattlEye bool

	// DataDir is the server installation root (contains ShooterGame/).
	DataDir string
}

// DefaultServerConfig returns a ServerConfig with sensible defaults.
func DefaultServerConfig() *ServerConfig {
	return &ServerConfig{
		Name:        "ARK Server",
		Map:         "TheIsland_WP",
		GamePort:    7777,
		QueryPort:   27015,
		RCONPort:    27020,
		RCONEnabled: true,
		MaxPlayers:  70,
		NoBattlEye:  runtime.GOOS == "linux",
	}
}

// configDir returns the platform-specific INI config directory inside DataDir.
func (cfg *ServerConfig) configDir() string {
	platform := "LinuxServer"
	if runtime.GOOS == "windows" {
		platform = "WindowsServer"
	}
	return filepath.Join(cfg.DataDir, "ShooterGame", "Saved", "Config", platform)
}

// LoadServerConfig reads GameUserSettings.ini (and Game.ini) from the server
// installation at dataDir and returns a populated ServerConfig.
func LoadServerConfig(dataDir string) (*ServerConfig, error) {
	cfg := DefaultServerConfig()
	cfg.DataDir = dataDir

	gusPath := filepath.Join(cfg.configDir(), "GameUserSettings.ini")
	doc, err := parseINI(gusPath)
	if err != nil {
		if os.IsNotExist(err) {
			return cfg, nil
		}
		return nil, fmt.Errorf("reading GameUserSettings.ini: %w", err)
	}
	applyGUSToConfig(doc, cfg)
	return cfg, nil
}

// SaveServerConfig writes cfg into GameUserSettings.ini, creating the config
// directory if needed and preserving any existing formatting/comments.
func SaveServerConfig(cfg *ServerConfig) error {
	dir := cfg.configDir()
	if err := os.MkdirAll(dir, 0755); err != nil {
		return fmt.Errorf("creating config dir: %w", err)
	}

	gusPath := filepath.Join(dir, "GameUserSettings.ini")
	doc, err := parseINI(gusPath)
	if err != nil {
		if !os.IsNotExist(err) {
			return fmt.Errorf("reading GameUserSettings.ini: %w", err)
		}
		doc = &iniDocument{}
	}

	applyConfigToGUS(cfg, doc)
	return writeINI(gusPath, doc)
}

// applyGUSToConfig reads known keys from a parsed GameUserSettings.ini into cfg.
func applyGUSToConfig(doc *iniDocument, cfg *ServerConfig) {
	if ss := doc.getSection("ServerSettings"); ss != nil {
		cfg.ServerPassword = ss.getValue("ServerPassword")
		cfg.AdminPassword = ss.getValue("ServerAdminPassword")
		if v := ss.getValue("MaxPlayers"); v != "" {
			cfg.MaxPlayers, _ = strconv.Atoi(v)
		}
		if strings.EqualFold(ss.getValue("RCONEnabled"), "true") {
			cfg.RCONEnabled = true
		}
		if v := ss.getValue("RCONPort"); v != "" {
			cfg.RCONPort, _ = strconv.Atoi(v)
		}
	}

	if ses := doc.getSection("SessionSettings"); ses != nil {
		if v := ses.getValue("SessionName"); v != "" {
			cfg.Name = v
		}
		if v := ses.getValue("Port"); v != "" {
			cfg.GamePort, _ = strconv.Atoi(v)
		}
		if v := ses.getValue("QueryPort"); v != "" {
			cfg.QueryPort, _ = strconv.Atoi(v)
		}
	}
}

// applyConfigToGUS writes cfg values into a parsed GameUserSettings.ini document.
func applyConfigToGUS(cfg *ServerConfig, doc *iniDocument) {
	doc.setKeyValue("ServerSettings", "MaxPlayers", strconv.Itoa(cfg.MaxPlayers))
	doc.setKeyValue("ServerSettings", "ServerPassword", cfg.ServerPassword)
	doc.setKeyValue("ServerSettings", "ServerAdminPassword", cfg.AdminPassword)
	if cfg.RCONEnabled {
		doc.setKeyValue("ServerSettings", "RCONEnabled", "True")
		doc.setKeyValue("ServerSettings", "RCONPort", strconv.Itoa(cfg.RCONPort))
	} else {
		doc.setKeyValue("ServerSettings", "RCONEnabled", "False")
	}
	doc.setKeyValue("SessionSettings", "SessionName", cfg.Name)
	doc.setKeyValue("SessionSettings", "Port", strconv.Itoa(cfg.GamePort))
	doc.setKeyValue("SessionSettings", "QueryPort", strconv.Itoa(cfg.QueryPort))
}
