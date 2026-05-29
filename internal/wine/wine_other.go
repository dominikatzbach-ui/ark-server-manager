//go:build !linux

package wine

import "os/exec"

func checkWineInstalledLinux() error  { return nil }
func setupWinePrefixLinux(_ string) error { return nil }

func getWineCommandLinux(_ *Environment, executable string, args []string) *exec.Cmd {
	return exec.Command(executable, args...)
}

// HealthCheck is a no-op on non-Linux platforms.
func HealthCheck(_ *Environment) error { return nil }
