package html

import (
	"strings"
)

func Clean(html string) string {
	// Remove all HTML tags using a simple string replacement approach
	for {
		startIdx := strings.Index(html, "<")
		if startIdx == -1 {
			break
		}
		endIdx := strings.Index(html[startIdx:], ">")
		if endIdx == -1 {
			break
		}
		html = html[:startIdx] + html[startIdx+endIdx+1:]
	}
	return html
}
