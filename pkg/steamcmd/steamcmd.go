// Package steamcmd provides SteamCMD bootstrap, download, and update utilities
// for ARK: Survival Ascended dedicated servers (AppID 2430930).
// Supports Windows and Linux. On Linux, lib32gcc-s1 must be installed separately.
package steamcmd

import (
	"archive/tar"
	"archive/zip"
	"bufio"
	"compress/gzip"
	"errors"
	"fmt"
	"io"
	"net/http"
	"os"
	"os/exec"
	"path/filepath"
	"runtime"
	"strings"
)

const (
	AppIDASA = 2430930

	downloadURLWindows = "https://steamcdn-a.akamaihd.net/client/installer/steamcmd.zip"
	downloadURLLinux   = "https://steamcdn-a.akamaihd.net/client/installer/steamcmd_linux.tar.gz"
)

// ProgressFunc receives output lines from SteamCMD for live UI streaming.
type ProgressFunc func(line string)

// Client manages a SteamCMD installation and runs app download/update commands.
type Client struct {
	// InstallDir is where SteamCMD itself is installed.
	InstallDir string
	// OnProgress is called with each line of SteamCMD stdout, if set.
	OnProgress ProgressFunc
}

// New creates a Client with the given SteamCMD installation directory.
func New(installDir string) *Client {
	return &Client{InstallDir: installDir}
}

// binaryName returns the platform-specific SteamCMD executable name.
func (c *Client) binaryName() string {
	if runtime.GOOS == "windows" {
		return "steamcmd.exe"
	}
	return "steamcmd.sh"
}

// binaryPath returns the absolute path to the SteamCMD binary.
func (c *Client) binaryPath() string {
	return filepath.Join(c.InstallDir, c.binaryName())
}

// CheckInstalled reports whether the SteamCMD binary exists in InstallDir.
func (c *Client) CheckInstalled() bool {
	_, err := os.Stat(c.binaryPath())
	return err == nil
}

// Bootstrap downloads and extracts SteamCMD if it is not already present.
// On Linux, lib32gcc-s1 must be installed via the system package manager first.
func (c *Client) Bootstrap() error {
	if c.CheckInstalled() {
		return nil
	}
	if err := os.MkdirAll(c.InstallDir, 0o755); err != nil {
		return fmt.Errorf("steamcmd: create install dir: %w", err)
	}
	if runtime.GOOS == "windows" {
		return c.bootstrapWindows()
	}
	return c.bootstrapLinux()
}

// Download is an alias for Bootstrap kept for API compatibility with the scaffold.
func (c *Client) Download() error {
	return c.Bootstrap()
}

func (c *Client) bootstrapWindows() error {
	tmp := filepath.Join(c.InstallDir, "steamcmd.zip")
	if err := downloadFile(downloadURLWindows, tmp, c.OnProgress); err != nil {
		return fmt.Errorf("steamcmd: download: %w", err)
	}
	defer os.Remove(tmp)
	if err := extractZip(tmp, c.InstallDir); err != nil {
		return fmt.Errorf("steamcmd: extract: %w", err)
	}
	return nil
}

func (c *Client) bootstrapLinux() error {
	tmp := filepath.Join(c.InstallDir, "steamcmd_linux.tar.gz")
	if err := downloadFile(downloadURLLinux, tmp, c.OnProgress); err != nil {
		return fmt.Errorf("steamcmd: download: %w", err)
	}
	defer os.Remove(tmp)
	if err := extractTarGz(tmp, c.InstallDir); err != nil {
		return fmt.Errorf("steamcmd: extract: %w", err)
	}
	// Ensure the shell script is executable.
	return os.Chmod(c.binaryPath(), 0o755)
}

// Install downloads a Steam app by appID into targetDir using anonymous login.
// Equivalent to: steamcmd +force_install_dir <targetDir> +login anonymous +app_update <appID> validate +quit
func (c *Client) Install(appID int, targetDir string) error {
	return c.runSteamCMD(appID, targetDir)
}

// Update updates an existing Steam app installation, identical to Install with validate.
func (c *Client) Update(appID int, targetDir string) error {
	return c.runSteamCMD(appID, targetDir)
}

// ErrNotInstalled is returned when SteamCMD is not present and Bootstrap has not been called.
var ErrNotInstalled = errors.New("steamcmd: binary not found — call Bootstrap() first")

