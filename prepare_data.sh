#!/usr/bin/env bash

# Pass the csv files folder as the first args. Note that the data path must be absolute path, which can easily archive by using `pwd`

echo "----------Start----------"

echo "----------Remove json and tmp csv files---------"
find $1 -type f -name '*.json' -delete
find $1 -type f -name 'tmp-*.csv' -delete

echo "----------Sort order with w_id, d_id, o_id----------"
sort -t',' -k1 -k2 -k3 $1/order.csv > $1/tmp-order.csv

echo "----------Adding ol-i-name into order-line----------"

# Create tmp_order_line.csv with new value ol_i_name on the row 11 and then sort
join -a 1 -j 1 -t ',' -o 1.2 1.3 1.4 1.5 1.6 1.7 1.8 1.9 1.10 1.11 2.2 -e "null" <(paste -d',' <(cut -d',' --output-delimiter=- -f5 $1/order-line.csv) $1/order-line.csv | sort -t',' -k1,1) <(cat $1/item.csv | sort -t',' -k1,1) > $1/tmp-join-order-line.csv
sort -t',' -k1 -k2 -k3 -k4 $1/tmp-join-order-line.csv > $1/tmp-order-line.csv

echo "----------Adding s-i-name and s-i-price into stock----------"

# Create tmp_stock.csv with new value s_i_name, s_i_price on the row 18, 19
join -a 1 -j 1 -t ',' -o 1.2 1.3 1.4 1.5 1.6 1.7 1.8 1.9 1.10 1.11 1.12 1.13 1.14 1.15 1.16 1.17 1.18 2.2 2.3 -e "null" <(paste -d',' <(cut -d',' --output-delimiter=- -f2 $1/stock.csv) $1/stock.csv | sort -t',' -k1,1) <(cat $1/item.csv | sort -t',' -k1,1) > $1/tmp-stock.csv


echo "----------Replacing null by empty in all csv files----------"

for f in $1/*.csv
do
	sed -i -e 's/,null,/,,/g' -e 's/^null,/,/' -e 's/,null$/,/' $f
done


# TODO: implement this part.
echo "----------Convert csv file into json file----------"

DATA_DIR=$1 npm run convert-data 

echo "----------Done----------"
