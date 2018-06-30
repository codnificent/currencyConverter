const apiURL = `https://free.currencyconverterapi.com/api/v5/countries`;
fetch(apiURL).then((response) => {
 return response.json().then((responseValue) => {//Get the JSON data
  return responseValue.results
  	
 }).then((value) =>{
  for(let data in value){
  	//Looping through the data and getting the currencyId  and 
  	//currencyName into the field for 'From' in the select tag
  	let from = document.createElement("option");
  	let selectFrom = document.getElementById("from");
    selectFrom.appendChild(from);
  	from.innerHTML = `${value[data].currencyId}__${value[data].currencyName}`;
  	from.setAttribute("value", `${value[data].currencyId}`);//Set the value attribute

  	//Doing same for the 'To' field
  	let to = document.createElement("option");
  	let selectTo = document.getElementById("to");
    selectTo.appendChild(to);
  	to.innerHTML = `${value[data].currencyId}__${value[data].currencyName}`;
  	to.setAttribute("value", `${value[data].currencyId}`);//Set the value attribute
  }  
 })
}).catch((err) => {//If the fetch requests fails...
  //document.write('Sorry, there seems to be an error ' + err);
  console.log(err);
}); 

function buttonClick() {
  //Function for geting the conversion when a user clicks a button
  let fromCurrency = from.value;
  let toCurrency = to.value;
  let query = fromCurrency + '_' + toCurrency;
  let userInput = document.getElementById("value").value;
  let resultValue = document.getElementById('result');
  let url = `https://free.currencyconverterapi.com/api/v5/convert?q=${query}&compact=ultra`;

  if (!('indexedDB' in window)) {
    console.log('This browser doesn\'t support IndexedDB');
    return;
  }
  let dbPromise = idb.open('converter-db', 1, (upgradeDb) =>{
  // If the browser doesn't support service worker,
  // There's no need having a database
  if (!navigator.serviceWorker) {
    return Promise.resolve();
  };
  if(!upgradeDb.objectStoreNames.contains('db-data')){
    let dbData = upgradeDb.createObjectStore('db-data',  {autoIncrement: true});
  }
  });

  fetch(url).then((response) =>{
    return response.json().then((results) =>{ //The json object is passed to results
      let total = results[query] * userInput; //Working with user input
      let actualConversion = Math.round(total * 100)/100;
      resultValue.value = actualConversion.toFixed(2); //Displays result to the user
      //let responseResult = results;
      dbPromise.then((db) => {
        let tx = db.transaction('db-data', 'readwrite');
        let store = tx.objectStore('db-data');
        store.put(results);
        return tx.complete;
      });
    });
  }).catch(() =>{
     dbPromise.then((db) => {
          let tx = db.transaction('db-data', 'readwrite');
          let store = tx.objectStore('db-data');
          return store.openCursor();
        }).then(function continueCursoring(cursor) {
          if (!cursor) {
            return;
          }
          
          for (let field in cursor.value) {
            //Working with data got from IndexedDB
            if(field === query){
              let cursorValue = cursor.value[field];
              let dbtotal = cursorValue * userInput;//Working with user input
              let dbactualConversion = Math.round(dbtotal * 100)/100;
              resultValue.value = dbactualConversion.toFixed(2); //Displays result to the user
            }
          }
          return cursor.continue().then(continueCursoring);
        })
  })
}
//Register ServiceWorker
if('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => { 
    console.log("Service Worker Registered."); 
  }).catch(() => {
    console.log("Service Worker Registration failed");
  });
}