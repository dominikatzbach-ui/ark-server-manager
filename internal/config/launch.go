package config

import (
	"fmt"
	"strings"
)

// GenerateLaunchCommand builds the full ArkAscendedServer launch command from cfg.
//
// Output format:
//
//	<map>?listen?SessionName=<n>?MaxPlayers=<n>[?...] -port=<n> -queryport=<n> [flags]
func GenerateLaunchCommand(cfg *ServerConfig) string {
	var sb strings.Builder

	// --- Map + query-string (? params) ---
	sb.WriteString(cfg.Map)
	sb.WriteString("?listen")
	writeQParam(&sb, "SessionName", cfg.Name)
	writeQParam(&sb, "MaxPlayers", fmt.Sprintf("%d", cfg.MaxPlayers))
	if cfg.ServerPassword != "" {
		writeQParam(&sb, "ServerPassword", cfg.ServerPassword)
	}
	if cfg.AdminPassword != "" {
		writeQParam(&sb, "ServerAdminPassword", cfg.AdminPassword)
	}
	if cfg.RCONEnabled {
		writeQParam(&sb, "RCONEnabled", "True")
		writeQParam(&sb, "RCONPort", fmt.Sprintf("%d", cfg.RCONPort))
	}

	// --- Minus (startup) flags ---
	writeFlag(&sb, "port", fmt.Sprintf("%d", cfg.GamePort))
	writeFlag(&sb, "queryport", fmt.Sprintf("%d", cfg.QueryPort))

	if cfg.NoBattlEye {
		sb.WriteString(" -NoBattlEye")
	}

	if cfg.Crossplay {
		sb.WriteString(" -ServerPlatform=EpicAndSteam")
	}

	if len(cfg.Mods) > 0 {
		writeFlag(&sb, "mods", strings.Join(cfg.Mods, ","))
	}

	return sb.String()
}

func writeQParam(sb *strings.Builder, key, value string) {
	sb.WriteByte('?')
	sb.WriteString(key)
	sb.WriteByte('=')
	sb.WriteString(value)
}

func writeFlag(sb *strings.Builder, key, value string) {
	sb.WriteString(" -")
	sb.WriteString(key)
	sb.WriteByte('=')
	sb.WriteString(value)
}
