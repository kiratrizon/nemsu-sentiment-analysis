// darktheme

var dark_themes = document.getElementById("dark_themes");
dark_themes.onclick = function () {
  document.body.classList.toggle("dark_themes");
  if (document.body.classList.contains("dark_themes")) {
    dark_themes.src = "/images/sun.png";
  } else {
    dark_themes.src = "/images/moon.png";
  }
};

// end of darktheme

// animate initialization
AOS.init();
// end initialization

// services

const services = {
  "college of information and technology education": "CITE",
  "cite": "CITE",
  "cas": "CAS",
  "college of arts and sciences": "CAS",
  "college of teacher education": "CTE",
  "cte": "CTE",
  "registrar office": "Registrar",
  "registrar": "Registrar",
  "library": "Library",
  "library office": "Library",
  "graduate school": "GS",
  "graduate studies": "GS",
  "graduate school office": "GS",
  "gs": "GS",
  "college of business and management": "CBM",
  "cbm": "CBM",
  "cashier office": "Cashier",
  "cashier": "Cashier",
  "guidance office": "Guidance",
  "guidance": "Guidance",
  "clinic": "Clinic",
  "clinic office": "Clinic",
  "accounting office": "Accounting",
  "accounting": "Accounting",
  "administration office": "Admin",
  "administration": "Admin",
  "admin": "Admin",
  "budget": "Budget",
  "budget office": "Budget",
  "ict": "ICT",
  "information and communication technologies": "ICT",
  "hr": "HR",
  "college of engineering": "CET",
  "cet": "CET",
};

const services2 = {
  "college of information and technology education": "CITE",
  cite: "CITE",
  cas: "CAS",
  "college of arts and sciences": "CAS",
  "college of teacher education": "CTE",
  cte: "CTE",
  "registrar office": "Registrar Office",
  registrar: "Registrar Office",
  library: "Library Office",
  "library office": "Library Office",
  "graduate school": "Graduate School Office",
  "graduate studies": "Graduate School Office",
  "graduate school office": "Graduate School Office",
  gs: "Graduate School Office",
  "college of business and management": "CBM",
  cbm: "CBM",
  "cashier office": "Cashier",
  cashier: "Cashier",
  "guidance office": "Guidance Office",
  guidance: "Guidance Office",
  clinic: "Clinic",
  "clinic office": "Clinic",
  "accounting office": "Accounting Office",
  accounting: "Accounting Office",
  "administration office": "Administration Office",
  administration: "Administration Office",
  budget: "Budget Office",
  "budget office": "Budget Office",
  ict: "Information and Communication Technologies",
  "information and communication technologies":
    "Information and Communication Technologies",
  hr: "HR",
  "college of engineering": "College of Engineering",
  cet: "College of Engineering",
};

// vars
var commentholder = 0,
  maxcomment,
  feedbacktypes = { Compliment: 0, Suggestion: 0, Complaint: 0, Others: 0 };

// all time responses

var alltimeresponse,
  alltimeObj = {},
  alltimeArrLabel = [],
  alltimeArrData = [];


$.ajax({
  url: "/process/alltime",
  type: "POST",
  dataType: "json", // expect JSON response
  headers: {
    "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr('content')
  },
  data: {},         // send body if needed
  success: function (data) {
    const alltimeresponse = data.sort(
      (a, b) => Number(a.split("/")[0]) - Number(b.split("/")[0])
    );
    fillAllTime(alltimeresponse, alltimeObj);
  },
});


function fillAllTime(alltimeresponse, alltimeObj) {
  for (let i = 0; i < alltimeresponse.length; i++) {
    if (alltimeObj[alltimeresponse[i].split("/")[0]] === undefined) {
      alltimeObj[alltimeresponse[i].split("/")[0]] = 1;
    } else {
      alltimeObj[alltimeresponse[i].split("/")[0]]++;
    }
  }
  showalltimeResponse();
}

function showalltimeResponse() {
  for (let i = 0; i < Object.keys(alltimeObj).length; i++) {
    alltimeArrLabel.push(Object.keys(alltimeObj)[i]);
    alltimeArrData.push(alltimeObj[alltimeArrLabel[i]]);
  }
  chartpromoter("", "alltimechart");
}

// end of all time responses

// year filtering

