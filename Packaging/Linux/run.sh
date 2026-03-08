#!/bin/bash -eu

source ../info.env

# ── Arguments ─────────────────────────────────────────────────────────────────
VERBOSE=false
for arg in "$@"; do
  case $arg in -v|--verbose) VERBOSE=true ;; esac
done

# ── Colors ────────────────────────────────────────────────────────────────────
BOLD='\033[1m'; DIM='\033[2m'
GREEN='\033[0;32m'; RED='\033[0;31m'; CYAN='\033[0;36m'; RESET='\033[0m'

# ── State ─────────────────────────────────────────────────────────────────────
OVERALL_START=$(date +%s)
LOG_FILE="/tmp/${NAME}_build.log"
STEP_NAMES=(); STEP_TIMES=()
SPINNER_PID=""
: > "$LOG_FILE"

# ── Cleanup trap ──────────────────────────────────────────────────────────────
cleanup() {
  [[ -n "${SPINNER_PID:-}" ]] && kill "$SPINNER_PID" 2>/dev/null || true
}
trap cleanup EXIT

# ── Spinner ───────────────────────────────────────────────────────────────────
FRAMES=('⠋' '⠙' '⠹' '⠸' '⠼' '⠴' '⠦' '⠧' '⠇' '⠏')

spin() {
  local label="$1" t0="$2"
  printf "  \033[0;36m${FRAMES[0]}\033[0m  %-20s \033[2m0:00\033[0m\n  \033[2m\033[0m" "$label" >&2
  ( local i=1
    while true; do
      local elapsed=$(( $(date +%s) - t0 ))
      local m=$(( elapsed / 60 )) s=$(( elapsed % 60 ))
      local last_line=""
      if [[ -s "$LOG_FILE" ]]; then
        last_line=$(tail -1 "$LOG_FILE" 2>/dev/null | tr -d '\r' | sed $'s/\033\\[[0-9;]*[a-zA-Z]//g' | cut -c1-70)
      fi
      printf "\r\033[1A\r\033[K  \033[0;36m${FRAMES[$i]}\033[0m  %-20s \033[2m%d:%02d\033[0m\n\r\033[K  \033[2m%.70s\033[0m" \
        "$label" "$m" "$s" "$last_line" >&2
      i=$(( (i+1) % 10 )); sleep 0.25
    done ) &
  SPINNER_PID=$!
  disown "$SPINNER_PID"
}

unspin() {
  [[ -n "${SPINNER_PID:-}" ]] && { kill "$SPINNER_PID" 2>/dev/null || true; SPINNER_PID=""; }
  printf "\r\033[1A\r\033[J" >&2
}

# ── Step runner ───────────────────────────────────────────────────────────────
run_step() {
  local name="$1" script="$2"
  local t0 t1 elapsed ec=0

  t0=$(date +%s)

  if [[ "$VERBOSE" == true ]]; then
    printf "\n${BOLD}▶  %s${RESET}\n" "$name"
    sh "$script" || ec=$?
  else
    spin "$name..." "$t0"
    sh "$script" >> "$LOG_FILE" 2>&1 || ec=$?
    unspin
  fi

  t1=$(date +%s); elapsed=$(( t1 - t0 ))
  STEP_NAMES+=("$name"); STEP_TIMES+=("$elapsed")

  if [[ $ec -eq 0 ]]; then
    printf "  ${GREEN}✓${RESET}  %-20s ${DIM}%ds${RESET}\n" "$name" "$elapsed"
  else
    printf "  ${RED}✗${RESET}  %-20s ${DIM}%ds${RESET}\n" "$name" "$elapsed"
    if [[ "$VERBOSE" == false ]]; then
      printf "\n${RED}Last output:${RESET}\n"
      tail -30 "$LOG_FILE"
    fi
    print_summary "$ec"
    exit "$ec"
  fi
}

# ── Summary ───────────────────────────────────────────────────────────────────
print_summary() {
  local ec="${1:-0}"
  local total=$(( $(date +%s) - OVERALL_START ))
  local mins=$(( total / 60 )) secs=$(( total % 60 ))

  printf "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
  printf "${BOLD}  Build Summary — %s %s${RESET}\n" "$NAME" "$VERSION"
  printf "${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n\n"

  local i
  for i in "${!STEP_NAMES[@]}"; do
    printf "  ${GREEN}✓${RESET}  %-20s ${DIM}%ds${RESET}\n" "${STEP_NAMES[$i]}" "${STEP_TIMES[$i]}"
  done

  if [[ $mins -gt 0 ]]; then
    printf "\n  ${DIM}Total${RESET}   ${BOLD}%dm %ds${RESET}\n" "$mins" "$secs"
  else
    printf "\n  ${DIM}Total${RESET}   ${BOLD}%ds${RESET}\n" "$secs"
  fi

  printf "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n\n"

  if [[ $ec -eq 0 ]]; then
    printf "${GREEN}${BOLD}  Build complete!${RESET}\n\n"
    printf "${BOLD}  What's next?${RESET}\n\n"
    printf "  %-14s unzip ${NAME}-Linux.zip -d ~/.vst3/\n"  "Install"
    printf "  %-14s upload ./${NAME}-Linux.zip\n"           "Distribute"
    printf "  %-14s cat ${LOG_FILE}\n\n"                    "Full logs"
  else
    printf "${RED}${BOLD}  Build failed.${RESET}\n\n"
    if [[ "$VERBOSE" == false ]]; then
      printf "  ${DIM}Tip: rerun with ${RESET}${BOLD}--verbose${RESET}${DIM} for full output${RESET}\n"
      printf "  ${DIM}Logs saved to: ${LOG_FILE}${RESET}\n"
    fi
    echo ""
  fi
}

# ── Header ────────────────────────────────────────────────────────────────────
printf "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n"
printf "${BOLD}  %s %s  —  Build Pipeline (Linux)${RESET}" "$NAME" "$VERSION"
[[ "$VERBOSE" == true ]] && printf "  ${DIM}[verbose]${RESET}"
printf "\n${BOLD}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${RESET}\n\n"

# ── Pipeline ──────────────────────────────────────────────────────────────────
run_step "Compile"  compile.sh
run_step "Test"     test.sh
run_step "Package"  package.sh

# ── Done ──────────────────────────────────────────────────────────────────────
TOTAL=$(( $(date +%s) - OVERALL_START ))
print_summary 0
