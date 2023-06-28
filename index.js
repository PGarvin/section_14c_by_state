const reader = require('xlsx');
const fs = require('fs');

fs.mkdirSync("site", { recursive: true });

const stateText = [
  {"two_letter_code":'MO',"state":"Missouri"},
  {"two_letter_code":'IL',"state":"Illinois"},
  {"two_letter_code":'MN',"state":"Minnesota"},
  {"two_letter_code":'WI',"state":"Wisconsin"},
  {"two_letter_code":'OH',"state":"Ohio"},
  {"two_letter_code":'PA',"state":"Pennsylvania"},
  {"two_letter_code":'CA',"state":"California"},
  {"two_letter_code":'OK',"state":"Oklahoma"},
  {"two_letter_code":'AR',"state":"Arkansas"},
  {"two_letter_code":'NJ',"state":"New Jersey"},
  {"two_letter_code":'FL',"state":"Florida"},
  {"two_letter_code":'TX',"state":"Texas"},
  {"two_letter_code":'NC',"state":"North Carolina"},
  {"two_letter_code":'AZ',"state":"Arizona"},
  {"two_letter_code":'NY',"state":"New York"},
  {"two_letter_code":'IN',"state":"Indiana"},
  {"two_letter_code":'KY',"state":"Kentucky"},
  {"two_letter_code":'KS',"state":"Kansas"},
  {"two_letter_code":'CT',"state":"Connecticut"},
  {"two_letter_code":'MI',"state":"Michigan"},
  {"two_letter_code":'SC',"state":"South Carolina"},
  {"two_letter_code":'MT',"state":"Montana"},
  {"two_letter_code":'LA',"state":"Louisiana"},
  {"two_letter_code":'ND',"state":"North Dakota"},
  {"two_letter_code":'GA',"state":"Georgia"},
  {"two_letter_code":'VA',"state":"Virginia"},
  {"two_letter_code":'UT',"state":"Utah"},
  {"two_letter_code":'MA',"state":"Massachusetts"},
  {"two_letter_code":'SD',"state":"South Dakota"},
  {"two_letter_code":'ID',"state":"Idaho"},
  {"two_letter_code":'IA',"state":"Iowa"},
  {"two_letter_code":'WA',"state":"Washington"},
  {"two_letter_code":'NV',"state":"Nevada"},
  {"two_letter_code":'NE',"state":"Nebraska"},
  {"two_letter_code":'MS',"state":"Mississippi"},
  {"two_letter_code":'WV',"state":"West Virginia"},
  {"two_letter_code":'AL',"state":"Alabama"},
  {"two_letter_code":'NM',"state":"New Mexico"},
  {"two_letter_code":'CO',"state":"Colorado"},
  {"two_letter_code":'TN',"state":"Tennessee"},
  {"two_letter_code":'AK',"state":"Alaska"},
  {"two_letter_code":'OR',"state":"Oregon"}
]

let numberOfWorkersPaidSubminimumWages = 0;
let totalPending = 0;
let totalIssued = 0;
let totalTotal = 0;

let backToTop = `<div class="backToTop"><a href="#content">Back to top</a></div>`

const messageFile = "./updated_data_with_lat_lon.xlsx";
const isExists = fs.existsSync(messageFile, 'utf8');
  if(isExists) {
    readExcelFile(messageFile);
  }



