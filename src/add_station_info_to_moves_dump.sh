#!/bin/bash
mongo moves ../../utilities/dump_moves_activities.js | tail -50 | while read line
do 
  start_long=`echo "$line" | cut -f4 -d,`
  start_lat=`echo "$line" | cut -f3 -d,`
  start_at_station=$(./is_point_at_station.js $start_long $start_lat)
  end_long=`echo "$line" | cut -f7 -d,`
  end_lat=`echo "$line" | cut -f6 -d,`
  end_at_station=$(./is_point_at_station.js $end_long $end_lat)
  echo "$line, $start_at_station, $end_at_station" 
done
