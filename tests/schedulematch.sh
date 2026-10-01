#!/bin/sh
set -eu
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
T="$(mktemp -d)"
trap 'rm -rf "$T"' EXIT
export CRON_ROOT="$T/crontab" CRON_INIT="$T/cron" SCHEDULE_STAMP="$T/stamp"
printf '#!/bin/sh\nexit 0\n' > "$CRON_INIT"
chmod +x "$CRON_INIT"
uci() { case "${SCHEDULE_TEST_HOURS:-24}" in *) printf '%s' "${SCHEDULE_TEST_HOURS:-24}" ;; esac; }
. "$ROOT/files/usr/lib/splify2/list-schedule.sh"
for hours in 12 24 48 72 168; do
    export SCHEDULE_TEST_HOURS="$hours"
    test "$(schedule_hours)" = "$hours"
    echo 1000000 > "$SCHEDULE_STAMP"
    export SCHEDULE_NOW="$((1000000 + hours * 3600 - 1))"
    if schedule_due; then echo "ran too early: $hours"; exit 1; fi
    export SCHEDULE_NOW="$((1000000 + hours * 3600))"
    schedule_due
done
export SCHEDULE_TEST_HOURS='24;touch bad'
test "$(schedule_hours)" = 24
printf '0 5 * * * /usr/sbin/splify2-update-lists\n0 3 * * * /other-job\n' > "$CRON_ROOT"
schedule_install
schedule_install
test "$(grep -c 'splify2-update-lists --scheduled' "$CRON_ROOT")" = 1
grep -q '/other-job' "$CRON_ROOT"
schedule_done
test -s "$SCHEDULE_STAMP"
echo 'list schedule: intervals, invalid value, cron migration and persistence OK'