function readExcelFile(fileName) {

  const file = reader.readFile(fileName)

  const data = [];
  const states = [];

  const sheets = file.SheetNames;



     const temp = reader.utils.sheet_to_json(
          file.Sheets[file.SheetNames[Number(sheets.length - 1)]])
     temp.forEach((res) => {
       if (res.State === "MO" && res.City.indexOf("Louis") > -1) {
         res.City = "St. Louis";
       }
       if (res.State === "NC" && res.City.indexOf("Wilkesboro") > -1) {
         res.City = "North Wilkesboro";
       }
       if (res.State === "NJ" && res.City.indexOf("Cmch") > -1) {
         res.City = "Cape May Court House";
       }
       if (res.State === "WI" && res.City.indexOf("Rapids") > -1) {
         res.City = "Wisconsin Rapids";
       }
        data.push(res);
        if (states.indexOf(res.State) === -1) {
          states.push(res.State);
        }
        if (res['Number of Workers Paid Subminimum Wages'] !== undefined) {
        numberOfWorkersPaidSubminimumWages+= Number(res['Number of Workers Paid Subminimum Wages']);
        }
        if (res.Status === "Pending") {
          totalPending++;
          totalTotal++;
        }

        if (res.Status === "Issued") {
          totalIssued++;
          totalTotal++;
        }
     });
     let stateData = new Array(states.length);
     states.sort();

     let statesBlock = `

     <nav>
     <ul class="state-block">
     <li><a href="data.html">U.S. data</a></li>`;
     states.forEach((state, i) => {
       var stateName = stateText.filter(stateLine => stateLine.two_letter_code === state)[0].state;
       statesBlock += `\n<li><a href="${stateName.toLowerCase().split(" ").join("")}.html">${stateName} data</a></li>`

     });
     statesBlock += "\n</ul>\n</nav>";
     states.forEach((state, i) => {

       var stateName = stateText.filter(stateLine => stateLine.two_letter_code === state)[0].state;

       var html = ``;

       const result = data.filter(datum => datum.State === state);
       const stateCerts = certType(result);
       const pending = result.filter(res => res.Status === "Pending");
       const issued = result.filter(res => res.Status === "Issued");
       const numberOfWorkers = subminimumWages(result);

       stateData[i] = {"state":stateName, "issued":issued.length, "pending":pending.length, "total":result.length, "Number of Workers Paid Subminimum Wages":numberOfWorkers}
       const cities = [];

       result.forEach((item, index) => {

         if (cities.indexOf(item.City) === -1) {
           cities.push(item.City);
         }

       });
       cities.sort();
       let cityData = new Array(cities.length);
       cities.forEach((city, j) => {
         const cityResult = data.filter(datum => (datum.State === state && datum.City === city));
         const cityPending = cityResult.filter(cityRes => cityRes.Status === "Pending");
         const cityIssued = cityResult.filter(cityRes => cityRes.Status === "Issued");
         const cityNumberOfWorkers = subminimumWages(cityResult);
         cityData[j] = {"state":state, "city":city, "issued":cityIssued.length, "pending":cityPending.length, "total":cityResult.length, "Number of Workers Paid Subminimum Wages":cityNumberOfWorkers}
       });
       //console.log(cityData);
       html += `
       <h2 id="by_the_numbers">By the numbers</h2>
       <ul class="chunkyNumbers">
        <li><span>${stateData[i].total.toLocaleString("en-US")}</span> total certificates</li>
        <li><span>${stateData[i].issued.toLocaleString("en-US")}</span> issued certificates</li>
        <li><span>${stateData[i].pending.toLocaleString("en-US")}</span> pending certificates</li>
        <li><span>${stateData[i]["Number of Workers Paid Subminimum Wages"].toLocaleString("en-US")}</span> workers being paid less than minimum wage</li>
       </ul>
       ${backToTop}
       `;
       //html += makeChart(stateCerts, "Number of Certificates","Certificate Type");
       html += `<h2 id="cities_compared">${stateName} cities, compared</h2>`+makeTable(cityData, "city", "city");
       html += backToTop;
       //html += makeChart(cityData, "total", "city");
       //html += makeChart(cityData, "issued", "city");
       //html += makeChart(cityData, "pending", "city");

       var totalContent =
       `<!DOCTYPE html>
       <html lang="en" dir="ltr">
         <head>
           <meta charset="utf-8">
           <title>${stateName} Section 14(c) data</title>

           <meta charset="utf-8">
           <meta name="author" content="Patrick Garvin">
           <meta name="keywords" content="Patrick Garvin, Section 14c, subminimum wage, people with disabilities, sheltered workshops">
           <meta name="viewport" content="width=device-width">
           <meta property="og:url" content="http://patrickgarvin.com/disabilityJournoResource/section14c/pages" />
           <meta property="og:title" content="Why it's still legal to pay disabled people less than minimum wage" />
           <meta property="og:image" content="http://patrickgarvin.com/disabilityJournoResource/section14c/assets/og_image.jpg" />
           <meta property="og:site_name" content="Why it's still legal to pay disabled people less than minimum wage" />
           <meta property="og:description" content="Not everyone knows about the minimum wage loophole." />

           <link rel="stylesheet" href="../css/styles.css">
           <link rel="stylesheet" href="../css/a11y_tables.css">

         </head>
         <body>
    <a class="skip-link" href="#content">Skip to content</a>
    <nav>
      <ul class="navigation">
        <li><a href="index.html">Home</a></li>
        <li class="active"><a href="data.html">Data</a></li>
        <li><a href="resources.html">Resources</a></li>
        <li><a href="about.html">About</a></li>
      </ul>
    </nav>

<main id="content">
           <h1>${stateName} Section 14(c) data</h1>

           <h2>Table of contents</h2>
           <ul>
           <li>
           <a href="#by_the_numbers">By the numbers</a>
           </li>
           <li>
           <a href="#cities_compared">${stateName} cities, compared</a>
           </li>
           <li>
           <a href="#where_data">Where the dataset comes from</a>
           </li>
           <li>
           <a href="#explore">Explore each state, one by one</a>
           </li>
           </ul>


           ${html}
           <h2 id="where_data">Where the dataset comes from</h2>
           <p>The data on this come from the Department of Labor.</p>
           <ul>
            <li><a href="https://www.dol.gov/agencies/whd/workers-with-disabilities/section-14c/certificate-holders">Department of Labor's 14(c) Certificate Holders page</a></li>
            <li><a href="https://www.dol.gov/sites/dolgov/files/WHD/xml/CertificatesListing.xlsx">Download the Department of Labor's Excel file (XLSX, 101KB)</a></li>
            <li><a href="../assets/updated_data_with_lat_lon.xlsx">Get Patrick's Excel document with extra calculations and with lat/lon coordinates (XLSX, 813KB)</a></li>
           </ul>
           ${backToTop}
           <h2 id="explore">Explore each state, one by one</h2>
           ${statesBlock}
           ${backToTop}
</main>
<footer><p>&#169; Patrick Garvin, 2023<p></footer>
         </body>
       </html>
       `;

       fs.writeFileSync(
        `./site/pages/${stateName.toLowerCase().split(" ").join("")}.html`,
        totalContent,
        {
          encoding: "utf8",
          flag: "w",
        }
       );

     });

     let mainHTML = ``
     let topChunk = `<ul class="chunkyNumbers">
      <li><span>${totalTotal.toLocaleString("en-US")}</span> total certificates</li>
      <li><span>${states.length}</span> states where certificates are issued</li>
      <li><span>${numberOfWorkersPaidSubminimumWages.toLocaleString("en-US")}</span> workers being paid less than minimum wage</li>
     </ul>
     `;
     //mainHTML += makeChart(certType(data),"Number of Certificates","Certificate Type");
     mainHTML += makeTable(stateData, "state", "state");
     mainHTML += backToTop;
     mainHTML += `<h3 id="by_total">Bar chart: By total number of certificates</h3>` + makeChart(stateData, "total", "state");
     mainHTML += backToTop;
     mainHTML += `<h3 id="by_issued">Bar chart: By number of certificates that have been issued</h3>` + makeChart(stateData, "issued", "state");
     mainHTML += backToTop;
     mainHTML += `<h3 id="by_pending">Bar chart: By number of certificates that are pending</h3>` +makeChart(stateData, "pending", "state");
     mainHTML += backToTop;
     mainHTML += `<h3 id="by_workers">Bar chart: By number of workers who are being paid less than minimum wage</h3>` +makeChart(stateData, "Number of Workers Paid Subminimum Wages", "state");
     mainHTML += backToTop;

     var mainContent =
     `<!DOCTYPE html>
     <html lang="en" dir="ltr">
       <head>
         <meta charset="utf-8">
         <title>U.S. Section 14(c) data, by state</title>

         <meta charset="utf-8">
         <meta name="author" content="Patrick Garvin">
         <meta name="keywords" content="Patrick Garvin, Section 14c, subminimum wage, people with disabilities, sheltered workshops">
         <meta name="viewport" content="width=device-width">
         <meta property="og:url" content="http://patrickgarvin.com/disabilityJournoResource/section14c/pages" />
         <meta property="og:title" content="Why it's still legal to pay disabled people less than minimum wage" />
         <meta property="og:image" content="http://patrickgarvin.com/disabilityJournoResource/section14c/assets/og_image.jpg" />
         <meta property="og:site_name" content="Why it's still legal to pay disabled people less than minimum wage" />
         <meta property="og:description" content="Not everyone knows about the minimum wage loophole." />

         <link rel="stylesheet" href="../css/styles.css">
         <link rel="stylesheet" href="../css/a11y_tables.css">

       </head>
       <body>
  <a class="skip-link" href="#content">Skip to content</a>
  <nav>
    <ul class="navigation">
      <li><a href="index.html">Home</a></li>
      <li class="active"><a href="data.html">Data</a></li>
      <li><a href="resources.html">Resources</a></li>
      <li><a href="about.html">About</a></li>
    </ul>
  </nav>

<main id="content">
         <h1>Section 14(c) data, by state</h1>

         <h2>Table of contents</h2>
         <ul>
         <li>
         <a href="#where_data">Where the dataset comes from</a>
         </li>
         <li>
         <a href="#by_the_numbers">By the numbers</a>
         </li>
         <li>
         <a href="#map">Map: Where are these employers?</a>
         </li>
         <li>
         <a href="#states_compared">States, compared</a>
         </li>
         <li>
         <a href="#by_total">Bar chart: Bar chart: By total number of certificates</a>
         </li>
         <li>
         <a href="#by_issued">Bar chart: By number of certificates that have been issued</a>
         </li>
         <li>
         <a href="#by_pending">Bar chart: By number of certificates that are pending</a>
         </li>
         <li>
         <a href="#by_workers">Bar chart: By number of workers who are being paid less than minimum wage</a>
         </li>


         <li>
         <a href="#explore">Explore each state, one by one</a>
         </li>
         </ul>

         <h2 id="where_data">Where the dataset comes from</h2>
         <p>The data on this comes from the Department of Labor.</p>
         <ul>
          <li><a href="https://www.dol.gov/agencies/whd/workers-with-disabilities/section-14c/certificate-holders">Department of Labor's 14(c) Certificate Holders page</a></li>
          <li><a href="https://www.dol.gov/sites/dolgov/files/WHD/xml/CertificatesListing.xlsx">Download the Department of Labor's Excel file (XLSX, 101KB)</a></li>
          <li><a href="../assets/updated_data_with_lat_lon.xlsx">Get Patrick's Excel document with extra calculations and with lat/lon coordinates (XLSX, 813KB)</a></li>
         </ul>
         ${backToTop}

         <h2 id="by_the_numbers">By the numbers</h2>
         ${topChunk}
         ${backToTop}
         <h2 id="map">Map: Where are these employers?</h2>
         <div class="map-holder">
         <iframe src="https://www.google.com/maps/d/u/0/embed?mid=1mhqIYvYwQdx8deDo6N6kR_LaeYFG2hc&ehbc=2E312F" width="100%" height="480"></iframe>
         </div>
         ${backToTop}
         <h2 id="states_compared">States, compared</h2>
         ${mainHTML}

         <h2 id="explore">Explore each state, one by one</h2>
         ${statesBlock}

</main>
<footer><p>&#169; Patrick Garvin, 2023<p></footer>
       </body>
     </html>
     `;

     fs.writeFileSync(
      `./site/pages/data.html`,
      mainContent,
      {
        encoding: "utf8",
        flag: "w",
      }
     );
}

