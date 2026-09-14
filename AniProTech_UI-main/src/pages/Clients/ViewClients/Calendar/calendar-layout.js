export const minutes = (time) => Number(time.slice(0, 2)) * 60 + Number(time.slice(3, 5));
export function positionVisits(visits) {
    const ordered = visits
        .map((v) => ({ ...v, start: minutes(v.startTime), end: minutes(v.endTime) }))
        .sort((a, b) => a.start - b.start || a.end - b.end || a.id.localeCompare(b.id));
    const result = [];
    let group = [],
        ends = [],
        groupEnd = -1;
    const flush = () => {
        for (const v of group) result.push({ ...v, columns: ends.length });
        group = [];
        ends = [];
    };
    for (const v of ordered) {
        if (v.start >= groupEnd) {
            flush();
            groupEnd = -1;
        }
        let lane = ends.findIndex((end) => end <= v.start);
        if (lane < 0) lane = ends.length;
        ends[lane] = v.end;
        groupEnd = Math.max(groupEnd, v.end);
        group.push({ ...v, lane });
    }
    flush();
    return result;
}
