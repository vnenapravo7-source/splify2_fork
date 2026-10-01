#!/bin/sh
# Shared by rpcd, package installation and the hourly cron tick.
schedule_hours() {
    sh_hours="$(uci -q get splify2.main.lists_interval_hours)"
    case "$sh_hours" in 12|24|48|72|168) ;; *) sh_hours=24 ;; esac
    printf '%s' "$sh_hours"
}

schedule_install() {
    sh_cron="${CRON_ROOT:-/etc/crontabs/root}"
    mkdir -p "$(dirname "$sh_cron")" || return 1
    sh_tmp="$(mktemp "$sh_cron.XXXXXX")" || return 1
    if [ -f "$sh_cron" ]; then
        awk '!/\/usr\/sbin\/splify2-update-lists([[:space:]]|$)/' "$sh_cron" > "$sh_tmp"
    fi
    printf '17 * * * * /usr/sbin/splify2-update-lists --scheduled\n' >> "$sh_tmp"
    chmod 600 "$sh_tmp"
    mv "$sh_tmp" "$sh_cron" || { rm -f "$sh_tmp"; return 1; }
    "${CRON_INIT:-/etc/init.d/cron}" enable >/dev/null 2>&1
    "${CRON_INIT:-/etc/init.d/cron}" restart >/dev/null 2>&1
    return 0
}

schedule_due() {
    sh_now="${SCHEDULE_NOW:-$(date +%s)}"
    sh_last="$(cat "${SCHEDULE_STAMP:-/etc/splify2/lists-last-auto}" 2>/dev/null)"
    case "$sh_last" in ''|*[!0-9]*) return 0 ;; esac
    [ "$sh_now" -lt "$sh_last" ] && return 0
    [ "$((sh_now - sh_last))" -ge "$(( $(schedule_hours) * 3600 ))" ]
}

schedule_done() {
    sh_stamp="${SCHEDULE_STAMP:-/etc/splify2/lists-last-auto}"
    mkdir -p "$(dirname "$sh_stamp")" || return 1
    sh_tmp="$(mktemp "$sh_stamp.XXXXXX")" || return 1
    date +%s > "$sh_tmp"
    mv "$sh_tmp" "$sh_stamp"
}
