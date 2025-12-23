<?php
session_start();
include('db_connect.php');
include('vendor/autoload.php');

use Sentiment\Analyzer;

$neutrals = [
    "nothing",
    "none",
    "non",
    "no comment",
    "no comments",
    ".",
    "no",
    "no complaints",
    "no complaint",
    "n/a",
    "n\a",
    "na"
];

// adding feedbacks
if (isset($_POST['submit'])) {
    // respondent information
    $name = $_POST['name'];
    $date = explode("-", $_POST['date']);
    $newdate = join("/", [$date[1], $date[2], $date[0]]);

    $clienttype = $_POST['client_type'];

    // service availed
    $on = 0;
    $servicesArr = [
        "registrar",
        "clinic",
        "cashier",
        "guidance",
        "library",
        "hr",
        "accounting",
        "budget",
        "gs",
        "cte",
        "cbm",
        "cas",
        "cet",
        "cite",
        "ict",
        "admin"
    ];
    $service_availed = '';
    for ($i = 0; $i < sizeof($servicesArr); $i++) {
        if (isset($_POST[$servicesArr[$i]])) {
            if ($on === 0) {
                $service_availed .= $servicesArr[$i];
                $on++;
            } else {
                $service_availed .= ';' . $servicesArr[$i];
            }
        }
    }

    // transactions
    $purpose_of_transaction = join("", explode("'", $_POST['purpose_of_transaction']));
    $puo_transacted = join("", explode("'", $_POST['puo_transacted']));

    // feedbacks
    $customer_rating = $_POST['customer_rating'];
    $customer_feedback = $_POST['customer_feedback'];
    $fodoti = join("", explode("'", $_POST['fodoti']));
    $rsdafto = join("", explode("'", $_POST['rsdafto']));

    mysqli_query($connect, "INSERT INTO research_data`(name`, timestamp, date_of_feedback, type_of_client, service_availed, purpose_of_transaction, puo_transacted, customer_rating, customer_feedback, fodoti, rsdafto, data_type) VALUES ('$name',now(),'$newdate','$clienttype','$service_availed','$purpose_of_transaction','$puo_transacted','$customer_rating','$customer_feedback','$fodoti','$rsdafto', 'new')");

    $_SESSION['done'] = 'Done';
    header('location: ./#div3');
}



// comments
if (isset($_GET['comments'])) {
    $year = $_GET['comments'];
    $filtersenti = $_GET['sentiment'];
    $analyzer = new Analyzer();

    $resultcomments = mysqli_query($connect, "SELECT * FROM research_data where ((timestamp like '$year/%' and data_type = 'old') or (date_of_feedback like '%/$year' and data_type = 'new')) and (fodoti != 'none' and fodoti != 'nothing') ORDER BY data_id desc");

    $count = mysqli_num_rows($resultcomments);
    $resultArrCom = [];
    $counter = 0;
    $commentarray = [];

    while ($row = mysqli_fetch_assoc($resultcomments)) {
        if (!in_array(strtolower($row['fodoti']), $neutrals)) {
            $output = $analyzer->getSentiment($row['fodoti']);
            if ($filtersenti === 'positive') {
                if ($output['compound'] > 0) {
                    $row['sentiment'] = $output['compound'];
                    array_push($commentarray, $row);
                    $counter++;
                }
            } else if ($filtersenti === 'negative') {
                if ($output['compound'] < 0) {
                    $row['sentiment'] = $output['compound'];
                    array_push($commentarray, $row);
                    $counter++;
                }
            } else if ($filtersenti === 'all') {
                $row['sentiment'] = $output['compound'];
                array_push($commentarray, $row);
                $counter++;
            } else if ($filtersenti === 'neutral') {
                if ($output['compound'] == 0) {
                    $row['sentiment'] = $output['compound'];
                    array_push($commentarray, $row);
                    $counter++;
                }
            }
            if ($counter % 10 === 0) {
                array_push($resultArrCom, $commentarray);
                $commentarray = [];
            }
        }
    }
    // echo $counter;
    array_push($resultArrCom, $commentarray);
    // $outputanalysis = $analyzer->getSentiment("not an overall great experience in the beginning we were treated like children");
    // print_r($outputanalysis);
    $counted = [];
    for ($i = 0; $i < sizeof($resultArrCom); $i++) {
        if (sizeof($resultArrCom[$i]) !== 0) {
            array_push($counted, $resultArrCom[$i]);
        }
    }
    echo json_encode($counted);
}



// serviceratings
if (isset($_GET['ratings'])) {
    $year = $_GET['ratings'];
    $resultrating = mysqli_query($connect, "SELECT * FROM research_data where (timestamp like '$year/%' and data_type = 'old') or (date_of_feedback like '%/$year%' and data_type = 'new')");
    $resultArrRate = [];
    while ($row = mysqli_fetch_assoc($resultrating)) {
        array_push($resultArrRate, $row);
    }

    echo json_encode($resultArrRate);
}

