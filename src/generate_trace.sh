#!/usr/bin/env bash

# Collect args
if [[ $# -ne 3 ]]; then
    echo "Usage: $0 interface trace_dir_path trace_length"
    exit 1
fi

interface=$1
trace_dir_path=$(echo $2| sed 's:/*$::')
trace_length=$3

start=$(date +"%Y%m%d%H%M%S")
outpcap="$trace_dir_path/$start.pcap"
echo "Starting trace of interface : ${interface} for ${trace_length} second(s) at ${start} and saving to directory: '${outpcap}'"

timeout $((trace_length + 5)) /usr/sbin/tcpdump -i $interface -s 94 -w $outpcap 'ip and tcp' &
/usr/local/bin/node /home/stariq/testbed/cctracing/src/gen_traffic.js $trace_length

end=$(date +"%Y%m%d%H%M%S")

echo "Trace completed at $end"