function sortByTopic (array, key) {
  array.sort(function(a, b) {

  var aConcat = Number(a[key]);
  var bConcat = Number(b[key]);

  if (aConcat < bConcat) {
    return 1;
  } else if (aConcat > bConcat) {
    return -1;
  } else {
    return 0;
  }
});
}

function alphabetize (array, key) {
  array.sort(function (a, b) {
  if (a[key] < b[key]) {
  return -1;
  }
  if (a[key] > b[key]) {
  return 1;
  }
  return 0;
  });
}


function makeChart (array, key, locationType) {
  if (key !== "state" && key !== "city") {
    sortByTopic(array, key);
  } else {
    alphabetize(array, key);
  }
  const newArray = array.filter(arrayItem => arrayItem[key] > 0);
  baseNumber = 100;

  if (key === "Number of Workers Paid Subminimum Wages") {
    baseNumber = array[0][key];
  }
  let chartContent =
  `<table class="tableChart" cellspacing="0" summary="Number of ${key} certificates by ${locationType}">
  <thead>
    <tr>
  		<th class="responsive">${locationType}</th>
  		<th class="responsive">${key}</th>
  	</tr>
    </thead>
    <tbody>`;

    newArray.forEach(item => {
      chartContent += `\n\t<tr><td class="responsive td_label">${item[locationType]}</td><td class="responsive td_value"><div><span class="bar" style="width:${100*item[key]/baseNumber}%"></span><span class="value">${item[key].toLocaleString("en-US")}</span></div></td></tr>`
    });

    chartContent += `\n</tbody>\n</table>`;

    if (newArray.length < 1) {
      chartContent = ``;
    }

    return chartContent;
}