function yearfilter(string) {
  if (string === "netpromoterchart") {
    chartpromoter($("#chart2yearfilter").val(), string);
    servicesratings($('#chart2yearfilter').val());
  } else if (string === "piechartyear") {
    ratingtype($("#piechartyear").val());
    div2();
  }
}

// end of year filtering

// chart promoter

var usedcanvas = {},
  forcharts = {
    netpromoterchart: [
      [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "May",
        "Jun",
        "Jul",
        "Aug",
        "Sep",
        "Oct",
        "Nov",
        "Dec",
      ],
      [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    ],
  };

function chartpromoter(search, stringObj) {
  let labelsArr, dataArr, ctx, charttype;
  if (stringObj === "netpromoterchart") {
    labelsArr = forcharts[stringObj][0];
    dataArr = forcharts[stringObj][1];

    if (usedcanvas[stringObj] === undefined) {
      usedcanvas[stringObj] = 0;
    } else {
      $(`#${stringObj}${usedcanvas[stringObj]}`).remove();
      usedcanvas[stringObj]++;
    }
    charttype = "line";
    $.ajax({
      url: "/process/responsebyyear",
      type: "POST",
      dataType: "json",
      data: {
        year: search
      },
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr('content')
      },
      success: function (data) {
        for (let i = 0; i < data.length; i++) {
          if (data[i].length > 0) {
            for (let j = 0; j < data[i].length; j++) {
              if (i === 0) {
                dataArr[
                  Number(data[i][j].timestamp.split("/")[1]) - 1
                ]++;
              } else {
                dataArr[
                  Number(data[i][j].date_of_feedback.split("/")[0]) - 1
                ]++;
              }
            }
          }
        }

        $(`#${stringObj}`).html(
          `<canvas id="${stringObj}${usedcanvas[stringObj]}"></canvas>`
        );

        ctx = $(`#${stringObj}${usedcanvas[stringObj]}`);

        forcharts[stringObj] = [
          ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
          [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        ];

        forchart(labelsArr, dataArr, ctx, charttype, stringObj);
      },
      error: function (xhr, status, error) {
        console.error("Request failed:", error);
      }
    });

  } else if (stringObj === "alltimechart") {
    if (usedcanvas[stringObj] === undefined) {
      usedcanvas[stringObj] = 0;
    } else {
      $(`#${stringObj}${usedcanvas[stringObj]}`).remove();
      usedcanvas[stringObj]++;
    }
    charttype = "line";
    $(`#${stringObj}`).html(
      `<canvas id="${stringObj}${usedcanvas[stringObj]}"></canvas>`
    );
    ctx = $(`#${stringObj}${usedcanvas[stringObj]}`);
    forchart(alltimeArrLabel, alltimeArrData, ctx, charttype, stringObj);
  }
}

function forchart(labelarray, dataarray, canvas, charttype, labeltype) {
  if (labeltype === "netpromoterchart") {
    labeltype = "No. of Responses";
    $('#asde').html($('#chart2yearfilter').val());
    let total = 0;
    dataarray.forEach(function (e) {
      total += e;
    });
    $('#asda').html(total);
  } else if (labeltype === "alltimechart") {
    labeltype = "Total Responses";
  }
  new Chart(canvas, {
    type: charttype,
    data: {
      labels: labelarray,
      datasets: [
        {
          label: labeltype,
          data: dataarray,
          borderWidth: 3,
          pointBackgroundColor: "#3367d1",
          pointStyle: "circle",
          fill: true,
          clip: 50,
          backgroundColor: "rgba(51, 103, 209, 0.4)",
          borderColor: "#3367d1",
          tension: 0.2,
          hitRadius: 20,
          radius: 3,
          hoverBackgroundColor: "rgba(51, 103, 209, 0.9)",
          hoverBorderWidth: 3,
          hoverBorderColor: false,
        },
      ],
    },
    options: {
      maintainAspectRatio:false,
      plugins: {
        tooltip: {
          titleFont: {
            family: "poppins",
            size: 14,
          },

          titleColor: "#f7b445",
          titleSpacing: 3,
          padding: 10,
          bodyFont: {
            family: "poppins",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
          borderWidth: false,
        },
        legend: {
          align: "end",
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: "circle",
            font: {
              size: 12,
              family: "Poppins",
            },
          },
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          grid: {
            display: false,
          },
          ticks: {
            display: Math.max(...dataarray) < 10 ? false : true,
          },
        },
        x: {
          beginAtZero: true,
          grid: {
            display: false,
          },
          font: {
            color: "#ffff",
          },
        },
      },
    },
  });
}

// end chart promoter

// services ratings

var servicelabels = [],
  forservicesObj = {},
  servicedata1 = [],
  servicedata2 = [],
  servicedata3 = [],
  servicedata4 = [],
  servicedata5 = [];

function servicesratings(year) {
  $.ajax({
    url: "/process/ratings",
    method: "POST",
    dataType: "json",
    data: {year},
    headers: {
      "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr('content')
    },
    success: function (data) {
      if (data.length === 0) {
        if (usedcanvas['serviceratingcanvas'] === undefined) {
          $('#serviceratingcanvas0').remove();
          usedcanvas['serviceratingcanvas'] = 1;
        } else {
          $(`#serviceratingcanvas${usedcanvas['serviceratingcanvas']}`).remove();
          usedcanvas['serviceratingcanvas']++;
        }
        $('#chart_3 .x-scroll').html(`<p id="serviceratingcanvas${usedcanvas['serviceratingcanvas']}" style="color:red;">No data available</p>`);
      } else {
        for (let i = 0; i < data.length; i++) {
          let manyservices = data[i].service_availed.split(";");
          for (let j = 0; j < manyservices.length; j++) {
            if (forservicesObj[services[manyservices[j].toLowerCase()] === undefined ? "Others" : services[manyservices[j].toLowerCase()]] === undefined) {
              if (data[i].customer_rating[0] === "1") {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ] = [1, 0, 0, 0, 0];
              } else if (data[i].customer_rating[0] === "2") {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ] = [0, 1, 0, 0, 0];
              } else if (data[i].customer_rating[0] === "3") {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ] = [0, 0, 1, 0, 0];
              } else if (data[i].customer_rating[0] === "4") {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ] = [0, 0, 0, 1, 0];
              } else if (data[i].customer_rating[0] === "5") {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ] = [0, 0, 0, 0, 1];
              } else {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ] = [0, 0, 0, 0, 0];
              }
            } else {
              if (data[i].customer_rating[0] === "1") {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ][0]++;
              } else if (data[i].customer_rating[0] === "2") {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ][1]++;
              } else if (data[i].customer_rating[0] === "3") {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ][2]++;
              } else if (data[i].customer_rating[0] === "4") {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ][3]++;
              } else if (data[i].customer_rating[0] === "5") {
                forservicesObj[
                  services[manyservices[j].toLowerCase()] === undefined
                    ? "Others"
                    : services[manyservices[j].toLowerCase()]
                ][4]++;
              }
            }
          }
        }
        keysofforservicesObj(forservicesObj);
      }
    },
    error: function (error) {
      console.error("Error fetching service ratings:", error);
    }
  });
}

