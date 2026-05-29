//go:build linux

package wine

import (
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"
	"time"
)

func checkWineInstalledLinux() error {
	candidates := []string{"wine64", "wine"}
	for _, candidate := range candidates {
		if path, err := exec.LookPath(candidate); err == nil {
			_ = path
			return nil
		}
	}
	return &WineError{
		Component: "installation",
		Message: "neither 'wine' nor 'wine64' found in PATH.\n" +
			"  Install via: sudo apt-get install wine wine64\n" +
			"  Or use GloriousEggroll Wine: scripts/setup-wine.sh",
	}
}

func setupWinePrefixLinux(prefixPath string) error {
	if prefixPath == "" {
		return &WineError{Component: "prefix", Message: "prefixPath must not be empty"}
	}

	absPrefix, err := filepath.Abs(prefixPath)
	if err != nil {
		return fmt.Errorf("wine: resolving prefix path: %w", err)
	}

	// Nothing to do if prefix already initialised (system.reg is the canonical marker).
	if _, statErr := os.Stat(filepath.Join(absPrefix, "system.reg")); statErr == nil {
		return nil
	}

	wineExec := resolveWineExec()
	if wineExec == "" {
		return &WineError{Component: "installation", Message: "wine not found, run setup-wine.sh first"}
	}

	if err := os.MkdirAll(absPrefix, 0o755); err != nil {
		return fmt.Errorf("wine: creating prefix directory: %w", err)
	}

	// wineboot initialises the prefix.
	cmd := exec.Command("wineboot", "--init")
	cmd.Env = buildWineEnv(absPrefix, ":99")
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	if err := cmd.Run(); err != nil {
		return fmt.Errorf("wine: wineboot --init failed: %w", err)
	}

	return nil
}

func getWineCommandLinux(env *Environment, executable string, args []string) *exec.Cmd {
	wineExec := env.WineExec
	if wineExec == "" {
		wineExec = resolveWineExec()
	}
	if wineExec == "" {
		wineExec = "wine"
	}

	cmdArgs := append([]string{executable}, args...)
	cmd := exec.Command(wineExec, cmdArgs...)
	cmd.Env = buildWineEnv(env.WinePrefix, env.Display)
	return cmd
}

// resolveWineExec returns the path to wine64 or wine, preferring wine64.
func resolveWineExec() string {
	for _, candidate := range []string{"wine64", "wine"} {
		if path, err := exec.LookPath(candidate); err == nil {
			return path
		}
	}
	return ""
}

// buildWineEnv constructs the environment variables required by Wine.
func buildWineEnv(prefix, display string) []string {
	base := os.Environ()
	overrides := map[string]string{
		"WINEPREFIX":    prefix,
		"DISPLAY":       display,
		"WINEDEBUG":     "-all",           // suppress noisy Wine debug output
		"WINEDLLOVERRIDES": "mscoree,mshtml=", // disable Mono/Gecko pop-ups
	}

	// Filter out existing keys we are overriding.
	filtered := make([]string, 0, len(base)+len(overrides))
	for _, kv := range base {
		key := strings.SplitN(kv, "=", 2)[0]
		if _, skip := overrides[key]; !skip {
			filtered = append(filtered, kv)
		}
	}
	for k, v := range overrides {
		filtered = append(filtered, k+"="+v)
	}
	return filtered
}

// HealthCheck runs a quick sanity-check (wine --version) and returns nil on success.
func HealthCheck(env *Environment) error {
	if !IsLinux() {
		return nil
	}

	wineExec := env.WineExec
	if wineExec == "" {
		wineExec = resolveWineExec()
	}
	if wineExec == "" {
		return &WineError{Component: "health", Message: "wine binary not found"}
	}

	cmd := exec.Command(wineExec, "--version")
	cmd.Env = buildWineEnv(env.WinePrefix, env.Display)

	done := make(chan error, 1)
	go func() { done <- cmd.Run() }()

	select {
	case err := <-done:
		if err != nil {
			return fmt.Errorf("wine: health check failed: %w", err)
		}
		return nil
	case <-time.After(10 * time.Second):
		_ = cmd.Process.Kill()
		return &WineError{Component: "health", Message: "wine --version timed out after 10 s"}
	}
}
