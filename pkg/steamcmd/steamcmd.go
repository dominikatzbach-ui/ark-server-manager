// Package steamcmd provides SteamCMD download and execution utilities.
// Scaffold only — implementation in AVE-91/AVE-92.
package steamcmd

import "errors"

var ErrNotImplemented = errors.New("steamcmd: not yet implemented")

type Client struct {
	InstallDir string
}

func New(installDir string) *Client {
	return &Client{InstallDir: installDir}
}

// Download installs SteamCMD into InstallDir.
func (c *Client) Download() error {
	return ErrNotImplemented
}

// Install downloads a Steam app by appID into targetDir.
func (c *Client) Install(appID int, targetDir string) error {
	return ErrNotImplemented
}

// Update updates an already-installed Steam app.
func (c *Client) Update(appID int, targetDir string) error {
	return ErrNotImplemented
}