function keysofforservicesObj(object) {
  for (let i = 0; i < Object.keys(object).length; i++) {
    // console.log();
    if (Object.keys(object)[i] === "Others") {
      servicelabels.push(Object.keys(object)[i]);
    } else {
      servicelabels.unshift(Object.keys(object)[i]);
    }
  }

  for (let servlabels of servicelabels) {
    servicedata1.push(forservicesObj[servlabels][0]);
    servicedata2.push(forservicesObj[servlabels][1]);
    servicedata3.push(forservicesObj[servlabels][2]);
    servicedata4.push(forservicesObj[servlabels][3]);
    servicedata5.push(forservicesObj[servlabels][4]);
  }
  chartservicerating(
    servicelabels,
    servicedata1,
    servicedata2,
    servicedata3,
    servicedata4,
    servicedata5
  );
}

function selectservicechange() {
  yearfilter('netpromoterchart');
}

function chartservicerating(servicelabels, servicedata1, servicedata2, servicedata3, servicedata4, servicedata5) {
  let sl, sd1, sd2, sd3, sd4, sd5;
  if ($('#selectedservice').val().toLowerCase() !== 'all') {
    sl = [`${services[$('#selectedservice').val().toLowerCase()]}`];
    sd1 = [servicedata1[servicelabels.indexOf(sl[0])] === undefined ? 0 : servicedata1[servicelabels.indexOf(sl[0])]];
    sd2 = [servicedata2[servicelabels.indexOf(sl[0])] === undefined ? 0 : servicedata2[servicelabels.indexOf(sl[0])]];
    sd3 = [servicedata3[servicelabels.indexOf(sl[0])] === undefined ? 0 : servicedata3[servicelabels.indexOf(sl[0])]];
    sd4 = [servicedata4[servicelabels.indexOf(sl[0])] === undefined ? 0 : servicedata4[servicelabels.indexOf(sl[0])]];
    sd5 = [servicedata5[servicelabels.indexOf(sl[0])] === undefined ? 0 : servicedata5[servicelabels.indexOf(sl[0])]];
  } else {
    sl = servicelabels, sd1 = servicedata1, sd2 = servicedata2, sd3 = servicedata3, sd4 = servicedata4, sd5 = servicedata5;
    if (sl[sl.length - 1].toLowerCase() === 'others') {
      sl.pop();
      sd1.pop();
      sd2.pop();
      sd3.pop();
      sd4.pop();
      sd5.pop();
    }
  }

  var data = {
    labels: sl,
    datasets: [
      {
        label: "1-Poor",
        data: sd1,
        borderColor: "red",
        // backgroundColor: '#FF1E1E',
        backgroundColor: "rgba(255, 3, 3, 0.7)",
        yAxisID: "y",
      },
      {
        label: "2-Poor(Need Improvement)",
        data: sd2,
        // backgroundColor: 'rgba(17, 29, 182, 0.96)',
        backgroundColor: "rgba(255, 110, 49, 0.7)",
        yAxisID: "y",
      },
      {
        label: "3-Satisfactory",
        data: sd3,
        backgroundColor: "rgb(255, 217, 102)",
        // backgroundColor: "rgba(216, 250, 8, .9)",
        yAxisID: "y",
      },
      {
        label: "4-Good",
        data: sd4,
        // backgroundColor: '#8526f3',
        backgroundColor: "rgba(31, 200, 112, 0.7)",
        yAxisID: "y",
      },
      {
        label: "5-Excellent",
        data: sd5,
        backgroundColor: "rgb(51, 103, 209)",
        // backgroundColor: 'rgb(185, 243, 228)',
        yAxisID: "y",
      },
    ],
  };
  var ctx;
  if (usedcanvas['serviceratingcanvas'] === undefined) {
    ctx = document.querySelector("#serviceratingcanvas0");
    usedcanvas['serviceratingcanvas'] = 1;
  } else {
    $(`#serviceratingcanvas${usedcanvas['serviceratingcanvas'] - 1}`).remove();
    usedcanvas['serviceratingcanvas']++;
    let newId = `serviceratingcanvas${usedcanvas['serviceratingcanvas']}`;
    $('#chart_3 .x-scroll').html(`<canvas id="${newId}"></canvas>`);
    ctx = $(`#${newId}`);
  }
  new Chart(ctx, {
    type: "bar",
    data: data,
    options: {
      responsive: true,
      borderRadius: 2,
      interaction: {
        mode: "index",
        intersect: false,
      },
      stacked: false,
      plugins: {
        tooltip: {
          titleFont: {
            family: "poppins",
            size: 14,
          },
          titleColor: "#f7b445",
          titleSpacing: 3,
          padding: 10,
          bodyFont: {
            family: "poppins",
            size: 12,
          },
          usePointStyle: true,
          pointStyle: "circle",
          borderWidth: false,
        },
        title: {
          display: false,
          color: "#3367d1",
          font: {
            size: 14,
            family: "Poppins",
          },
        },
        legend: {
          labels: {
            boxWidth: 10,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: "circle",
            // color: '#3367d1',
            family: "Poppins",
            font: {
              size: 12,
              family: "Poppins",
            },
          },
        },
      },
      maintainAspectRatio: false,
      scales: {
        y: {
          type: "linear",
          display: true,
          position: "left",

          // grid line settings
          grid: {
            display: false,
            drawOnChartArea: true, // only want the grid lines for one axis to show up
          },
        },
      },
    },
  });

  resetalltimedata();
}

