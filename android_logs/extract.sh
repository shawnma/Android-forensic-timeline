#!/bin/bash

if [ $# -lt 2 ]
then
    echo 'Usage: '$0' <evidence_path> <output_path>'
    exit -1
fi

EVI_PATH=$1
OUTPUT_PATH=$2

echo "wait until device is connected..."
adb wait-for-device
echo "device found, proceeding..."
echo "Device state: [`adb get-state`]"

echo "extracting dmesg log..."

if [ ! -d $EVI_PATH ]
then
    echo -ne 'create folder for original evidence... [mkdir '$EVI_PATH']\t'
    mkdir $EVI_PATH
    echo 'ok'
fi

DMESG=$EVI_PATH"/dmesg.log"
STAT=$EVI_PATH"/stat"

echo 'adb shell dmesg > '$DMESG
echo -ne 'saving dmesg to local file...\t'
adb shell dmesg > $DMESG
echo 'ok'

echo 'adb pull /proc/stat '$STAT
echo -ne 'pulling /proc/stat to local...\t'
adb pull /proc/stat $STAT 1>/dev/null 2>&1
echo 'ok'

echo './timestamp_dmesg.sh '$STAT $DMESG $OUTPUT_PATH
echo 'converting timestamps in dmesg log...'
./timestamp_dmesg.sh $STAT $DMESG $OUTPUT_PATH

echo "extracting dmesg log... [Succeeded]"

echo "extracting logcat logs..."

LOGCATS="main radio events system"

for log in $LOGCATS
do
    echo -ne 'extracting /dev/log/'$log' ...\t'
    adb logcat -d -v time -b $log > $EVI_PATH"/"$log".log"
    echo "ok"
done

echo 'start converting timestamps in logcat logs ...'
./timestamp_logcat.py $EVI_PATH $OUTPUT_PATH

PACKAGES_LIST="/data/system/packages.list"
echo -ne 'extracting '$PACKAGES_LIST' ...\t'
adb pull $PACKAGES_LIST $EVI_PATH 1>/dev/null 2>&1
echo "ok"

echo 'start parsing packages list ...'
./packages_list.py $EVI_PATH $OUTPUT_PATH

echo 'done!'

