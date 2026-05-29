package config

import (
	"bufio"
	"fmt"
	"os"
	"strings"
)

// iniDocument is a parsed INI file that preserves comments and blank lines for
// faithful round-trip writes.
type iniDocument struct {
	sections []*iniSection
}

type iniSection struct {
	name  string
	lines []iniLine
}

type iniLine struct {
	raw  string // original text (used for comments / blank lines)
	key  string
	val  string
	isKV bool
}

// parseINI reads path into an iniDocument. Returns os.ErrNotExist when the
// file does not exist yet (caller decides how to handle that).
func parseINI(path string) (*iniDocument, error) {
	f, err := os.Open(path)
	if err != nil {
		return nil, err
	}
	defer f.Close()

	doc := &iniDocument{}
	var cur *iniSection

	scanner := bufio.NewScanner(f)
	for scanner.Scan() {
		raw := scanner.Text()
		trimmed := strings.TrimSpace(raw)

		// Section header
		if strings.HasPrefix(trimmed, "[") && strings.HasSuffix(trimmed, "]") {
			name := trimmed[1 : len(trimmed)-1]
			cur = &iniSection{name: name}
			doc.sections = append(doc.sections, cur)
			continue
		}

		// Lines before the first section header go into an unnamed root section.
		if cur == nil {
			cur = &iniSection{}
			doc.sections = append(doc.sections, cur)
		}

		il := iniLine{raw: raw}
		// Parse key=value (skip comments and blank lines)
		if trimmed != "" && !strings.HasPrefix(trimmed, ";") && !strings.HasPrefix(trimmed, "#") {
			if idx := strings.IndexByte(raw, '='); idx >= 0 {
				il.key = strings.TrimSpace(raw[:idx])
				il.val = strings.TrimSpace(raw[idx+1:])
				il.isKV = true
			}
		}
		cur.lines = append(cur.lines, il)
	}

	return doc, scanner.Err()
}

// writeINI serialises doc back to path, preserving the original structure.
func writeINI(path string, doc *iniDocument) error {
	f, err := os.Create(path)
	if err != nil {
		return fmt.Errorf("creating %s: %w", path, err)
	}
	defer f.Close()

	w := bufio.NewWriter(f)
	for i, sec := range doc.sections {
		if sec.name != "" {
			if i > 0 {
				fmt.Fprintln(w)
			}
			fmt.Fprintf(w, "[%s]\n", sec.name)
		}
		for _, line := range sec.lines {
			if line.isKV {
				fmt.Fprintf(w, "%s=%s\n", line.key, line.val)
			} else {
				fmt.Fprintln(w, line.raw)
			}
		}
	}

	return w.Flush()
}

// getSection returns the section with the given name (case-insensitive), or nil.
func (doc *iniDocument) getSection(name string) *iniSection {
	for _, s := range doc.sections {
		if strings.EqualFold(s.name, name) {
			return s
		}
	}
	return nil
}

// getValue returns the first matching key value (case-insensitive key lookup).
func (s *iniSection) getValue(key string) string {
	for _, l := range s.lines {
		if l.isKV && strings.EqualFold(l.key, key) {
			return l.val
		}
	}
	return ""
}

// setKeyValue updates an existing key or appends a new one.
func (doc *iniDocument) setKeyValue(section, key, value string) {
	s := doc.getSection(section)
	if s == nil {
		s = &iniSection{name: section}
		doc.sections = append(doc.sections, s)
	}
	for i, l := range s.lines {
		if l.isKV && strings.EqualFold(l.key, key) {
			s.lines[i].val = value
			s.lines[i].raw = l.key + "=" + value
			return
		}
	}
	s.lines = append(s.lines, iniLine{
		raw:  key + "=" + value,
		key:  key,
		val:  value,
		isKV: true,
	})
}

// deleteKey removes all entries matching key inside the named section.
func (doc *iniDocument) deleteKey(section, key string) {
	s := doc.getSection(section)
	if s == nil {
		return
	}
	kept := s.lines[:0]
	for _, l := range s.lines {
		if !(l.isKV && strings.EqualFold(l.key, key)) {
			kept = append(kept, l)
		}
	}
	s.lines = kept
}