function resetalltimedata() {
  servicelabels = [],
    forservicesObj = {},
    servicedata1 = [],
    servicedata2 = [],
    servicedata3 = [],
    servicedata4 = [],
    servicedata5 = [];
}

// end of services ratings

// for div1

function div1() {
  $("#chart2yearfilter").val(Date().split(" ")[3]);
  chartpromoter(Date().split(" ")[3], "netpromoterchart");
  chartpromoter("", "alltimechart");
}

// end of div1

// comments

function commentui(index) {
  // let style;
  // let splitted = maxcomment[index].customer_feedback.split(";");
  let classcomment;
  let feedbacktypes = "";
  let comments = `<table class="table table-hover table-active table_comment"><thead class="table_wrap"><th  class="th_comments">Feedbacks</th><th  class="th_recom">Feedback Type</th><th  class="th_sent">Sentiments</th></thead>`;
  for (let i = 0; i < maxcomment[index].length; i++) {
    // console.log(maxcomment[index][i]);
    // for ()
    let splitted = maxcomment[index][i].customer_feedback.split(";")[0].split(",")[0];
    if (maxcomment[index][i].sentiment > 0) {
      classcomment = "complimentcomment";
      feedbacktypes = "Positive";
    } else if (maxcomment[index][i].sentiment < 0){
      classcomment = 'complaintcomment';
      feedbacktypes = "Negative";
    } else {
      classcomment = "suggestioncomment";
      feedbacktypes = "Neutral";
    }
    // var neutral = [
    //   "nothing",
    //   "none",
    //   "non",
    //   "no comment",
    //   "no comments",
    //   ".",
    //   "no",
    //   "no complaints",
    //   "no complaint",
    // ];
    // if (neutral.includes(maxcomment[index][i].fodoti.toLowerCase()) === true) {
    //   classcomment = "suggestioncomment";
    //   feedbacktypes = "Neutral";
    // }
    comments += `<tr class="tb_wrap"><td class="tb_com">${maxcomment[index][i].fodoti}</td><td class="tb_rec">${splitted}</td><td class="tb_sent"><span class="${classcomment}">${feedbacktypes}</span></td></tr>`;
  }
  comments += `</tbody></table>`;
  $("#commentCount").html(index + 1);
  $("#commentUpTo").html(maxcomment.length);

  $("#comment_box").html(comments);
}