func (c *Client) runSteamCMD(appID int, targetDir string) error {
	if !c.CheckInstalled() {
		return ErrNotInstalled
	}
	if err := os.MkdirAll(targetDir, 0o755); err != nil {
		return fmt.Errorf("steamcmd: create target dir: %w", err)
	}

	args := []string{
		"+force_install_dir", targetDir,
		"+login", "anonymous",
		"+app_update", fmt.Sprintf("%d", appID), "validate",
		"+quit",
	}

	cmd := exec.Command(c.binaryPath(), args...) //nolint:gosec // path is derived from admin-configured InstallDir

	if c.OnProgress != nil {
		return c.runWithStreaming(cmd)
	}

	out, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("steamcmd: %w\n%s", err, strings.TrimSpace(string(out)))
	}
	return nil
}

// runWithStreaming runs cmd and calls OnProgress for each line of combined stdout/stderr.
func (c *Client) runWithStreaming(cmd *exec.Cmd) error {
	pr, pw := io.Pipe()
	cmd.Stdout = pw
	cmd.Stderr = pw

	if err := cmd.Start(); err != nil {
		_ = pw.Close()
		return fmt.Errorf("steamcmd: start: %w", err)
	}

	var scanErr error
	done := make(chan struct{})
	go func() {
		defer close(done)
		scanner := bufio.NewScanner(pr)
		for scanner.Scan() {
			c.OnProgress(scanner.Text())
		}
		scanErr = scanner.Err()
	}()

	waitErr := cmd.Wait()
	_ = pw.Close()
	<-done

	if waitErr != nil {
		return fmt.Errorf("steamcmd: %w", waitErr)
	}
	return scanErr
}

// downloadFile fetches url and writes it to dest, optionally reporting progress.
func downloadFile(url, dest string, progress ProgressFunc) error {
	if progress != nil {
		progress(fmt.Sprintf("Downloading %s ...", url))
	}

	resp, err := http.Get(url) //nolint:noctx,gosec // bootstrapping utility, no sensitive input
	if err != nil {
		return err
	}
	defer resp.Body.Close()

	if resp.StatusCode != http.StatusOK {
		return fmt.Errorf("HTTP %d for %s", resp.StatusCode, url)
	}

	f, err := os.Create(dest)
	if err != nil {
		return err
	}
	defer f.Close()

	_, err = io.Copy(f, resp.Body)
	return err
}

// extractZip extracts a .zip archive into destDir, guarding against path traversal.
func extractZip(src, destDir string) error {
	r, err := zip.OpenReader(src)
	if err != nil {
		return err
	}
	defer r.Close()

	destDir = filepath.Clean(destDir)
	for _, f := range r.File {
		target := filepath.Join(destDir, filepath.FromSlash(f.Name))
		if !strings.HasPrefix(target, destDir+string(os.PathSeparator)) && target != destDir {
			return fmt.Errorf("zip path traversal rejected: %s", f.Name)
		}

		if f.FileInfo().IsDir() {
			if err := os.MkdirAll(target, f.Mode()); err != nil {
				return err
			}
			continue
		}

		if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
			return err
		}

		rc, err := f.Open()
		if err != nil {
			return err
		}

		out, err := os.OpenFile(target, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, f.Mode())
		if err != nil {
			rc.Close()
			return err
		}

		_, copyErr := io.Copy(out, rc) //nolint:gosec // files from Valve's CDN only
		rc.Close()
		out.Close()
		if copyErr != nil {
			return copyErr
		}
	}
	return nil
}

// extractTarGz extracts a .tar.gz archive into destDir, guarding against path traversal.
func extractTarGz(src, destDir string) error {
	f, err := os.Open(src)
	if err != nil {
		return err
	}
	defer f.Close()

	gz, err := gzip.NewReader(f)
	if err != nil {
		return err
	}
	defer gz.Close()

	destDir = filepath.Clean(destDir)
	tr := tar.NewReader(gz)
	for {
		hdr, err := tr.Next()
		if errors.Is(err, io.EOF) {
			break
		}
		if err != nil {
			return err
		}

		target := filepath.Join(destDir, filepath.FromSlash(hdr.Name))
		if !strings.HasPrefix(target, destDir+string(os.PathSeparator)) && target != destDir {
			return fmt.Errorf("tar path traversal rejected: %s", hdr.Name)
		}

		switch hdr.Typeflag {
		case tar.TypeDir:
			if err := os.MkdirAll(target, hdr.FileInfo().Mode()); err != nil {
				return err
			}
		case tar.TypeReg:
			if err := os.MkdirAll(filepath.Dir(target), 0o755); err != nil {
				return err
			}
			out, err := os.OpenFile(target, os.O_CREATE|os.O_WRONLY|os.O_TRUNC, hdr.FileInfo().Mode())
			if err != nil {
				return err
			}
			_, copyErr := io.Copy(out, tr) //nolint:gosec // files from Valve's CDN only
			out.Close()
			if copyErr != nil {
				return copyErr
			}
		}
	}
	return nil
}