// year filitering
if (isset($_GET['responsebyyear'])) {
    $analyzer = new Analyzer();
    $year = $_GET['responsebyyear'];

    $old = mysqli_query($connect, "SELECT * FROM research_data where timestamp like '$year/%' and data_type = 'old' and (fodoti != 'none' and fodoti != 'nothing')");
    $new = mysqli_query($connect, "SELECT * FROM research_data where date_of_feedback like '%/$year' and data_type = 'new' and (fodoti != 'none' and fodoti != 'nothing')");

    $oldArr = [];
    $newArr = [];
    $resultArr = [];
    while ($row = mysqli_fetch_assoc($old)) {
        if (!in_array(strtolower($row['fodoti']), $neutrals)) {
            $outputold = $analyzer->getSentiment($row['fodoti']);
            $row['sentiment'] = $outputold['compound'];
            $row['neutralsentiment'] = $outputold['neu'];
            array_push($oldArr, $row);
        }
    }
    array_push($resultArr, $oldArr);

    while ($row = mysqli_fetch_assoc($new)) {
        if (!in_array(strtolower($row['fodoti']), $neutrals)) {
            $outputnew = $analyzer->getSentiment($row['fodoti']);
            $row['sentiment'] = $outputnew['compound'];
            $row['neutralsentiment'] = $outputnew['neu'];
            array_push($newArr, $row);
        }
    }
    array_push($resultArr, $newArr);

    echo json_encode($resultArr);
}

// all time response
if (isset($_GET['alltime'])) {
    $old = mysqli_query($connect, "SELECT * FROM research_data where data_type = 'old'");
    $new = mysqli_query($connect, "SELECT * FROM research_data where data_type = 'new'");
    $alltimeArr = [];

    while ($alltimeold = mysqli_fetch_array($old)) {
        array_push($alltimeArr, $alltimeold['timestamp']);
    }

    while ($alltimenew = mysqli_fetch_array($new)) {
        $newdate = '';
        $splitter = explode('/', $alltimenew['date_of_feedback']);
        $joining = [$splitter[2], $splitter[0], $splitter[1]];
        $newdate = join('/', $joining);
        array_push($alltimeArr, $newdate);
    }

    echo json_encode($alltimeArr);
}

// csv importing
if (isset($_POST['submitcsv'])) {
    if (!empty($_FILES['file']['tmp_name'])) {
        $data = fopen($_FILES['file']['tmp_name'], 'r');
        $current = mysqli_num_rows(mysqli_query($connect, "SELECT * FROM research_data"));
        $errors = [];
        $uploaded = 0;
        while ($row = fgetcsv($data)) {
            $time = explode(" ", $row[0]);
            $actualtime = $time[0];
            $clienttype = $row[1];
            $service_availed = $row[2];
            $purpose_of_transaction = join("", explode("'", $row[3]));
            $puo_transacted = join("", explode("'", $row[4]));
            $customer_rating = $row[5];
            $customer_feedback = $row[6];
            $fodoti = join("", explode("'", $row[7]));
            $rsdafto = join("", explode("'", $row[8]));
            if ((sizeof(explode("/", $actualtime)) === 3) || (int)(explode("-", $customer_rating)[0]) > 0) {
                mysqli_query($connect, "INSERT INTO research_data`(name`, timestamp, date_of_feedback, type_of_client, service_availed, purpose_of_transaction, puo_transacted, customer_rating, customer_feedback, fodoti, rsdafto, data_type) VALUES ('Anonymous',now(),'$actualtime','$clienttype','$service_availed','$purpose_of_transaction','$puo_transacted','$customer_rating','$customer_feedback','$fodoti','$rsdafto','new')");
                $uploaded++;
            } else {
                $error = [];
                array_push($error, $row[0]);
                array_push($error, $row[1]);
                array_push($error, $row[2]);
                array_push($error, $row[3]);
                array_push($error, $row[4]);
                array_push($error, $row[5]);
                array_push($error, $row[6]);
                array_push($error, $row[7]);
                array_push($error, $row[8]);
                array_push($errors, $error);
            }
        }
        $msg = '';
        if ($uploaded === 0) {
            $msg = "Swal.fire({
                icon: 'info',
                title: 'No data added',
                showConfirmButton: false,
                timer: 1500
            });";
        } else {
            $msg = "Swal.fire({
                icon: 'success',
                title: '$uploaded data added',
                showConfirmButton: false,
                timer: 1500
            });";
        }
        $_SESSION['csvsuccess'] = "$msg";
        $_SESSION['errordata'] = json_encode($errors);
    }
    header('location: ./');
}