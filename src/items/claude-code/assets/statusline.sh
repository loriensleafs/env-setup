#!/bin/bash
# Claude Code statusline with pill shapes + right-aligned progress bar
# Works in bash 3.2+ (macOS system bash)

# --- Read JSON input from Claude Code ---
input=$(cat)

cwd=$(echo "$input" | jq -r '.workspace.current_dir // .cwd // empty')
model=$(echo "$input" | jq -r '.model.display_name // "Claude"')
context_pct=$(echo "$input" | jq -r '.context_window.used_percentage // 0' | cut -d. -f1)

# --- Branch detection (safe for paths with spaces) ---
branch=""
if [ -n "$cwd" ] && [ -d "$cwd" ]; then
  branch=$(git -C "$cwd" branch --show-current 2>/dev/null)
fi
[ -z "$branch" ] && branch="(no branch)"

# --- Bytes (work in bash 3.2+) ---
ESC=$(printf '\033')
LCAP=$(printf '\xee\x82\xb6')      # U+E0B6 left rounded cap
RCAP=$(printf '\xee\x82\xb4')      # U+E0B4 right rounded cap
DOT=$(printf '\xe2\x97\x8f')       # U+25CF black circle
BAR_FILL=$(printf '\xe2\x94\x81')  # U+2501 ━
BAR_EMPTY=$(printf '\xe2\x94\x84') # U+2504 ┄

# --- Colors ---
PILL_BG="${ESC}[48;2;55;48;75m"
PILL_FG="${ESC}[38;2;200;180;230m"
CAP_FG="${ESC}[38;2;55;48;75m"
GREEN="${ESC}[38;2;120;200;120m"
BAR_FG="${ESC}[38;2;180;160;220m"
RESET="${ESC}[0m"

# --- Pill builder ---
build_pill() {
  local text="$1" suffix="$2"
  printf '%s%s%s%s %s' "$CAP_FG" "$LCAP" "$PILL_BG" "$PILL_FG" "$text"
  [ -n "$suffix" ] && printf '%s' "$suffix"
  printf ' %s%s%s%s' "$RESET" "$CAP_FG" "$RCAP" "$RESET"
}

# Visible width = 2 caps + 2 spaces + text length + suffix visible width
pill_width() {
  echo $((4 + ${#1} + ${2:-0}))
}

# --- Terminal width detection ---
# Claude Code doesn't pass terminal width in the JSON, and tput/COLUMNS
# don't work reliably from within the statusline script. Walk up the
# process tree to find the real controlling TTY and query its size.
get_term_width() {
  local pid=$PPID
  local tty width
  # Try up to 5 levels up the process tree
  for _ in 1 2 3 4 5; do
    [ -z "$pid" ] || [ "$pid" = "0" ] && break
    tty=$(ps -o tty= -p "$pid" 2>/dev/null | tr -d ' ')
    if [ -n "$tty" ] && [ "$tty" != "?" ] && [ "$tty" != "??" ]; then
      # Try /dev/$tty directly, then /dev/pts/* etc.
      for dev in "/dev/$tty" "/dev/${tty#tty}"; do
        if [ -e "$dev" ]; then
          width=$(stty size < "$dev" 2>/dev/null | awk '{print $2}')
          if [ -n "$width" ] && [ "$width" -gt 0 ] 2>/dev/null; then
            echo "$width"
            return
          fi
        fi
      done
    fi
    pid=$(ps -o ppid= -p "$pid" 2>/dev/null | tr -d ' ')
  done
}

cols=$(get_term_width)
[ -z "$cols" ] && cols=$(tput cols 2>/dev/null)
[ -z "$cols" ] && cols="${COLUMNS:-120}"

# Claude Code reserves ~4 cells of internal padding (2 left + 2 right)
cols=$((cols - 4))
[ "$cols" -lt 20 ] && cols=20

# --- Build left side ---
branch_pill=$(build_pill "$branch" " ${GREEN}${DOT}${RESET}")
branch_w=$(pill_width "$branch" 2)   # " ●" = 2 visible cells

model_pill=$(build_pill "$model" "")
model_w=$(pill_width "$model" 0)

left="${branch_pill}  ${model_pill}"
left_w=$((branch_w + 2 + model_w))

# --- Build right side: progress bar ---
bar_width=20
filled=$((context_pct * bar_width / 100))
[ "$filled" -lt 0 ] && filled=0
[ "$filled" -gt "$bar_width" ] && filled=$bar_width
empty=$((bar_width - filled))

bar=""
for ((i=0; i<filled; i++)); do bar+="$BAR_FILL"; done
for ((i=0; i<empty; i++)); do bar+="$BAR_EMPTY"; done

right=$(printf '%s%s%s %d%%' "$BAR_FG" "$bar" "$RESET" "$context_pct")
pct_digits=${#context_pct}
right_w=$((bar_width + 1 + pct_digits + 1))

# --- Padding ---
padding=$((cols - left_w - right_w))
[ $padding -lt 1 ] && padding=1

# --- Output (no trailing newline; Claude Code adds one) ---
printf '%s%*s%s' "$left" "$padding" "" "$right"