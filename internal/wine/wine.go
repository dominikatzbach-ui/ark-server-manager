// Package wine manages Wine/Proton environments for running the ARK:SA Windows binary on Linux.
// On Windows, all functions are no-ops that return nil errors.
package wine

import (
	"fmt"
	"os/exec"
	"runtime"
)

// Environment holds the resolved Wine runtime configuration.
type Environment struct {
	// WineExec is the path to the wine or wine64 binary.
	WineExec string
	// WinePrefix is the path to the WINEPREFIX directory.
	WinePrefix string
	// Display is the X display string (e.g. ":1") used by Xvfb.
	Display string
	// UseProton indicates whether GE-Proton is used instead of plain Wine.
	UseProton bool
	// ProtonPath is set when UseProton is true.
	ProtonPath string
}

// WineError is returned when a Wine dependency is missing or misconfigured.
type WineError struct {
	Component string
	Message   string
}

func (e *WineError) Error() string {
	return fmt.Sprintf("wine: %s: %s", e.Component, e.Message)
}

// IsLinux reports whether the current OS is Linux.
func IsLinux() bool {
	return runtime.GOOS == "linux"
}

// CheckWineInstalled verifies that wine or wine64 is present and executable.
// On Windows this always returns nil.
func CheckWineInstalled() error {
	if !IsLinux() {
		return nil
	}
	return checkWineInstalledLinux()
}

// SetupWinePrefix creates and initialises the Wine prefix at prefixPath
// if it does not already exist.  On Windows this is a no-op.
func SetupWinePrefix(prefixPath string) error {
	if !IsLinux() {
		return nil
	}
	return setupWinePrefixLinux(prefixPath)
}

// GetWineCommand returns an *exec.Cmd that runs the given executable inside
// the configured Wine environment.  On Windows the executable is run directly.
func GetWineCommand(env *Environment, executable string, args ...string) *exec.Cmd {
	if !IsLinux() {
		return exec.Command(executable, args...)
	}
	return getWineCommandLinux(env, executable, args...)
}

// DefaultEnvironment returns a new Environment with sensible defaults.
// Call CheckWineInstalled and, if needed, SetupWinePrefix before using it.
func DefaultEnvironment(prefixPath string) *Environment {
	return &Environment{
		WinePrefix: prefixPath,
		Display:    ":1",
	}
}