function makeTable (array, key, locationType) {
  if (key !== "state" && key !== "city") {
    sortByTopic(array, key);
  } else {
    alphabetize(array, key);
  }

  let chartContent =
  `<table class="table-design table-a11y" role="table">
<caption>Number of ${key} certificates by ${locationType}</caption>
<thead>

    <tr role="row">
  		<th id="columnheader1" role="columnheader" scope="col">${locationType}</th>
  		<th id="columnheader2" role="columnheader" scope="col">Issued certificates</th>
      <th id="columnheader3" role="columnheader" scope="col">Pending certificates</th>
      <th id="columnheader4" role="columnheader" scope="col">Total certificates</th>
      <th id="columnheader5" role="columnheader" scope="col">Number of Workers Paid Less Than Minimum Wage</th>
  	</tr>
    </thead>
    </tbody>`;

    array.forEach((item, i) => {

      chartContent += `\n\t<tr role="row">
      <th id="item${Number(i + 1)}" role="rowheader" scope="row" headers="columnheader1"><span class="col-header" aria-hidden="true">${locationType}</span>${item[locationType]}</th>
      <td role="cell" headers="item${Number(i + 1)} columnheader2"><span class="col-header" aria-hidden="true">Issued certificates</span>${item.issued.toLocaleString("en-US")}</td>
      <td role="cell" headers="item${Number(i + 1)} columnheader3"><span class="col-header" aria-hidden="true">Pending certificates</span>${item.pending}</td>
      <td role="cell" headers="item${Number(i + 1)} columnheader4"><span class="col-header" aria-hidden="true">Total certificates</span>${item.total.toLocaleString("en-US")}</td>
      <td role="cell" headers="item${Number(i + 1)} columnheader5"><span class="col-header" aria-hidden="true">Number of Workers Paid Subminimum Wages</span>${item["Number of Workers Paid Subminimum Wages"].toLocaleString("en-US")}</td>
      </tr>`
    });

    chartContent += `\n</tbody>\n</table>`;

    return chartContent;
}