function prevcomment() {
  $("#comment_box").hide().fadeIn(1000);
  if (commentholder === 0) {
    commentholder = maxcomment.length - 1;
  } else {
    commentholder--;
  }
  commentui(commentholder);
}

function nextcomment() {
  $("#comment_box").hide().fadeIn(1000);
  if (commentholder === maxcomment.length - 1) {
    commentholder = 0;
  } else {
    commentholder++;
  }
  commentui(commentholder);
}

// end of comments

// percentage chart

function ratingtype(year) {
  let id = "";
  if (usedcanvas["respondentpercentage"] > 0) {
    $(`#respondentpercentage${usedcanvas["respondentpercentage"]}`).remove();
  } else if (usedcanvas["respondentpercentage"] === undefined) {
    usedcanvas["respondentpercentage"] = 0;
  }
  usedcanvas["respondentpercentage"]++;
  id = `respondentpercentage${usedcanvas["respondentpercentage"]}`;
  $("#chart_4").html(`<canvas id="${id}"></canvas>`);

  var respondenttypes = {
    compliment: 0,
    suggestion: 0,
    complaint: 0,
    others: 0,
  },
    labelsrespondent,
    datarespondent;

  $.ajax({
    url: "/process/responsebyyear",
    method: "POST",
    dataType: "json",
    data: {
      year: year
    },
    headers: {
      "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr('content')
    },
    success: function (data) {
      let total = 0;
      for (let i = 0; i < data.length; i++) {
        if (data[i].length > 0) {
          for (let j = 0; j < data[i].length; j++) {
            if (data[i][j].sentiment > 0){
              respondenttypes['compliment']++;
            } else if (data[i][j].sentiment === 0){
              respondenttypes['suggestion']++;
            } else {
              respondenttypes['complaint']++;
            }
            total++;
          }
        }
      }
      if (total > 0) {
        let fixnumber = 0;
        datarespondent = [
          Number(((respondenttypes["compliment"] * 100) / total).toFixed(2)),
          Number(((respondenttypes["suggestion"] * 100) / total).toFixed(2)),
          Number(((respondenttypes["complaint"] * 100) / total).toFixed(2)),
        ];
        for (let i = 0; i < datarespondent.length; i++) {
          fixnumber += datarespondent[i];
        }
        if (fixnumber === 99.99) {
          for (let i = 0; i < datarespondent.length; i++) {
            if (datarespondent[i] > 0) {
              datarespondent[i] += 0.01;
              break;
            }
          }
        }
        $("#yeartotal").html(`Total of ${total} Respondents in year ${year}`);
      } else {
        datarespondent = [0, 0, 0, 0];
        $("#yeartotal").html(`There are no feedbacks in year ${year}`);
      }
      labelsrespondent = [
        `${datarespondent[0]}% Positive responses`,
        `${datarespondent[1]}% Neutral responses`,
        `${datarespondent[2]}% Negative responses`,
      ];
      respondentcharts(labelsrespondent, datarespondent, `#${id}`);
    }
  })
}

