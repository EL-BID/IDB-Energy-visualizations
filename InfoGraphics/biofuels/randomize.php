<?php

    $files = glob("data/*.csv");
    mkdir("newdata");
    copy("data/countryyear.csv","newdata/countryyear.csv");
    unlink("data/countryyear.csv");
    foreach($files as $filename) {
        echo $filename . PHP_EOL;
        $f = fopen($filename, "r");
        $f2 = fopen(str_replace('data','newdata',$filename), "w");
        $row = fgetcsv($f); // header
        fprintf($f2,"%s,%s,%s\n",$row[0],$row[1],$row[2]);
        while($row) {
            $row = fgetcsv($f);
            if($row[2] != 0) {
                $row[2] += $row[2]*rand(-30,30)*0.01;
            }
            fprintf($f2,"%s,%s,%s\n",$row[0],$row[1],$row[2]);
        }   
        fclose($f);
        fclose($f2);
        unlink($filename);
    }
    rmdir("data");
    rename("newdata","data");