function subminimumWages (array) {
  let workers = 0;
  array.forEach((item, i) => {
    if (item['Number of Workers Paid Subminimum Wages'] !== undefined) {
    workers+= Number(item['Number of Workers Paid Subminimum Wages']);
    }
  });
  return workers;
}

function certType (array) {
  let baseArray = [{"Certificate Type":"Community Rehab Program (CRP)","Number of Certificates":0},
  {"Certificate Type":"Community Rehab Program (CRP) & Hospital/Patient Worker ","Number of Certificates":0},
  {"Certificate Type":"Hospital/Patient Worker","Number of Certificates":0},
  {"Certificate Type":"Business Establishment","Number of Certificates":0},
  {"Certificate Type":"Community Rehab Program (CRP) & Business Establishment","Number of Certificates":0},
  {"Certificate Type":"Unknown","Number of Certificates":0},
  {"Certificate Type":"Community Rehab Program (CRP) & School Work Experience Program (SWEP)","Number of Certificates":0},
  {"Certificate Type":"School Work Experience Program (SWEP)","Number of Certificates":0}];

  baseArray.forEach((base) => {
    base["Number of Certificates"] = array.filter(arrayItem => arrayItem["Certificate Type"] === base["Certificate Type"]).length;
  });

  return baseArray;
}