function respondentcharts(labelsrespondent, datarespondent, id) {
  var ctx = $(id);
  new Chart(ctx, {
    type: "doughnut",
    data: {
      labels: labelsrespondent,
      datasets: [
        {
          // label: "Percentage of Responses",
          backgroundColor: [
            "rgb(20, 255, 20)",
            "rgb(255, 127, 41)",

            // "rgba(255, 255, 20, 0.8)",
            "rgb(255, 0, 0)",
          ],
          borderColor: [
            "rgb(20, 255, 20)",
            "rgb(255, 127, 41)",
            "rgb(255, 0, 0)",
          ],
          data: datarespondent,
          borderWidth: 5,
          hoverBorderWidth: 15,
          hoverBorderDashOffset: true,
          borderRadius:2,
          spacing:3,
          // hoveroffset: true,
          // showLine: false,
        },
      ],
    },
    options: {
      layout: {
            padding: 5
        },
      plugins: {
        labels:{
          render:"percentage",
          precision: 1,
          fontSize: 15,
          fontFamily:"Poppins",
        },
        legend: {
          align: "start",
          // display: false,
          labels: {
            boxWidth: 10,
            precision: 1,
            boxHeight: 10,
            usePointStyle: true,
            pointStyle: "circle",
            // color: '#3367d1',
            family: "Poppins",
            font: {
              size: 12,
              family: "Poppins",
              margin: "50",
            },
          },
        },
        tooltip: {
          usePointStyle:true,
          pointStyle: "circle",
          borderWidth: false,
          enabled:false,
        },
      },
      scales: {
        y: {
          display:false,
          beginAtZero: false,
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
        },
        x: {
          display:false,
          beginAtZero: false,
          grid: {
            display: false,
          },
          ticks: {
            display: false,
          },
        },
      },
    },
    
  });
}

// end of percentage chart

// for div2

function div2() {
  const year = $('#piechartyear').val();
  const filteredcomment = $('#analyzesenti').val();

  $.ajax({
    url: "/process/comments",
    method: "POST",
    data: {
      year: year,
      filtersenti: filteredcomment
    },
    headers: {
      "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr('content')
    },
    dataType: "json",
    success: function (data) {
      if (data.length === 0) {
        $('#comment_box').html('No data fetched');
      } else {
        maxcomment = data;
        commentholder = 0;
        commentui(commentholder);
      }
    }
  })
}

// end of div2

// on forms

var countService = 0;

function countservice(id) {
  const checked = $(`#${id}`).is(":checked");
  if (checked) {
    countService++;
  } else if (!checked) {
    countService--;
  }
  if (countService === 0) {
    $("input[id^='service_']").prop("required", true);
  } else {
    $("input[id^='service_']").prop("required", false);
  }
}

// end of on forms

// ready function

$(document).ready(function () {
  // active functions
  $("#Upload_btn").click(function () {
    $(".upload_csv").toggleClass("show_upload");
  });

  $('#analyzesenti').change(function(e){
    const year = $('#piechartyear').val();
    const filteredcomment = $(this).val();

    $.ajax({
      url: "/process/comments",
      method: "POST",
      dataType: "json",
      data: {
        year: year,
        filtersenti: filteredcomment
      },
      headers: {
        "X-CSRF-TOKEN": $('meta[name="csrf-token"]').attr('content')
      },
      success: function (data) {
        if (data.length === 0) {
          $('#comment_box').html('No data fetched');
        } else {
          maxcomment = data;
          commentholder = 0;
          commentui(commentholder);
        }
      }
    });
  });

  // run the functions
  servicesratings(Date().split(" ")[3]);
  // div1();
  $("#chart2yearfilter, #piechartyear").val(Date().split(" ")[3]);
  $("#chart2yearfilter, #piechartyear").attr(
    "max",
    Number(Date().split(" ")[3]) + 1
  );
  chartpromoter(Date().split(" ")[3], "netpromoterchart");
  ratingtype(Date().split(" ")[3]);
  div2();
  

  // end run functions  
});

// end of ready function
