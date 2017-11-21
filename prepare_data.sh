#!/usr/bin/env bash

echo "Start"

cd

# Check for data folder
if [ ! -d "data" ]; then
    echo "Data folder does not exist. Downloading it from remote."
    wget http://www.comp.nus.edu.sg/~cs4224/4224-project-files.zip -O data.zip
    unzip data.zip
    rm data.zip
    echo "Data downloaded successfully!"
else
    echo "Data folder already exists"
fi

csv_dir=$(pwd)/data/xact-files

echo "Remove json and tmp csv files"
find $csv_dir -type f -name '*.json' -delete
find $csv_dir -type f -name 'tmp-*.csv' -delete

echo "Sort order with w_id, d_id, o_id"
sort -t',' -k1 -k2 -k3 -g $csv_dir/order.csv > $csv_dir/tmp-order.csv

echo "Adding ol-i-name into order-line"

# Create tmp_order_line.csv with new value ol_i_name on the row 11 and then sort
join -a 1 -j 1 -t ',' -o 1.2 1.3 1.4 1.5 1.6 1.7 1.8 1.9 1.10 1.11 2.2 -e "null" <(paste -d',' <(cut -d',' --output-delimiter=- -f5 $csv_dir/order-line.csv) $csv_dir/order-line.csv | sort -t',' -k1,1) <(cat $csv_dir/item.csv | sort -t',' -k1,1) > $csv_dir/tmp-join-order-line.csv
sort -t',' -k1 -k2 -k3 -k4 -g $csv_dir/tmp-join-order-line.csv > $csv_dir/tmp-order-line.csv
	
echo "Adding s-i-name and s-i-price into stock"	

# Create tmp_stock.csv with new value s_i_name, s_i_price on the row 18, 19
join -a 1 -j 1 -t ',' -o 1.2 1.3 1.4 1.5 1.6 1.7 1.8 1.9 1.10 1.11 1.12 1.13 1.14 1.15 1.16 1.17 1.18 2.2 2.3 -e "null" <(paste -d',' <(cut -d',' --output-delimiter=- -f2 $csv_dir/stock.csv) $csv_dir/stock.csv | sort -t',' -k1,1) <(cat $csv_dir/item.csv | sort -t',' -k1,1) > $csv_dir/tmp-stock.csv


echo "Replacing null by empty in all csv files"

for f in $csv_dir/*.csv
do
	sed -i -e 's/,null,/,,/g' -e 's/^null,/,/' -e 's/,null$/,/' $f
done


echo "Convert csv file into json file"

cd CS4224-MongoDB

DATA_DIR=$csv_dir npm run convert-data 

echo "Done"
